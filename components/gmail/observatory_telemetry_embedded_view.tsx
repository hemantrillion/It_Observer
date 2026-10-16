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
import { ArrowLeft, Activity, RefreshCw } from 'lucide-react';

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
}: ObservatoryTelemetryEmbeddedViewProps) {
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<MonitoredServiceRecord | null>(null);
  const [serviceSamples, setServiceSamples] = useState<MetricSampleRecord[]>([]);
  const [sampleLimit, setSampleLimit] = useState<number>(120);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>('');
  const [allIncidents, setAllIncidents] = useState<IncidentAlertRecord[]>([]);
  const [isLoadingIncidents, setIsLoadingIncidents] = useState(false);

  // Fetch incidents list when in incidents view
  useEffect(() => {
    if (demoSubView === 'incidents') {
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
    }
  }, [demoSubView]);

  // Fetch telemetry graph data for a specific service
  const fetchServiceDetails = useCallback(
    async (id: string, limit: number = sampleLimit) => {
      try {
        const [svcRes, samplesRes] = await Promise.all([
          fetch(`/api/services/${id}`, { cache: 'no-store' }),
          fetch(`/api/metrics/${id}?limit=${limit}`, { cache: 'no-store' }),
        ]);

        const svcData = await svcRes.json();
        const samplesData = await samplesRes.json();

        if (svcData.success) {
          setSelectedService(svcData.service);
        }
        if (samplesData.success) {
          setServiceSamples(samplesData.samples || []);
          setLastUpdatedTime(new Date().toLocaleTimeString());
        }
      } catch (err) {
        console.error('Failed to fetch service detail telemetry', err);
      }
    },
    [sampleLimit]
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
    density === 'compact' ? 'space-y-4 p-4 md:p-6' : density === 'comfortable' ? 'space-y-6 p-6 md:p-8' : 'space-y-8 p-6 md:p-10';

  return (
    <div className={`flex-1 flex flex-col h-full ${hasWallpaper ? 'bg-transparent' : 'bg-white'} overflow-y-auto font-sans select-none`}>
      {/* Top Breadcrumb & Live Status Bar */}
      <div className={`h-12 border-b border-[#e0e2ec]/70 px-6 flex items-center justify-between shrink-0 ${hasWallpaper ? 'bg-white/70 backdrop-blur-sm' : 'bg-white'}`}>
        <div className="flex items-center gap-3">
          {selectedServiceId ? (
            <button
              onClick={() => setSelectedServiceId(null)}
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#0b57d0] hover:bg-[#e8f0fe] px-3 py-1.5 rounded-full transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to all targets</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 text-xs font-semibold text-[#444746] uppercase tracking-wider">
              <span className="text-[#1f1f1f] font-bold">
                {demoSubView.toUpperCase()}
              </span>
              {statusFilter !== 'ALL' && (
                <span className="ml-2 px-2.5 py-0.5 rounded-full text-xs bg-[#eaf1fb] text-[#0b57d0] font-bold">
                  {statusFilter}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e6f4ea] text-[#137333] text-xs font-semibold border border-[#a8dab5]">
            <span className="w-2 h-2 rounded-full bg-[#137333] animate-ping inline-block" />
            <span>Telemetry Active</span>
          </span>
          {lastUpdatedTime && (
            <span className="text-xs text-[#5e5e5e] font-mono hidden sm:inline">
              Probed: {lastUpdatedTime}
            </span>
          )}
        </div>
      </div>

      {/* Main Observatory Content Body */}
      <div className={`${densitySpacing} flex-1`}>
        {/* If viewing a selected service's detail graph */}
        {selectedServiceId && selectedService ? (
          <div className="space-y-5 w-full">
            <div className="flex items-center justify-between border-b border-[#e0e2ec] pb-3">
              <div>
                <h3 className="text-xl font-bold tracking-tight text-[#1f1f1f]">
                  {selectedService.name} &mdash; Telemetry Detail & Graph
                </h3>
                <p className="text-xs text-[#5e5e5e]">
                  Continuous Latency Probing & Historical Samples
                </p>
              </div>
              <button
                onClick={() => setSelectedServiceId(null)}
                className="px-4 py-1.5 rounded-full bg-[#f0f4f9] hover:bg-[#e0e2ec] text-[#1f1f1f] font-semibold text-xs transition-colors"
              >
                Close Graph
              </button>
            </div>

            <ServiceDetailInfoBlockCard service={selectedService} />

            <div className="border border-[#e0e2ec] rounded-2xl p-4 bg-white shadow-xs">
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
                <h2 className="text-sm font-bold text-[#1f1f1f] uppercase tracking-wider">
                  System Telemetry Overview
                </h2>
                <span className="text-xs text-[#5e5e5e]">Live Aggregates</span>
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
                <div className="flex items-center justify-between pb-1 border-b border-[#e0e2ec]">
                  <h2 className="text-sm font-bold text-[#c5221f] uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#c5221f] animate-ping" />
                    <span>Active Critical Notifications ({activeIncidents.length})</span>
                  </h2>
                  <span className="text-xs text-[#c5221f] font-semibold">Immediate Action Required</span>
                </div>
                <div className="space-y-2 w-full">
                  {activeIncidents.map((incident) => (
                    <ActiveIncidentAlertNotificationCard
                      key={incident.id}
                      incident={incident}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Section: Interactive Chaos Testing Panel */}
            <section className="w-full">
              <ChaosTestingControlPanelContainer onChaosTriggered={triggerPoll} />
            </section>

            {/* Section: Monitored Targets Grid */}
            <section className="space-y-3 w-full">
              <div className="flex items-center justify-between pb-1 border-b border-[#e0e2ec]">
                <h2 className="text-sm font-bold text-[#1f1f1f] uppercase tracking-wider">
                  Test Suite Monitored Targets ({filteredServices.length})
                </h2>
                <span className="text-xs text-[#5e5e5e]">
                  Click Any Card Or &ldquo;Inspect&rdquo; To Open Real-Time Latency Graph
                </span>
              </div>

              {filteredServices.length === 0 ? (
                <div className="p-8 text-center text-sm text-[#5e5e5e] border border-dashed border-[#c4c7c5] rounded-2xl bg-[#f8fafd]">
                  No monitored targets match the current filter or search criteria. Select APIs in Demo Settings to add them to this dashboard.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                  {filteredServices.map((service) => (
                    <MonitoredServiceStatusBlockCard
                      key={service.id}
                      service={service}
                      onInspect={(id) => setSelectedServiceId(id)}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        ) : demoSubView === 'incidents' ? (
          /* Incidents View */
          <div className="space-y-4 w-full">
            <div className="flex items-center justify-between pb-2 border-b border-[#e0e2ec]">
              <div>
                <h2 className="text-lg font-bold text-[#1f1f1f]">
                  Incident History & Resolution Audit Log
                </h2>
                <p className="text-xs text-[#5e5e5e]">
                  Detected Outages, Timeouts, and Recovery Metrics
                </p>
              </div>
              <button
                onClick={() => triggerPoll()}
                disabled={isPolling}
                className="px-4 py-1.5 rounded-full bg-[#f0f4f9] hover:bg-[#e0e2ec] text-[#1f1f1f] font-semibold text-xs transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isPolling ? 'animate-spin' : ''}`} />
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
          />
        )}
      </div>
    </div>
  );
}
