/**
 * Smart Email Notification System - Configuration & Thresholds
 * All values can be overridden via environment variables.
 */

export interface NotificationSystemConfig {
  /** Consecutive failures required before declaring a service DOWN (default: 2) */
  consecutiveFailuresForDown: number;

  /** Consecutive successes required before declaring a service UP/recovered (default: 2) */
  consecutiveSuccessesForUp: number;

  /** Response time latency (ms) above which a service is marked DEGRADED (default: 1500) */
  degradedLatencyThresholdMs: number;

  /** Error rate ratio (0.0 to 1.0) above which a service is marked DEGRADED (default: 0.25) */
  degradedErrorRateThreshold: number;

  /** Sliding time window (in minutes) evaluated for flapping/instability detection (default: 10) */
  instabilityWindowMinutes: number;

  /** Number of UP <-> DOWN state transitions within the window required to classify as UNSTABLE (default: 3) */
  instabilityTransitionsThreshold: number;

  /** Default sender name and email */
  senderEmail: string;
  senderName: string;

  /** Optional explicit recipient override. If not set, notifications go to active platform users */
  alertRecipientOverride?: string;
}

function parseEnvInt(key: string, defaultValue: number): number {
  const val = process.env[key];
  if (!val) return defaultValue;
  const parsed = parseInt(val, 10);
  return isNaN(parsed) || parsed < 1 ? defaultValue : parsed;
}

function parseEnvFloat(key: string, defaultValue: number): number {
  const val = process.env[key];
  if (!val) return defaultValue;
  const parsed = parseFloat(val);
  return isNaN(parsed) || parsed <= 0 ? defaultValue : parsed;
}

export function getNotificationSystemConfig(): NotificationSystemConfig {
  return {
    consecutiveFailuresForDown: parseEnvInt('MONITOR_FAILURES_FOR_DOWN', 2),
    consecutiveSuccessesForUp: parseEnvInt('MONITOR_SUCCESSES_FOR_UP', 2),
    degradedLatencyThresholdMs: parseEnvInt('DEGRADED_LATENCY_THRESHOLD_MS', 1500),
    degradedErrorRateThreshold: parseEnvFloat('DEGRADED_ERROR_RATE_THRESHOLD', 0.25),
    instabilityWindowMinutes: parseEnvInt('INSTABILITY_WINDOW_MINUTES', 10),
    instabilityTransitionsThreshold: parseEnvInt('INSTABILITY_TRANSITIONS_THRESHOLD', 3),
    senderEmail: process.env.ALERT_SENDER_EMAIL || 'onboarding@resend.dev',
    senderName: process.env.ALERT_SENDER_NAME || 'InfraTrace Alerts',
    alertRecipientOverride: process.env.ALERT_NOTIFICATION_EMAIL || 'jai18hemant334@gmail.com',
  };
}
