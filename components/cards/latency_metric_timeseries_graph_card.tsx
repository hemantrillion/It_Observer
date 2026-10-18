'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { MetricSampleRecord } from '@/lib/database/get_metric_samples_by_service_query';
import { MonitoredServiceRecord } from '@/lib/database/get_all_monitored_services_query';

export interface GenericMetricSample {
  id?: number;
  service_id?: string;
  timestamp: string;
  latency_ms?: number;
  response_time_ms?: number;
  http_status?: number;
  error_message?: string | null;
  cpu_percentage?: number;
  memory_mb?: number;
}

interface LatencyMetricTimeseriesGraphCardProps {
  samples: GenericMetricSample[] | MetricSampleRecord[];
  service?: MonitoredServiceRecord | null;
  currentLimit?: number;
  onLimitChange?: (newLimit: number) => void;
  lastUpdatedTime?: string;
  isLivePolling?: boolean;
}

type TimeframeOption = '15m' | '30m' | '1h' | '6h' | '24h' | 'all';

const TIMEFRAME_BUTTONS: { id: TimeframeOption; label: string; minutes: number }[] = [
  { id: '15m', label: '15m', minutes: 15 },
  { id: '30m', label: '30m', minutes: 30 },
  { id: '1h', label: '1h', minutes: 60 },
  { id: '6h', label: '6h', minutes: 360 },
  { id: '24h', label: '24h', minutes: 1440 },
  { id: 'all', label: 'All', minutes: 0 },
];

function extractLatency(s: GenericMetricSample): number {
  const raw = s.latency_ms ?? s.response_time_ms ?? 0;
  return Math.min(6000, Math.max(0, raw));
}

function getCleanUpperBound(val: number): number {
  if (val <= 100) return 100;
  if (val <= 250) return 250;
  if (val <= 500) return 500;
  if (val <= 1000) return 1000;
  if (val <= 1500) return 1500;
  if (val <= 2000) return 2000;
  if (val <= 3000) return 3000;
  if (val <= 4000) return 4000;
  if (val <= 5000) return 5000;
  return 6000;
}

function formatFullDateTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = String(d.getDate()).padStart(2, '0');
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    const timeStr = d.toTimeString().split(' ')[0];
    return `${day} ${month} ${year}, ${timeStr}`;
  } catch {
    return isoString;
  }
}

function formatAxisTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toTimeString().split(' ')[0];
  } catch {
    return isoString;
  }
}

