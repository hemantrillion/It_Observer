import { getDatabaseConnection } from './sqlite_database_connection_manager';
import { initializeObservatoryTables } from './initialize_observatory_tables';

export function getActiveIncidentsCountQuery(): number {
  initializeObservatoryTables();
  const db = getDatabaseConnection();
  const row = db.prepare('SELECT COUNT(*) as count FROM incident_alerts WHERE is_active = 1').get() as { count: number };
  return row?.count || 0;
}
