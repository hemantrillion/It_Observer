import { NextRequest, NextResponse } from 'next/server';
import {
  getPhaseEngineState,
  resetAllPhases,
  getAllPhaseHistory,
} from '@/lib/monitoring_engine/notification_phase_engine';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const state = getPhaseEngineState();
    const history = getAllPhaseHistory();

    return NextResponse.json({
      success: true,
      state,
      history,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    if (body.action === 'reset') {
      const state = resetAllPhases();
      return NextResponse.json({
        success: true,
        message: 'All phases reset to Phase 1 (Initial bootstrap cycle)',
        state,
      });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
