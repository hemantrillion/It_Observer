import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseConnection } from '@/lib/database/sqlite_database_connection_manager';
import { initializeObservatoryTables } from '@/lib/database/initialize_observatory_tables';
import { getNotificationSystemConfig } from '@/lib/monitoring_engine/notification_config';
import {
  buildStatusChangeEmail,
  ServiceMonitoringState,
} from '@/lib/notifications/email_template_builder';
import { sendViaResend, storeInPlatformMailbox } from '@/lib/notifications/email_delivery_service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    initializeObservatoryTables();
    const db = getDatabaseConnection();
    const config = getNotificationSystemConfig();

    const apiKey = process.env.RESEND_API_KEY || '';
    const maskedKey = apiKey
      ? `${apiKey.slice(0, 7)}••••••••${apiKey.slice(-4)}`
      : 'Not configured';

    const logs = db
      .prepare(`
        SELECT * FROM service_notification_logs
        ORDER BY sent_at DESC
        LIMIT 50
      `)
      .all();

    const transitions = db
      .prepare(`
        SELECT * FROM service_state_transitions
        ORDER BY transition_timestamp DESC
        LIMIT 25
      `)
      .all();

    const totalLogsRow = db
      .prepare('SELECT COUNT(*) as count FROM service_notification_logs')
      .get() as { count: number };

    const deliveredLogsRow = db
      .prepare("SELECT COUNT(*) as count FROM service_notification_logs WHERE delivery_status = 'DELIVERED'")
      .get() as { count: number };

    const failedLogsRow = db
      .prepare("SELECT COUNT(*) as count FROM service_notification_logs WHERE delivery_status = 'FAILED'")
      .get() as { count: number };

    return NextResponse.json({
      success: true,
      config: {
        ...config,
        hasResendKey: Boolean(apiKey),
        maskedKey,
        provider: apiKey ? 'RESEND' : 'PLATFORM_MAILBOX',
      },
      stats: {
        totalSent: totalLogsRow?.count || 0,
        deliveredExternal: deliveredLogsRow?.count || 0,
        failedExternal: failedLogsRow?.count || 0,
      },
      logs,
      transitions,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    initializeObservatoryTables();
    const db = getDatabaseConnection();
    const config = getNotificationSystemConfig();
    const body = await req.json().catch(() => ({}));

    const targetEmail = (body.recipient || config.alertRecipientOverride || 'jai18hemant334@gmail.com').trim();
    const state: ServiceMonitoringState = body.state || 'DOWN';
    const serviceName = body.serviceName || 'Local Controlled Node Service';
    const serviceId = body.serviceId || 'local_controlled_service';
    const targetUrl = body.targetUrl || 'http://localhost:5001/metrics';

    const testEmail = buildStatusChangeEmail({
      serviceName,
      serviceId,
      targetUrl,
      previousStatus: state === 'DOWN' ? 'UP' : 'DOWN',
      currentStatus: state,
      timestamp: new Date().toISOString(),
      responseTimeMs: state === 'DEGRADED' ? 2450 : 42,
      httpStatus: state === 'DOWN' ? 503 : 200,
      errorDetails: state === 'DOWN' ? 'Service unavailable: simulated chaos trigger' : null,
      triggerReason: `Manual operator verification test from Delivery Console`,
    });

    const apiKey = process.env.RESEND_API_KEY;
    let delivered = false;
    let provider = 'PLATFORM_MAILBOX';
    let errorMessage: string | undefined;

    // 1. Store in platform_mailbox
    storeInPlatformMailbox(
      targetEmail,
      `${config.senderName} <${config.senderEmail}>`,
      testEmail.subject,
      testEmail.snippet,
      testEmail.text,
      state === 'DOWN' ? 'INCIDENTS' : 'ALERTS'
    );

    // 2. Deliver via Resend if available
    if (apiKey) {
      provider = 'RESEND';
      try {
        await sendViaResend(
          apiKey,
          config.senderEmail,
          targetEmail,
          testEmail.subject,
          testEmail.html,
          testEmail.text
        );
        delivered = true;
      } catch (err: any) {
        errorMessage = err.message;
      }
    } else {
      delivered = true;
    }

    // 3. Log to service_notification_logs
    const logId = `test_${Date.now()}`;
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
        serviceId,
        targetEmail,
        `TEST_${state}`,
        state === 'DOWN' ? 'UP' : 'DOWN',
        state,
        testEmail.subject,
        delivered ? 'DELIVERED' : 'FAILED',
        provider,
        now,
        `test_key_${Date.now()}`,
        errorMessage || null
      );
    } catch (_) {}

    return NextResponse.json({
      success: delivered,
      provider,
      recipient: targetEmail,
      subject: testEmail.subject,
      error: errorMessage,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
