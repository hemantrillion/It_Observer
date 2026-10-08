'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { TopHeaderNavigationBarContainer } from '@/components/containers/top_header_navigation_bar_container';
import { SystemOverviewMetricsBarContainer } from '@/components/containers/system_overview_metrics_bar_container';
import { MonitoredServicesGridContainer } from '@/components/containers/monitored_services_grid_container';
import { ChaosTestingControlPanelContainer } from '@/components/containers/chaos_testing_control_panel_container';
import { ActiveIncidentAlertNotificationCard } from '@/components/cards/active_incident_alert_notification_card';
import { MonitoredServiceRecord } from '@/lib/database/get_all_monitored_services_query';
import { IncidentAlertRecord } from '@/lib/database/get_all_incidents_history_query';

export default function ObservatoryDashboardPage() {
  const [services, setServices] = useState<MonitoredServiceRecord[]>([]);
  const [summary, setSummary] = useState({
    total: 0,
    healthy: 0,
    degraded: 0,
    down: 0,
    activeAlerts: 0,
  });
  const [activeIncidents, setActiveIncidents] = useState<IncidentAlertRecord[]>([]);
  const [isPolling, setIsPolling] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const [servicesRes, incidentsRes] = await Promise.all([
        fetch('/api/services'),
        fetch('/api/incidents'),
      ]);
      const servicesData = await servicesRes.json();
      const incidentsData = await incidentsRes.json();

      if (servicesData.success) {
        setServices(servicesData.services);
        setSummary(servicesData.summary);
      }
      if (incidentsData.success) {
        const active = incidentsData.incidents.filter((i: IncidentAlertRecord) => i.is_active === 1);
        setActiveIncidents(active);
      }
    } catch (e) {
      console.error('Failed to fetch status', e);
    }
  }, []);

  const triggerPoll = useCallback(async () => {
    setIsPolling(true);
    try {
      await fetch('/api/poller');
      await fetchStatus();
    } catch (e) {
      console.error('Polling failed', e);
    } finally {
      setIsPolling(false);
    }
  }, [fetchStatus]);

  useEffect(() => {
    // Initial fetch
    fetchStatus();
    // Immediate first poll
    triggerPoll();

    // Regular polling interval
    const interval = setInterval(() => {
      triggerPoll();
    }, 8000);

    return () => clearInterval(interval);
  }, [fetchStatus, triggerPoll]);

  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      <TopHeaderNavigationBarContainer onPoll={triggerPoll} isPolling={isPolling} />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-6 w-full space-y-6">
        {/* System Overview Bar */}
        <SystemOverviewMetricsBarContainer
          total={summary.total}
          healthy={summary.healthy}
          degraded={summary.degraded}
          down={summary.down}
          activeAlerts={summary.activeAlerts}
        />

        {/* Active Incident Alerts */}
        {activeIncidents.length > 0 && (
          <div className="space-y-2">
            <div className="font-mono text-xs font-black uppercase tracking-wider">
              // ACTIVE CRITICAL NOTIFICATIONS ({activeIncidents.length})
            </div>
            {activeIncidents.map((incident) => (
              <ActiveIncidentAlertNotificationCard key={incident.id} incident={incident} />
            ))}
          </div>
        )}

        {/* Interactive Chaos Testing Panel */}
        <ChaosTestingControlPanelContainer onChaosTriggered={triggerPoll} />

        {/* Monitored Services Grid */}
        <MonitoredServicesGridContainer services={services} />
      </main>

      {/* Footer */}
      <footer className="border-t-3 border-black p-4 mt-8 bg-white font-mono text-xs flex justify-between items-center max-w-7xl mx-auto w-full">
        <span className="font-bold">INFRASTRUCTURE OBSERVATORY 30-A</span>
        <span className="opacity-60">TEST SUITE MONITORED CORE // MONOCHROME NEO-BRUTALISM</span>
      </footer>
    </div>
  );
}
