/**
 * Email Template Builder
 * Generates clean, responsive HTML email templates and matching plaintext versions.
 */

export type ServiceMonitoringState = 'UP' | 'DOWN' | 'DEGRADED' | 'UNSTABLE';

export interface EmailTemplateData {
  serviceName: string;
  serviceId: string;
  targetUrl: string;
  previousStatus: ServiceMonitoringState;
  currentStatus: ServiceMonitoringState;
  timestamp: string;
  responseTimeMs?: number;
  httpStatus?: number;
  errorDetails?: string | null;
  triggerReason?: string;
  flappingMetrics?: {
    transitionsCount: number;
    windowMinutes: number;
    recentHistorySummary?: string;
  };
}

export interface GeneratedEmail {
  subject: string;
  text: string;
  html: string;
  snippet: string;
}

const STATE_META: Record<
  ServiceMonitoringState,
  { emoji: string; color: string; label: string; bgLight: string; border: string }
> = {
  UP: {
    emoji: '🟢',
    color: '#16a34a', // emerald-600
    label: 'UP',
    bgLight: '#f0fdf4',
    border: '#bbf7d0',
  },
  DOWN: {
    emoji: '🔴',
    color: '#dc2626', // red-600
    label: 'DOWN',
    bgLight: '#fef2f2',
    border: '#fecaca',
  },
  DEGRADED: {
    emoji: '🟠',
    color: '#ea580c', // orange-600
    label: 'DEGRADED',
    bgLight: '#fff7ed',
    border: '#fed7aa',
  },
  UNSTABLE: {
    emoji: '🟣',
    color: '#9333ea', // purple-600
    label: 'UNSTABLE',
    bgLight: '#faf5ff',
    border: '#e9d5ff',
  },
};

