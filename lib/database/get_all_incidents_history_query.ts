import { getDatabaseConnection } from './sqlite_database_connection_manager';
import { initializeObservatoryTables } from './initialize_observatory_tables';

export interface IncidentAlertRecord {
  id: number;
  service_id: string;
  service_name?: string;
  severity: 'CRITICAL' | 'WARNING';
  reason: string;
  started_at: string;
  resolved_at: string | null;
  is_active: number;
  duration_seconds: number;
}

export function getAllIncidentsHistoryQuery(limit = 50): IncidentAlertRecord[] {
  initializeObservatoryTables();
  const db = getDatabaseConnection();
  return db.prepare(`
    SELECT i.*, s.name as service_name
    FROM incident_alerts i
    LEFT JOIN monitored_services s ON i.service_id = s.id
    ORDER BY i.is_active DESC, i.started_at DESC
    LIMIT ?
  `).all(limit) as unknown as IncidentAlertRecord[];
}
