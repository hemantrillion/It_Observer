'use client';

import React from 'react';
import { MetricSampleRecord } from '@/lib/database/get_metric_samples_by_service_query';

interface LatencyMetricTimeseriesGraphCardProps {
  samples: MetricSampleRecord[];
}

export function LatencyMetricTimeseriesGraphCard({ samples }: LatencyMetricTimeseriesGraphCardProps) {
  const reversed = [...samples].reverse();
  const maxLatency = Math.max(200, ...reversed.map((s) => s.response_time_ms));

  return (
    <div className="border-3 border-black p-5 bg-white shadow-brutal space-y-4">
      <div className="flex justify-between items-center border-b-2 border-black pb-3">
        <h4 className="font-mono font-black text-sm uppercase">
          RESPONSE LATENCY HISTORY (LAST {reversed.length} SAMPLES)
        </h4>
        <span className="font-mono text-xs font-bold">PEAK: {maxLatency} MS</span>
      </div>

      {reversed.length === 0 ? (
        <div className="p-8 text-center font-mono text-xs opacity-60">
          [ NO TELEMETRY SAMPLES RECORDED YET ]
        </div>
      ) : (
        <div className="space-y-2">
          {/* SVG Geometric Bar Chart */}
          <div className="h-44 w-full flex items-end gap-1.5 pt-4 border-b-2 border-l-2 border-black px-2 pb-1 bg-white">
            {reversed.map((sample, idx) => {
              const heightPct = Math.max(8, Math.min(100, Math.round((sample.response_time_ms / maxLatency) * 100)));
              const isError = sample.http_status === 0 || sample.http_status >= 500;

              return (
                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center group relative h-full justify-end"
                >
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full border border-black transition-none ${
                      isError ? 'bg-black' : 'bg-white hover:bg-black'
                    }`}
                  />
                  {/* Tooltip on hover */}
                  <div className="hidden group-hover:block absolute -top-8 z-20 bg-black text-white font-mono text-[10px] px-1.5 py-0.5 border border-black whitespace-nowrap">
                    {sample.response_time_ms}ms ({sample.http_status})
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between font-mono text-[10px] opacity-60 pt-1">
            <span>OLDEST SAMPLE</span>
            <span>CHRONOLOGICAL STREAM →</span>
            <span>MOST RECENT</span>
          </div>
        </div>
      )}
    </div>
  );
}
