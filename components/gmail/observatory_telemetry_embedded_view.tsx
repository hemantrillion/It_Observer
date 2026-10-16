'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SystemOverviewMetricsBarContainer } from '@/components/containers/system_overview_metrics_bar_container';
import { ChaosTestingControlPanelContainer } from '@/components/containers/chaos_testing_control_panel_container';
import { ActiveIncidentAlertNotificationCard } from '@/components/cards/active_incident_alert_notification_card';
import { MonitoredServiceStatusBlockCard } from '@/components/cards/monitored_service_status_block_card';
import { ServiceDetailInfoBlockCard } from '@/components/cards/service_detail_info_block_card';
import { LatencyMetricTimeseriesGraphCard } from '@/components/cards/latency_metric_timeseries_graph_card';
import { IncidentHistoryTableContainer } from '@/components/containers/incident_history_table_container';
import { SaveCloudCredentialsButtonOnSettings } from '@/components/buttons/save_cloud_credentials_button_on_settings';
import { MonitoredServiceRecord } from '@/lib/database/get_all_monitored_services_query';
import { IncidentAlertRecord } from '@/lib/database/get_all_incidents_history_query';
import { MetricSampleRecord } from '@/lib/database/get_metric_samples_by_service_query';
import { DemoSubView, StatusFilter } from './gmail_left_sidebar';
import { DensityOption } from './gmail_quick_settings_panel';
import { ArrowLeft, Activity, RefreshCw, Key, ShieldCheck } from 'lucide-react';

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
}: ObservatoryTelemetryEmbeddedViewProps) {
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<MonitoredServiceRecord | null>(null);
  const [serviceSamples, setServiceSamples] = useState<MetricSampleRecord[]>([]);
  const [sampleLimit, setSampleLimit] = useState<number>(120);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>('');
  const [allIncidents, setAllIncidents] = useState<IncidentAlertRecord[]>([]);
  const [isLoadingIncidents, setIsLoadingIncidents] = useState(false);

  // Settings State
  const [githubToken, setGithubToken] = useState('');
  const [awsKeyId, setAwsKeyId] = useState('');
  const [awsSecret, setAwsSecret] = useState('');
  const [cloudflareToken, setCloudflareToken] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveSettings = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  // Fetch incidents list when in incidents view
  useEffect(() => {
    if (demoSubView === 'incidents') {
      setIsLoadingIncidents(true);
      fetch('/api/incidents')
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setAllIncidents(data.incidents);
          }
        })
        .catch(console.error)
        .finally(() => setIsLoadingIncidents(false));
    }
  }, [demoSubView]);

  // Fetch detailed samples if a service is selected
  const fetchServiceDetails = useCallback(
    async (serviceId: string, limitOverride?: number) => {
      try {
        const limit = limitOverride ?? sampleLimit;
        const res = await fetch(
          `/api/services/${serviceId}?limit=${limit}&t=${Date.now()}`,
          { cache: 'no-store' }
        );
        const data = await res.json();
        if (data.success) {
          setSelectedService(data.service);
          setServiceSamples(data.samples);
          setLastUpdatedTime(new Date().toLocaleTimeString());
        }
      } catch (e) {
        console.error('Failed to load service samples', e);
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
    <div className="flex-1 flex flex-col h-full bg-white overflow-y-auto font-sans select-none">
      {/* Top Breadcrumb & Live Status Bar */}
      <div className="h-12 border-b border-[#e0e2ec] px-6 flex items-center justify-between shrink-0 bg-white">
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
              <img
                src="/infra_trace_logo.png"
                alt="InfraTrace"
                className="w-4 h-4 object-contain"
              />
              <span>InfraTrace</span>
              <span>/</span>
              <span className="text-[#1f1f1f] font-bold">
                {demoSubView.toUpperCase()}
              </span>
              {statusFilter !== 'ALL' && (
                <span className="ml-2 px-2.5 py-0.5 rounded-full text-[10px] bg-[#eaf1fb] text-[#0b57d0] font-bold">
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
            <span className="text-[11px] text-[#5e5e5e] font-mono hidden sm:inline">
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
                  No monitored targets match the current filter or search criteria.
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
            </div>

            {isLoadingIncidents ? (
              <div className="p-16 text-center font-sans font-medium text-sm border border-[#e0e2ec] rounded-2xl bg-[#f8fafd] text-[#5e5e5e]">
                Loading incident logs...
              </div>
            ) : (
              <IncidentHistoryTableContainer incidents={allIncidents} />
            )}
          </div>
        ) : (
          /* Settings View */
          <div className="space-y-6 w-full max-w-3xl mx-auto py-2">
            <div className="border-b border-[#e0e2ec] pb-3">
              <h2 className="text-xl font-bold text-[#1f1f1f]">
                Test Suite Configuration & Cloud Adapters
              </h2>
              <p className="text-xs text-[#5e5e5e]">
                Connect Optional Private Credentials For Extended Telemetry Limits
              </p>
            </div>

            <div className="border border-[#e0e2ec] rounded-2xl p-6 bg-white space-y-6 shadow-xs">
              <div className="space-y-2">
                <label className="flex items-center gap-2 font-sans text-xs font-bold uppercase text-[#1f1f1f]">
                  <Key className="w-3.5 h-3.5 text-[#0b57d0]" />
                  <span>GitHub Personal Access Token (Optional)</span>
                </label>
                <p className="font-sans text-xs text-[#5e5e5e]">
                  Increases rate limit from 60 to 5,000 requests/hour for GitHub API adapter.
                </p>
                <input
                  type="password"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  placeholder="ghp_..."
                  className="w-full p-2.5 border border-[#c4c7c5] rounded-xl font-mono text-xs bg-[#f8fafd] text-[#1f1f1f] focus:bg-white focus:border-[#0b57d0] focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-4 border-t border-[#e0e2ec] pt-4">
                <div>
                  <label className="flex items-center gap-2 font-sans text-xs font-bold uppercase text-[#1f1f1f]">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#0b57d0]" />
                    <span>AWS IAM Credentials (Optional)</span>
                  </label>
                  <p className="font-sans text-xs text-[#5e5e5e]">
                    Enables live CloudWatch metric querying and EC2/RDS monitoring.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="block font-sans text-[11px] font-semibold text-[#5e5e5e] mb-1">
                      ACCESS KEY ID
                    </span>
                    <input
                      type="text"
                      value={awsKeyId}
                      onChange={(e) => setAwsKeyId(e.target.value)}
                      placeholder="AKIA..."
                      className="w-full p-2.5 border border-[#c4c7c5] rounded-xl font-mono text-xs bg-[#f8fafd] text-[#1f1f1f] focus:bg-white focus:border-[#0b57d0] focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <span className="block font-sans text-[11px] font-semibold text-[#5e5e5e] mb-1">
                      SECRET ACCESS KEY
                    </span>
                    <input
                      type="password"
                      value={awsSecret}
                      onChange={(e) => setAwsSecret(e.target.value)}
                      placeholder="••••••••••••••••"
                      className="w-full p-2.5 border border-[#c4c7c5] rounded-xl font-mono text-xs bg-[#f8fafd] text-[#1f1f1f] focus:bg-white focus:border-[#0b57d0] focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2 border-t border-[#e0e2ec] pt-4">
                <label className="flex items-center gap-2 font-sans text-xs font-bold uppercase text-[#1f1f1f]">
                  <Key className="w-3.5 h-3.5 text-[#0b57d0]" />
                  <span>Cloudflare API Token (Optional)</span>
                </label>
                <p className="font-sans text-xs text-[#5e5e5e]">
                  Enables live edge network latency and security intelligence metrics.
                </p>
                <input
                  type="password"
                  value={cloudflareToken}
                  onChange={(e) => setCloudflareToken(e.target.value)}
                  placeholder="cftoken_..."
                  className="w-full p-2.5 border border-[#c4c7c5] rounded-xl font-mono text-xs bg-[#f8fafd] text-[#1f1f1f] focus:bg-white focus:border-[#0b57d0] focus:outline-none transition-colors"
                />
              </div>

              <div className="pt-4 border-t border-[#e0e2ec] flex justify-end">
                <SaveCloudCredentialsButtonOnSettings
                  onSave={handleSaveSettings}
                  isSaved={isSaved}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
