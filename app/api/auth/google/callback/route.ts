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
  let redirectTarget = '/console';
  let appSource = 'infratrace';

  if (stateParam) {
    try {
      const decoded = JSON.parse(Buffer.from(stateParam, 'base64url').toString('utf8'));
      if (decoded.target && typeof decoded.target === 'string') {
        redirectTarget = decoded.target;
      }
      if (decoded.app) {
        appSource = decoded.app;
      }
    } catch {
      try {
        const decoded = JSON.parse(Buffer.from(stateParam, 'base64').toString('utf8'));
        if (decoded.target && typeof decoded.target === 'string') {
          redirectTarget = decoded.target;
        }
        if (decoded.app) {
          appSource = decoded.app;
        }
      } catch {
        // ignore invalid state decode
      }
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

    const isSuperAdmin = cleanEmail === 'jai18hemant334@gmail.com';
    const effectiveRole = isSuperAdmin ? 'Super Admin' : (user?.role === 'Super Admin' ? 'Super Admin' : (user?.role === 'Admin' ? 'Admin' : 'Normal User'));
    const defaultPerms = (effectiveRole === 'Super Admin' || effectiveRole === 'Admin')
      ? ['VT1', 'EM1', 'PA1', 'CI1', 'UM1', 'SC1']
      : ['VT1'];

    if (!user) {
      // Auto-create new user account
      const id = `usr_g_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
      const initialPerms = defaultPerms.join(',');

      db.prepare(`
        INSERT INTO platform_users (
          id, name, email, role, permissions, status, avatar_url, profile_picture,
          auth_provider, provider_user_id, country, created_at, updated_at, last_active_at
        ) VALUES (?, ?, ?, ?, ?, 'ACTIVE', ?, ?, 'google', ?, 'India', ?, ?, ?)
      `).run(id, name, cleanEmail, effectiveRole, initialPerms, picture, picture, googleId, now, now, now);

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
      // Existing user: Link Google identity and update last active timestamp & role
      db.prepare(`
        UPDATE platform_users
        SET last_active_at = ?,
            updated_at = ?,
            role = ?,
            auth_provider = CASE WHEN auth_provider IS NULL OR auth_provider = 'local' THEN 'google' ELSE auth_provider END,
            provider_user_id = COALESCE(provider_user_id, ?),
            avatar_url = COALESCE(?, avatar_url),
            profile_picture = COALESCE(?, profile_picture)
        WHERE id = ?
      `).run(now, now, effectiveRole, googleId, picture, picture, user.id);

      user = db.prepare('SELECT * FROM platform_users WHERE id = ?').get(user.id) as any;
    }

    // 3. Create session token
    const sessionToken = createSessionToken({
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.profile_picture || user.avatar_url || picture,
      role: effectiveRole,
      authProvider: 'google',
      providerUserId: user.provider_user_id || googleId,
    });

    // Handle OQ Booking app redirection
    if (appSource === 'oq' || redirectTarget.includes('3001') || redirectTarget.includes('/oq')) {
      const targetBase = redirectTarget.startsWith('http') ? redirectTarget : `http://localhost:3001${redirectTarget.startsWith('/') ? '' : '/'}${redirectTarget}`;
      const targetUrl = new URL(targetBase);
      targetUrl.searchParams.set('google_auth', 'success');
      targetUrl.searchParams.set('email', user.email);
      targetUrl.searchParams.set('name', user.name);
      if (picture) targetUrl.searchParams.set('avatarUrl', picture);
      return NextResponse.redirect(targetUrl.toString());
    }

    // Handle InfraTrace app login with synchronous client-side storage injection
    const userPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: effectiveRole,
      permissions: defaultPerms,
      avatarUrl: user.profile_picture || user.avatar_url || picture,
      profilePicture: user.profile_picture || user.avatar_url || picture,
      authProvider: 'google',
      providerUserId: user.provider_user_id || googleId,
      company: user.company || 'InfraTrace Internal',
      jobTitle: user.job_title || 'Observability Lead',
      country: user.country || 'India',
    };

    const targetUrl = redirectTarget.startsWith('/') ? redirectTarget : `/${redirectTarget}`;
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>InfraTrace</title>
</head>
<body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#f8fafd;color:#1f1f1f;">
  <div style="text-align:center;">
    <p style="font-weight:600;font-size:16px;">Authenticating with Google...</p>
  </div>
  <script>
    try {
      localStorage.removeItem('infratrace_logged_out');
      localStorage.setItem('infratrace_active_account_email', ${JSON.stringify(user.email)});
      localStorage.setItem('infratrace_accounts_list', JSON.stringify([${JSON.stringify(userPayload)}]));
    } catch (e) {}
    window.location.replace(${JSON.stringify(targetUrl)});
  </script>
</body>
</html>`;

    const response = new NextResponse(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
    setSessionCookieOnResponse(response, sessionToken);

    return response;
  } catch (err: any) {
    return NextResponse.redirect(
      new URL(`/signin?error=${encodeURIComponent(err.message || 'Authentication error')}`, req.url)
    );
  }
}
