import { NextResponse } from 'next/server';
import { executeAllServiceChecks } from '@/lib/monitoring_engine/execute_all_service_checks';
import { getAllMonitoredServicesQuery } from '@/lib/database/get_all_monitored_services_query';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await executeAllServiceChecks();
    const services = getAllMonitoredServicesQuery();
    return NextResponse.json({ success: true, services });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Poller execution failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
