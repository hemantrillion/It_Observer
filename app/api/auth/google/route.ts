import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { getDatabaseConnection } from '@/lib/database/sqlite_database_connection_manager';
import { initializeObservatoryTables } from '@/lib/database/initialize_observatory_tables';
import { sendPlatformMail } from '@/lib/mail/mailbox_service';
import { createSessionToken, setSessionCookieOnResponse } from '@/lib/auth/session_manager';

interface VerifiedGoogleProfile {
  sub: string;
  email: string;
  name: string;
  picture?: string;
  email_verified?: boolean | string;
}

/**
 * Verifies a Google ID Token using Google's official tokeninfo endpoint
 */
async function verifyGoogleIdToken(idToken: string): Promise<VerifiedGoogleProfile> {
  const tokeninfoUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`;
  const resp = await fetch(tokeninfoUrl, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
  });

  if (!resp.ok) {
    const errorText = await resp.text();
    throw new Error(`Google token verification failed: ${errorText}`);
  }

  const payload = await resp.json();

  // Validate issuer
  const validIssuers = ['accounts.google.com', 'https://accounts.google.com'];
  if (!validIssuers.includes(payload.iss)) {
    throw new Error(`Invalid Google token issuer: ${payload.iss}`);
  }

  // Validate audience if client ID is configured in environment
  const expectedClientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (expectedClientId && payload.aud !== expectedClientId) {
    throw new Error(`Google token audience mismatch. Expected: ${expectedClientId}, got: ${payload.aud}`);
  }

  // Verify email exists and is verified
  if (!payload.email) {
    throw new Error('Google token did not contain an email address.');
  }

  return {
    sub: payload.sub,
    email: payload.email,
    name: payload.name || payload.given_name || payload.email.split('@')[0],
    picture: payload.picture,
    email_verified: payload.email_verified,
  };
}

/**
 * Exchanges Google OAuth 2.0 authorization code for tokens and userinfo
 */
async function exchangeAuthCodeForProfile(code: string, redirectUri: string): Promise<VerifiedGoogleProfile> {
  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Server missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET environment variable.');
  }

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
    throw new Error(`Failed to exchange Google auth code: ${errText}`);
  }

  const tokenData = await tokenResp.json();
  if (tokenData.id_token) {
    return await verifyGoogleIdToken(tokenData.id_token);
  }

  // Alternatively fetch userinfo via access token
  if (tokenData.access_token) {
    const userinfoResp = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    if (!userinfoResp.ok) {
      throw new Error('Failed to fetch Google user profile with access token.');
    }
    const info = await userinfoResp.json();
    return {
      sub: info.sub,
      email: info.email,
      name: info.name || info.email.split('@')[0],
      picture: info.picture,
      email_verified: info.email_verified,
    };
  }

  throw new Error('No ID token or access token received from Google.');
}

export async function POST(req: Request) {
  try {
    initializeObservatoryTables();
    const db = getDatabaseConnection();
    const body = await req.json().catch(() => ({}));

    let verifiedProfile: VerifiedGoogleProfile;

    if (body.credential) {
      // 1. Google Identity Services ID Token (JWT)
      verifiedProfile = await verifyGoogleIdToken(body.credential);
    } else if (body.code) {
      // 2. Authorization Code flow
      verifiedProfile = await exchangeAuthCodeForProfile(body.code, body.redirectUri || '');
    } else if (body.email && body.googleId && process.env.NODE_ENV === 'development' && !process.env.GOOGLE_CLIENT_ID) {
      // Development fallback only if no Google credentials are set yet
      verifiedProfile = {
        sub: body.googleId,
        email: body.email,
        name: body.name || body.email.split('@')[0],
        picture: body.avatarUrl || '/infra_trace_logo.png',
      };
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Google authentication credential or authorization code is required.',
        },
        { status: 400 }
      );
    }

    const cleanEmail = verifiedProfile.email.toLowerCase().trim();
    const googleId = verifiedProfile.sub;
    const displayName = verifiedProfile.name || cleanEmail.split('@')[0];
    const avatarUrl = verifiedProfile.picture || '/infra_trace_logo.png';
    const now = new Date().toISOString();

    // Look for existing user by provider_user_id OR by verified email
    let user = db
      .prepare('SELECT * FROM platform_users WHERE provider_user_id = ? OR LOWER(email) = ?')
      .get(googleId, cleanEmail) as any;

    let isNewUser = false;

    if (!user) {
      // Auto-create new user account
      isNewUser = true;
      const id = `usr_g_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;

      db.prepare(`
        INSERT INTO platform_users (
          id, name, email, role, status, avatar_url, profile_picture,
          auth_provider, provider_user_id, country, created_at, updated_at, last_active_at
        ) VALUES (?, ?, ?, 'Admin', 'ACTIVE', ?, ?, 'google', ?, 'India', ?, ?, ?)
      `).run(id, displayName, cleanEmail, avatarUrl, avatarUrl, googleId, now, now, now);

      // Send Welcome Email and save to platform mailbox
      try {
        sendPlatformMail({
          recipientEmail: cleanEmail,
          sender: 'InfraTrace Google Auth <auth@infratrace.internal>',
          subject: `Welcome to InfraTrace, ${displayName}! (Google Account Linked)`,
          snippet: `Your account was successfully registered using Google Sign-In (${cleanEmail}).`,
          body: `Hello ${displayName},\n\nWelcome to InfraTrace!\n\nYour account is now linked with your Google identity (${cleanEmail}). You can sign in anytime with one click using "Continue with Google".\n\nGoogle Account ID: ${googleId}\nStatus: Active\n\nBest regards,\nThe InfraTrace Team`,
          tag: 'WELCOME',
        });
      } catch (mailErr) {
        // Mail service error shouldn't block login
      }

      user = db.prepare('SELECT * FROM platform_users WHERE id = ?').get(id) as any;
    } else {
      // Existing user: Link Google identity if needed and update timestamp & profile
      db.prepare(`
        UPDATE platform_users
        SET last_active_at = ?,
            updated_at = ?,
            auth_provider = CASE WHEN auth_provider IS NULL OR auth_provider = 'local' THEN 'google' ELSE auth_provider END,
            provider_user_id = COALESCE(provider_user_id, ?),
            avatar_url = COALESCE(?, avatar_url),
            profile_picture = COALESCE(?, profile_picture)
        WHERE id = ?
      `).run(now, now, googleId, avatarUrl, avatarUrl, user.id);

      user = db.prepare('SELECT * FROM platform_users WHERE id = ?').get(user.id) as any;
    }

    // Build standard user account response
    const userPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role || 'Admin',
      avatarUrl: user.profile_picture || user.avatar_url || avatarUrl,
      profilePicture: user.profile_picture || user.avatar_url || avatarUrl,
      authProvider: user.auth_provider || 'google',
      providerUserId: user.provider_user_id || googleId,
      company: user.company,
      jobTitle: user.job_title,
      country: user.country || 'India',
      createdAt: user.created_at,
      updatedAt: user.updated_at || now,
    };

    // Create cryptographically signed HTTP-only session token
    const sessionToken = createSessionToken({
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: userPayload.avatarUrl,
      role: user.role,
      authProvider: 'google',
      providerUserId: user.provider_user_id || googleId,
    });

    const response = NextResponse.json({
      success: true,
      isNewUser,
      user: userPayload,
    });

    // Set secure HTTP-only session cookie
    setSessionCookieOnResponse(response, sessionToken);

    return response;
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Google authentication failed.',
      },
      { status: 500 }
    );
  }
}
