'use client';

import React, { useEffect, useState, useCallback } from 'react';
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

  const fetchServiceDetails = useCallback(async () => {
    if (!serviceId) return;
    try {
      const res = await fetch(`/api/services/${serviceId}`);
      const data = await res.json();
      if (data.success) {
        setService(data.service);
        setSamples(data.samples);
      }
    } catch (e) {
      console.error('Failed to load service', e);
    } finally {
      setIsLoading(false);
    }
  }, [serviceId]);

  useEffect(() => {
    fetchServiceDetails();
    const interval = setInterval(fetchServiceDetails, 5000);
    return () => clearInterval(interval);
  }, [fetchServiceDetails]);

  return (
    <div className="min-h-screen bg-white text-black flex flex-col w-full font-sans">
      <TopHeaderNavigationBarContainer />

      <main className="flex-1 w-full px-6 md:px-10 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <BackToDashboardButtonOnDetailPage />
          <span className="font-sans text-xs text-black opacity-60 uppercase font-semibold">
            TELEMETRY INSPECTION NODE
          </span>
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
          <div className="p-16 text-center font-sans font-bold text-sm border border-black rounded-lg">
            [ LOADING SERVICE TELEMETRY DATA... ]
          </div>
        ) : !service ? (
          <div className="p-16 text-center font-sans font-bold text-sm border border-black rounded-lg">
            [ SERVICE NOT FOUND ]
          </div>
        ) : (
          <div className="space-y-6 w-full">
            <ServiceDetailInfoBlockCard service={service} />
            <LatencyMetricTimeseriesGraphCard samples={samples} service={service} />
          </div>
        )}
      </main>
    </div>
  );
}
