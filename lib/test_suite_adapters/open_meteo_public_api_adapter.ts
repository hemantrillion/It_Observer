import { BaseMonitorTargetAdapter, HealthCheckResult } from './base_monitor_target_interface';

export class OpenMeteoPublicApiAdapter implements BaseMonitorTargetAdapter {
  serviceId = 'open_meteo_api';

  async checkHealth(): Promise<HealthCheckResult> {
    const startTime = performance.now();
    try {
      const response = await fetch(
        'https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&current_weather=true',
        { signal: AbortSignal.timeout(5000), cache: 'no-store' }
      );

      const responseTimeMs = Math.round(performance.now() - startTime);
      const isHealthy = response.status === 200;

      return {
        serviceId: this.serviceId,
        status: isHealthy ? 'HEALTHY' : 'DOWN',
        responseTimeMs,
        httpStatus: response.status,
        errorMessage: isHealthy ? null : `HTTP status ${response.status}`,
      };
    } catch (err: unknown) {
      const responseTimeMs = Math.round(performance.now() - startTime);
      const message = err instanceof Error ? err.message : 'Connection failed';
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
