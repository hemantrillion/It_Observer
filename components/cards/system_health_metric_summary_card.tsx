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
  isWarning,
}: SystemHealthMetricSummaryCardProps) {
  return (
    <div
      className={`border-3 border-black p-4 bg-white shadow-brutal flex flex-col justify-between ${
        isWarning ? 'bg-black text-white' : 'text-black'
      }`}
    >
      <div className="font-mono text-xs uppercase tracking-wider font-bold mb-2">
        {label}
      </div>
      <div className="text-3xl font-black font-mono tracking-tight my-1">
        {value}
      </div>
      {subtext && (
        <div className="font-mono text-[11px] opacity-80 mt-1 uppercase">
          {subtext}
        </div>
      )}
    </div>
  );
}
