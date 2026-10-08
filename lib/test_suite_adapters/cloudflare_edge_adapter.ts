import { BaseMonitorTargetAdapter, HealthCheckResult } from './base_monitor_target_interface';

export class CloudflareEdgeAdapter implements BaseMonitorTargetAdapter {
  serviceId = 'cloudflare_edge';

  async checkHealth(): Promise<HealthCheckResult> {
    const startTime = performance.now();
    try {
      // Cloudflare public edge status API
      const response = await fetch('https://www.cloudflarestatus.com/api/v2/status.json', {
        signal: AbortSignal.timeout(4000),
        cache: 'no-store',
      });

      const responseTimeMs = Math.round(performance.now() - startTime);

      if (response.ok) {
        const data = await response.json();
        const indicator = data?.status?.indicator; // 'none' | 'minor' | 'major' | 'critical'
        const isHealthy = indicator === 'none' || indicator === 'minor';

        return {
          serviceId: this.serviceId,
          status: isHealthy ? 'HEALTHY' : 'DEGRADED',
          responseTimeMs,
          httpStatus: response.status,
          errorMessage: isHealthy ? null : `Cloudflare Edge indicator: ${indicator}`,
          metadata: data?.status,
        };
      }

      return {
        serviceId: this.serviceId,
        status: 'DEGRADED',
        responseTimeMs,
        httpStatus: response.status,
        errorMessage: `HTTP ${response.status}`,
      };
    } catch (err: unknown) {
      const responseTimeMs = Math.round(performance.now() - startTime);
      const message = err instanceof Error ? err.message : 'Cloudflare endpoint unreachable';
      return {
        serviceId: this.serviceId,
        status: 'DOWN',
        responseTimeMs,
        httpStatus: 0,
        errorMessage: message,
      };
    }
  }
}
