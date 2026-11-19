import crypto from 'node:crypto';
import { getDatabaseConnection } from '@/lib/database/sqlite_database_connection_manager';
import { initializeObservatoryTables } from '@/lib/database/initialize_observatory_tables';
import { getNotificationSystemConfig } from '@/lib/monitoring_engine/notification_config';
import { GeneratedEmail, ServiceMonitoringState } from './email_template_builder';

export interface NotificationDispatchResult {
  recipient: string;
  delivered: boolean;
  provider: 'RESEND' | 'SENDGRID' | 'SMTP' | 'PLATFORM_MAILBOX';
  error?: string;
}

/**
 * Resolves list of authorized recipient email addresses for a service status transition.
 */
export function getAuthorizedAlertRecipients(
  newStatus: ServiceMonitoringState
): string[] {
  initializeObservatoryTables();
  const db = getDatabaseConnection();
  const config = getNotificationSystemConfig();

  // If explicit recipient override is specified in environment or config, prioritize it
  if (config.alertRecipientOverride) {
    const addresses = config.alertRecipientOverride
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter((s) => s.includes('@'));
    if (addresses.length > 0) {
      return Array.from(new Set(addresses));
    }
  }

  // Fetch active platform users
  const activeUsers = db
    .prepare('SELECT email FROM platform_users WHERE status = "ACTIVE"')
    .all() as { email: string }[];

  const recipients: string[] = [];

  for (const user of activeUsers) {
    const email = user.email.toLowerCase().trim();

    // Check user preferences if configured
    try {
      const pref = db
        .prepare('SELECT * FROM user_notification_preferences WHERE LOWER(user_email) = ?')
        .get(email) as any;

      if (pref) {
        if (pref.is_enabled === 0) continue;
        if (newStatus === 'DOWN' && pref.notify_down === 0) continue;
        if (newStatus === 'UP' && pref.notify_up === 0) continue;
        if (newStatus === 'DEGRADED' && pref.notify_degraded === 0) continue;
        if (newStatus === 'UNSTABLE' && pref.notify_unstable === 0) continue;
      }
    } catch (_) {}

    recipients.push(email);
  }

  // Fallback to real administrator email if database has no active users yet
  if (recipients.length === 0) {
    recipients.push('jai18hemant334@gmail.com');
  }

  return Array.from(new Set(recipients));
}

/**
 * Dispatches an external email via Resend REST API if configured
 */
export async function sendViaResend(
  apiKey: string,
  from: string,
  to: string,
  subject: string,
  html: string,
  text: string
): Promise<boolean> {
  // Ensure 'from' header complies with Resend onboarding domain if unverified custom domain
  const senderAddress = from.includes('<') ? from : `InfraTrace Alerts <${from}>`;

  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: senderAddress,
      to: [to],
      subject,
      html,
      text,
    }),
  });

  if (!resp.ok) {
    const errBody = await resp.text();
    throw new Error(`Resend delivery failed (${resp.status}): ${errBody}`);
  }
  return true;
}

/**
 * Dispatches an external email via SendGrid REST API if configured
 */
export async function sendViaSendGrid(
  apiKey: string,
  from: string,
  to: string,
  subject: string,
  html: string,
  text: string
): Promise<boolean> {
  const resp = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: from },
      subject,
      content: [
        { type: 'text/plain', value: text },
        { type: 'text/html', value: html },
      ],
    }),
  });

  if (!resp.ok) {
    const errBody = await resp.text();
    throw new Error(`SendGrid delivery failed (${resp.status}): ${errBody}`);
  }
  return true;
}

/**
 * Stores email in SQLite platform_mailbox for in-app viewing in the Mail cockpit
 */
export function storeInPlatformMailbox(
  recipientEmail: string,
  sender: string,
  subject: string,
  snippet: string,
  body: string,
  tag: string
): string {
  const db = getDatabaseConnection();
  const id = `mail_alert_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO platform_mailbox (id, recipient_email, sender, subject, snippet, body, sent_at, is_read, tag)
    VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)
  `).run(id, recipientEmail, sender, subject, snippet, body, now, tag);

  return id;
}

