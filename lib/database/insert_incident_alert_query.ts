import { getDatabaseConnection } from './sqlite_database_connection_manager';

export interface IncidentAlertInput {
  serviceId: string;
  severity: 'CRITICAL' | 'WARNING' | 'HEALTHY';
  reason: string;
}

export function insertIncidentAlertQuery(input: IncidentAlertInput): number {
  const db = getDatabaseConnection();
  const startedAt = new Date().toISOString();

  // If severity is HEALTHY, it is an informational status log, not an active outage
  if (input.severity === 'HEALTHY') {
    const result = db.prepare(`
      INSERT INTO incident_alerts (service_id, severity, reason, started_at, is_active, duration_seconds)
      VALUES (?, 'HEALTHY', ?, ?, 0, 0)
    `).run(input.serviceId, input.reason, startedAt);
    return Number(result.lastInsertRowid);
  }

  // Check if there is already an active incident for this service
  const existing = db.prepare(`
    SELECT id FROM incident_alerts
    WHERE service_id = ? AND is_active = 1
  `).get(input.serviceId) as { id: number } | undefined;

  if (existing) {
    db.prepare(`
      UPDATE incident_alerts
      SET severity = ?, reason = ?
      WHERE id = ?
    `).run(input.severity, input.reason, existing.id);
    return existing.id;
  }

  const result = db.prepare(`
    INSERT INTO incident_alerts (service_id, severity, reason, started_at, is_active, duration_seconds)
    VALUES (?, ?, ?, ?, 1, 0)
  `).run(input.serviceId, input.severity, input.reason, startedAt);

  return Number(result.lastInsertRowid);
}
