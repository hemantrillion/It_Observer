'use client';

import React from 'react';
import { MonitoredServiceRecord } from '@/lib/database/get_all_monitored_services_query';
import { ViewServiceDetailButtonOnCard } from '../buttons/view_service_detail_button_on_card';
import { Globe, Server, Cloud, Cpu, Activity, Zap } from 'lucide-react';

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
        return <Cloud className="w-3.5 h-3.5 text-[#0b57d0]" />;
      case 'system_process':
        return <Server className="w-3.5 h-3.5 text-purple-600" />;
      default:
        return <Globe className="w-3.5 h-3.5 text-emerald-600" />;
    }
  };

  return (
    <div
      onClick={() => onInspect?.(service.id)}
      className="border border-[#e0e2ec] hover:border-[#0b57d0]/60 hover:shadow-md rounded-2xl p-5 bg-white flex flex-col justify-between space-y-4 transition-all duration-200 group cursor-pointer"
    >
      <div>
        {/* Header: Type Pill & Status Badge */}
        <div className="flex justify-between items-center mb-3">
          <span className="inline-flex items-center gap-1.5 font-sans text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#f0f4f9] text-[#444746]">
            {getTypeIcon()}
            <span className="uppercase tracking-wide">{service.target_type.replace('_', ' ')}</span>
          </span>

          <span
            className={`font-sans text-xs font-semibold px-3 py-1 rounded-full inline-flex items-center gap-1.5 ${
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

        {/* Title & URL */}
        <h3 className="font-sans font-semibold text-base tracking-tight text-[#1f1f1f] group-hover:text-[#0b57d0] transition-colors mb-1">
          {service.name}
        </h3>

        <p className="font-sans text-xs text-[#5e5e5e] truncate mb-4 font-mono">
          {service.target_url}
        </p>

        {/* Metrics Grid */}
        <div className="border-t border-[#e0e2ec] pt-3.5 grid grid-cols-2 gap-3 font-sans text-xs bg-[#f8fafd] rounded-xl p-3">
          <div>
            <div className="text-[#5e5e5e] text-[10px] uppercase font-semibold tracking-wider">
              LATENCY
            </div>
            <div className="font-bold text-sm text-[#1f1f1f] mt-0.5 flex items-baseline gap-1">
              <span>{service.latest_response_time_ms ? `${service.latest_response_time_ms}` : 'N/A'}</span>
              <span className="text-[10px] font-normal text-[#5e5e5e]">ms</span>
            </div>
          </div>
          <div>
            <div className="text-[#5e5e5e] text-[10px] uppercase font-semibold tracking-wider">
              UPTIME
            </div>
            <div className="font-bold text-sm text-[#1f1f1f] mt-0.5">
              {service.uptime_percentage}%
            </div>
          </div>
        </div>
      </div>

      {/* Button: Inspect Telemetry & Graph */}
      <div className="pt-1">
        <ViewServiceDetailButtonOnCard
          serviceId={service.id}
          onClick={onInspect ? () => onInspect(service.id) : undefined}
        />
      </div>
    </div>
  );
}
