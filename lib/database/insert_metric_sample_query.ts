import { getDatabaseConnection } from './sqlite_database_connection_manager';

export interface MetricSampleInput {
  serviceId: string;
  responseTimeMs: number;
  httpStatus: number;
  cpuPercentage?: number;
  memoryMb?: number;
  errorMessage?: string | null;
}

export function insertMetricSampleQuery(input: MetricSampleInput): void {
  const db = getDatabaseConnection();
  const timestamp = new Date().toISOString();

  db.prepare(`
    INSERT INTO metric_samples (service_id, timestamp, response_time_ms, http_status, cpu_percentage, memory_mb, error_message)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    input.serviceId,
    timestamp,
    input.responseTimeMs,
    input.httpStatus,
    input.cpuPercentage || 0,
    input.memoryMb || 0,
    input.errorMessage || null
  );
}
