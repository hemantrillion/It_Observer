'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { ArrowLeft, Activity, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';

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

  // Fetch incidents list always on mount and when in incidents view
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

  // Fetch telemetry graph data for a specific service
  const fetchServiceDetails = useCallback(
    async (id: string, limit: number = sampleLimit) => {
      // Immediate fallback from props so inspect view renders instantly without blocking
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
            // Seed a baseline sample so graph renders properly
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
      // Auto-refresh selected service telemetry every 4s
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
    density === 'compact' ? 'space-y-5 p-5 md:p-7' : density === 'comfortable' ? 'space-y-6 p-6 md:p-8' : 'space-y-8 p-6 md:p-10';

  return (
    <div className={`flex-1 flex flex-col h-full ${hasWallpaper ? 'bg-transparent' : 'bg-white'} overflow-y-auto font-sans select-none`}>
      {/* Top Breadcrumb & Live Status Bar */}
      <div className={`h-14 border-b border-[#e0e2ec]/80 px-6 flex items-center justify-between shrink-0 ${hasWallpaper ? 'bg-white/70 backdrop-blur-sm' : 'bg-white'}`}>
        <div className="flex items-center gap-3">
          {selectedServiceId ? (
            <button
              onClick={() => setSelectedServiceId(null)}
              className="inline-flex items-center gap-2 text-sm font-bold text-[#0b57d0] hover:bg-[#e8f0fe] px-4 py-2 rounded-full transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to all targets</span>
            </button>
          ) : (
            <div className="flex items-center gap-2.5 text-sm font-black text-[#1f1f1f] uppercase tracking-wider">
              <span className="text-base font-black">
                {demoSubView.toUpperCase()}
              </span>
              {statusFilter !== 'ALL' && (
                <span className="ml-2 px-3 py-1 rounded-full text-xs bg-[#eaf1fb] text-[#0b57d0] font-black border border-[#0b57d0]/20">
                  {statusFilter}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#e6f4ea] text-[#137333] text-xs sm:text-sm font-bold border border-[#a8dab5]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#137333] animate-ping inline-block" />
            <span>Telemetry Active</span>
          </span>
          {lastUpdatedTime && (
            <span className="text-xs sm:text-sm text-[#444746] font-mono font-semibold hidden sm:inline">
              Probed: {lastUpdatedTime}
            </span>
          )}
        </div>
      </div>

      {/* Main Observatory Content Body */}
      <div className={`${densitySpacing} flex-1`}>
        {/* If viewing a selected service's detail graph */}
        {selectedServiceId && selectedService ? (
          <div className="space-y-6 w-full animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b-2 border-black pb-4">
              <div>
                <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black">
                  {selectedService.name} &mdash; TELEMETRY DETAIL &amp; GRAPH
                </h3>
                <p className="text-sm sm:text-base font-semibold text-neutral-700 mt-1">
                  Continuous Synthetic Latency Probing &amp; Real-Time Time-Series Samples
                </p>
              </div>
              <button
                onClick={() => setSelectedServiceId(null)}
                className="px-5 py-2 rounded-lg bg-black text-white hover:bg-neutral-800 font-bold text-xs sm:text-sm uppercase transition-colors cursor-pointer"
              >
                Close Graph
              </button>
            </div>

            <ServiceDetailInfoBlockCard service={selectedService} />

            <div className="border-2 border-black rounded-2xl p-5 bg-white/95 backdrop-blur-md shadow-sm">
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
            <section className="space-y-3 w-full">
              <div className="flex items-center justify-between pb-1 border-b border-[#e0e2ec]">
                <h2 className="text-base sm:text-lg font-bold text-[#1f1f1f] uppercase tracking-wider">
                  System Telemetry Overview
                </h2>
                <span className="text-xs sm:text-sm font-semibold text-[#5e5e5e]">Live Aggregates &bull; Click card to filter</span>
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

            {/* Section: Incidents Telemetry & Notifications (Always Visible) */}
            <section className="space-y-3 w-full">
              <div className="flex items-center justify-between pb-1 border-b border-[#e0e2ec]">
                <div className="flex items-center gap-2.5">
                  {activeIncidents.length > 0 ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-[#c5221f] animate-ping" />
                  ) : (
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  )}
                  <h2 className="text-base sm:text-lg font-bold text-[#1f1f1f] uppercase tracking-wider">
                    Incident Telemetry &amp; Outage Notifications ({activeIncidents.length} Active / {allIncidents.length} Historical)
                  </h2>
                </div>
                {onSelectDemoSubView && (
                  <button
                    onClick={() => onSelectDemoSubView('incidents')}
                    className="text-xs sm:text-sm font-bold text-[#0b57d0] hover:underline cursor-pointer"
                  >
                    View Complete Audit Log &rarr;
                  </button>
                )}
              </div>

              {activeIncidents.length > 0 ? (
                <div className="space-y-2.5 w-full">
                  {activeIncidents.map((incident) => (
                    <ActiveIncidentAlertNotificationCard
                      key={incident.id}
                      incident={incident}
                    />
                  ))}
                </div>
              ) : (
                <div className="border border-[#e0e2ec] rounded-2xl p-5 bg-white/90 backdrop-blur-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
                  <div className="flex items-center gap-3.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 shrink-0" />
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-[#1f1f1f]">Zero Active Critical Outages</h4>
                      <p className="text-xs sm:text-sm text-[#444746] font-medium leading-relaxed">
                        All monitored production targets are passing synthetic health probes. {allIncidents.length} historical outage events recorded in the system audit ledger.
                      </p>
                    </div>
                  </div>
                  {onSelectDemoSubView && (
                    <button
                      onClick={() => onSelectDemoSubView('incidents')}
                      className="px-5 py-2.5 rounded-xl bg-[#f0f4f9] hover:bg-[#e0e2ec] text-[#1f1f1f] font-bold text-xs sm:text-sm shrink-0 transition-colors cursor-pointer border border-[#c4c7c5]"
                    >
                      Audit Incident History ({allIncidents.length})
                    </button>
                  )}
                </div>
              )}
            </section>

            {/* Section: Interactive Chaos Testing Panel */}
            <section className="w-full">
              <ChaosTestingControlPanelContainer onChaosTriggered={triggerPoll} />
            </section>

            {/* Section: Monitored Targets Grid */}
            <section className="space-y-3 w-full">
              <div className="flex items-center justify-between pb-1 border-b border-[#e0e2ec]">
                <h2 className="text-base sm:text-lg font-bold text-[#1f1f1f] uppercase tracking-wider">
                  Test Suite Monitored Targets ({filteredServices.length})
                </h2>
                <span className="text-xs sm:text-sm font-semibold text-[#5e5e5e]">
                  Click Any Card Or &ldquo;Inspect&rdquo; To Open Real-Time Latency Graph
                </span>
              </div>

              {filteredServices.length === 0 ? (
                <div className="p-10 text-center text-sm sm:text-base text-[#444746] font-semibold border-2 border-dashed border-[#c4c7c5] rounded-2xl bg-[#f8fafd]">
                  No monitored targets match the current filter or search criteria. Select APIs in Demo Settings to add them to this dashboard.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
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
          /* Incidents View */
          <div className="space-y-5 w-full">
            <div className="flex items-center justify-between pb-3 border-b border-[#e0e2ec]">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-[#1f1f1f] tracking-tight">
                  Incident History &amp; Resolution Audit Log
                </h2>
                <p className="text-sm font-medium text-[#444746]">
                  Detected Outages, Timeouts, and Recovery Timelines (Total Events: {allIncidents.length})
                </p>
              </div>
              <button
                onClick={() => {
                  fetchIncidentsHistory();
                  triggerPoll();
                }}
                disabled={isPolling || isLoadingIncidents}
                className="px-5 py-2.5 rounded-full bg-[#f0f4f9] hover:bg-[#e0e2ec] text-[#1f1f1f] font-bold text-xs sm:text-sm transition-colors flex items-center gap-2 cursor-pointer border border-[#c4c7c5]"
              >
                <RefreshCw className={`w-4 h-4 ${isPolling || isLoadingIncidents ? 'animate-spin' : ''}`} />
                <span>Refresh Audit Log</span>
              </button>
            </div>

            <IncidentHistoryTableContainer
              incidents={allIncidents}
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
            hasWallpaper={hasWallpaper}
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
