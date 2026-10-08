import { NextResponse } from 'next/server';
import { getAllMonitoredServicesQuery } from '@/lib/database/get_all_monitored_services_query';
import { getMetricSamplesByServiceQuery } from '@/lib/database/get_metric_samples_by_service_query';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const services = getAllMonitoredServicesQuery();

    let output = '';
    output += '# HELP http_response_latency_ms Response latency in milliseconds\n';
    output += '# TYPE http_response_latency_ms gauge\n';

    for (const service of services) {
      const sanitizedUrl = service.target_url.replace(/"/g, '\\"');
      output += `http_response_latency_ms{service="${service.id}",endpoint="${sanitizedUrl}",type="${service.target_type}"} ${service.latest_response_time_ms}\n`;
    }

    output += '\n# HELP service_up Service operational status (1 = healthy, 0 = down or degraded)\n';
    output += '# TYPE service_up gauge\n';

    for (const service of services) {
      const isUp = service.current_status === 'HEALTHY' ? 1 : 0;
      output += `service_up{service="${service.id}",status="${service.current_status}"} ${isUp}\n`;
    }

    output += '\n# HELP http_requests_total Total health check probes executed\n';
    output += '# TYPE http_requests_total counter\n';

    for (const service of services) {
      output += `http_requests_total{service="${service.id}",result="success"} ${service.total_checks - service.failed_checks}\n`;
      output += `http_requests_total{service="${service.id}",result="failure"} ${service.failed_checks}\n`;
    }

    output += '\n# HELP service_uptime_percentage Service uptime percentage (0-100)\n';
    output += '# TYPE service_uptime_percentage gauge\n';

    for (const service of services) {
      output += `service_uptime_percentage{service="${service.id}"} ${service.uptime_percentage}\n`;
    }

    // Include recent system memory and CPU if available
    const localSamples = getMetricSamplesByServiceQuery('local_controlled_service', 1);
    if (localSamples.length > 0) {
      const sample = localSamples[0];
      output += '\n# HELP process_cpu_percentage Process CPU usage percentage\n';
      output += '# TYPE process_cpu_percentage gauge\n';
      output += `process_cpu_percentage{service="local_controlled_service"} ${sample.cpu_percentage}\n`;

      output += '\n# HELP process_memory_rss_bytes Process Resident Set Size memory in bytes\n';
      output += '# TYPE process_memory_rss_bytes gauge\n';
      output += `process_memory_rss_bytes{service="local_controlled_service"} ${sample.memory_mb * 1024 * 1024}\n`;
    }

    return new Response(output, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Metrics extraction error';
    return new Response(`# ERROR: ${message}\n`, {
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}
