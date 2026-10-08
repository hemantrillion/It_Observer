import { NextResponse } from 'next/server';
import { getAllMonitoredServicesQuery } from '@/lib/database/get_all_monitored_services_query';
import { getActiveIncidentsCountQuery } from '@/lib/database/get_active_incidents_count_query';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const services = getAllMonitoredServicesQuery();
    const activeAlerts = getActiveIncidentsCountQuery();

    const summary = {
      total: services.length,
      healthy: services.filter((s) => s.current_status === 'HEALTHY').length,
      degraded: services.filter((s) => s.current_status === 'DEGRADED').length,
      down: services.filter((s) => s.current_status === 'DOWN').length,
      activeAlerts,
    };

    return NextResponse.json({ success: true, summary, services });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to query services';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
