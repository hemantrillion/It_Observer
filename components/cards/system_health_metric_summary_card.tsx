'use client';

import React from 'react';

interface SystemHealthMetricSummaryCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  isWarning?: boolean;
}

export function SystemHealthMetricSummaryCard({
  label,
  value,
  subtext,
  isWarning = false,
}: SystemHealthMetricSummaryCardProps) {
  return (
    <div className="border border-black rounded-lg p-5 bg-white flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-2">
        <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-black opacity-70">
          {label}
        </span>
        {isWarning && (
          <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-black text-white uppercase">
            ATTN
          </span>
        )}
      </div>

      <div className="text-3xl font-sans font-bold text-black tracking-tight my-2">
        {value}
      </div>

      {subtext && (
        <div className="font-sans text-[11px] text-black opacity-60 uppercase mt-1">
          {subtext}
        </div>
      )}
    </div>
  );
}