export function buildStatusChangeEmail(data: EmailTemplateData): GeneratedEmail {
  const currentMeta = STATE_META[data.currentStatus] || STATE_META.UP;
  const prevMeta = STATE_META[data.previousStatus] || STATE_META.UP;

  // Formulate clear, specified subjects
  let subject = '';
  let headline = '';
  let statusSummary = '';

  switch (data.currentStatus) {
    case 'DOWN':
      subject = `🔴 Alert: ${data.serviceName} is DOWN`;
      headline = 'Service Outage Detected';
      statusSummary = 'The monitored service is currently unavailable and failing health checks.';
      break;
    case 'UP':
      subject = `🟢 Recovery: ${data.serviceName} is UP`;
      headline = 'Service Recovered';
      statusSummary = 'The service has recovered and is operating normally within expected performance parameters.';
      break;
    case 'DEGRADED':
      subject = `🟠 Warning: ${data.serviceName} Performance Degraded`;
      headline = 'Performance Degradation Detected';
      statusSummary = 'The service is available but experiencing elevated response latency or degraded health.';
      break;
    case 'UNSTABLE':
      subject = `🟣 Alert: ${data.serviceName} is UNSTABLE`;
      headline = 'Service Instability / Flapping Detected';
      statusSummary = 'The service has experienced frequent transitions between UP and DOWN states within the recent monitoring window.';
      break;
  }

  const formattedTime = new Date(data.timestamp).toUTCString();
  const latencyDisplay = data.responseTimeMs ? `${Math.round(data.responseTimeMs)} ms` : 'N/A';
  const httpStatusDisplay = data.httpStatus ? `HTTP ${data.httpStatus}` : 'N/A (Connection Refused/Timeout)';

  // Build Plaintext Version
  const textLines = [
    `${currentMeta.emoji} ${headline.toUpperCase()}`,
    `Service: ${data.serviceName}`,
    `Previous Status: ${prevMeta.emoji} ${prevMeta.label}`,
    `Current Status:  ${currentMeta.emoji} ${currentMeta.label}`,
    `Time:            ${formattedTime}`,
    `Target URL:      ${data.targetUrl}`,
    `Response Time:   ${latencyDisplay}`,
    `HTTP Status:     ${httpStatusDisplay}`,
    '',
    `Status Message:`,
    statusSummary,
  ];

  if (data.errorDetails) {
    textLines.push('', `Error Details: ${data.errorDetails}`);
  }

  if (data.currentStatus === 'UNSTABLE' && data.flappingMetrics) {
    textLines.push(
      '',
      `Flapping Telemetry:`,
      `- Detected Transitions: ${data.flappingMetrics.transitionsCount}`,
      `- Evaluation Window:    Last ${data.flappingMetrics.windowMinutes} minutes`,
      `- Recent Probe History: ${data.flappingMetrics.recentHistorySummary || 'Repeated state changes between UP/DOWN'}`
    );
  }

  textLines.push('', '---', 'InfraTrace Smart Observability & Alerting Platform');
  const text = textLines.join('\n');

  // Build Responsive HTML Email Template
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(subject)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
    .card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { padding: 24px 28px; background: ${currentMeta.bgLight}; border-bottom: 1px solid ${currentMeta.border}; display: flex; align-items: center; justify-content: space-between; }
    .header-title { font-size: 20px; font-weight: 800; color: ${currentMeta.color}; margin: 0; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 700; background: ${currentMeta.color}; color: #ffffff; text-transform: uppercase; }
    .content { padding: 28px; }
    .service-name { font-size: 18px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 6px; }
    .target-url { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 12px; color: #64748b; margin-bottom: 20px; word-break: break-all; }
    .status-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 20px; display: flex; gap: 16px; justify-content: space-around; }
    .status-col { text-align: center; }
    .status-label { font-size: 11px; text-transform: uppercase; font-weight: 600; color: #64748b; margin-bottom: 4px; }
    .status-val { font-size: 14px; font-weight: 700; }
    .details-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }
    .details-table td { padding: 8px 0; border-bottom: 1px solid #f1f5f9; }
    .details-table td.label { color: #64748b; font-weight: 600; width: 38%; }
    .details-table td.val { color: #0f172a; font-weight: 500; }
    .summary-text { font-size: 14px; line-height: 1.6; color: #334155; margin-bottom: 20px; background: #f1f5f9; padding: 14px 16px; border-radius: 10px; }
    .flapping-box { background: #faf5ff; border: 1px solid #e9d5ff; border-radius: 12px; padding: 16px; margin-bottom: 20px; font-size: 13px; color: #6b21a8; }
    .error-box { background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 14px 16px; margin-bottom: 20px; font-size: 12px; color: #991b1b; font-family: ui-monospace, monospace; word-break: break-word; }
    .footer { padding: 18px 28px; background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1 class="header-title">${currentMeta.emoji} ${escapeHtml(headline)}</h1>
      <span class="badge">${escapeHtml(currentMeta.label)}</span>
    </div>
    <div class="content">
      <div class="service-name">${escapeHtml(data.serviceName)}</div>
      <div class="target-url">${escapeHtml(data.targetUrl)}</div>

      <div class="status-box">
        <div class="status-col">
          <div class="status-label">Previous State</div>
          <div class="status-val" style="color: ${prevMeta.color};">${prevMeta.emoji} ${prevMeta.label}</div>
        </div>
        <div class="status-col">
          <div class="status-label">&rarr;</div>
          <div class="status-val">&rarr;</div>
        </div>
        <div class="status-col">
          <div class="status-label">Current State</div>
          <div class="status-val" style="color: ${currentMeta.color};">${currentMeta.emoji} ${currentMeta.label}</div>
        </div>
      </div>

      <div class="summary-text">
        ${escapeHtml(statusSummary)}
      </div>

      ${
        data.currentStatus === 'UNSTABLE' && data.flappingMetrics
          ? `
      <div class="flapping-box">
        <div style="font-weight: 700; margin-bottom: 6px;">🟣 Flapping Analysis Metrics:</div>
        <div>&bull; State Changes Detected: <strong>${data.flappingMetrics.transitionsCount} transitions</strong></div>
        <div>&bull; Evaluation Window: <strong>Last ${data.flappingMetrics.windowMinutes} minutes</strong></div>
        ${
          data.flappingMetrics.recentHistorySummary
            ? `<div style="margin-top: 4px; font-family: monospace; font-size: 11px;">History: ${escapeHtml(data.flappingMetrics.recentHistorySummary)}</div>`
            : ''
        }
      </div>`
          : ''
      }

      <table class="details-table">
        <tr>
          <td class="label">Trigger Reason</td>
          <td class="val">${escapeHtml(data.triggerReason || 'Standard health poll transition')}</td>
        </tr>
        <tr>
          <td class="label">Response Latency</td>
          <td class="val">${escapeHtml(latencyDisplay)}</td>
        </tr>
        <tr>
          <td class="label">HTTP Status Code</td>
          <td class="val">${escapeHtml(httpStatusDisplay)}</td>
        </tr>
        <tr>
          <td class="label">Recorded At</td>
          <td class="val">${escapeHtml(formattedTime)}</td>
        </tr>
      </table>

      ${
        data.errorDetails
          ? `
      <div class="error-box">
        <strong>Error Diagnostics:</strong><br>
        ${escapeHtml(data.errorDetails)}
      </div>`
          : ''
      }
    </div>
    <div class="footer">
      This is an automated operational alert generated by <strong>InfraTrace Observability</strong>.<br>
      Strict deduplication is active: you will only receive alerts upon verified state transitions.
    </div>
  </div>
</body>
</html>
  `.trim();

  const snippet = `${currentMeta.emoji} [${currentMeta.label}] ${data.serviceName}: ${statusSummary} (${latencyDisplay})`;

  return {
    subject,
    text,
    html,
    snippet,
  };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
