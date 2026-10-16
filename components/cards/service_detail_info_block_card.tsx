'use client';

import React from 'react';
import { MonitoredServiceRecord } from '@/lib/database/get_all_monitored_services_query';
import { Cloud, Server, Globe } from 'lucide-react';

interface ServiceDetailInfoBlockCardProps {
  service: MonitoredServiceRecord;
}

export function ServiceDetailInfoBlockCard({
  service,
}: ServiceDetailInfoBlockCardProps) {
  const isHealthy = service.current_status === 'HEALTHY';
  const isDegraded = service.current_status === 'DEGRADED';
  const isDown = service.current_status === 'DOWN';

  return (
    <div className="border border-[#e0e2ec] rounded-2xl p-6 bg-white space-y-5 w-full shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e0e2ec] pb-4">
        <div>
          <span className="font-sans text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#f0f4f9] text-[#444746] inline-block mb-1.5 uppercase tracking-wide">
            {service.target_type.replace('_', ' ')}
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-sans tracking-tight text-[#1f1f1f]">
            {service.name}
          </h2>
        </div>
        <span
          className={`font-sans text-xs font-semibold px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 self-start sm:self-center ${
            isDown
              ? 'bg-[#fce8e6] text-[#c5221f] border border-[#f5c2c7]'
              : isDegraded
              ? 'bg-[#fef7e0] text-[#b06000] border border-[#fde293]'
              : 'bg-[#e6f4ea] text-[#137333] border border-[#a8dab5]'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full inline-block ${
              isDown
                ? 'bg-[#c5221f] animate-ping'
                : isDegraded
                ? 'bg-[#b06000]'
                : 'bg-[#137333]'
            }`}
          />
          <span>{service.current_status}</span>
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#f8fafd] border border-[#e0e2ec] rounded-xl p-3.5">
          <div className="font-sans text-[10px] uppercase font-semibold text-[#5e5e5e] tracking-wider">
            LATEST LATENCY
          </div>
          <div className="font-sans text-xl font-bold text-[#1f1f1f] mt-1">
            {service.latest_response_time_ms ? `${service.latest_response_time_ms} ms` : 'N/A'}
          </div>
        </div>

        <div className="bg-[#f8fafd] border border-[#e0e2ec] rounded-xl p-3.5">
          <div className="font-sans text-[10px] uppercase font-semibold text-[#5e5e5e] tracking-wider">
            UPTIME RECORD
          </div>
          <div className="font-sans text-xl font-bold text-[#137333] mt-1">
            {service.uptime_percentage}%
          </div>
        </div>

        <div className="bg-[#f8fafd] border border-[#e0e2ec] rounded-xl p-3.5">
          <div className="font-sans text-[10px] uppercase font-semibold text-[#5e5e5e] tracking-wider">
            TOTAL CHECKS
          </div>
          <div className="font-sans text-xl font-bold text-[#1f1f1f] mt-1">
            {service.total_checks}
          </div>
        </div>

        <div className="bg-[#f8fafd] border border-[#e0e2ec] rounded-xl p-3.5">
          <div className="font-sans text-[10px] uppercase font-semibold text-[#5e5e5e] tracking-wider">
            FAILED CHECKS
          </div>
          <div className={`font-sans text-xl font-bold mt-1 ${service.failed_checks > 0 ? 'text-[#c5221f]' : 'text-[#1f1f1f]'}`}>
            {service.failed_checks}
          </div>
        </div>
      </div>

      <div className="border-t border-[#e0e2ec] pt-3.5 font-sans text-xs text-[#444746] flex flex-wrap items-center gap-2">
        <span className="font-semibold uppercase tracking-wider text-[#5e5e5e]">
          Target Endpoint:
        </span>
        <code className="bg-[#f0f4f9] px-3 py-1 rounded-full font-mono text-[#0b57d0] font-medium break-all">
          {service.target_url}
        </code>
      </div>
    </div>
  );
}
