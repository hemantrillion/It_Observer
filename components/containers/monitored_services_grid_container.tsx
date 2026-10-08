'use client';

import React from 'react';
import { MonitoredServiceRecord } from '@/lib/database/get_all_monitored_services_query';
import { MonitoredServiceStatusBlockCard } from '../cards/monitored_service_status_block_card';

interface MonitoredServicesGridContainerProps {
  services: MonitoredServiceRecord[];
}

export function MonitoredServicesGridContainer({ services }: MonitoredServicesGridContainerProps) {
  return (
    <div className="space-y-4 w-full">
      {/* Centered Section Header in Arial */}
      <div className="text-center">
        <h2 className="font-sans font-bold text-sm tracking-wider uppercase text-black">
          // TEST SUITE MONITORED TARGETS ({services.length})
        </h2>
        <p className="font-sans text-xs text-black opacity-60">
          Automated Continuous Health & Latency Telemetry Active
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
        {services.map((service) => (
          <MonitoredServiceStatusBlockCard key={service.id} service={service} />
        ))}
      </div>
    </div>
  );
}
