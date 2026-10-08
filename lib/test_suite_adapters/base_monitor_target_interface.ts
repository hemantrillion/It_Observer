export interface HealthCheckResult {
  serviceId: string;
  status: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  responseTimeMs: number;
  httpStatus: number;
  cpuPercentage?: number;
  memoryMb?: number;
  errorMessage?: string | null;
  metadata?: Record<string, unknown>;
}

export interface BaseMonitorTargetAdapter {
  serviceId: string;
  checkHealth(): Promise<HealthCheckResult>;
}
