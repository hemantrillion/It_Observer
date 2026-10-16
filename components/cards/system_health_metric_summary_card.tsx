'use client';

import React from 'react';

interface SystemHealthMetricSummaryCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  isWarning?: boolean;
  onClick?: () => void;
}

export function SystemHealthMetricSummaryCard({
  label,
  value,
  subtext,
  isWarning = false,
  onClick,
}: SystemHealthMetricSummaryCardProps) {
  const getAccentColor = () => {
    const l = label.toLowerCase();
    if (l.includes('healthy')) return 'text-[#137333]';
    if (l.includes('degraded')) return Number(value) > 0 ? 'text-[#b06000]' : 'text-[#444746]';
    if (l.includes('down')) return Number(value) > 0 ? 'text-[#c5221f]' : 'text-[#444746]';
    if (l.includes('incident') || l.includes('alert')) return Number(value) > 0 ? 'text-[#c5221f]' : 'text-[#444746]';
    return 'text-[#0b57d0]';
  };

  return (
    <div
      onClick={onClick}
      className={`border border-[#e0e2ec] hover:border-[#0b57d0]/60 rounded-2xl p-5 bg-white/90 backdrop-blur-xs flex flex-col justify-between h-full shadow-2xs hover:shadow-md transition-all ${
        onClick ? 'cursor-pointer hover:scale-[1.01]' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-sans text-xs font-bold uppercase tracking-wider text-[#444746]">
          {label}
        </span>
        {isWarning && Number(value) > 0 && (
          <span className="font-sans text-xs font-bold px-2 py-0.5 rounded-full bg-[#fce8e6] text-[#c5221f] border border-[#f5c2c7] uppercase">
            ATTN
          </span>
        )}
      </div>

      <div className={`text-3xl font-sans font-bold tracking-tight my-1.5 ${getAccentColor()}`}>
        {value}
      </div>

      {subtext && (
        <div className="font-sans text-xs text-[#5e5e5e] font-semibold mt-1">
          {subtext}
        </div>
      )}
    </div>
  );
}
