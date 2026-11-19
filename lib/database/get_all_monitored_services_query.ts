import { getDatabaseConnection } from './sqlite_database_connection_manager';
import { initializeObservatoryTables } from './initialize_observatory_tables';

export interface MonitoredServiceRecord {
  id: string;
  name: string;
  target_type: 'public_api' | 'system_process' | 'cloud_provider';
  target_url: string;
  check_interval_seconds: number;
  current_status: 'HEALTHY' | 'UP' | 'DEGRADED' | 'DOWN' | 'UNSTABLE';
  latest_response_time_ms: number;
  uptime_percentage: number;
  total_checks: number;
  failed_checks: number;
  last_checked_at: string | null;
  previous_status?: string;
  consecutive_failures?: number;
  consecutive_successes?: number;
  last_state_change_at?: string | null;
  last_notified_status?: string;
  last_notified_at?: string | null;
}

export function getAllMonitoredServicesQuery(): MonitoredServiceRecord[] {
  initializeObservatoryTables();
  const db = getDatabaseConnection();
  return db.prepare('SELECT * FROM monitored_services ORDER BY target_type ASC, name ASC').all() as unknown as MonitoredServiceRecord[];
}
