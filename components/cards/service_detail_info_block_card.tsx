'use client';

import React from 'react';
import { MonitoredServiceRecord } from '@/lib/database/get_all_monitored_services_query';

interface ServiceDetailInfoBlockCardProps {
  service: MonitoredServiceRecord;
}

export function ServiceDetailInfoBlockCard({ service }: ServiceDetailInfoBlockCardProps) {
  return (
    <div className="border-3 border-black p-5 bg-white shadow-brutal space-y-4">
      <div className="flex justify-between items-start border-b-2 border-black pb-3">
        <div>
          <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 border border-black bg-white inline-block mb-1">
            {service.target_type}
          </span>
          <h2 className="text-2xl font-black font-mono tracking-tight uppercase">
            {service.name}
          </h2>
        </div>
        <span className="font-mono text-sm font-black px-3 py-1.5 border-2 border-black bg-black text-white">
          [ {service.current_status} ]
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
        <div className="border-2 border-black p-3 bg-white">
          <div className="font-mono text-[10px] uppercase font-bold opacity-60">LATEST LATENCY</div>
          <div className="font-mono text-xl font-bold">{service.latest_response_time_ms} ms</div>
        </div>
        <div className="border-2 border-black p-3 bg-white">
          <div className="font-mono text-[10px] uppercase font-bold opacity-60">UPTIME RECORD</div>
          <div className="font-mono text-xl font-bold">{service.uptime_percentage}%</div>
        </div>
        <div className="border-2 border-black p-3 bg-white">
          <div className="font-mono text-[10px] uppercase font-bold opacity-60">TOTAL CHECKS</div>
          <div className="font-mono text-xl font-bold">{service.total_checks}</div>
        </div>
        <div className="border-2 border-black p-3 bg-white">
          <div className="font-mono text-[10px] uppercase font-bold opacity-60">FAILED CHECKS</div>
          <div className="font-mono text-xl font-bold">{service.failed_checks}</div>
        </div>
      </div>

      <div className="border-t-2 border-black pt-3 font-mono text-xs">
        <span className="font-bold uppercase opacity-60 mr-2">TARGET ENDPOINT:</span>
        <code className="bg-white px-2 py-1 border border-black font-bold break-all">
          {service.target_url}
        </code>
      </div>
    </div>
  );
}
