import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { getDatabaseConnection } from '@/lib/database/sqlite_database_connection_manager';
import { initializeObservatoryTables } from '@/lib/database/initialize_observatory_tables';
import { sendPlatformMail } from '@/lib/mail/mailbox_service';
import { createSessionToken, setSessionCookieOnResponse } from '@/lib/auth/session_manager';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const stateParam = searchParams.get('state');

  // Parse state target if provided
  let redirectTarget = '/demo';
  if (stateParam) {
    try {
      const decoded = JSON.parse(Buffer.from(stateParam, 'base64url').toString('utf8'));
      if (decoded.target && typeof decoded.target === 'string' && decoded.target.startsWith('/')) {
        redirectTarget = decoded.target;
      }
    } catch {
      // ignore invalid state decode
    }
  }

  if (error) {
    return NextResponse.redirect(new URL(`/signin?error=${encodeURIComponent(error)}`, req.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/signin?error=missing_authorization_code', req.url));
  }

  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      new URL('/signin?error=google_credentials_not_configured', req.url)
    );
  }

  try {
    const origin = req.nextUrl.origin || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const redirectUri = `${origin}/api/auth/google/callback`;

    // 1. Exchange authorization code for tokens
    const tokenResp = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResp.ok) {
      const errText = await tokenResp.text();
      return NextResponse.redirect(
        new URL(`/signin?error=${encodeURIComponent('Token exchange failed: ' + errText)}`, req.url)
      );
    }

    const tokenData = await tokenResp.json();
    let googleId = '';
    let email = '';
    let name = '';
    let picture = '/infra_trace_logo.png';

    // Verify ID Token or fetch userinfo
    if (tokenData.id_token) {
      const verifyResp = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(tokenData.id_token)}`
      );
      if (verifyResp.ok) {
        const payload = await verifyResp.json();
        googleId = payload.sub;
        email = payload.email;
        name = payload.name || payload.given_name || email.split('@')[0];
        picture = payload.picture || '/infra_trace_logo.png';
      }
    }

    if (!email && tokenData.access_token) {
      const userinfoResp = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      if (userinfoResp.ok) {
        const payload = await userinfoResp.json();
        googleId = payload.sub;
        email = payload.email;
        name = payload.name || email.split('@')[0];
        picture = payload.picture || '/infra_trace_logo.png';
      }
    }

    if (!email) {
      return NextResponse.redirect(
        new URL('/signin?error=could_not_retrieve_google_profile', req.url)
      );
    }

    // 2. Database lookup or creation
    initializeObservatoryTables();
    const db = getDatabaseConnection();
    const cleanEmail = email.toLowerCase().trim();
    const now = new Date().toISOString();

    let user = db
      .prepare('SELECT * FROM platform_users WHERE provider_user_id = ? OR LOWER(email) = ?')
      .get(googleId, cleanEmail) as any;

    if (!user) {
      // Auto-create new user account
      const id = `usr_g_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
      db.prepare(`
        INSERT INTO platform_users (
          id, name, email, role, status, avatar_url, profile_picture,
          auth_provider, provider_user_id, country, created_at, updated_at, last_active_at
        ) VALUES (?, ?, ?, 'Admin', 'ACTIVE', ?, ?, 'google', ?, 'India', ?, ?, ?)
      `).run(id, name, cleanEmail, picture, picture, googleId, now, now, now);

      try {
        sendPlatformMail({
          recipientEmail: cleanEmail,
          sender: 'InfraTrace Google Auth <auth@infratrace.internal>',
          subject: `Welcome to InfraTrace, ${name}! (Google Account Linked)`,
          snippet: `Your account was successfully registered using Google Sign-In (${cleanEmail}).`,
          body: `Hello ${name},\n\nWelcome to InfraTrace!\n\nYour account is now linked with your Google identity (${cleanEmail}). You can sign in anytime with one click using "Continue with Google".\n\nGoogle Account ID: ${googleId}\nStatus: Active\n\nBest regards,\nThe InfraTrace Team`,
          tag: 'WELCOME',
        });
      } catch {
        // Mail failure should not block login
      }

      user = db.prepare('SELECT * FROM platform_users WHERE id = ?').get(id) as any;
    } else {
      // Existing user: Link Google identity and update last active timestamp
      db.prepare(`
        UPDATE platform_users
        SET last_active_at = ?,
            updated_at = ?,
            auth_provider = CASE WHEN auth_provider IS NULL OR auth_provider = 'local' THEN 'google' ELSE auth_provider END,
            provider_user_id = COALESCE(provider_user_id, ?),
            avatar_url = COALESCE(?, avatar_url),
            profile_picture = COALESCE(?, profile_picture)
        WHERE id = ?
      `).run(now, now, googleId, picture, picture, user.id);

      user = db.prepare('SELECT * FROM platform_users WHERE id = ?').get(user.id) as any;
    }

    // 3. Create session token and set cookie on redirect
    const sessionToken = createSessionToken({
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.profile_picture || user.avatar_url || picture,
      role: user.role,
      authProvider: 'google',
      providerUserId: user.provider_user_id || googleId,
    });

    const response = NextResponse.redirect(new URL(redirectTarget, req.url));
    setSessionCookieOnResponse(response, sessionToken);

    return response;
  } catch (err: any) {
    return NextResponse.redirect(
      new URL(`/signin?error=${encodeURIComponent(err.message || 'Authentication error')}`, req.url)
    );
  }
}

