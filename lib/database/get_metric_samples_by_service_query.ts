import { getDatabaseConnection } from './sqlite_database_connection_manager';
import { initializeObservatoryTables } from './initialize_observatory_tables';

export interface MetricSampleRecord {
  id: number;
  service_id: string;
  timestamp: string;
  response_time_ms: number;
  http_status: number;
  cpu_percentage: number;
  memory_mb: number;
  error_message: string | null;
}

export function getMetricSamplesByServiceQuery(serviceId: string, limit = 120): MetricSampleRecord[] {
  initializeObservatoryTables();
  const db = getDatabaseConnection();
  return db.prepare(`
    SELECT * FROM metric_samples
    WHERE service_id = ?
    ORDER BY id DESC
    LIMIT ?
  `).all(serviceId, limit) as unknown as MetricSampleRecord[];
}
