import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';

export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!clientId) {
    return NextResponse.json(
      {
        error: 'GOOGLE_CLIENT_ID is not configured.',
        message: 'Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.local to enable Google OAuth.',
      },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(req.url);
  const redirectTarget = searchParams.get('redirect') || '/demo';

  // Construct callback URL
  const origin = req.nextUrl.origin || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const redirectUri = `${origin}/api/auth/google/callback`;

  // Cryptographically random CSRF state with optional redirect path
  const stateData = {
    nonce: crypto.randomBytes(16).toString('hex'),
    target: redirectTarget,
  };
  const state = Buffer.from(JSON.stringify(stateData)).toString('base64url');

  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  googleAuthUrl.searchParams.set('client_id', clientId);
  googleAuthUrl.searchParams.set('redirect_uri', redirectUri);
  googleAuthUrl.searchParams.set('response_type', 'code');
  googleAuthUrl.searchParams.set('scope', 'openid email profile');
  googleAuthUrl.searchParams.set('access_type', 'offline');
  googleAuthUrl.searchParams.set('prompt', 'select_account'); // Forces Google account chooser
  googleAuthUrl.searchParams.set('state', state);

  return NextResponse.redirect(googleAuthUrl.toString());
}

