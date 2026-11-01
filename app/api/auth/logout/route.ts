import { NextResponse } from 'next/server';
import { clearSessionCookieOnResponse } from '@/lib/auth/session_manager';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Signed out successfully' });
  clearSessionCookieOnResponse(response);
  return response;
}

export async function GET() {
  const response = NextResponse.json({ success: true, message: 'Signed out successfully' });
  clearSessionCookieOnResponse(response);
  return response;
}

