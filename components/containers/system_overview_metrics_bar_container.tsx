'use client';

import React from 'react';
import { SystemHealthMetricSummaryCard } from '../cards/system_health_metric_summary_card';

interface SystemOverviewMetricsBarContainerProps {
  total: number;
  healthy: number;
  degraded: number;
  down: number;
  activeAlerts: number;
}

export function SystemOverviewMetricsBarContainer({
  total,
  healthy,
  degraded,
  down,
  activeAlerts,
}: SystemOverviewMetricsBarContainerProps) {
  const uptimeScore = total > 0 ? (((total - down) / total) * 100).toFixed(1) : '100.0';

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 w-full">
      <SystemHealthMetricSummaryCard
        label="TOTAL SERVICES"
        value={total}
        subtext="MONITORED TARGETS"
      />
      <SystemHealthMetricSummaryCard
        label="STATUS HEALTHY"
        value={healthy}
        subtext="NORMAL LATENCY"
      />
      <SystemHealthMetricSummaryCard
        label="DEGRADED"
        value={degraded}
        subtext="HIGH LATENCY / 4XX"
        isWarning={degraded > 0}
      />
      <SystemHealthMetricSummaryCard
        label="STATUS DOWN"
        value={down}
        subtext="5XX / UNREACHABLE"
        isWarning={down > 0}
      />
      <SystemHealthMetricSummaryCard
        label="ACTIVE INCIDENTS"
        value={activeAlerts}
        subtext={`${uptimeScore}% OVERALL`}
        isWarning={activeAlerts > 0}
      />
    </div>
  );
}
