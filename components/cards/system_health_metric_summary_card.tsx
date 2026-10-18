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
    if (l.includes('healthy')) return 'text-emerald-600';
    if (l.includes('degraded')) return Number(value) > 0 ? 'text-amber-600' : 'text-slate-800';
    if (l.includes('down')) return Number(value) > 0 ? 'text-rose-600' : 'text-slate-800';
    if (l.includes('incident') || l.includes('alert')) return Number(value) > 0 ? 'text-rose-600' : 'text-slate-800';
    return 'text-slate-900';
  };

  return (
    <div
      onClick={onClick}
      className={`border border-slate-200/90 hover:border-slate-300 rounded-xl p-3.5 bg-white flex flex-col justify-between h-full shadow-2xs transition-all ${
        onClick ? 'cursor-pointer hover:bg-slate-50/50' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </span>
        {isWarning && Number(value) > 0 && (
          <span className="font-sans text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 uppercase">
            ATTN
          </span>
        )}
      </div>

      <div className={`text-2xl font-sans font-black tracking-tight my-1 ${getAccentColor()}`}>
        {value}
      </div>

      {subtext && (
        <div className="font-sans text-[11px] text-slate-500 font-medium">
          {subtext}
        </div>
      )}
    </div>
  );
}
