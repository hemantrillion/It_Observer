import { getDatabaseConnection } from './sqlite_database_connection_manager';
import { initializeObservatoryTables } from './initialize_observatory_tables';
import { MonitoredServiceRecord } from './get_all_monitored_services_query';

export function getSingleServiceByIdQuery(serviceId: string): MonitoredServiceRecord | null {
  initializeObservatoryTables();
  const db = getDatabaseConnection();
  const row = db.prepare('SELECT * FROM monitored_services WHERE id = ?').get(serviceId);
  return (row as unknown as MonitoredServiceRecord) || null;
}
