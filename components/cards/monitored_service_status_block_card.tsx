'use client';

import React from 'react';
import { MonitoredServiceRecord } from '@/lib/database/get_all_monitored_services_query';
import { ViewServiceDetailButtonOnCard } from '../buttons/view_service_detail_button_on_card';

interface MonitoredServiceStatusBlockCardProps {
  service: MonitoredServiceRecord;
}

export function MonitoredServiceStatusBlockCard({ service }: MonitoredServiceStatusBlockCardProps) {
  const isHealthy = service.current_status === 'HEALTHY';
  const isDegraded = service.current_status === 'DEGRADED';
  const isDown = service.current_status === 'DOWN';

  return (
    <div className="border-3 border-black p-5 bg-white shadow-brutal flex flex-col justify-between space-y-4">
      <div>
        <div className="flex justify-between items-start mb-2">
          <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 border border-black bg-white">
            {service.target_type}
          </span>
          <span
            className={`font-mono text-xs font-black uppercase px-2 py-1 border-2 border-black ${
              isDown
                ? 'bg-black text-white'
                : isDegraded
                ? 'bg-black text-white italic'
                : 'bg-white text-black'
            }`}
          >
            [ {service.current_status} ]
          </span>
        </div>

        <h3 className="font-mono font-black text-lg tracking-tight text-black uppercase mb-1">
          {service.name}
        </h3>

        <p className="font-mono text-[11px] text-black opacity-70 truncate mb-4">
          {service.target_url}
        </p>

        <div className="border-t-2 border-black pt-3 grid grid-cols-2 gap-2 font-mono text-xs">
          <div>
            <div className="opacity-60 text-[10px] uppercase font-bold">LATENCY</div>
            <div className="font-bold text-sm">
              {service.latest_response_time_ms ? `${service.latest_response_time_ms} ms` : 'N/A'}
            </div>
          </div>
          <div>
            <div className="opacity-60 text-[10px] uppercase font-bold">UPTIME</div>
            <div className="font-bold text-sm">{service.uptime_percentage}%</div>
          </div>
        </div>
      </div>

      <div className="pt-2">
        <ViewServiceDetailButtonOnCard serviceId={service.id} />
      </div>
    </div>
  );
}
