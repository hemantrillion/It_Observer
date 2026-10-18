'use client';

import React from 'react';
import { MonitoredServiceRecord } from '@/lib/database/get_all_monitored_services_query';
import { ViewServiceDetailButtonOnCard } from '../buttons/view_service_detail_button_on_card';
import { Globe, Server, Cloud } from 'lucide-react';

interface MonitoredServiceStatusBlockCardProps {
  service: MonitoredServiceRecord;
  onInspect?: (serviceId: string) => void;
}

export function MonitoredServiceStatusBlockCard({
  service,
  onInspect,
}: MonitoredServiceStatusBlockCardProps) {
  const isHealthy = service.current_status === 'HEALTHY';
  const isDegraded = service.current_status === 'DEGRADED';
  const isDown = service.current_status === 'DOWN';

  const getTypeIcon = () => {
    switch (service.target_type) {
      case 'cloud_provider':
        return <Cloud className="w-3.5 h-3.5 text-blue-600" />;
      case 'system_process':
        return <Server className="w-3.5 h-3.5 text-purple-600" />;
      default:
        return <Globe className="w-3.5 h-3.5 text-emerald-600" />;
    }
  };

  return (
    <div
      onClick={() => onInspect?.(service.id)}
      className="border border-slate-200/90 hover:border-slate-300 rounded-xl p-4 bg-white flex flex-col justify-between space-y-3.5 transition-all duration-150 group cursor-pointer shadow-2xs hover:shadow-xs font-sans"
    >
      <div>
        {/* Header: Type Pill & Status Badge */}
        <div className="flex justify-between items-center mb-2.5">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200/60">
            {getTypeIcon()}
            <span className="uppercase text-[11px] tracking-wide">{service.target_type.replace('_', ' ')}</span>
          </span>

          <span
            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5 border ${
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
            <span className="text-[11px] font-bold">{service.current_status}</span>
          </span>
        </div>

        {/* Title & URL */}
        <h3 className="font-bold text-base tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors mb-1">
          {service.name}
        </h3>

        <p className="text-xs text-slate-500 truncate mb-3 font-mono font-medium">
          {service.target_url}
        </p>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50/70 border border-slate-200/80 rounded-lg p-2.5">
          <div>
            <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
              LATENCY
            </div>
            <div className="font-black text-lg text-slate-900 mt-0.5 flex items-baseline gap-1">
              <span>{service.latest_response_time_ms ? `${service.latest_response_time_ms}` : 'N/A'}</span>
              <span className="text-[11px] font-semibold text-slate-400">ms</span>
            </div>
          </div>
          <div>
            <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
              UPTIME
            </div>
            <div className="font-black text-lg text-emerald-600 mt-0.5">
              {service.uptime_percentage}%
            </div>
          </div>
        </div>
      </div>

      {/* Button: Inspect */}
      <div className="pt-1">
        <ViewServiceDetailButtonOnCard
          serviceId={service.id}
          onClick={onInspect ? () => onInspect(service.id) : undefined}
        />
      </div>
    </div>
  );
}
