import { NextRequest, NextResponse } from 'next/server';
import { executeAllServiceChecks } from '@/lib/monitoring_engine/execute_all_service_checks';
import { getAllMonitoredServicesQuery } from '@/lib/database/get_all_monitored_services_query';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action || 'down'; // 'down' | 'lag' | 'recover' | 'flapping'
    const port = body.port || 5001;

    let targetUrl = `http://localhost:${port}/chaos/${action}`;
    if (action === 'flapping') {
      // Toggle back and forth to simulate flapping
      await fetch(`http://localhost:${port}/chaos/down`, { method: 'POST' }).catch(() => {});
      await executeAllServiceChecks().catch(() => {});
      await fetch(`http://localhost:${port}/chaos/recover`, { method: 'POST' }).catch(() => {});
      await executeAllServiceChecks().catch(() => {});
      await fetch(`http://localhost:${port}/chaos/down`, { method: 'POST' }).catch(() => {});
      await executeAllServiceChecks().catch(() => {});
      await fetch(`http://localhost:${port}/chaos/recover`, { method: 'POST' }).catch(() => {});
      await executeAllServiceChecks().catch(() => {});

      const services = getAllMonitoredServicesQuery();
      return NextResponse.json({
        success: true,
        action: 'flapping',
        message: 'Flapping sequence executed across local controlled service',
        services,
      });
    }

    // Normal single chaos action
    const chaosResp = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    const chaosResult = await chaosResp.json().catch(() => ({ status: chaosResp.status }));

    // Run poller immediately if requested
    if (body.runPoller) {
      // Run once or twice depending on requirement
      await executeAllServiceChecks();
      if (action === 'down' || action === 'recover') {
        // Run second check to satisfy the 2-consecutive threshold!
        await executeAllServiceChecks();
      }
    }

    const services = getAllMonitoredServicesQuery();
    return NextResponse.json({
      success: true,
      action,
      chaosResult,
      services,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
