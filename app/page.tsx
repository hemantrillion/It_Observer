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
    fetchStatus();
    triggerPoll();

    const interval = setInterval(() => {
      triggerPoll();
    }, 8000);

    return () => clearInterval(interval);
  }, [fetchStatus, triggerPoll]);

  return (
    <div className="min-h-screen bg-white text-black flex flex-col w-full font-sans">
      {/* Full-width header */}
      <TopHeaderNavigationBarContainer onPoll={triggerPoll} isPolling={isPolling} />

      {/* Full screen left to right main layout */}
      <main className="flex-1 w-full px-6 md:px-10 py-8 space-y-8">
        {/* Section: Overview Metrics */}
        <section className="space-y-3 w-full">
          <div className="text-center space-y-1">
            <h2 className="font-sans font-bold text-3xl md:text-4xl tracking-tight uppercase text-black">
              SYSTEM TELEMETRY OVERVIEW
            </h2>
            <p className="font-sans text-sm text-black opacity-60">
              Live Real-Time Aggregates Across Monitored Infrastructure
            </p>
          </div>
          <SystemOverviewMetricsBarContainer
            total={summary.total}
            healthy={summary.healthy}
            degraded={summary.degraded}
            down={summary.down}
            activeAlerts={summary.activeAlerts}
          />
        </section>

        {/* Section: Active Critical Notifications */}
        {activeIncidents.length > 0 && (
          <section className="space-y-3 w-full">
            <div className="text-center space-y-1">
              <h2 className="font-sans font-bold text-3xl md:text-4xl tracking-tight uppercase text-black">
                ACTIVE CRITICAL NOTIFICATIONS ({activeIncidents.length})
              </h2>
              <p className="font-sans text-sm text-black opacity-60">
                Action Required: Immediate Detected System Incidents
              </p>
            </div>
            <div className="space-y-2 w-full">
              {activeIncidents.map((incident) => (
                <ActiveIncidentAlertNotificationCard key={incident.id} incident={incident} />
              ))}
            </div>
          </section>
        )}

        {/* Section: Interactive Chaos Testing Panel */}
        <section className="w-full">
          <ChaosTestingControlPanelContainer onChaosTriggered={triggerPoll} />
        </section>

        {/* Section: Monitored Services Grid */}
        <section className="w-full">
          <MonitoredServicesGridContainer services={services} />
        </section>
      </main>

      {/* Full-width Business Footer */}
      <footer className="w-full border-t border-black px-6 md:px-10 py-5 bg-white font-sans text-xs text-black flex flex-col sm:flex-row justify-between items-center gap-2">
        <span className="font-bold tracking-tight uppercase">
          INFRASTRUCTURE OBSERVATORY 30-A
        </span>
        <span className="opacity-60 text-center sm:text-right">
          ENTERPRISE TELEMETRY ENGINE // FULL-WIDTH BUSINESS DASHBOARD
        </span>
      </footer>
    </div>
  );
}
