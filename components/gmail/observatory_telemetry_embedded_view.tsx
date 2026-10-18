'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { SystemOverviewMetricsBarContainer } from '@/components/containers/system_overview_metrics_bar_container';
import { ChaosTestingControlPanelContainer } from '@/components/containers/chaos_testing_control_panel_container';
import { ActiveIncidentAlertNotificationCard } from '@/components/cards/active_incident_alert_notification_card';
import { MonitoredServiceStatusBlockCard } from '@/components/cards/monitored_service_status_block_card';
import { ServiceDetailInfoBlockCard } from '@/components/cards/service_detail_info_block_card';
import { LatencyMetricTimeseriesGraphCard } from '@/components/cards/latency_metric_timeseries_graph_card';
import { IncidentHistoryTableContainer } from '@/components/containers/incident_history_table_container';
import { DemoSettingsCatalogView } from '@/components/containers/demo_settings_catalog_view';
import { MonitoredServiceRecord } from '@/lib/database/get_all_monitored_services_query';
import { IncidentAlertRecord } from '@/lib/database/get_all_incidents_history_query';
import { MetricSampleRecord } from '@/lib/database/get_metric_samples_by_service_query';
import { DemoSubView, StatusFilter } from './gmail_left_sidebar';
import { DensityOption } from './gmail_quick_settings_panel';

interface ObservatoryTelemetryEmbeddedViewProps {
  services: MonitoredServiceRecord[];
  summary: {
    total: number;
    healthy: number;
    degraded: number;
    down: number;
    activeAlerts: number;
  };
  activeIncidents: IncidentAlertRecord[];
  triggerPoll: () => Promise<void>;
  isPolling: boolean;
  demoSubView: DemoSubView;
  statusFilter: StatusFilter;
  searchQuery: string;
  density?: DensityOption;
  hasWallpaper?: boolean;
  onServicesUpdated?: () => void | Promise<void>;
  isConstantPollingEnabled?: boolean;
  onToggleConstantPolling?: (enabled: boolean) => void;
  constantPollingInterval?: number;
  onChangeConstantPollingInterval?: (intervalMs: number) => void;
  onSelectDemoSubView?: (view: DemoSubView) => void;
  onSelectStatusFilter?: (filter: StatusFilter) => void;
}

