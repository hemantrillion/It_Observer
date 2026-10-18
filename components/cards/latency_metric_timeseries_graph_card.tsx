'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { MetricSampleRecord } from '@/lib/database/get_metric_samples_by_service_query';
import { MonitoredServiceRecord } from '@/lib/database/get_all_monitored_services_query';
import { TrendingUp, Square, BarChart2 } from 'lucide-react';

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

type TimeframeOption = '15m' | '30m' | '1h' | '6h' | '24h';
type GraphFormat = 'area' | 'cartesian' | 'bar';

const TIMEFRAME_BUTTONS: { id: TimeframeOption; label: string; minutes: number }[] = [
  { id: '15m', label: '15m', minutes: 15 },
  { id: '30m', label: '30m', minutes: 30 },
  { id: '1h', label: '1h', minutes: 60 },
  { id: '6h', label: '6h', minutes: 360 },
  { id: '24h', label: '24h', minutes: 1440 },
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

function formatAxisTime(ms: number): string {
  try {
    const d = new Date(ms);
    if (isNaN(d.getTime())) return '';
    return d.toTimeString().split(' ')[0];
  } catch {
    return '';
  }
}

export function LatencyMetricTimeseriesGraphCard({
  samples,
  service,
  onLimitChange,
}: LatencyMetricTimeseriesGraphCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(1000);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeOption>('15m');
  const [graphFormat, setGraphFormat] = useState<GraphFormat>('area');
  const [currentTimeMs, setCurrentTimeMs] = useState<number>(Date.now());

  // Dynamically advance live reference time so the time axis naturally moves forward
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTimeMs(Date.now());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

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

  // 2. Strict timeframe window bounds: [windowStartTime, windowEndTime]
  const currentMinutes = useMemo(() => {
    return TIMEFRAME_BUTTONS.find((b) => b.id === selectedTimeframe)?.minutes || 15;
  }, [selectedTimeframe]);

  const windowDurationMs = currentMinutes * 60 * 1000;
  const windowEndTime = currentTimeMs;
  const windowStartTime = windowEndTime - windowDurationMs;

  // Filter samples that fall strictly inside this window
  const chronological = useMemo(() => {
    const inWindow = allChronological.filter((s) => {
      const time = new Date(s.timestamp).getTime();
      return !isNaN(time) && time >= windowStartTime && time <= windowEndTime + 5000;
    });

    // If completely empty (e.g. system just booted or dormant), anchor with the latest samples
    if (inWindow.length === 0 && allChronological.length > 0) {
      return allChronological.slice(-15);
    }

    return inWindow;
  }, [allChronological, windowStartTime, windowEndTime]);

  // Extract latencies
  const latencies = useMemo(() => {
    return chronological.map((s) => extractLatency(s));
  }, [chronological]);

  // Telemetry metrics statistics (matching Metrics domain view font and layout)
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
  const svgHeight = 330;
  const paddingLeft = 56;
  const paddingRight = 24;
  const paddingTop = 20;
  const paddingBottom = 40;
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

  // Time-proportionate coordinates mapping across the actual selected timeframe window
  const points = useMemo(() => {
    const total = chronological.length;
    if (total === 0) return [];

    return chronological.map((sample, i) => {
      const lat = extractLatency(sample);
      const sampleTime = new Date(sample.timestamp).getTime();

      // Proportional position along the window duration
      let timeRatio = (sampleTime - windowStartTime) / windowDurationMs;
      if (isNaN(timeRatio)) timeRatio = total === 1 ? 0.5 : i / (total - 1);
      timeRatio = Math.max(0, Math.min(1, timeRatio));

      const x = paddingLeft + timeRatio * plotWidth;
      const valRatio = Math.max(0, Math.min(1, lat / maxY));
      const y = plotBaseline - valRatio * plotHeight;

      return { x, y, sample, latency: lat, index: i, sampleTime };
    });
  }, [chronological, maxY, plotBaseline, plotHeight, plotWidth, paddingLeft, windowStartTime, windowDurationMs]);

  // Smooth Curves (for Area Line mode)
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

  // Stepped Cartesian Path (for Cartesian square mode)
  const cartesianPathD = useMemo(() => {
    if (points.length === 0) return '';
    let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
    for (let i = 1; i < points.length; i++) {
      d += ` L ${points[i].x.toFixed(1)} ${points[i].y.toFixed(1)}`;
    }
    return d;
  }, [points]);

  // 5 X-axis evenly spaced time ticks across the exact window [windowStartTime, windowEndTime]
  const xTimeTicks = useMemo(() => {
    const count = 5;
    const ticks: { x: number; label: string; anchor: 'start' | 'middle' | 'end' }[] = [];
    for (let i = 0; i < count; i++) {
      const fraction = i / (count - 1);
      const timeMs = windowStartTime + fraction * windowDurationMs;
      const x = paddingLeft + fraction * plotWidth;
      const label = formatAxisTime(timeMs);
      const anchor = i === 0 ? 'start' : i === count - 1 ? 'end' : 'middle';
      ticks.push({ x, label, anchor });
    }
    return ticks;
  }, [windowStartTime, windowDurationMs, paddingLeft, plotWidth]);

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
      {/* Top Header: Title, Timeframe Buttons & Graph Format Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Response Latency Time-Series
          </h3>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Timeframe Buttons (without 'All') */}
          <div className="flex items-center gap-1">
            <span className="text-xs font-semibold text-slate-400 mr-1">Timeframe:</span>
            {TIMEFRAME_BUTTONS.map((btn) => (
              <button
                key={btn.id}
                type="button"
                onClick={() => {
                  setSelectedTimeframe(btn.id);
                  if (btn.id === '24h') onLimitChange?.(300);
                  else if (btn.id === '6h') onLimitChange?.(200);
                  else onLimitChange?.(120);
                }}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  selectedTimeframe === btn.id
                    ? 'bg-slate-900 text-white font-bold'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* 3 Graph Format Selection Icons */}
          <div className="flex items-center gap-1 border-l border-slate-200 pl-3">
            <button
              type="button"
              onClick={() => setGraphFormat('area')}
              className={`p-1.5 rounded-md border transition-all cursor-pointer ${
                graphFormat === 'area'
                  ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-2xs'
                  : 'bg-white text-slate-500 hover:text-slate-800 border-slate-200'
              }`}
              title="Smooth Area Curve"
            >
              <TrendingUp className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setGraphFormat('cartesian')}
              className={`p-1.5 rounded-md border transition-all cursor-pointer ${
                graphFormat === 'cartesian'
                  ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-2xs'
                  : 'bg-white text-slate-500 hover:text-slate-800 border-slate-200'
              }`}
              title="Cartesian Point Grid"
            >
              <Square className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setGraphFormat('bar')}
              className={`p-1.5 rounded-md border transition-all cursor-pointer ${
                graphFormat === 'bar'
                  ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-2xs'
                  : 'bg-white text-slate-500 hover:text-slate-800 border-slate-200'
              }`}
              title="Vertical Bar Histogram"
            >
              <BarChart2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Summary Tiles (Matching Metrics domain font styling) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="border border-slate-200/90 rounded-xl p-3 bg-white shadow-2xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            LATEST
          </div>
          <div className="text-xl font-black text-slate-900 mt-0.5">
            {stats.latest} <span className="text-xs font-semibold text-slate-400">ms</span>
          </div>
        </div>
        <div className="border border-slate-200/90 rounded-xl p-3 bg-white shadow-2xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            AVERAGE
          </div>
          <div className="text-xl font-black text-slate-900 mt-0.5">
            {stats.avg} <span className="text-xs font-semibold text-slate-400">ms</span>
          </div>
        </div>
        <div className="border border-slate-200/90 rounded-xl p-3 bg-white shadow-2xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            MINIMUM
          </div>
          <div className="text-xl font-black text-slate-900 mt-0.5">
            {stats.min} <span className="text-xs font-semibold text-slate-400">ms</span>
          </div>
        </div>
        <div className="border border-slate-200/90 rounded-xl p-3 bg-white shadow-2xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            PEAK / MAX
          </div>
          <div className="text-xl font-black text-slate-900 mt-0.5">
            {stats.max} <span className="text-xs font-semibold text-slate-400">ms</span>
          </div>
        </div>
        <div className="border border-slate-200/90 rounded-xl p-3 bg-white shadow-2xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            95TH % (P95)
          </div>
          <div className="text-xl font-black text-slate-900 mt-0.5">
            {stats.p95} <span className="text-xs font-semibold text-slate-400">ms</span>
          </div>
        </div>
        <div className="border border-slate-200/90 rounded-xl p-3 bg-white shadow-2xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
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
          No telemetry samples recorded in the selected {selectedTimeframe} window. Probing active...
        </div>
      ) : (
        <div
          ref={containerRef}
          className="relative w-full rounded-xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs select-none cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* SVG Vector Chart */}
          <div className="w-full h-[310px] bg-white">
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

              {/* X-Axis Vertical Gridlines & Evenly Spaced Timestamps */}
              {xTimeTicks.map((t, idx) => (
                <g key={idx}>
                  <line
                    x1={t.x}
                    y1={paddingTop}
                    x2={t.x}
                    y2={plotBaseline}
                    stroke="#f8fafc"
                    strokeWidth="1"
                  />
                  <text
                    x={t.x}
                    y={plotBaseline + 20}
                    textAnchor={t.anchor}
                    fill="#94a3b8"
                    fontSize="11"
                    fontWeight="600"
                    fontFamily="sans-serif"
                  >
                    {t.label}
                  </text>
                </g>
              ))}

              {/* GRAPH FORMAT 1: AREA CURVE */}
              {graphFormat === 'area' && (
                <>
                  {areaPathD && (
                    <path
                      d={areaPathD}
                      fill="url(#cleanLatencyAreaGrad)"
                    />
                  )}
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

                    return (
                      <circle
                        key={i}
                        cx={pt.x}
                        cy={pt.y}
                        r={isHovered ? 4.5 : 2.5}
                        fill={pointColor}
                        stroke="#ffffff"
                        strokeWidth={isHovered ? 2 : 1}
                      />
                    );
                  })}
                </>
              )}

              {/* GRAPH FORMAT 2: CARTESIAN HIGH-PRECISION SQUARES */}
              {graphFormat === 'cartesian' && (
                <>
                  {cartesianPathD && (
                    <path
                      d={cartesianPathD}
                      fill="none"
                      stroke="#0f172a"
                      strokeWidth="1.5"
                    />
                  )}
                  {points.map((pt, i) => {
                    const isError =
                      pt.sample.http_status === 0 ||
                      (pt.sample.http_status !== undefined && pt.sample.http_status >= 500);
                    const isHighLatency = !isError && pt.latency >= 1000;
                    const pointColor = isError
                      ? '#ef4444'
                      : isHighLatency
                      ? '#f59e0b'
                      : '#0f172a';
                    const isHovered = hoveredIdx === i;
                    const size = isHovered ? 9 : 6;
                    const half = size / 2;

                    return (
                      <g key={i}>
                        {isHovered && (
                          <rect
                            x={pt.x - half - 2}
                            y={pt.y - half - 2}
                            width={size + 4}
                            height={size + 4}
                            fill="none"
                            stroke={pointColor}
                            strokeWidth="1.5"
                          />
                        )}
                        <rect
                          x={pt.x - half}
                          y={pt.y - half}
                          width={size}
                          height={size}
                          fill={pointColor}
                          stroke="#ffffff"
                          strokeWidth="1"
                        />
                      </g>
                    );
                  })}
                </>
              )}

              {/* GRAPH FORMAT 3: VERTICAL BAR HISTOGRAM */}
              {graphFormat === 'bar' && (
                <>
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
                    const barWidth = Math.max(3, Math.min(14, (plotWidth / Math.max(1, points.length)) * 0.7));
                    const barHeight = Math.max(2, plotBaseline - pt.y);

                    return (
                      <rect
                        key={i}
                        x={pt.x - barWidth / 2}
                        y={pt.y}
                        width={barWidth}
                        height={barHeight}
                        fill={pointColor}
                        opacity={isHovered ? 1 : 0.8}
                        rx="1.5"
                      />
                    );
                  })}
                </>
              )}

              {/* Hover Crosshair Line */}
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
