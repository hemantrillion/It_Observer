import { NextResponse } from 'next/server';
import { verifyOtp } from '@/lib/mail/mailbox_service';

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ success: false, error: 'Email and OTP are required' }, { status: 400 });
    }

    const result = verifyOtp(email.toLowerCase().trim(), otp.toString().trim());
    if (!result.valid) {
      return NextResponse.json({ success: false, error: result.reason }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Email address verified successfully.',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
