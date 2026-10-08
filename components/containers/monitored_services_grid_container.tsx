'use client';

import React from 'react';
import { MonitoredServiceRecord } from '@/lib/database/get_all_monitored_services_query';
import { MonitoredServiceStatusBlockCard } from '../cards/monitored_service_status_block_card';

interface MonitoredServicesGridContainerProps {
  services: MonitoredServiceRecord[];
}

export function MonitoredServicesGridContainer({ services }: MonitoredServicesGridContainerProps) {
  return (
    <div className="space-y-3">
      <div className="border-b-3 border-black pb-2 flex justify-between items-center">
        <h3 className="font-mono font-black text-sm uppercase tracking-wider">
          // TEST SUITE MONITORED TARGETS ({services.length})
        </h3>
        <span className="font-mono text-[11px] font-bold opacity-60">
          AUTOMATED POLLING CYCLE ACTIVE
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service) => (
          <MonitoredServiceStatusBlockCard key={service.id} service={service} />
        ))}
      </div>
    </div>
  );
}