/**
 * Dispatches a smart notification to all authorized recipients.
 * Enforces strict database-level idempotency to prevent duplicate notifications.
 */
export async function dispatchStateChangeNotification(params: {
  serviceId: string;
  previousStatus: ServiceMonitoringState;
  newStatus: ServiceMonitoringState;
  email: GeneratedEmail;
  transitionTimestamp: string;
}): Promise<NotificationDispatchResult[]> {
  initializeObservatoryTables();
  const db = getDatabaseConnection();
  const config = getNotificationSystemConfig();
  const recipients = getAuthorizedAlertRecipients(params.newStatus);
  const results: NotificationDispatchResult[] = [];

  const senderString = `${config.senderName} <${config.senderEmail}>`;
  const resendApiKey = process.env.RESEND_API_KEY;
  const sendgridApiKey = process.env.SENDGRID_API_KEY;

  for (const recipient of recipients) {
    // Unique deterministic idempotency key per recipient & transition
    const idempotencyKey = `notif_${params.serviceId}_${params.previousStatus}_to_${params.newStatus}_${params.transitionTimestamp}_${recipient}`;

    // 1. Idempotency Check: Verify this notification has not already been sent
    try {
      const existingLog = db
        .prepare('SELECT id FROM service_notification_logs WHERE idempotency_key = ?')
        .get(idempotencyKey) as { id: string } | undefined;

      if (existingLog) {
        // Duplicate send strictly prevented
        continue;
      }
    } catch (_) {}

    const logId = `log_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    let deliveryStatus = 'STORED';
    let provider: 'RESEND' | 'SENDGRID' | 'SMTP' | 'PLATFORM_MAILBOX' = 'PLATFORM_MAILBOX';
    let deliveryError: string | undefined;

    // 2. Always store a copy in platform_mailbox for the in-app telemetry inbox
    try {
      storeInPlatformMailbox(
        recipient,
        senderString,
        params.email.subject,
        params.email.snippet,
        params.email.text,
        params.newStatus === 'DOWN' ? 'INCIDENTS' : 'ALERTS'
      );
    } catch (err: any) {
      console.error(`[Notification] Failed to store in platform_mailbox for ${recipient}:`, err.message);
    }

    // 3. Attempt external delivery if credentials are provided
    try {
      if (resendApiKey) {
        provider = 'RESEND';
        await sendViaResend(
          resendApiKey,
          senderString,
          recipient,
          params.email.subject,
          params.email.html,
          params.email.text
        );
        deliveryStatus = 'DELIVERED';
      } else if (sendgridApiKey) {
        provider = 'SENDGRID';
        await sendViaSendGrid(
          sendgridApiKey,
          config.senderEmail,
          recipient,
          params.email.subject,
          params.email.html,
          params.email.text
        );
        deliveryStatus = 'DELIVERED';
      } else {
        // Platform in-app storage only
        provider = 'PLATFORM_MAILBOX';
        deliveryStatus = 'STORED';
      }
    } catch (extErr: any) {
      deliveryStatus = 'FAILED';
      deliveryError = extErr.message || 'External provider delivery failed';
      console.error(`[Notification] External delivery failed to ${recipient}:`, deliveryError);
    }

    // 4. Record permanent log entry in database
    const now = new Date().toISOString();
    try {
      db.prepare(`
        INSERT INTO service_notification_logs (
          id, service_id, recipient_email, event_type, previous_status,
          new_status, subject, delivery_status, delivery_provider, sent_at,
          idempotency_key, error_message
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        logId,
        params.serviceId,
        recipient,
        `${params.previousStatus}_TO_${params.newStatus}`,
        params.previousStatus,
        params.newStatus,
        params.email.subject,
        deliveryStatus,
        provider,
        now,
        idempotencyKey,
        deliveryError || null
      );
    } catch (logErr: any) {
      console.error('[Notification] Failed to record notification log:', logErr.message);
    }

    results.push({
      recipient,
      delivered: deliveryStatus !== 'FAILED',
      provider,
      error: deliveryError,
    });
  }

  return results;
}
