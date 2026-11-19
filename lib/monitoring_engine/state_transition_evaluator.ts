import { getDatabaseConnection } from '@/lib/database/sqlite_database_connection_manager';
import { initializeObservatoryTables } from '@/lib/database/initialize_observatory_tables';
import {
  ServiceMonitoringState,
} from '@/lib/notifications/email_template_builder';
import {
  processProbeInPhase,
  PhaseProcessingResult,
} from './notification_phase_engine';

export interface StateTransitionResult {
  serviceId: string;
  previousState: ServiceMonitoringState;
  currentState: ServiceMonitoringState;
  stateChanged: boolean;
  notificationSent: boolean;
  emailsCount: number;
  triggerReason: string;
}

export function normalizeState(status: string | null | undefined): ServiceMonitoringState {
  if (!status) return 'UP';
  const upper = status.toUpperCase().trim();
  if (upper === 'DOWN') return 'DOWN';
  if (upper === 'DEGRADED') return 'DEGRADED';
  return 'UP';
}

/**
 * Evaluates service health result through the 20-minute adaptive phase engine.
 */
export async function evaluateServiceStateTransition(params: {
  serviceId: string;
  serviceName: string;
  targetUrl: string;
  rawStatus: 'HEALTHY' | 'UP' | 'DEGRADED' | 'DOWN' | 'UNSTABLE' | string;
  responseTimeMs: number;
  httpStatus: number;
  errorMessage?: string | null;
}): Promise<StateTransitionResult> {
  initializeObservatoryTables();
  const db = getDatabaseConnection();
  const now = new Date().toISOString();

  // Fetch current service state from database
  const serviceRow = db
    .prepare('SELECT current_status, previous_status FROM monitored_services WHERE id = ?')
    .get(params.serviceId) as any;

  const previousState: ServiceMonitoringState = normalizeState(serviceRow?.current_status || 'UP');

  // Normalize rawStatus
  let raw: 'HEALTHY' | 'UP' | 'DEGRADED' | 'DOWN' = 'UP';
  if (params.rawStatus === 'DOWN') raw = 'DOWN';
  else if (params.rawStatus === 'DEGRADED') raw = 'DEGRADED';
  else raw = 'UP';

  // Process through the adaptive phase engine
  const phaseResult: PhaseProcessingResult = await processProbeInPhase({
    serviceId: params.serviceId,
    serviceName: params.serviceName,
    targetUrl: params.targetUrl,
    rawStatus: raw,
    responseTimeMs: params.responseTimeMs,
    httpStatus: params.httpStatus,
    errorMessage: params.errorMessage,
  });

  const confirmedState: ServiceMonitoringState = phaseResult.status;

  // Update monitored_services table (status is strictly UP, DOWN, or DEGRADED)
  try {
    db.prepare(`
      UPDATE monitored_services
      SET current_status = ?,
          previous_status = ?,
          last_state_change_at = ?,
          latest_response_time_ms = ?,
          last_checked_at = ?
      WHERE id = ?
    `).run(
      confirmedState,
      previousState,
      now,
      params.responseTimeMs,
      now,
      params.serviceId
    );
  } catch (_) {}

  return {
    serviceId: params.serviceId,
    previousState,
    currentState: confirmedState,
    stateChanged: phaseResult.stateChanged,
    notificationSent: phaseResult.notificationSent,
    emailsCount: phaseResult.notificationSent ? 1 : 0,
    triggerReason: phaseResult.triggerReason,
  };
}
