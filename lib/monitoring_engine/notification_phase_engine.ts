import { getDatabaseConnection } from '@/lib/database/sqlite_database_connection_manager';
import { initializeObservatoryTables } from '@/lib/database/initialize_observatory_tables';
import { getNotificationSystemConfig } from './notification_config';
import {
  ServiceMonitoringState,
  buildStatusChangeEmail,
} from '@/lib/notifications/email_template_builder';
import { dispatchStateChangeNotification } from '@/lib/notifications/email_delivery_service';

export interface PhaseRecord {
  id: number;
  phase_number: number;
  phase_type: string;
  window_duration_minutes: number;
  started_at: string;
  completed_at: string;
  up_count: number;
  down_count: number;
  degraded_count: number;
  outcome_status: string;
  notification_sent: number;
  notification_subject: string | null;
  recipient_email: string | null;
}

export interface PhaseEngineState {
  current_phase_number: number;
  phase_stage: 'BOOTSTRAP_WAITING_DOWN' | 'BOOTSTRAP_WAITING_UP' | 'WINDOW_RUNNING';
  active_window_started_at: string | null;
  active_window_duration_minutes: number;
  up_events_count: number;
  down_events_count: number;
  degraded_events_count: number;
  last_evaluated_at: string | null;
  last_notification_status: string | null;
  previous_notification_status: string | null;
  last_window_duration_minutes: number;
  previous_window_duration_minutes: number;
  updated_at: string;
}

