'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { GmailTopNavbar } from '@/components/gmail/gmail_top_navbar';
import { GmailLeftRail, RailTab } from '@/components/gmail/gmail_left_rail';
import { GmailLeftSidebar, DemoSubView, StatusFilter } from '@/components/gmail/gmail_left_sidebar';
import { GmailRightRail } from '@/components/gmail/gmail_right_rail';
import { BackToDashboardButtonOnDetailPage } from '@/components/buttons/back_to_dashboard_button_on_detail_page';
import { ServiceDetailInfoBlockCard } from '@/components/cards/service_detail_info_block_card';
import { LatencyMetricTimeseriesGraphCard } from '@/components/cards/latency_metric_timeseries_graph_card';
import { MonitoredServiceRecord } from '@/lib/database/get_all_monitored_services_query';
import { MetricSampleRecord } from '@/lib/database/get_metric_samples_by_service_query';
import { ArrowLeft } from 'lucide-react';

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const serviceId = params?.id as string;

  const [service, setService] = useState<MonitoredServiceRecord | null>(null);
  const [samples, setSamples] = useState<MetricSampleRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPolling, setIsPolling] = useState(false);
  const [sampleLimit, setSampleLimit] = useState<number>(120);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>('');

  const sampleLimitRef = useRef(sampleLimit);
  useEffect(() => {
    sampleLimitRef.current = sampleLimit;
  }, [sampleLimit]);

  const fetchServiceDetails = useCallback(async (limitOverride?: number) => {
    if (!serviceId) return;
    try {
      const limit = limitOverride ?? sampleLimitRef.current;
      const res = await fetch(`/api/services/${serviceId}?limit=${limit}&t=${Date.now()}`, {
        cache: 'no-store',
      });
      const data = await res.json();
      if (data.success) {
        setService(data.service);
        setSamples(data.samples);
        setLastUpdatedTime(new Date().toLocaleTimeString());
      }
    } catch (e) {
      console.error('Failed to load service', e);
    } finally {
      setIsLoading(false);
    }
  }, [serviceId]);

  const triggerPoll = useCallback(async () => {
    setIsPolling(true);
    try {
      await fetch('/api/poller', { cache: 'no-store' });
      await fetchServiceDetails();
    } catch (e) {
      console.error('Service polling failed', e);
    } finally {
      setIsPolling(false);
    }
  }, [fetchServiceDetails]);

  useEffect(() => {
    fetchServiceDetails();
    const interval = setInterval(() => {
      triggerPoll();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchServiceDetails, triggerPoll]);

  const handleLimitChange = (newLimit: number) => {
    setSampleLimit(newLimit);
    fetchServiceDetails(newLimit);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#f6f8fc] text-[#1f1f1f] overflow-hidden font-sans select-none">
      {/* Zone 3: Top Navigation Bar */}
      <GmailTopNavbar activeMode="demo" />

      {/* Main Layout Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Zone 1: Far-Left Rail */}
        <GmailLeftRail
          activeTab="demo"
          onSelectTab={(tab) => {
            if (tab === 'mail') router.push('/');
            else router.push('/');
          }}
        />

        {/* Zone 2: Sidebar */}
        <GmailLeftSidebar
          activeTab="demo"
          demoSubView="dashboard"
          onSelectDemoSubView={() => router.push('/')}
          statusFilter="ALL"
          onSelectStatusFilter={() => router.push('/')}
          onPoll={triggerPoll}
          isPolling={isPolling}
        />

        {/* Zone 4: Central Main Container */}
        <main className="flex-1 flex flex-col bg-white rounded-2xl mx-1 my-2 border border-[#e0e2ec] overflow-hidden shadow-sm">
          {/* Top Breadcrumb & Live Status Bar */}
          <div className="h-12 border-b border-[#e0e2ec] px-6 flex items-center justify-between shrink-0 bg-white">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/')}
                className="inline-flex items-center gap-2 text-xs font-semibold text-[#0b57d0] hover:bg-[#e8f0fe] px-3 py-1.5 rounded-full transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Dashboard</span>
              </button>
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

          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
            {isLoading ? (
              <div className="p-16 text-center font-sans font-medium text-sm border border-[#e0e2ec] rounded-2xl bg-[#f8fafd] text-[#5e5e5e]">
                Loading service telemetry data...
              </div>
            ) : !service ? (
              <div className="p-16 text-center font-sans font-medium text-sm border border-[#e0e2ec] rounded-2xl bg-[#f8fafd] text-[#5e5e5e]">
                Service not found
              </div>
            ) : (
              <div className="space-y-6 w-full">
                <ServiceDetailInfoBlockCard service={service} />
                <div className="border border-[#e0e2ec] rounded-2xl p-4 bg-white shadow-xs">
                  <LatencyMetricTimeseriesGraphCard
                    samples={samples}
                    service={service}
                    currentLimit={sampleLimit}
                    onLimitChange={handleLimitChange}
                    lastUpdatedTime={lastUpdatedTime}
                    isLivePolling={isPolling}
                  />
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Zone 5: Far-Right Companion Rail */}
        <GmailRightRail />
      </div>
    </div>
  );
}
