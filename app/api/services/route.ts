import { NextRequest, NextResponse } from 'next/server';
import { getAllMonitoredServicesQuery } from '@/lib/database/get_all_monitored_services_query';
import { getActiveIncidentsCountQuery } from '@/lib/database/get_active_incidents_count_query';
import {
  toggleMonitoredServiceQuery,
  addMonitoredServiceQuery,
  removeMonitoredServiceQuery,
  ServiceInput,
} from '@/lib/database/monitored_services_management_queries';

export const dynamic = 'force-dynamic';

function getSummaryAndServices() {
  const services = getAllMonitoredServicesQuery();
  const activeAlerts = getActiveIncidentsCountQuery();

  const summary = {
    total: services.length,
    healthy: services.filter((s) => s.current_status === 'HEALTHY').length,
    degraded: services.filter((s) => s.current_status === 'DEGRADED').length,
    down: services.filter((s) => s.current_status === 'DOWN').length,
    activeAlerts,
  };

  return { summary, services };
}

export async function GET() {
  try {
    const { summary, services } = getSummaryAndServices();
    return NextResponse.json({ success: true, summary, services });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to query services';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, service, serviceId } = body;

    let isMonitored = false;

    if (action === 'toggle' && service) {
      const res = toggleMonitoredServiceQuery(service as ServiceInput);
      isMonitored = res.isMonitored;
    } else if (action === 'add' && service) {
      addMonitoredServiceQuery(service as ServiceInput);
      isMonitored = true;
    } else if (action === 'remove' && (serviceId || service?.id)) {
      const id = serviceId || service.id;
      removeMonitoredServiceQuery(id);
      isMonitored = false;
    }

    const { summary, services } = getSummaryAndServices();

    return NextResponse.json({
      success: true,
      action,
      isMonitored,
      summary,
      services,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to modify services';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