export function ensurePhaseTables(): void {
  initializeObservatoryTables();
  const db = getDatabaseConnection();

  db.exec(`
    CREATE TABLE IF NOT EXISTS notification_engine_state (
      id TEXT PRIMARY KEY,
      current_phase_number INTEGER DEFAULT 1,
      phase_stage TEXT DEFAULT 'BOOTSTRAP_WAITING_DOWN',
      active_window_started_at TEXT,
      active_window_duration_minutes INTEGER DEFAULT 20,
      up_events_count INTEGER DEFAULT 0,
      down_events_count INTEGER DEFAULT 0,
      degraded_events_count INTEGER DEFAULT 0,
      last_evaluated_at TEXT,
      last_notification_status TEXT,
      previous_notification_status TEXT,
      last_window_duration_minutes INTEGER DEFAULT 20,
      previous_window_duration_minutes INTEGER DEFAULT 20,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS notification_phases_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phase_number INTEGER NOT NULL,
      phase_type TEXT NOT NULL,
      window_duration_minutes INTEGER DEFAULT 20,
      started_at TEXT NOT NULL,
      completed_at TEXT NOT NULL,
      up_count INTEGER DEFAULT 0,
      down_count INTEGER DEFAULT 0,
      degraded_count INTEGER DEFAULT 0,
      outcome_status TEXT NOT NULL,
      notification_sent INTEGER DEFAULT 1,
      notification_subject TEXT,
      recipient_email TEXT
    );
  `);

  const existing = db.prepare("SELECT id FROM notification_engine_state WHERE id = 'singleton'").get();
  if (!existing) {
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO notification_engine_state (
        id, current_phase_number, phase_stage, active_window_started_at,
        active_window_duration_minutes, up_events_count, down_events_count,
        degraded_events_count, updated_at
      ) VALUES ('singleton', 1, 'BOOTSTRAP_WAITING_DOWN', ?, 20, 0, 0, 0, ?)
    `).run(now, now);
  }
}

export function getPhaseEngineState(): PhaseEngineState {
  ensurePhaseTables();
  const db = getDatabaseConnection();
  const row = db.prepare("SELECT * FROM notification_engine_state WHERE id = 'singleton'").get() as any;

  return {
    current_phase_number: row?.current_phase_number || 1,
    phase_stage: row?.phase_stage || 'BOOTSTRAP_WAITING_DOWN',
    active_window_started_at: row?.active_window_started_at || null,
    active_window_duration_minutes: row?.active_window_duration_minutes || 20,
    up_events_count: row?.up_events_count || 0,
    down_events_count: row?.down_events_count || 0,
    degraded_events_count: row?.degraded_events_count || 0,
    last_evaluated_at: row?.last_evaluated_at || null,
    last_notification_status: row?.last_notification_status || null,
    previous_notification_status: row?.previous_notification_status || null,
    last_window_duration_minutes: row?.last_window_duration_minutes || 20,
    previous_window_duration_minutes: row?.previous_window_duration_minutes || 20,
    updated_at: row?.updated_at || new Date().toISOString(),
  };
}

export function resetAllPhases(): PhaseEngineState {
  ensurePhaseTables();
  const db = getDatabaseConnection();
  const now = new Date().toISOString();

  db.prepare(`
    UPDATE notification_engine_state
    SET current_phase_number = 1,
        phase_stage = 'BOOTSTRAP_WAITING_DOWN',
        active_window_started_at = ?,
        active_window_duration_minutes = 20,
        up_events_count = 0,
        down_events_count = 0,
        degraded_events_count = 0,
        last_evaluated_at = ?,
        last_notification_status = NULL,
        previous_notification_status = NULL,
        last_window_duration_minutes = 20,
        previous_window_duration_minutes = 20,
        updated_at = ?
    WHERE id = 'singleton'
  `).run(now, now, now);

  // Clear running phases history
  db.prepare('DELETE FROM notification_phases_history').run();

  return getPhaseEngineState();
}

export function getAllPhaseHistory(): PhaseRecord[] {
  ensurePhaseTables();
  const db = getDatabaseConnection();
  return db
    .prepare('SELECT * FROM notification_phases_history ORDER BY id DESC')
    .all() as unknown as PhaseRecord[];
}

export interface PhaseProcessingResult {
  phaseNumber: number;
  stage: string;
  stateChanged: boolean;
  notificationSent: boolean;
  subject?: string;
  triggerReason: string;
  status: ServiceMonitoringState;
}

/**
 * Executes state evaluation according to the user's exact multi-phase & dynamic window algorithm.
 */
export async function processProbeInPhase(params: {
  serviceId: string;
  serviceName: string;
  targetUrl: string;
  rawStatus: 'HEALTHY' | 'UP' | 'DEGRADED' | 'DOWN';
  responseTimeMs: number;
  httpStatus: number;
  errorMessage?: string | null;
}): Promise<PhaseProcessingResult> {
  ensurePhaseTables();
  const db = getDatabaseConnection();
  const config = getNotificationSystemConfig();
  const now = new Date().toISOString();

  // Normalize rawStatus to 'UP', 'DOWN', or 'DEGRADED'
  let normalizedStatus: ServiceMonitoringState = 'UP';
  if (params.rawStatus === 'DOWN') normalizedStatus = 'DOWN';
  else if (params.rawStatus === 'DEGRADED') normalizedStatus = 'DEGRADED';
  else normalizedStatus = 'UP';

  const state = getPhaseEngineState();
  const recipient = config.alertRecipientOverride || 'jai18hemant334@gmail.com';

  // Record raw probe history
  try {
    db.prepare(`
      INSERT INTO service_probe_history (service_id, raw_status, response_time_ms, http_status, timestamp, error_message)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(params.serviceId, normalizedStatus, params.responseTimeMs, params.httpStatus, now, params.errorMessage || null);
  } catch (_) {}

  // =========================================================================
  // PHASE 1: INITIAL BOOTSTRAP CYCLE (IMMEDIATE NOTIFICATIONS)
  // =========================================================================

  // Step 1: Waiting for first incident (DOWN or DEGRADED)
  if (state.phase_stage === 'BOOTSTRAP_WAITING_DOWN') {
    if (normalizedStatus === 'DOWN' || normalizedStatus === 'DEGRADED') {
      // Dispatches immediate alert notification
      const email = buildStatusChangeEmail({
        serviceName: params.serviceName,
        serviceId: params.serviceId,
        targetUrl: params.targetUrl,
        previousStatus: 'UP',
        currentStatus: normalizedStatus,
        timestamp: now,
        responseTimeMs: params.responseTimeMs,
        httpStatus: params.httpStatus,
        errorDetails: params.errorMessage || null,
        triggerReason: `Phase 1: Initial detected service ${normalizedStatus} event`,
      });

      await dispatchStateChangeNotification({
        serviceId: params.serviceId,
        previousStatus: 'UP',
        newStatus: normalizedStatus,
        email,
        transitionTimestamp: now,
      });

      // Log in history
      db.prepare(`
        INSERT INTO notification_phases_history (
          phase_number, phase_type, window_duration_minutes, started_at, completed_at,
          up_count, down_count, degraded_count, outcome_status, notification_sent,
          notification_subject, recipient_email
        ) VALUES (1, 'BOOTSTRAP_INITIAL_ALERT', 0, ?, ?, 0, ?, ?, ?, 1, ?, ?)
      `).run(
        now,
        now,
        normalizedStatus === 'DOWN' ? 1 : 0,
        normalizedStatus === 'DEGRADED' ? 1 : 0,
        normalizedStatus,
        email.subject,
        recipient
      );

      // Advance state to wait for first UP recovery
      db.prepare(`
        UPDATE notification_engine_state
        SET phase_stage = 'BOOTSTRAP_WAITING_UP',
            last_notification_status = ?,
            updated_at = ?
        WHERE id = 'singleton'
      `).run(normalizedStatus, now);

      return {
        phaseNumber: 1,
        stage: 'BOOTSTRAP_WAITING_UP',
        stateChanged: true,
        notificationSent: true,
        subject: email.subject,
        triggerReason: `Phase 1: Initial ${normalizedStatus} notification dispatched immediately`,
        status: normalizedStatus,
      };
    }

    // Still healthy, zero notifications
    return {
      phaseNumber: 1,
      stage: 'BOOTSTRAP_WAITING_DOWN',
      stateChanged: false,
      notificationSent: false,
      triggerReason: 'Phase 1: Nominal service monitoring (awaiting initial incident)',
      status: 'UP',
    };
  }

  // Step 2: Waiting for first UP recovery
  if (state.phase_stage === 'BOOTSTRAP_WAITING_UP') {
    if (normalizedStatus === 'UP') {
      // Dispatches immediate recovery notification
      const prevStatus = (state.last_notification_status as ServiceMonitoringState) || 'DOWN';
      const email = buildStatusChangeEmail({
        serviceName: params.serviceName,
        serviceId: params.serviceId,
        targetUrl: params.targetUrl,
        previousStatus: prevStatus,
        currentStatus: 'UP',
        timestamp: now,
        responseTimeMs: params.responseTimeMs,
        httpStatus: params.httpStatus,
        triggerReason: `Phase 1: Initial service recovery verified`,
      });

      await dispatchStateChangeNotification({
        serviceId: params.serviceId,
        previousStatus: prevStatus,
        newStatus: 'UP',
        email,
        transitionTimestamp: now,
      });

      // Log Phase 1 completion
      db.prepare(`
        INSERT INTO notification_phases_history (
          phase_number, phase_type, window_duration_minutes, started_at, completed_at,
          up_count, down_count, degraded_count, outcome_status, notification_sent,
          notification_subject, recipient_email
        ) VALUES (1, 'BOOTSTRAP_INITIAL_RECOVERY', 0, ?, ?, 1, 0, 0, 'UP', 1, ?, ?)
      `).run(now, now, email.subject, recipient);

      // Phase 1 is officially complete! Advance to Phase 2 (20-minute window observation)
      db.prepare(`
        UPDATE notification_engine_state
        SET current_phase_number = 2,
            phase_stage = 'WINDOW_RUNNING',
            active_window_started_at = ?,
            active_window_duration_minutes = 20,
            up_events_count = 0,
            down_events_count = 0,
            degraded_events_count = 0,
            last_notification_status = 'UP',
            previous_notification_status = ?,
            last_window_duration_minutes = 20,
            previous_window_duration_minutes = 20,
            updated_at = ?
        WHERE id = 'singleton'
      `).run(now, prevStatus, now);

      return {
        phaseNumber: 1,
        stage: 'COMPLETED_TO_PHASE_2',
        stateChanged: true,
        notificationSent: true,
        subject: email.subject,
        triggerReason: 'Phase 1: Initial recovery dispatched immediately; entering Phase 2 window',
        status: 'UP',
      };
    }

    // Remains down/degraded, zero notifications (already notified initial DOWN)
    return {
      phaseNumber: 1,
      stage: 'BOOTSTRAP_WAITING_UP',
      stateChanged: false,
      notificationSent: false,
      triggerReason: 'Phase 1: Still awaiting initial UP recovery',
      status: (state.last_notification_status as ServiceMonitoringState) || 'DOWN',
    };
  }

  // =========================================================================
  // PHASE 2+: OBSERVATION WINDOW (20m, 40m, 60m...) WITH ADAPTIVE BACKOFF
  // =========================================================================

  const windowStartedAt = state.active_window_started_at
    ? new Date(state.active_window_started_at).getTime()
    : Date.now();
  const durationMs = state.active_window_duration_minutes * 60 * 1000;
  const elapsedMs = Date.now() - windowStartedAt;
  const isWindowExpired = elapsedMs >= durationMs;

  let upCount = state.up_events_count + (normalizedStatus === 'UP' ? 1 : 0);
  let downCount = state.down_events_count + (normalizedStatus === 'DOWN' ? 1 : 0);
  let degradedCount = state.degraded_events_count + (normalizedStatus === 'DEGRADED' ? 1 : 0);

  // If window is STILL IN PROGRESS: record counts silently. ZERO NOTIFICATIONS DISPATCHED!
  if (!isWindowExpired) {
    db.prepare(`
      UPDATE notification_engine_state
      SET up_events_count = ?,
          down_events_count = ?,
          degraded_events_count = ?,
          updated_at = ?
      WHERE id = 'singleton'
    `).run(upCount, downCount, degradedCount, now);

    return {
      phaseNumber: state.current_phase_number,
      stage: 'WINDOW_RUNNING',
      stateChanged: false,
      notificationSent: false,
      triggerReason: `Phase ${state.current_phase_number} (${state.active_window_duration_minutes}m): Observation window active (${Math.round(elapsedMs / 1000)}s / ${state.active_window_duration_minutes * 60}s) - zero notifications`,
      status: normalizedStatus,
    };
  }

  // WINDOW HAS EXPIRED! TIME TO EVALUATE THE PHASE OUTCOME!
  const n = Math.max(1, Math.round(state.active_window_duration_minutes / 20));
  const failureCount = downCount + degradedCount;

  // Exact User Formula:
  // (2*n UP and 1*n DOWN/DEGRADED) OR (2*n DOWN/DEGRADED and 1*n UP)
  const isUnstable =
    (upCount >= 2 * n && failureCount >= 1 * n) ||
    (failureCount >= 2 * n && upCount >= 1 * n);

  let outcomeStatus: ServiceMonitoringState = 'UP';
  let emailSubject = '';

  if (isUnstable) {
    outcomeStatus = 'UNSTABLE';
    const email = buildStatusChangeEmail({
      serviceName: params.serviceName,
      serviceId: params.serviceId,
      targetUrl: params.targetUrl,
      previousStatus: (state.last_notification_status as ServiceMonitoringState) || 'UP',
      currentStatus: 'UNSTABLE',
      timestamp: now,
      responseTimeMs: params.responseTimeMs,
      httpStatus: params.httpStatus,
      triggerReason: `Phase ${state.current_phase_number} (${state.active_window_duration_minutes}m): Flapping detected (${upCount} UP, ${failureCount} DOWN/DEGRADED)`,
      flappingMetrics: {
        transitionsCount: upCount + failureCount,
        windowMinutes: state.active_window_duration_minutes,
        recentHistorySummary: `${upCount} UP, ${downCount} DOWN, ${degradedCount} DEGRADED`,
      },
    });

    emailSubject = email.subject;

    // Dispatches external email via Resend to user and records in platform_mailbox
    await dispatchStateChangeNotification({
      serviceId: params.serviceId,
      previousStatus: (state.last_notification_status as ServiceMonitoringState) || 'UP',
      newStatus: 'UNSTABLE',
      email,
      transitionTimestamp: now,
    });
  } else {
    // Condition not satisfied: send notification for the state at the final moment of the window!
    outcomeStatus = normalizedStatus;
    const prevStatus = (state.last_notification_status as ServiceMonitoringState) || 'UP';

    const email = buildStatusChangeEmail({
      serviceName: params.serviceName,
      serviceId: params.serviceId,
      targetUrl: params.targetUrl,
      previousStatus: prevStatus,
      currentStatus: outcomeStatus,
      timestamp: now,
      responseTimeMs: params.responseTimeMs,
      httpStatus: params.httpStatus,
      triggerReason: `Phase ${state.current_phase_number} (${state.active_window_duration_minutes}m): Final-moment state confirmation`,
    });

    emailSubject = email.subject;

    await dispatchStateChangeNotification({
      serviceId: params.serviceId,
      previousStatus: prevStatus,
      newStatus: outcomeStatus,
      email,
      transitionTimestamp: now,
    });
  }

  // Record completed phase in history
  db.prepare(`
    INSERT INTO notification_phases_history (
      phase_number, phase_type, window_duration_minutes, started_at, completed_at,
      up_count, down_count, degraded_count, outcome_status, notification_sent,
      notification_subject, recipient_email
    ) VALUES (?, 'WINDOW_OBSERVATION', ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
  `).run(
    state.current_phase_number,
    state.active_window_duration_minutes,
    state.active_window_started_at || now,
    now,
    upCount,
    downCount,
    degradedCount,
    outcomeStatus,
    emailSubject,
    recipient
  );

  // Dynamic Window Scaling for Next Phase:
  // "if those past two noti had same status -> duration will be sum of past two noti durations"
  // "if condition was not satisfied / status changed -> range for next notification is of 20 minutes"
  let nextDurationMinutes = 20;

  if (state.last_notification_status && state.last_notification_status === outcomeStatus) {
    // Matching consecutive outcomes: additive Fibonacci backoff!
    nextDurationMinutes = state.active_window_duration_minutes + state.last_window_duration_minutes;
  } else {
    // Differing outcome: reset to base 20 minutes!
    nextDurationMinutes = 20;
  }

  // Start next phase
  const nextPhaseNumber = state.current_phase_number + 1;

  db.prepare(`
    UPDATE notification_engine_state
    SET current_phase_number = ?,
        phase_stage = 'WINDOW_RUNNING',
        active_window_started_at = ?,
        active_window_duration_minutes = ?,
        up_events_count = 0,
        down_events_count = 0,
        degraded_events_count = 0,
        last_evaluated_at = ?,
        previous_notification_status = ?,
        last_notification_status = ?,
        previous_window_duration_minutes = ?,
        last_window_duration_minutes = ?,
        updated_at = ?
    WHERE id = 'singleton'
  `).run(
    nextPhaseNumber,
    now,
    nextDurationMinutes,
    now,
    state.last_notification_status,
    outcomeStatus,
    state.last_window_duration_minutes,
    state.active_window_duration_minutes,
    now
  );

  return {
    phaseNumber: state.current_phase_number,
    stage: 'WINDOW_COMPLETED',
    stateChanged: true,
    notificationSent: true,
    subject: emailSubject,
    triggerReason: `Phase ${state.current_phase_number} completed: ${outcomeStatus} notification dispatched; Phase ${nextPhaseNumber} started (${nextDurationMinutes}m)`,
    status: outcomeStatus === 'UNSTABLE' ? normalizedStatus : outcomeStatus,
  };
}
