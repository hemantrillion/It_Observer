import { HealthCheckResult } from '../test_suite_adapters/base_monitor_target_interface';
import { insertIncidentAlertQuery } from '../database/insert_incident_alert_query';
import { resolveActiveIncidentAlertQuery } from '../database/resolve_active_incident_alert_query';
import { getDatabaseConnection } from '../database/sqlite_database_connection_manager';

export function evaluateIncidentThresholds(result: HealthCheckResult): void {
  if (result.status === 'DOWN') {
    insertIncidentAlertQuery({
      serviceId: result.serviceId,
      severity: 'CRITICAL',
      reason: result.errorMessage || `Endpoint unreachable or returned HTTP ${result.httpStatus}`,
    });
  } else if (result.status === 'DEGRADED') {
    insertIncidentAlertQuery({
      serviceId: result.serviceId,
      severity: 'WARNING',
      reason: result.errorMessage || `High response latency of ${result.responseTimeMs}ms exceeded threshold`,
    });
  } else if (result.status === 'HEALTHY') {
    // If healthy, resolve any active incident for this service
    resolveActiveIncidentAlertQuery(result.serviceId);

    // Log healthy status event periodically (> 60s) or upon recovering
    try {
      const db = getDatabaseConnection();
      const lastRow = db.prepare(`
        SELECT severity, started_at FROM incident_alerts
        WHERE service_id = ?
        ORDER BY id DESC LIMIT 1
      `).get(result.serviceId) as { severity: string; started_at: string } | undefined;

      const timeSinceLast = lastRow
        ? Date.now() - new Date(lastRow.started_at).getTime()
        : Infinity;

      if (!lastRow || lastRow.severity !== 'HEALTHY' || timeSinceLast > 60000) {
        insertIncidentAlertQuery({
          serviceId: result.serviceId,
          severity: 'HEALTHY',
          reason: 'Nominal health check verified',
        });
      }
    } catch (err) {
      console.error('Failed to log healthy status incident:', err);
    }
  }
}
