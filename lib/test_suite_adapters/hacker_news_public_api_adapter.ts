import { BaseMonitorTargetAdapter, HealthCheckResult } from './base_monitor_target_interface';

export class HackerNewsPublicApiAdapter implements BaseMonitorTargetAdapter {
  serviceId = 'hacker_news_api';

  async checkHealth(): Promise<HealthCheckResult> {
    const startTime = performance.now();
    try {
      const response = await fetch('https://hacker-news.firebaseio.com/v0/maxitem.json', {
        signal: AbortSignal.timeout(5000),
        cache: 'no-store',
      });

      const responseTimeMs = Math.round(performance.now() - startTime);
      const isHealthy = response.status === 200;
      const isDegraded = responseTimeMs > 1000;

      return {
        serviceId: this.serviceId,
        status: isHealthy ? (isDegraded ? 'DEGRADED' : 'HEALTHY') : 'DOWN',
        responseTimeMs,
        httpStatus: response.status,
        errorMessage: isHealthy ? null : `HTTP status ${response.status}`,
      };
    } catch (err: unknown) {
      const responseTimeMs = Math.round(performance.now() - startTime);
      const message = err instanceof Error ? err.message : 'Timeout or network error';
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
