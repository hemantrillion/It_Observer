import { HealthCheckResult } from '../test_suite_adapters/base_monitor_target_interface';
import { insertIncidentAlertQuery } from '../database/insert_incident_alert_query';
import { resolveActiveIncidentAlertQuery } from '../database/resolve_active_incident_alert_query';
import { getDatabaseConnection } from '../database/sqlite_database_connection_manager';
import { sendPlatformMail } from '../mail/mailbox_service';

export function evaluateIncidentThresholds(result: HealthCheckResult): void {
  const db = getDatabaseConnection();

  // Retrieve current service metadata including previous status & notification state
  const service = db
    .prepare('SELECT id, name, target_url, current_status, last_down_notified_at, user_email FROM monitored_services WHERE id = ?')
    .get(result.serviceId) as {
      id: string;
      name: string;
      target_url: string;
      current_status: string;
      last_down_notified_at?: string | null;
      user_email?: string | null;
    } | undefined;

  const previousStatus = service?.current_status || 'HEALTHY';
  const serviceName = service?.name || result.serviceId;
  const now = new Date();
  const nowIso = now.toISOString();

  // Determine recipient user emails: specific user if bound, else all active registered users
  let recipientEmails: string[] = [];
  if (service?.user_email) {
    recipientEmails = [service.user_email];
  } else {
    try {
      const activeUsers = db.prepare('SELECT email FROM platform_users WHERE status = ?').all('ACTIVE') as { email: string }[];
      recipientEmails = activeUsers.map((u) => u.email);
    } catch {
      // fallback
    }
  }
  if (recipientEmails.length === 0) {
    recipientEmails = ['xyztestuser@gmail.com'];
  }

  if (result.status === 'DOWN') {
    insertIncidentAlertQuery({
      serviceId: result.serviceId,
      severity: 'CRITICAL',
      reason: result.errorMessage || `Endpoint unreachable or returned HTTP ${result.httpStatus}`,
    });

    // Notification Throttling & State-Transition Logic
    let shouldSendDownAlert = false;
    const lastNotifiedTime = service?.last_down_notified_at ? new Date(service.last_down_notified_at).getTime() : 0;
    const msSinceLastNotification = now.getTime() - lastNotifiedTime;
    const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

    if (previousStatus !== 'DOWN') {
      // 1. FIRST DOWN TRANSITION: Immediate notification
      shouldSendDownAlert = true;
    } else if (msSinceLastNotification >= TWENTY_FOUR_HOURS_MS) {
      // 2. CONTINUED DOWN STATE: Throttled to max 1 repeated notification per 24 hours
      shouldSendDownAlert = true;
    }

    if (shouldSendDownAlert) {
      // Send platform email and log to Mail tab for all relevant users
      for (const recipient of recipientEmails) {
        sendPlatformMail({
          recipientEmail: recipient,
          sender: 'InfraTrace Alerts <alerts@infratrace.internal>',
          subject: `🚨 Outage Alert: ${serviceName} is DOWN`,
          snippet: `State change detected: ${serviceName} transitioned to DOWN (${result.errorMessage || 'HTTP ' + result.httpStatus}).`,
          body: `Incident Alert Notification\n\nTarget: ${serviceName}\nStatus: DOWN\nReason: ${result.errorMessage || 'HTTP status ' + result.httpStatus}\nLatency: ${result.responseTimeMs}ms\nTimestamp: ${now.toUTCString()}\n\nInfraTrace state-transition monitor will alert you once this service recovers. Repeated alerts are throttled to a maximum of 1 per 24 hours while down.\n\nInfraTrace Automated SRE Engine`,
          tag: 'ALERT',
        });
      }

      // Record notification timestamp in SQLite
      db.prepare('UPDATE monitored_services SET last_down_notified_at = ? WHERE id = ?').run(nowIso, result.serviceId);
    }
  } else if (result.status === 'DEGRADED') {
    insertIncidentAlertQuery({
      serviceId: result.serviceId,
      severity: 'WARNING',
      reason: result.errorMessage || `High response latency of ${result.responseTimeMs}ms exceeded threshold`,
    });
  } else if (result.status === 'HEALTHY') {
    // Resolve active incident
    resolveActiveIncidentAlertQuery(result.serviceId);

    // 3. RECOVERY NOTIFICATION: When recovering from DOWN to HEALTHY
    if (previousStatus === 'DOWN') {
      for (const recipient of recipientEmails) {
        sendPlatformMail({
          recipientEmail: recipient,
          sender: 'InfraTrace Resolution <alerts@infratrace.internal>',
          subject: `✅ Service Recovery: ${serviceName} is back UP`,
          snippet: `Nominal state restored: ${serviceName} has recovered and is verified HEALTHY (${result.responseTimeMs}ms latency).`,
          body: `Service Recovery Notification\n\nTarget: ${serviceName}\nStatus: HEALTHY\nResponse Latency: ${result.responseTimeMs}ms\nHTTP Status: ${result.httpStatus || 200}\nTimestamp: ${now.toUTCString()}\n\nAll synthetic health checks have passed. Outage resolved.\n\nInfraTrace Automated SRE Engine`,
          tag: 'RECOVERY',
        });
      }

      // Clear down notification timestamp
      db.prepare('UPDATE monitored_services SET last_down_notified_at = NULL WHERE id = ?').run(result.serviceId);
    }

    // Log periodic healthy verification
    try {
      const lastRow = db.prepare(`
        SELECT severity, started_at FROM incident_alerts
        WHERE service_id = ?
        ORDER BY id DESC LIMIT 1
      `).get(result.serviceId) as { severity: string; started_at: string } | undefined;

      const timeSinceLast = lastRow
        ? now.getTime() - new Date(lastRow.started_at).getTime()
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
