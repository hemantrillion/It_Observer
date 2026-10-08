'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { TopHeaderNavigationBarContainer } from '@/components/containers/top_header_navigation_bar_container';
import { BackToDashboardButtonOnDetailPage } from '@/components/buttons/back_to_dashboard_button_on_detail_page';
import { ServiceDetailInfoBlockCard } from '@/components/cards/service_detail_info_block_card';
import { LatencyMetricTimeseriesGraphCard } from '@/components/cards/latency_metric_timeseries_graph_card';
import { MonitoredServiceRecord } from '@/lib/database/get_all_monitored_services_query';
import { MetricSampleRecord } from '@/lib/database/get_metric_samples_by_service_query';

export default function ServiceDetailPage() {
  const params = useParams();
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

  // Fetch service telemetry details with specific sample limit
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

  // Active poller execution to trigger a fresh probe and update database
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

  // Initial load and continuous real-time live polling interval
  useEffect(() => {
    fetchServiceDetails();
    // Poll every 5 seconds to ensure real-time latency live stream
    const interval = setInterval(() => {
      triggerPoll();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchServiceDetails, triggerPoll]);

  // Handle sample limit change from the graph controls
  const handleLimitChange = (newLimit: number) => {
    setSampleLimit(newLimit);
    fetchServiceDetails(newLimit);
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col w-full font-sans">
      <TopHeaderNavigationBarContainer onPoll={triggerPoll} isPolling={isPolling} />

      <main className="flex-1 w-full px-6 md:px-10 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <BackToDashboardButtonOnDetailPage />
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-black rounded bg-white text-xs font-bold uppercase">
              <span className="w-2 h-2 bg-emerald-500 animate-ping inline-block" />
              <span>LIVE TELEMETRY NODE</span>
            </span>
            {lastUpdatedTime && (
              <span className="font-sans text-xs text-black opacity-60 uppercase font-semibold">
                LAST PROBED: {lastUpdatedTime}
              </span>
            )}
          </div>
        </div>

        {/* Centered section header in Arial */}
        <div className="text-center space-y-1">
          <h2 className="font-sans font-bold text-3xl md:text-4xl tracking-tight uppercase text-black">
            SERVICE TELEMETRY DETAIL & LATENCY LOG
          </h2>
          <p className="font-sans text-sm text-black opacity-60">
            Real-Time Sample Stream & Uptime History
          </p>
        </div>

        {isLoading ? (
          <div className="p-16 text-center font-sans font-bold text-sm border border-black rounded-lg bg-white">
            [ LOADING SERVICE TELEMETRY DATA... ]
          </div>
        ) : !service ? (
          <div className="p-16 text-center font-sans font-bold text-sm border border-black rounded-lg bg-white">
            [ SERVICE NOT FOUND ]
          </div>
        ) : (
          <div className="space-y-6 w-full">
            <ServiceDetailInfoBlockCard service={service} />
            <LatencyMetricTimeseriesGraphCard
              samples={samples}
              service={service}
              currentLimit={sampleLimit}
              onLimitChange={handleLimitChange}
              lastUpdatedTime={lastUpdatedTime}
              isLivePolling={isPolling}
            />
          </div>
        )}
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
