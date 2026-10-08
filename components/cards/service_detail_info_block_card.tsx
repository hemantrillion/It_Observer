'use client';

import React from 'react';
import { MonitoredServiceRecord } from '@/lib/database/get_all_monitored_services_query';

interface ServiceDetailInfoBlockCardProps {
  service: MonitoredServiceRecord;
}

export function ServiceDetailInfoBlockCard({ service }: ServiceDetailInfoBlockCardProps) {
  return (
    <div className="border border-black rounded-lg p-5 bg-white space-y-4 w-full">
      <div className="flex justify-between items-start border-b border-black/20 pb-3">
        <div>
          <span className="font-sans text-[10px] uppercase font-bold px-2 py-0.5 border border-black rounded bg-white inline-block mb-1 text-black">
            {service.target_type}
          </span>
          <h2 className="text-2xl font-bold font-sans tracking-tight uppercase text-black">
            {service.name}
          </h2>
        </div>
        <span className="font-sans text-xs font-bold px-3 py-1.5 border border-black rounded bg-black text-white uppercase">
          {service.current_status}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
        <div className="border border-black rounded-md p-3.5 bg-white">
          <div className="font-sans text-[10px] uppercase font-bold opacity-60 text-black">LATEST LATENCY</div>
          <div className="font-sans text-xl font-bold text-black">{service.latest_response_time_ms} ms</div>
        </div>
        <div className="border border-black rounded-md p-3.5 bg-white">
          <div className="font-sans text-[10px] uppercase font-bold opacity-60 text-black">UPTIME RECORD</div>
          <div className="font-sans text-xl font-bold text-black">{service.uptime_percentage}%</div>
        </div>
        <div className="border border-black rounded-md p-3.5 bg-white">
          <div className="font-sans text-[10px] uppercase font-bold opacity-60 text-black">TOTAL CHECKS</div>
          <div className="font-sans text-xl font-bold text-black">{service.total_checks}</div>
        </div>
        <div className="border border-black rounded-md p-3.5 bg-white">
          <div className="font-sans text-[10px] uppercase font-bold opacity-60 text-black">FAILED CHECKS</div>
          <div className="font-sans text-xl font-bold text-black">{service.failed_checks}</div>
        </div>
      </div>

      <div className="border-t border-black/20 pt-3 font-sans text-xs text-black">
        <span className="font-bold uppercase opacity-60 mr-2">TARGET ENDPOINT:</span>
        <code className="bg-neutral-50 px-2.5 py-1 border border-black/30 rounded font-mono font-semibold break-all">
          {service.target_url}
        </code>
      </div>
    </div>
  );
}
