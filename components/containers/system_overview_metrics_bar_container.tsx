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
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 w-full">
      <SystemHealthMetricSummaryCard
        label="TOTAL SERVICES"
        value={total}
        subtext="MONITORED TARGETS"
        onClick={() => onSelectStatusFilter?.('ALL')}
      />
      <SystemHealthMetricSummaryCard
        label="STATUS HEALTHY"
        value={healthy}
        subtext="NORMAL LATENCY"
        onClick={() => onSelectStatusFilter?.('HEALTHY')}
      />
      <SystemHealthMetricSummaryCard
        label="DEGRADED"
        value={degraded}
        subtext="HIGH LATENCY / 4XX"
        isWarning={degraded > 0}
        onClick={() => onSelectStatusFilter?.('DEGRADED')}
      />
      <SystemHealthMetricSummaryCard
        label="STATUS DOWN"
        value={down}
        subtext="5XX / UNREACHABLE"
        isWarning={down > 0}
        onClick={() => onSelectStatusFilter?.('DOWN')}
      />
      <SystemHealthMetricSummaryCard
        label="ACTIVE INCIDENTS"
        value={activeAlerts}
        subtext={`${uptimeScore}% OVERALL • CLICK TO AUDIT`}
        isWarning={activeAlerts > 0}
        onClick={onSelectIncidents}
      />
    </div>
  );
}
