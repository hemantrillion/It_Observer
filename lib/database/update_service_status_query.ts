import { getDatabaseConnection } from './sqlite_database_connection_manager';

export function updateServiceStatusQuery(
  serviceId: string,
  status: 'HEALTHY' | 'DEGRADED' | 'DOWN',
  responseTimeMs: number,
  isFailure: boolean
): void {
  const db = getDatabaseConnection();
  const now = new Date().toISOString();

  // First fetch current checks count
  const current = db.prepare('SELECT total_checks, failed_checks FROM monitored_services WHERE id = ?').get(serviceId) as {
    total_checks: number;
    failed_checks: number;
  } | undefined;

  const totalChecks = (current?.total_checks || 0) + 1;
  const failedChecks = (current?.failed_checks || 0) + (isFailure ? 1 : 0);
  const uptimePct = Math.max(0, Math.min(100, Number((((totalChecks - failedChecks) / totalChecks) * 100).toFixed(2))));

  db.prepare(`
    UPDATE monitored_services
    SET current_status = ?,
        latest_response_time_ms = ?,
        total_checks = ?,
        failed_checks = ?,
        uptime_percentage = ?,
        last_checked_at = ?
    WHERE id = ?
  `).run(status, responseTimeMs, totalChecks, failedChecks, uptimePct, now, serviceId);
}
