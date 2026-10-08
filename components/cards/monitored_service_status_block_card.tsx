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
    <div className="border border-black rounded-lg p-5 bg-white flex flex-col justify-between space-y-4">
      <div>
        <div className="flex justify-between items-start mb-2.5">
          <span className="font-sans text-[10px] uppercase font-bold px-2 py-0.5 border border-black rounded bg-white text-black">
            {service.target_type}
          </span>
          <span
            className={`font-sans text-xs font-bold uppercase px-2.5 py-1 border border-black rounded ${
              isDown
                ? 'bg-black text-white'
                : isDegraded
                ? 'bg-neutral-100 text-black'
                : 'bg-white text-black'
            }`}
          >
            {service.current_status}
          </span>
        </div>

        <h3 className="font-sans font-bold text-base tracking-tight text-black uppercase mb-1">
          {service.name}
        </h3>

        <p className="font-sans text-xs text-black opacity-60 truncate mb-4">
          {service.target_url}
        </p>

        <div className="border-t border-black/20 pt-3 grid grid-cols-2 gap-2 font-sans text-xs">
          <div>
            <div className="opacity-60 text-[10px] uppercase font-bold">LATENCY</div>
            <div className="font-bold text-sm text-black">
              {service.latest_response_time_ms ? `${service.latest_response_time_ms} ms` : 'N/A'}
            </div>
          </div>
          <div>
            <div className="opacity-60 text-[10px] uppercase font-bold">UPTIME</div>
            <div className="font-bold text-sm text-black">{service.uptime_percentage}%</div>
          </div>
        </div>
      </div>

      <div className="pt-2">
        <ViewServiceDetailButtonOnCard serviceId={service.id} />
      </div>
    </div>
  );
}
