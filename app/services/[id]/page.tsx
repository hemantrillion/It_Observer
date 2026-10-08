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
    <div className="min-h-screen bg-white text-black flex flex-col">
      <TopHeaderNavigationBarContainer />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-6 w-full space-y-6">
        <div>
          <BackToDashboardButtonOnDetailPage />
        </div>

        {isLoading ? (
          <div className="p-12 text-center font-mono font-bold text-sm">
            [ LOADING SERVICE TELEMETRY DATA... ]
          </div>
        ) : !service ? (
          <div className="p-12 text-center font-mono font-bold text-sm border-2 border-black">
            [ SERVICE NOT FOUND ]
          </div>
        ) : (
          <div className="space-y-6">
            <ServiceDetailInfoBlockCard service={service} />
            <LatencyMetricTimeseriesGraphCard samples={samples} />
          </div>
        )}
      </main>
    </div>
  );
}
