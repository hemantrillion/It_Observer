import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json(); // 'down' | 'lag' | 'recover'
    if (!['down', 'lag', 'recover'].includes(action)) {
      return NextResponse.json({ success: false, error: 'Invalid chaos action' }, { status: 400 });
    }

    const response = await fetch(`http://localhost:5001/chaos/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();
    return NextResponse.json({ success: true, result: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Companion service unreachable on port 5001';
    return NextResponse.json({ success: false, error: message }, { status: 502 });
  }
}
