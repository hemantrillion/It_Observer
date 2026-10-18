'use client';

import React from 'react';
import { SystemHealthMetricSummaryCard } from '../cards/system_health_metric_summary_card';

interface SystemOverviewMetricsBarContainerProps {
  total: number;
  healthy: number;
  degraded: number;
  down: number;
  activeAlerts: number;
  onSelectIncidents?: () => void;
  onSelectStatusFilter?: (status: 'ALL' | 'HEALTHY' | 'DEGRADED' | 'DOWN') => void;
}

export function SystemOverviewMetricsBarContainer({
  total,
  healthy,
  degraded,
  down,
  activeAlerts,
  onSelectIncidents,
  onSelectStatusFilter,
}: SystemOverviewMetricsBarContainerProps) {
  const uptimeScore = total > 0 ? (((total - down) / total) * 100).toFixed(1) : '100.0';

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 w-full">
      <SystemHealthMetricSummaryCard
        label="TOTAL SERVICES"
        value={total}
        subtext="Monitored targets"
        onClick={() => onSelectStatusFilter?.('ALL')}
      />
      <SystemHealthMetricSummaryCard
        label="HEALTHY"
        value={healthy}
        subtext="Normal latency"
        onClick={() => onSelectStatusFilter?.('HEALTHY')}
      />
      <SystemHealthMetricSummaryCard
        label="DEGRADED"
        value={degraded}
        subtext="High latency / 4xx"
        isWarning={degraded > 0}
        onClick={() => onSelectStatusFilter?.('DEGRADED')}
      />
      <SystemHealthMetricSummaryCard
        label="DOWN"
        value={down}
        subtext="5xx / Unreachable"
        isWarning={down > 0}
        onClick={() => onSelectStatusFilter?.('DOWN')}
      />
      <SystemHealthMetricSummaryCard
        label="ACTIVE OUTAGES"
        value={activeAlerts}
        subtext={`${uptimeScore}% Uptime`}
        isWarning={activeAlerts > 0}
        onClick={onSelectIncidents}
      />
    </div>
  );
}