export function ObservatoryTelemetryEmbeddedView({
  services,
  summary,
  activeIncidents,
  triggerPoll,
  isPolling,
  demoSubView,
  statusFilter,
  searchQuery,
  density = 'compact',
  hasWallpaper = false,
  onServicesUpdated = () => {},
  isConstantPollingEnabled = false,
  onToggleConstantPolling = () => {},
  constantPollingInterval = 8000,
  onChangeConstantPollingInterval = () => {},
  onSelectDemoSubView,
  onSelectStatusFilter,
}: ObservatoryTelemetryEmbeddedViewProps) {
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<MonitoredServiceRecord | null>(null);
  const [serviceSamples, setServiceSamples] = useState<MetricSampleRecord[]>([]);
  const [sampleLimit, setSampleLimit] = useState<number>(120);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>('');
  const [allIncidents, setAllIncidents] = useState<IncidentAlertRecord[]>([]);
  const [isLoadingIncidents, setIsLoadingIncidents] = useState(false);

  // Fetch incidents list on mount and whenever demoSubView changes
  const fetchIncidentsHistory = useCallback(() => {
    setIsLoadingIncidents(true);
    fetch('/api/incidents')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setAllIncidents(data.incidents || []);
        }
      })
      .catch((err) => console.error('Failed to load incidents history', err))
      .finally(() => setIsLoadingIncidents(false));
  }, []);

  useEffect(() => {
    fetchIncidentsHistory();
  }, [fetchIncidentsHistory, demoSubView]);

  // Reset inspect mode whenever demoSubView changes (e.g. clicking Incidents or Settings in sidebar)
  useEffect(() => {
    setSelectedServiceId(null);
  }, [demoSubView]);

  // Fetch telemetry graph data for a specific service
  const fetchServiceDetails = useCallback(
    async (id: string, limit: number = sampleLimit) => {
      const fallback = services.find((s) => s.id === id);
      if (fallback) {
        setSelectedService(fallback);
      }

      try {
        const res = await fetch(`/api/services/${id}?limit=${limit}`, { cache: 'no-store' });
        const data = await res.json();

        if (data.success) {
          if (data.service) {
            setSelectedService(data.service);
          }
          if (data.samples && data.samples.length > 0) {
            setServiceSamples(data.samples);
          } else if (fallback) {
            setServiceSamples([
              {
                id: 1,
                service_id: fallback.id,
                timestamp: new Date().toISOString(),
                response_time_ms: fallback.latest_response_time_ms || 45,
                http_status: 200,
                cpu_percentage: 12,
                memory_mb: 35,
                error_message: null,
              },
            ]);
          }
          setLastUpdatedTime(new Date().toLocaleTimeString());
        }
      } catch (err) {
        console.error('Failed to fetch service detail telemetry', err);
      }
    },
    [sampleLimit, services]
  );

  useEffect(() => {
    if (selectedServiceId) {
      fetchServiceDetails(selectedServiceId);
      const interval = setInterval(() => {
        fetchServiceDetails(selectedServiceId);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [selectedServiceId, fetchServiceDetails]);

  // Filter services by status & search query
  const filteredServices = services.filter((s) => {
    if (statusFilter !== 'ALL' && s.current_status !== statusFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.target_url.toLowerCase().includes(q) ||
        s.target_type.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const densitySpacing =
    density === 'compact' ? 'space-y-4 p-4 md:p-6' : density === 'comfortable' ? 'space-y-6 p-6 md:p-8' : 'space-y-8 p-6 md:p-10';

  return (
    <div className={`flex-1 flex flex-col h-full ${hasWallpaper ? 'bg-transparent' : 'bg-slate-50/60'} overflow-y-auto font-sans select-text w-full`}>
      {/* Top Header Bar: Only render if not inspecting and statusFilter is active */}
      {!selectedServiceId && statusFilter !== 'ALL' && (
        <div className={`h-10 border-b border-slate-200/80 px-6 flex items-center justify-between shrink-0 ${hasWallpaper ? 'bg-white/70 backdrop-blur-sm' : 'bg-white'}`}>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs bg-blue-50 text-blue-700 font-bold border border-blue-200">
              {statusFilter}
            </span>
          </div>
        </div>
      )}

      {/* Main Observatory Content Body */}
      <div className={`${densitySpacing} flex-1 w-full`}>
        {/* If viewing a selected service's detail graph */}
        {selectedServiceId && selectedService ? (
          <div className="space-y-4 w-full animate-in fade-in duration-150">
            <ServiceDetailInfoBlockCard
              service={selectedService}
              onClose={() => setSelectedServiceId(null)}
            />

            {/* Direct clean graph card (outer darker rectangle removed) */}
            <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs">
              <LatencyMetricTimeseriesGraphCard
                samples={serviceSamples}
                service={selectedService}
                currentLimit={sampleLimit}
                onLimitChange={(lim) => {
                  setSampleLimit(lim);
                  fetchServiceDetails(selectedServiceId, lim);
                }}
                lastUpdatedTime={lastUpdatedTime}
                isLivePolling={isPolling}
              />
            </div>
          </div>
        ) : demoSubView === 'dashboard' ? (
          /* Main Dashboard Content */
          <>
            {/* Section: Overview Metrics Bar */}
            <section className="space-y-2.5 w-full">
              <div className="flex items-center justify-between pb-1">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  System Telemetry Overview
                </h2>
              </div>
              <SystemOverviewMetricsBarContainer
                total={summary.total}
                healthy={summary.healthy}
                degraded={summary.degraded}
                down={summary.down}
                activeAlerts={summary.activeAlerts}
                onSelectIncidents={() => onSelectDemoSubView?.('incidents')}
                onSelectStatusFilter={onSelectStatusFilter}
              />
            </section>

            {/* Section: Chaos Injection Panel (Box A) & Outage Notifications (Box B) Side-by-Side as direct siblings */}
            <section className="w-full flex flex-col md:flex-row gap-4">
              {/* Box A: Chaos Injection Panel (Square-ish on Left, only taking as much space as needed) */}
              <div className="w-full md:w-80 lg:w-96 shrink-0">
                <ChaosTestingControlPanelContainer onChaosTriggered={triggerPoll} />
              </div>

              {/* Box B: Outage Notifications (Rectangular taking rest of space on right) */}
              <div className="flex-1 flex flex-col justify-between bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs">
                <div>
                  {/* Header with Title and Severity Legend */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <h3 className="font-sans font-bold text-sm text-slate-900 tracking-tight">
                        Outage Notifications
                      </h3>
                      {activeIncidents.length > 0 && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                          {activeIncidents.length} active
                        </span>
                      )}
                    </div>

                    {/* Legend: Yellow for Warning, Red for Critical */}
                    <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        <span>Warning</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        <span>Critical</span>
                      </div>
                    </div>
                  </div>

                  {/* Active Outages List (Only 2 in dashboard) */}
                  <div className="mt-2.5 space-y-2">
                    {activeIncidents.length > 0 ? (
                      activeIncidents.slice(0, 2).map((incident) => (
                        <ActiveIncidentAlertNotificationCard
                          key={incident.id}
                          incident={incident}
                        />
                      ))
                    ) : (
                      <div className="py-6 text-center text-xs text-slate-500 font-medium">
                        Zero active outages &mdash; all monitored endpoints operating normally.
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer link: simple "more" (no arrow) */}
                {onSelectDemoSubView && (
                  <div className="pt-2 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={() => onSelectDemoSubView('incidents')}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                    >
                      more
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* Section: Monitored Targets Grid */}
            <section className="space-y-2.5 w-full">
              <div className="flex items-center justify-between pb-1">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Test Suite Monitored Targets ({filteredServices.length})
                </h2>
              </div>

              {filteredServices.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 font-medium border border-slate-200/90 rounded-xl bg-white">
                  No monitored targets match the current filter or search criteria. Select APIs in Demo Settings to add them to this dashboard.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                  {filteredServices.map((service) => (
                    <MonitoredServiceStatusBlockCard
                      key={service.id}
                      service={service}
                      onInspect={(id) => {
                        setSelectedServiceId(id);
                        fetchServiceDetails(id);
                      }}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        ) : demoSubView === 'incidents' ? (
          /* Incidents View: Outages at Top, Historical Incident Logs Below */
          <div className="space-y-4 w-full">
            {/* Outage Notifications at Top */}
            <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <h3 className="font-sans font-bold text-sm text-slate-900 tracking-tight">
                    Outage Notifications
                  </h3>
                  {activeIncidents.length > 0 && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                      {activeIncidents.length} active
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>Warning</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span>Critical</span>
                  </div>
                </div>
              </div>

              <div className="mt-2.5 space-y-2">
                {activeIncidents.length > 0 ? (
                  activeIncidents.map((incident) => (
                    <ActiveIncidentAlertNotificationCard
                      key={incident.id}
                      incident={incident}
                    />
                  ))
                ) : (
                  <div className="py-4 text-center text-xs text-slate-500 font-medium">
                    Zero active outages &mdash; all monitored endpoints operating normally.
                  </div>
                )}
              </div>
            </div>

            {/* Historical Incident Logs with Filter Bar and checked targets */}
            <IncidentHistoryTableContainer
              incidents={allIncidents}
              monitoredServices={services}
            />
          </div>
        ) : (
          /* Demo Settings View: Comprehensive Public APIs Catalog & Polling Control */
          <DemoSettingsCatalogView
            monitoredServices={services}
            onServicesUpdated={onServicesUpdated}
            isConstantPollingEnabled={isConstantPollingEnabled}
            onToggleConstantPolling={onToggleConstantPolling}
            constantPollingInterval={constantPollingInterval}
            onChangeConstantPollingInterval={onChangeConstantPollingInterval}
            onTriggerManualPoll={triggerPoll}
            isPolling={isPolling}
            searchQuery={searchQuery}
            onInspectService={(id) => {
              setSelectedServiceId(id);
              fetchServiceDetails(id);
            }}
          />
        )}
      </div>
    </div>
  );
}
