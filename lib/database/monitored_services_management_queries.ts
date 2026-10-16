import { getDatabaseConnection } from './sqlite_database_connection_manager';
import { initializeObservatoryTables } from './initialize_observatory_tables';

export interface ServiceInput {
  id: string;
  name: string;
  target_type?: string;
  target_url?: string;
  check_interval_seconds?: number;
}

export function isServiceMonitoredQuery(id: string): boolean {
  initializeObservatoryTables();
  const db = getDatabaseConnection();
  const row = db.prepare('SELECT id FROM monitored_services WHERE id = ?').get(id);
  return Boolean(row);
}

export function addMonitoredServiceQuery(service: ServiceInput): boolean {
  initializeObservatoryTables();
  const db = getDatabaseConnection();

  const existing = db.prepare('SELECT id FROM monitored_services WHERE id = ?').get(service.id);
  if (existing) {
    return false;
  }

  const targetType = service.target_type || 'public_api';
  const targetUrl = service.target_url || 'https://api.github.com/zen';
  const interval = service.check_interval_seconds || 10;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO monitored_services (
      id, name, target_type, target_url, check_interval_seconds,
      current_status, latest_response_time_ms, uptime_percentage,
      total_checks, failed_checks, last_checked_at
    ) VALUES (?, ?, ?, ?, ?, 'HEALTHY', 45.0, 100.0, 1, 0, ?)
  `).run(service.id, service.name, targetType, targetUrl, interval, now);

  // Log in database_query_logs
  try {
    db.prepare(`
      INSERT INTO database_query_logs (operation, table_name, query_details, execution_time_ms, timestamp, status)
      VALUES ('INSERT', 'monitored_services', ?, 0.5, ?, 'SUCCESS')
    `).run(`INSERT monitored_service id=${service.id} (${service.name})`, now);
  } catch {
    // Ignore logging failures
  }

  return true;
}

export function removeMonitoredServiceQuery(id: string): boolean {
  initializeObservatoryTables();
  const db = getDatabaseConnection();

  const now = new Date().toISOString();

  // Clean up cascade
  db.prepare('DELETE FROM metric_samples WHERE service_id = ?').run(id);
  db.prepare('DELETE FROM incident_alerts WHERE service_id = ?').run(id);
  const result = db.prepare('DELETE FROM monitored_services WHERE id = ?').run(id);

  try {
    db.prepare(`
      INSERT INTO database_query_logs (operation, table_name, query_details, execution_time_ms, timestamp, status)
      VALUES ('DELETE', 'monitored_services', ?, 0.4, ?, 'SUCCESS')
    `).run(`DELETE monitored_service id=${id}`, now);
  } catch {
    // Ignore logging failures
  }

  return result.changes > 0;
}

export function toggleMonitoredServiceQuery(service: ServiceInput): { isMonitored: boolean } {
  initializeObservatoryTables();
  const isCurrentlyMonitored = isServiceMonitoredQuery(service.id);

  if (isCurrentlyMonitored) {
    removeMonitoredServiceQuery(service.id);
    return { isMonitored: false };
  } else {
    addMonitoredServiceQuery(service);
    return { isMonitored: true };
  }
}
