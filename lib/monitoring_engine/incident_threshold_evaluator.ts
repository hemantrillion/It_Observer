import { HealthCheckResult } from '../test_suite_adapters/base_monitor_target_interface';
import { insertIncidentAlertQuery } from '../database/insert_incident_alert_query';
import { resolveActiveIncidentAlertQuery } from '../database/resolve_active_incident_alert_query';

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
  }
}
