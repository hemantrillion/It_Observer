'use client';

import React from 'react';
import { MonitoredServiceRecord } from '@/lib/database/get_all_monitored_services_query';

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
    <div className="border border-slate-200/90 rounded-xl p-5 bg-white space-y-4 w-full shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
        <div>
          <span className="font-sans text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 inline-block mb-1 uppercase tracking-wide">
            {service.target_type.replace('_', ' ')}
          </span>
          <h2 className="text-xl font-bold font-sans tracking-tight text-slate-900">
            {service.name}
          </h2>
        </div>
        <span
          className={`font-sans text-xs font-semibold px-3 py-1 rounded-full inline-flex items-center gap-1.5 self-start sm:self-center border ${
            isDown
              ? 'bg-rose-50 text-rose-700 border-rose-200'
              : isDegraded
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full inline-block ${
              isDown
                ? 'bg-rose-500 animate-ping'
                : isDegraded
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
          />
          <span>{service.current_status}</span>
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-50/70 border border-slate-200/80 rounded-lg p-3">
          <div className="font-sans text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            LATEST LATENCY
          </div>
          <div className="font-sans text-lg font-black text-slate-900 mt-0.5">
            {service.latest_response_time_ms ? `${service.latest_response_time_ms} ms` : 'N/A'}
          </div>
        </div>

        <div className="bg-slate-50/70 border border-slate-200/80 rounded-lg p-3">
          <div className="font-sans text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            UPTIME RECORD
          </div>
          <div className="font-sans text-lg font-black text-emerald-600 mt-0.5">
            {service.uptime_percentage}%
          </div>
        </div>

        <div className="bg-slate-50/70 border border-slate-200/80 rounded-lg p-3">
          <div className="font-sans text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            TOTAL CHECKS
          </div>
          <div className="font-sans text-lg font-black text-slate-900 mt-0.5">
            {service.total_checks}
          </div>
        </div>

        <div className="bg-slate-50/70 border border-slate-200/80 rounded-lg p-3">
          <div className="font-sans text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            FAILED CHECKS
          </div>
          <div className={`font-sans text-lg font-black mt-0.5 ${service.failed_checks > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
            {service.failed_checks}
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 pt-3 font-sans text-xs text-slate-500 flex flex-wrap items-center gap-2">
        <span className="font-semibold uppercase tracking-wider text-slate-400 text-[11px]">
          Target Endpoint:
        </span>
        <code className="bg-slate-100 px-2.5 py-0.5 rounded font-mono text-slate-800 font-medium text-xs break-all border border-slate-200/60">
          {service.target_url}
        </code>
      </div>
    </div>
  );
}
