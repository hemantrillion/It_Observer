import { BaseMonitorTargetAdapter, HealthCheckResult } from './base_monitor_target_interface';

export class LocalControlledNodeServiceAdapter implements BaseMonitorTargetAdapter {
  serviceId = 'local_controlled_service';

  async checkHealth(): Promise<HealthCheckResult> {
    const startTime = performance.now();
    try {
      const response = await fetch('http://127.0.0.1:5001/metrics', {
        signal: AbortSignal.timeout(4000),
        cache: 'no-store',
      });

      const responseTimeMs = Math.round(performance.now() - startTime);

      if (!response.ok) {
        return {
          serviceId: this.serviceId,
          status: 'DOWN',
          responseTimeMs,
          httpStatus: response.status,
          errorMessage: `Service returned HTTP ${response.status} (Intentional or Process Failure)`,
        };
      }

      const data = await response.json();
      const isDegraded = responseTimeMs > 1500;

      return {
        serviceId: this.serviceId,
        status: isDegraded ? 'DEGRADED' : 'HEALTHY',
        responseTimeMs,
        httpStatus: response.status,
        cpuPercentage: data.cpuPercentage || 0,
        memoryMb: data.memoryMb || 0,
        errorMessage: isDegraded ? 'High latency detected on internal loop' : null,
        metadata: data,
      };
    } catch (err: unknown) {
      const responseTimeMs = Math.round(performance.now() - startTime);
      const message = err instanceof Error ? err.message : 'Local service not running or connection refused';
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
