import { BaseMonitorTargetAdapter, HealthCheckResult } from './base_monitor_target_interface';

export class GitHubPublicApiAdapter implements BaseMonitorTargetAdapter {
  serviceId = 'github_api';

  async checkHealth(): Promise<HealthCheckResult> {
    const startTime = performance.now();
    try {
      const response = await fetch('https://api.github.com/users/octocat', {
        headers: {
          'User-Agent': 'Infrastructure-Observatory-30A',
          'Accept': 'application/vnd.github.v3+json',
        },
        signal: AbortSignal.timeout(6000),
        cache: 'no-store',
      });

      const responseTimeMs = Math.round(performance.now() - startTime);
      const remainingLimit = response.headers.get('x-ratelimit-remaining');

      const isHealthy = response.status === 200;
      const isDegraded = response.status === 403 || responseTimeMs > 1200;

      return {
        serviceId: this.serviceId,
        status: isHealthy ? 'HEALTHY' : isDegraded ? 'DEGRADED' : 'DOWN',
        responseTimeMs,
        httpStatus: response.status,
        errorMessage: isHealthy ? null : `HTTP ${response.status} (RateLimit remaining: ${remainingLimit})`,
        metadata: {
          rateLimitRemaining: remainingLimit,
        },
      };
    } catch (err: unknown) {
      const responseTimeMs = Math.round(performance.now() - startTime);
      const message = err instanceof Error ? err.message : 'Unknown network failure';
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