export function LatencyMetricTimeseriesGraphCard({
  samples,
  service,
  onLimitChange,
  isLivePolling = false,
}: LatencyMetricTimeseriesGraphCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(1000);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeOption>('15m');

  // Measure container width for responsive SVG rendering
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        if (w > 0) {
          setContainerWidth(Math.round(w));
        }
      }
    });
    observer.observe(containerRef.current);
    if (containerRef.current.clientWidth > 0) {
      setContainerWidth(containerRef.current.clientWidth);
    }
    return () => observer.disconnect();
  }, []);

  // 1. Sort all raw samples chronologically (oldest -> newest)
  const allChronological = useMemo(() => {
    return [...samples].sort((a, b) => {
      const timeDiff = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      if (!isNaN(timeDiff) && timeDiff !== 0) return timeDiff;
      const idA = a.id ?? 0;
      const idB = b.id ?? 0;
      return idA - idB;
    });
  }, [samples]);

  // 2. Filter strictly by selected timeframe window
  const chronological = useMemo(() => {
    if (selectedTimeframe === 'all') return allChronological;
    const config = TIMEFRAME_BUTTONS.find((b) => b.id === selectedTimeframe);
    if (!config || config.minutes === 0) return allChronological;

    const now = Date.now();
    const cutoff = now - config.minutes * 60 * 1000;

    const filtered = allChronological.filter((s) => {
      const time = new Date(s.timestamp).getTime();
      return !isNaN(time) && time >= cutoff;
    });

    // If zero samples in strictly current window (e.g. app was dormant),
    // fallback to showing the last 20 samples so user is not left with an empty canvas,
    // but clearly anchor them
    if (filtered.length === 0 && allChronological.length > 0) {
      return allChronological.slice(-25);
    }

    return filtered;
  }, [allChronological, selectedTimeframe]);

  // Extract latencies
  const latencies = useMemo(() => {
    return chronological.map((s) => extractLatency(s));
  }, [chronological]);

  // Telemetry metrics statistics
  const stats = useMemo(() => {
    if (latencies.length === 0) {
      return { min: 0, max: 0, avg: 0, p95: 0, latest: 0 };
    }
    const min = Math.min(...latencies);
    const max = Math.max(...latencies);
    const sum = latencies.reduce((acc, curr) => acc + curr, 0);
    const avg = Math.round(sum / latencies.length);

    const sorted = [...latencies].sort((a, b) => a - b);
    const p95Idx = Math.max(0, Math.min(sorted.length - 1, Math.ceil(sorted.length * 0.95) - 1));
    const p95 = sorted[p95Idx];
    const latest = latencies[latencies.length - 1];

    return { min, max, avg, p95, latest };
  }, [latencies]);

  // SVG Geometry
  const svgWidth = Math.max(300, containerWidth);
  const svgHeight = 340;
  const paddingLeft = 56;
  const paddingRight = 18;
  const paddingTop = 20;
  const paddingBottom = 42;
  const plotWidth = Math.max(100, svgWidth - paddingLeft - paddingRight);
  const plotHeight = Math.max(100, svgHeight - paddingTop - paddingBottom);
  const plotBaseline = paddingTop + plotHeight;

  const rawMax = Math.max(80, stats.max);
  const maxY = useMemo(() => getCleanUpperBound(rawMax * 1.2), [rawMax]);

  const yTicks = useMemo(() => {
    return [
      maxY,
      Math.round(maxY * 0.75),
      Math.round(maxY * 0.5),
      Math.round(maxY * 0.25),
      0,
    ];
  }, [maxY]);

  // Coordinates mapping
  const points = useMemo(() => {
    const total = chronological.length;
    if (total === 0) return [];
    return chronological.map((sample, i) => {
      const lat = extractLatency(sample);
      const x =
        total === 1
          ? paddingLeft + plotWidth / 2
          : paddingLeft + (i / (total - 1)) * plotWidth;
      const ratio = Math.max(0, Math.min(1, lat / maxY));
      const y = plotBaseline - ratio * plotHeight;
      return { x, y, sample, latency: lat, index: i };
    });
  }, [chronological, maxY, plotBaseline, plotHeight, plotWidth, paddingLeft]);

  // Smooth Curves
  const { linePathD, areaPathD } = useMemo(() => {
    if (points.length === 0) return { linePathD: '', areaPathD: '' };
    if (points.length === 1) {
      return {
        linePathD: `M ${points[0].x} ${points[0].y}`,
        areaPathD: `M ${points[0].x} ${plotBaseline} L ${points[0].x} ${points[0].y} L ${points[0].x} ${plotBaseline} Z`,
      };
    }

    let linePath = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
    let areaCurves = '';

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(0, i - 1)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(points.length - 1, i + 2)];

      let cp1x = p1.x + (p2.x - p0.x) / 6;
      let cp1y = p1.y + (p2.y - p0.y) / 6;
      let cp2x = p2.x - (p3.x - p1.x) / 6;
      let cp2y = p2.y - (p3.y - p1.y) / 6;

      cp1y = Math.max(paddingTop, Math.min(plotBaseline, cp1y));
      cp2y = Math.max(paddingTop, Math.min(plotBaseline, cp2y));

      const segment = ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
      linePath += segment;
      areaCurves += segment;
    }

    const areaPath = `M ${points[0].x.toFixed(1)} ${plotBaseline.toFixed(1)} L ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}${areaCurves} L ${points[points.length - 1].x.toFixed(1)} ${plotBaseline.toFixed(1)} Z`;

    return { linePathD: linePath, areaPathD: areaPath };
  }, [points, plotBaseline, paddingTop]);

  // X ticks
  const xTickIndices = useMemo(() => {
    const total = points.length;
    if (total === 0) return [];
    if (total <= 5) return points.map((_, i) => i);
    const step = (total - 1) / 4;
    return Array.from(
      new Set([
        0,
        Math.round(step),
        Math.round(step * 2),
        Math.round(step * 3),
        total - 1,
      ])
    );
  }, [points]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (points.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const svgX = (mouseX / rect.width) * svgWidth;

    let closestIdx = 0;
    let minDiff = Infinity;
    for (let i = 0; i < points.length; i++) {
      const diff = Math.abs(points[i].x - svgX);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = i;
      }
    }
    setHoveredIdx(closestIdx);
  };

  const handleMouseLeave = () => {
    setHoveredIdx(null);
  };

  const hoveredPoint = hoveredIdx !== null ? points[hoveredIdx] : null;
  const hoveredSample = hoveredPoint?.sample;

  return (
    <div className="space-y-4 w-full font-sans select-text">
      {/* Top Controls: Timeframe Filter Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Response Latency Time-Series
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Continuous synthetic response time samples
          </p>
        </div>

        {/* Timeframe Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-semibold text-slate-400 mr-1">Timeframe:</span>
          {TIMEFRAME_BUTTONS.map((btn) => (
            <button
              key={btn.id}
              type="button"
              onClick={() => {
                setSelectedTimeframe(btn.id);
                if (btn.id === 'all') onLimitChange?.(500);
                else if (btn.id === '24h') onLimitChange?.(250);
                else onLimitChange?.(120);
              }}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                selectedTimeframe === btn.id
                  ? 'bg-slate-900 text-white font-bold'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="border border-slate-200/90 rounded-xl p-3 bg-white shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            LATEST
          </div>
          <div className="text-xl font-black text-slate-900 mt-0.5">
            {stats.latest} <span className="text-xs font-semibold text-slate-500">ms</span>
          </div>
        </div>
        <div className="border border-slate-200/90 rounded-xl p-3 bg-white shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            AVERAGE
          </div>
          <div className="text-xl font-black text-slate-900 mt-0.5">
            {stats.avg} <span className="text-xs font-semibold text-slate-500">ms</span>
          </div>
        </div>
        <div className="border border-slate-200/90 rounded-xl p-3 bg-white shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            MINIMUM
          </div>
          <div className="text-xl font-black text-slate-900 mt-0.5">
            {stats.min} <span className="text-xs font-semibold text-slate-500">ms</span>
          </div>
        </div>
        <div className="border border-slate-200/90 rounded-xl p-3 bg-white shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            PEAK / MAX
          </div>
          <div className="text-xl font-black text-slate-900 mt-0.5">
            {stats.max} <span className="text-xs font-semibold text-slate-500">ms</span>
          </div>
        </div>
        <div className="border border-slate-200/90 rounded-xl p-3 bg-white shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            95TH % (P95)
          </div>
          <div className="text-xl font-black text-slate-900 mt-0.5">
            {stats.p95} <span className="text-xs font-semibold text-slate-500">ms</span>
          </div>
        </div>
        <div className="border border-slate-200/90 rounded-xl p-3 bg-white shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            SAMPLES
          </div>
          <div className="text-xl font-black text-slate-900 mt-0.5">
            {chronological.length}
          </div>
        </div>
      </div>

      {/* Main Graph Viewport */}
      {chronological.length === 0 ? (
        <div className="p-12 text-center text-xs font-medium text-slate-500 border border-slate-200/90 rounded-xl bg-slate-50/50">
          No telemetry samples recorded for the selected timeframe.
        </div>
      ) : (
        <div
          ref={containerRef}
          className="relative w-full rounded-xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs select-none cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* SVG Vector Chart */}
          <div className="w-full h-[320px] bg-white">
            <svg
              width="100%"
              height="100%"
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              preserveAspectRatio="none"
              className="w-full h-full block"
            >
              <defs>
                <linearGradient id="cleanLatencyAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0.00" />
                </linearGradient>
              </defs>

              {/* Y-Axis Horizontal Dashed Gridlines */}
              {yTicks.map((tickVal, idx) => {
                const tickRatio = tickVal / maxY;
                const tickY = plotBaseline - tickRatio * plotHeight;
                return (
                  <g key={idx}>
                    <line
                      x1={paddingLeft}
                      y1={tickY}
                      x2={paddingLeft + plotWidth}
                      y2={tickY}
                      stroke="#f1f5f9"
                      strokeDasharray="3 3"
                      strokeWidth="1"
                    />
                    <text
                      x={paddingLeft - 8}
                      y={tickY + 4}
                      textAnchor="end"
                      fill="#94a3b8"
                      fontSize="11"
                      fontWeight="600"
                      fontFamily="sans-serif"
                    >
                      {tickVal}ms
                    </text>
                  </g>
                );
              })}

              {/* Baseline */}
              <line
                x1={paddingLeft}
                y1={plotBaseline}
                x2={paddingLeft + plotWidth}
                y2={plotBaseline}
                stroke="#e2e8f0"
                strokeWidth="1"
              />

              {/* X-Axis Vertical Gridlines & Timestamps */}
              {xTickIndices.map((idx) => {
                const pt = points[idx];
                if (!pt) return null;
                const timeLabel = formatAxisTime(pt.sample.timestamp);
                const isFirst = idx === 0;
                const isLast = idx === points.length - 1;
                const anchor = isFirst ? 'start' : isLast ? 'end' : 'middle';

                return (
                  <g key={idx}>
                    <line
                      x1={pt.x}
                      y1={paddingTop}
                      x2={pt.x}
                      y2={plotBaseline}
                      stroke="#f8fafc"
                      strokeWidth="1"
                    />
                    <text
                      x={pt.x}
                      y={plotBaseline + 20}
                      textAnchor={anchor}
                      fill="#94a3b8"
                      fontSize="11"
                      fontWeight="600"
                      fontFamily="sans-serif"
                    >
                      {timeLabel}
                    </text>
                  </g>
                );
              })}

              {/* Vector Gradient Area Fill */}
              {areaPathD && (
                <path
                  d={areaPathD}
                  fill="url(#cleanLatencyAreaGrad)"
                />
              )}

              {/* Vector Line */}
              {linePathD && (
                <path
                  d={linePathD}
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Data points */}
              {points.map((pt, i) => {
                const isError =
                  pt.sample.http_status === 0 ||
                  (pt.sample.http_status !== undefined && pt.sample.http_status >= 500);
                const isHighLatency = !isError && pt.latency >= 1000;
                const pointColor = isError
                  ? '#ef4444'
                  : isHighLatency
                  ? '#f59e0b'
                  : '#2563eb';

                const isHovered = hoveredIdx === i;
                const radius = isHovered ? 4.5 : 2.5;

                return (
                  <circle
                    key={i}
                    cx={pt.x}
                    cy={pt.y}
                    r={radius}
                    fill={pointColor}
                    stroke="#ffffff"
                    strokeWidth={isHovered ? 2 : 1}
                  />
                );
              })}

              {/* Hover Crosshairs */}
              {hoveredPoint && (
                <g pointerEvents="none">
                  <line
                    x1={hoveredPoint.x}
                    y1={paddingTop}
                    x2={hoveredPoint.x}
                    y2={plotBaseline}
                    stroke="#94a3b8"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                </g>
              )}
            </svg>
          </div>

          {/* Clean Tooltip */}
          {hoveredPoint && hoveredSample && (
            <div
              style={{
                left: `${Math.min(84, Math.max(16, (hoveredPoint.x / svgWidth) * 100))}%`,
                top: hoveredPoint.y < 120 ? `${hoveredPoint.y + 40}px` : `${hoveredPoint.y - 10}px`,
                transform: hoveredPoint.y < 120 ? 'translate(-50%, 0)' : 'translate(-50%, -100%)',
              }}
              className="absolute z-30 pointer-events-none bg-slate-900 text-white rounded-lg p-2.5 text-xs shadow-lg space-y-1 min-w-[180px]"
            >
              <div className="flex items-center justify-between text-[11px] text-slate-300 border-b border-slate-700/80 pb-1">
                <span>Sample #{hoveredPoint.index + 1}</span>
                <span className="font-mono">{formatFullDateTime(hoveredSample.timestamp)}</span>
              </div>
              <div className="flex items-center justify-between font-medium">
                <span className="text-slate-400">Latency:</span>
                <span className="font-bold text-white text-sm">{hoveredPoint.latency} ms</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Status:</span>
                <span
                  className={`font-semibold ${
                    hoveredSample.http_status === 200
                      ? 'text-emerald-400'
                      : hoveredSample.http_status === 0
                      ? 'text-rose-400'
                      : 'text-amber-400'
                  }`}
                >
                  HTTP {hoveredSample.http_status || 0}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
