import { NextResponse } from 'next/server';
import { generateAndSendOtp } from '@/lib/mail/mailbox_service';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ success: false, error: 'Valid email address is required' }, { status: 400 });
    }

    const result = generateAndSendOtp(email.toLowerCase().trim());
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.message }, { status: 429 });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      otpPreview: result.otpPreview,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
