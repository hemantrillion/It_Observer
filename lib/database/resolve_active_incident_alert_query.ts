import { getDatabaseConnection } from './sqlite_database_connection_manager';

export function resolveActiveIncidentAlertQuery(serviceId: string): void {
  const db = getDatabaseConnection();
  const now = new Date();
  const resolvedAt = now.toISOString();

  const activeIncident = db.prepare(`
    SELECT id, started_at FROM incident_alerts
    WHERE service_id = ? AND is_active = 1
  `).get(serviceId) as { id: number; started_at: string } | undefined;

  if (activeIncident) {
    const startedTime = new Date(activeIncident.started_at).getTime();
    const durationSec = Math.max(1, Math.round((now.getTime() - startedTime) / 1000));

    db.prepare(`
      UPDATE incident_alerts
      SET is_active = 0,
          resolved_at = ?,
          duration_seconds = ?
      WHERE id = ?
    `).run(resolvedAt, durationSec, activeIncident.id);
  }
}
