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
    <div className="border border-black rounded-lg p-5 bg-white space-y-4 w-full">
      <div className="flex justify-between items-center border-b border-black/20 pb-3">
        <h4 className="font-sans font-bold text-sm uppercase text-black">
          RESPONSE LATENCY HISTORY (LAST {reversed.length} SAMPLES)
        </h4>
        <span className="font-sans text-xs font-semibold text-black">PEAK: {maxLatency} MS</span>
      </div>

      {reversed.length === 0 ? (
        <div className="p-8 text-center font-sans text-xs opacity-60 text-black">
          [ NO TELEMETRY SAMPLES RECORDED YET ]
        </div>
      ) : (
        <div className="space-y-2">
          {/* SVG Geometric Bar Chart */}
          <div className="h-44 w-full flex items-end gap-1.5 pt-4 border-b border-l border-black px-2 pb-1 bg-white">
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
                    className={`w-full border border-black rounded-t-sm transition-colors ${
                      isError ? 'bg-black' : 'bg-neutral-200 hover:bg-black'
                    }`}
                  />
                  {/* Tooltip on hover */}
                  <div className="hidden group-hover:block absolute -top-8 z-20 bg-black text-white font-sans text-[10px] px-2 py-0.5 rounded border border-black whitespace-nowrap">
                    {sample.response_time_ms}ms ({sample.http_status})
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between font-sans text-[10px] opacity-60 pt-1 text-black">
            <span>OLDEST SAMPLE</span>
            <span>CHRONOLOGICAL STREAM →</span>
            <span>MOST RECENT</span>
          </div>
        </div>
      )}
    </div>
  );
}
