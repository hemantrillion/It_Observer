import crypto from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role?: string;
  authProvider?: string;
  providerUserId?: string;
  exp: number; // timestamp in ms
}

const DEFAULT_SECRET = 'infratrace_production_secure_auth_secret_token_key_2026';
const COOKIE_NAME = 'infratrace_session';
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function getSecret(): string {
  return process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || DEFAULT_SECRET;
}

function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf8');
}

export function createSessionToken(user: {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role?: string;
  authProvider?: string;
  providerUserId?: string;
}): string {
  const payload: SessionPayload = {
    userId: user.id,
    email: user.email.toLowerCase().trim(),
    name: user.name,
    avatarUrl: user.avatarUrl,
    role: user.role || 'Admin',
    authProvider: user.authProvider || 'local',
    providerUserId: user.providerUserId,
    exp: Date.now() + SESSION_DURATION_MS,
  };

  const payloadStr = base64UrlEncode(JSON.stringify(payload));
  const signature = crypto
    .createHmac('sha256', getSecret())
    .update(payloadStr)
    .digest('base64url');

  return `${payloadStr}.${signature}`;
}

export function verifySessionToken(token: string | null | undefined): SessionPayload | null {
  if (!token || typeof token !== 'string' || !token.includes('.')) {
    return null;
  }

  try {
    const [payloadStr, signature] = token.split('.');
    if (!payloadStr || !signature) return null;

    const expectedSignature = crypto
      .createHmac('sha256', getSecret())
      .update(payloadStr)
      .digest('base64url');

    const sigA = Buffer.from(signature);
    const sigB = Buffer.from(expectedSignature);

    if (sigA.length !== sigB.length || !crypto.timingSafeEqual(sigA, sigB)) {
      return null;
    }

    const jsonStr = base64UrlDecode(payloadStr);
    const payload = JSON.parse(jsonStr) as SessionPayload;

    if (!payload.exp || Date.now() > payload.exp) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function setSessionCookieOnResponse(res: NextResponse, token: string): void {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookies.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: Math.floor(SESSION_DURATION_MS / 1000),
  });
}

export function clearSessionCookieOnResponse(res: NextResponse): void {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookies.set({
    name: COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

export function getSessionFromRequest(req: NextRequest | Request): SessionPayload | null {
  try {
    let cookieVal: string | undefined;

    if ('cookies' in req && typeof (req as any).cookies?.get === 'function') {
      cookieVal = (req as NextRequest).cookies.get(COOKIE_NAME)?.value;
    } else {
      const cookieHeader = req.headers.get('cookie') || '';
      const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`));
      cookieVal = match ? match[1] : undefined;
    }

    if (!cookieVal) return null;
    return verifySessionToken(cookieVal);
  } catch {
    return null;
  }
}

