'use client';

import React from 'react';
import { MonitoredServiceRecord } from '@/lib/database/get_all_monitored_services_query';
import { X } from 'lucide-react';

interface ServiceDetailInfoBlockCardProps {
  service: MonitoredServiceRecord;
  onClose?: () => void;
}

export function ServiceDetailInfoBlockCard({
  service,
  onClose,
}: ServiceDetailInfoBlockCardProps) {
  const isHealthy = service.current_status === 'HEALTHY';
  const isDegraded = service.current_status === 'DEGRADED';
  const isDown = service.current_status === 'DOWN';

  return (
    <div className="border border-slate-200/90 rounded-xl p-5 bg-white space-y-4 w-full shadow-2xs font-sans">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
        <div>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 inline-block mb-1 uppercase tracking-wide">
            {service.target_type.replace('_', ' ')}
          </span>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              {service.name}
            </h2>
            {/* Status indicator moved beside service name in a smaller size */}
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1 border ${
                isDown
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : isDegraded
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full inline-block ${
                  isDown
                    ? 'bg-rose-500 animate-ping'
                    : isDegraded
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
              />
              <span className="font-bold">{service.current_status}</span>
            </span>
          </div>
        </div>

        {/* Circular Exit button placed where the status icon previously was */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer shadow-2xs shrink-0"
            title="Close telemetry detail"
            aria-label="Close telemetry detail"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-50/70 border border-slate-200/80 rounded-lg p-3">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            LATEST LATENCY
          </div>
          <div className="text-lg font-black text-slate-900 mt-0.5">
            {service.latest_response_time_ms ? `${service.latest_response_time_ms} ms` : 'N/A'}
          </div>
        </div>

        <div className="bg-slate-50/70 border border-slate-200/80 rounded-lg p-3">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            UPTIME RECORD
          </div>
          <div className="text-lg font-black text-emerald-600 mt-0.5">
            {service.uptime_percentage}%
          </div>
        </div>

        <div className="bg-slate-50/70 border border-slate-200/80 rounded-lg p-3">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            TOTAL CHECKS
          </div>
          <div className="text-lg font-black text-slate-900 mt-0.5">
            {service.total_checks}
          </div>
        </div>

        <div className="bg-slate-50/70 border border-slate-200/80 rounded-lg p-3">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            FAILED CHECKS
          </div>
          <div className={`text-lg font-black mt-0.5 ${service.failed_checks > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
            {service.failed_checks}
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 pt-3 text-xs text-slate-500 flex flex-wrap items-center gap-2">
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
