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

function extractLatency(s: GenericMetricSample): number {
  return s.latency_ms ?? s.response_time_ms ?? 0;
}

function getCleanUpperBound(val: number): number {
  if (val <= 100) return 100;
  if (val <= 250) return 250;
  if (val <= 500) return 500;
  if (val <= 1000) return 1000;
  if (val <= 2000) return 2000;
  if (val <= 3000) return 3000;
  if (val <= 5000) return 5000;
  if (val <= 10000) return 10000;
  const power = Math.pow(10, Math.floor(Math.log10(val)));
  return Math.ceil(val / power) * power;
}

function formatTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toTimeString().split(' ')[0];
  } catch {
    return isoString;
  }
}

function formatFullDateTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
  } catch {
    return isoString;
  }
}

export function LatencyMetricTimeseriesGraphCard({
  samples,
  service,
  currentLimit = 120,
  onLimitChange,
  lastUpdatedTime,
  isLivePolling = false,
}: LatencyMetricTimeseriesGraphCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(1000);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Measure exact container width for 1:1 pixel aspect ratio (no text stretching)
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth;
        if (w > 0) setContainerWidth(w);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // 1. Sort samples chronologically (oldest -> newest, left -> right)
  const chronological = useMemo(() => {
    return [...samples].sort((a, b) => {
      const timeDiff = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      if (!isNaN(timeDiff) && timeDiff !== 0) return timeDiff;
      const idA = a.id ?? 0;
      const idB = b.id ?? 0;
      return idA - idB;
    });
  }, [samples]);

  // Extract latencies safely
  const latencies = useMemo(() => {
    return chronological.map((s) => extractLatency(s));
  }, [chronological]);

  // Summary telemetry calculations
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

  // SVG Coordinate Geometry with Generous Height to Avoid Squished Look
  const svgWidth = Math.max(600, containerWidth);
  const svgHeight = 380;
  const paddingLeft = 85;
  const paddingRight = 45;
  const paddingTop = 30;
  const paddingBottom = 60;
  const plotWidth = Math.max(300, svgWidth - paddingLeft - paddingRight);
  const plotHeight = Math.max(150, svgHeight - paddingTop - paddingBottom);
  const plotBaseline = paddingTop + plotHeight;

  // Dynamic Y-axis upper bound with 20% headroom
  const rawMax = Math.max(100, stats.max);
  const maxY = useMemo(() => getCleanUpperBound(rawMax * 1.2), [rawMax]);

  // Y-axis grid ticks (5 horizontal division levels)
  const yTicks = useMemo(() => {
    return [
      maxY,
      Math.round(maxY * 0.75),
      Math.round(maxY * 0.5),
      Math.round(maxY * 0.25),
      0,
    ];
  }, [maxY]);

  // Map chronological samples to SVG Cartesian Coordinates
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

  // Smooth Cubic Bezier Curves (Catmull-Rom to Cubic Bezier)
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

  // X-axis time tick indices (5-6 evenly spaced markers)
  const xTickIndices = useMemo(() => {
    const total = points.length;
    if (total === 0) return [];
    if (total <= 6) return points.map((_, i) => i);
    const step = (total - 1) / 5;
    return Array.from(
      new Set([
        0,
        Math.round(step),
        Math.round(step * 2),
        Math.round(step * 3),
        Math.round(step * 4),
        total - 1,
      ])
    );
  }, [points]);

  // Mouse interaction handler for interactive crosshairs
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

  const serviceId = service?.id || (chronological[0]?.service_id ?? 'service');
  const targetUrl = service?.target_url || 'http://localhost/probe';

  // Calculate start & end times of the currently visible time frame
  const timeFrameLabel = useMemo(() => {
    if (chronological.length < 2) return '';
    const start = formatTime(chronological[0].timestamp);
    const end = formatTime(chronological[chronological.length - 1].timestamp);
    return `${start} → ${end}`;
  }, [chronological]);

  return (
    <div className="border border-black rounded-lg p-5 bg-white space-y-5 w-full">
      {/* Top Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-black/20 pb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-sans text-[11px] uppercase font-bold px-2.5 py-0.5 border border-black rounded bg-black text-white">
              GRAFANA TSDB
            </span>
            <span className="font-sans text-[11px] uppercase font-bold px-2.5 py-0.5 border border-black rounded bg-white text-black">
              REAL-TIME VECTOR STREAM
            </span>
            {isLivePolling ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 border border-black rounded bg-white text-[11px] font-bold text-black uppercase">
                <span className="w-2 h-2 bg-black animate-ping inline-block" />
                <span>POLLING PROBE NOW...</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 border border-black rounded bg-white text-[11px] font-bold text-black uppercase">
                <span className="w-2 h-2 bg-emerald-500 inline-block" />
                <span>AUTO-PROBING EVERY 5S</span>
              </span>
            )}
          </div>

          <h3 className="font-sans font-bold text-xl md:text-2xl uppercase text-black mt-2 tracking-tight">
            RESPONSE LATENCY TIME-SERIES MONITOR
          </h3>

          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="font-sans text-xs font-bold text-black opacity-60 uppercase">
              PROMQL QUERY:
            </span>
            <code className="text-xs font-mono bg-neutral-100 px-2.5 py-1 rounded border border-black/20 text-black break-all font-bold">
              http_response_latency_ms&#123;service=&quot;{serviceId}&quot;, endpoint=&quot;{targetUrl}&quot;&#125;
            </code>
          </div>
        </div>

        {/* Time Window Buttons & Metrics Endpoint Link */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {onLimitChange && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-sans text-xs font-bold uppercase opacity-60 mr-1">
                TIME WINDOW:
              </span>
              {[
                { label: '30 (~5M)', limit: 30 },
                { label: '60 (~15M)', limit: 60 },
                { label: '120 (~30M)', limit: 120 },
                { label: '250 (~1H)', limit: 250 },
                { label: '500 (~2H+)', limit: 500 },
              ].map((btn) => (
                <button
                  key={btn.limit}
                  type="button"
                  onClick={() => onLimitChange(btn.limit)}
                  className={`px-2.5 py-1 text-xs font-bold font-sans border border-black rounded uppercase transition-colors ${
                    currentLimit === btn.limit
                      ? 'bg-black text-white'
                      : 'bg-white text-black hover:bg-neutral-100'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          )}

          <a
            href="/metrics"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold font-sans border border-black rounded bg-white hover:bg-black hover:text-white transition-colors text-black whitespace-nowrap"
            title="View standard text Prometheus exposition metrics endpoint"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            <span>PROMETHEUS /METRICS</span>
          </a>
        </div>
      </div>

      {/* High-Contrast Neo-Brutalist Summary Tiles (Large, Legible Arial Typography) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="border border-black rounded-md p-3 bg-white">
          <div className="text-xs font-bold uppercase opacity-60 font-sans text-black">
            LATEST LATENCY
          </div>
          <div className="text-2xl font-bold font-sans text-black mt-1">
            {stats.latest} <span className="text-sm font-semibold opacity-70">MS</span>
          </div>
        </div>
        <div className="border border-black rounded-md p-3 bg-white">
          <div className="text-xs font-bold uppercase opacity-60 font-sans text-black">
            AVERAGE
          </div>
          <div className="text-2xl font-bold font-sans text-black mt-1">
            {stats.avg} <span className="text-sm font-semibold opacity-70">MS</span>
          </div>
        </div>
        <div className="border border-black rounded-md p-3 bg-white">
          <div className="text-xs font-bold uppercase opacity-60 font-sans text-black">
            MINIMUM
          </div>
          <div className="text-2xl font-bold font-sans text-black mt-1">
            {stats.min} <span className="text-sm font-semibold opacity-70">MS</span>
          </div>
        </div>
        <div className="border border-black rounded-md p-3 bg-white">
          <div className="text-xs font-bold uppercase opacity-60 font-sans text-black">
            PEAK / MAX
          </div>
          <div className="text-2xl font-bold font-sans text-black mt-1">
            {stats.max} <span className="text-sm font-semibold opacity-70">MS</span>
          </div>
        </div>
        <div className="border border-black rounded-md p-3 bg-white">
          <div className="text-xs font-bold uppercase opacity-60 font-sans text-black">
            95TH % (P95)
          </div>
          <div className="text-2xl font-bold font-sans text-black mt-1">
            {stats.p95} <span className="text-sm font-semibold opacity-70">MS</span>
          </div>
        </div>
        <div className="border border-black rounded-md p-3 bg-white">
          <div className="text-xs font-bold uppercase opacity-60 font-sans text-black">
            SAMPLES SHOWN
          </div>
          <div className="text-2xl font-bold font-sans text-black mt-1">
            {chronological.length}
          </div>
        </div>
      </div>

      {/* Main Graph Viewport */}
      {chronological.length === 0 ? (
        <div className="p-16 text-center font-sans font-bold text-sm border border-black rounded-md bg-white text-black">
          [ NO TELEMETRY METRIC SAMPLES RECORDED YET // PROMETHEUS SCRAPING IDLE ]
        </div>
      ) : (
        <div className="space-y-3">
          {/* White Neo-Brutalist Graph Viewport Canvas */}
          <div
            ref={containerRef}
            className="relative w-full rounded-md border border-black overflow-hidden bg-white select-none cursor-crosshair shadow-none"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            {/* Viewport Top Bar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-black text-xs font-sans font-bold text-black bg-neutral-50">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-black inline-block" />
                <span className="uppercase tracking-wide">
                  CHRONOLOGICAL TIME-SERIES
                </span>
                {timeFrameLabel && (
                  <span className="text-neutral-600 font-semibold ml-2">
                    [ RANGE: {timeFrameLabel} ]
                  </span>
                )}
              </div>
              <div>
                {hoveredPoint ? (
                  <span className="text-black font-extrabold uppercase bg-neutral-200 px-2 py-0.5 rounded border border-black text-xs">
                    SAMPLE #{hoveredPoint.index + 1} OF {points.length}: {hoveredPoint.latency} MS
                  </span>
                ) : (
                  <span className="text-black opacity-60 font-semibold">
                    HOVER DATA SQUARES TO INSPECT PROBE
                  </span>
                )}
              </div>
            </div>

            {/* SVG Vector Chart: True 1:1 Pixel Aspect Ratio, Clean White Background */}
            <div className="w-full h-[380px] md:h-[400px] bg-white">
              <svg
                width="100%"
                height="100%"
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full h-full overflow-visible"
              >
                <defs>
                  {/* Subtle Gradient Area Fill under the line (Light translucent tint on pure white) */}
                  <linearGradient id="latencyAreaGradWhite" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#000000" stopOpacity="0.08" />
                    <stop offset="60%" stopColor="#000000" stopOpacity="0.03" />
                    <stop offset="100%" stopColor="#000000" stopOpacity="0.00" />
                  </linearGradient>
                </defs>

                {/* Y-Axis Horizontal Dashed Gridlines & Large Arial Millisecond Labels */}
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
                        stroke="#e5e7eb"
                        strokeDasharray="4 4"
                        strokeWidth="1"
                      />
                      <text
                        x={paddingLeft - 12}
                        y={tickY + 4}
                        textAnchor="end"
                        fill="#000000"
                        fontSize="13"
                        fontWeight="bold"
                        fontFamily="Arial, Helvetica, sans-serif"
                      >
                        {tickVal} ms
                      </text>
                    </g>
                  );
                })}

                {/* Baseline Solid Axis Line */}
                <line
                  x1={paddingLeft}
                  y1={plotBaseline}
                  x2={paddingLeft + plotWidth}
                  y2={plotBaseline}
                  stroke="#000000"
                  strokeWidth="1.5"
                />

                {/* X-Axis Vertical Gridlines & Large Arial Timestamps */}
                {xTickIndices.map((idx) => {
                  const pt = points[idx];
                  if (!pt) return null;
                  const timeLabel = formatTime(pt.sample.timestamp);

                  // Edge anchor adjustment to prevent overflow
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
                        stroke="#e5e7eb"
                        strokeDasharray="4 4"
                        strokeWidth="1"
                      />
                      <text
                        x={pt.x}
                        y={plotBaseline + 26}
                        textAnchor={anchor}
                        fill="#000000"
                        fontSize="13"
                        fontWeight="bold"
                        fontFamily="Arial, Helvetica, sans-serif"
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
                    fill="url(#latencyAreaGradWhite)"
                  />
                )}

                {/* Smooth Cubic Bezier Vector Line (Solid High-Contrast Black Line) */}
                {linePathD && (
                  <path
                    d={linePathD}
                    fill="none"
                    stroke="#000000"
                    strokeWidth="2.5"
                    strokeLinecap="square"
                    strokeLinejoin="round"
                  />
                )}

                {/* RIGID GEOMETRIC SQUARES (Replacing all circles) */}
                {points.map((pt, i) => {
                  const isError =
                    pt.sample.http_status === 0 ||
                    (pt.sample.http_status !== undefined && pt.sample.http_status >= 500);
                  const isHighLatency = !isError && pt.latency >= 1000;
                  const pointColor = isError
                    ? '#ef4444' // Red square
                    : isHighLatency
                    ? '#f59e0b' // Amber square
                    : '#10b981'; // Emerald square

                  const isHovered = hoveredIdx === i;
                  const squareSize = isHovered ? 10 : 7;
                  const halfSize = squareSize / 2;

                  return (
                    <g key={i}>
                      {/* Outer square ring for anomalies or hovered node */}
                      {(isHovered || isError || isHighLatency) && (
                        <rect
                          x={pt.x - halfSize - 3}
                          y={pt.y - halfSize - 3}
                          width={squareSize + 6}
                          height={squareSize + 6}
                          fill="none"
                          stroke={isError ? '#ef4444' : isHighLatency ? '#f59e0b' : '#000000'}
                          strokeWidth="1.5"
                        />
                      )}

                      {/* Main Data Square */}
                      <rect
                        x={pt.x - halfSize}
                        y={pt.y - halfSize}
                        width={squareSize}
                        height={squareSize}
                        fill={pointColor}
                        stroke="#000000"
                        strokeWidth="1.5"
                      />
                    </g>
                  );
                })}

                {/* Interactive Dynamic Crosshairs (Sharp Dashed Lines) */}
                {hoveredPoint && (
                  <g pointerEvents="none">
                    {/* Vertical tracking line */}
                    <line
                      x1={hoveredPoint.x}
                      y1={paddingTop}
                      x2={hoveredPoint.x}
                      y2={plotBaseline}
                      stroke="#000000"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                    />
                    {/* Horizontal tracking line */}
                    <line
                      x1={paddingLeft}
                      y1={hoveredPoint.y}
                      x2={paddingLeft + plotWidth}
                      y2={hoveredPoint.y}
                      stroke="#000000"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                    />
                    {/* Square cursor reticle */}
                    <rect
                      x={hoveredPoint.x - 8}
                      y={hoveredPoint.y - 8}
                      width={16}
                      height={16}
                      fill="none"
                      stroke="#000000"
                      strokeWidth="2"
                    />
                  </g>
                )}
              </svg>
            </div>

            {/* Neo-Brutalist White Tooltip Overlay with Crisp Black Border */}
            {hoveredPoint && hoveredSample && (
              <div
                style={{
                  left: `${Math.min(
                    84,
                    Math.max(16, (hoveredPoint.x / svgWidth) * 100)
                  )}%`,
                  top:
                    hoveredPoint.y < 150
                      ? `${((hoveredPoint.y + 40) / svgHeight) * 100}%`
                      : `${((hoveredPoint.y - 15) / svgHeight) * 100}%`,
                  transform:
                    hoveredPoint.y < 150
                      ? 'translate(-50%, 0%)'
                      : 'translate(-50%, -100%)',
                }}
                className="absolute z-30 pointer-events-none bg-white border-2 border-black rounded-md shadow-2xl p-4 text-black font-sans text-xs min-w-[280px] max-w-[360px]"
              >
                {/* Tooltip Header: Timestamp */}
                <div className="flex items-center justify-between border-b border-black pb-2 mb-2 text-xs text-black font-bold uppercase">
                  <span>SAMPLE #{hoveredPoint.index + 1}</span>
                  <span className="opacity-70 font-mono">
                    {formatFullDateTime(hoveredSample.timestamp)}
                  </span>
                </div>

                {/* Tooltip Body: Latency & Status */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-bold text-black uppercase">RESPONSE LATENCY:</span>
                    <span className="font-extrabold text-black text-base">
                      {hoveredPoint.latency} ms
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className="font-bold text-black uppercase">HTTP STATUS:</span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-bold uppercase border border-black ${
                        hoveredSample.http_status === 200
                          ? 'bg-neutral-100 text-black'
                          : hoveredSample.http_status === 0
                          ? 'bg-black text-white'
                          : 'bg-neutral-200 text-black'
                      }`}
                    >
                      {hoveredSample.http_status
                        ? `${hoveredSample.http_status}`
                        : '0 (NETWORK FAILURE)'}
                    </span>
                  </div>

                  {/* Health State Badge */}
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-bold text-black uppercase">HEALTH STATE:</span>
                    <span
                      className={`font-bold text-xs uppercase px-2 py-0.5 border border-black rounded ${
                        hoveredSample.http_status === 0 ||
                        (hoveredSample.http_status && hoveredSample.http_status >= 500)
                          ? 'bg-red-100 text-red-900'
                          : hoveredPoint.latency >= 1000
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-emerald-100 text-emerald-900'
                      }`}
                    >
                      {hoveredSample.http_status === 0 ||
                      (hoveredSample.http_status && hoveredSample.http_status >= 500)
                        ? 'CRITICAL / DOWN'
                        : hoveredPoint.latency >= 1000
                        ? 'DEGRADED / HIGH LATENCY'
                        : 'OPTIMAL / HEALTHY'}
                    </span>
                  </div>

                  {/* System CPU / RAM if present */}
                  {((hoveredSample.cpu_percentage ?? 0) > 0 ||
                    (hoveredSample.memory_mb ?? 0) > 0) && (
                    <div className="flex items-center justify-between gap-3 border-t border-black/20 pt-2 text-xs font-bold text-black">
                      <span>CPU: {hoveredSample.cpu_percentage ?? 0}%</span>
                      <span>RAM: {hoveredSample.memory_mb ?? 0} MB</span>
                    </div>
                  )}

                  {/* Error Message if present */}
                  {hoveredSample.error_message && (
                    <div className="mt-2 p-2 bg-neutral-100 border border-black rounded text-xs text-black break-words font-medium">
                      <span className="font-bold uppercase">ERROR: </span>
                      {hoveredSample.error_message}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Observability Legend Bar (Strict Neo-Brutalist SQUARES) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-black rounded-md p-3.5 bg-white font-sans text-xs text-black">
            <div className="flex items-center gap-5 flex-wrap">
              <span className="font-bold uppercase opacity-60 text-xs">LEGEND:</span>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 bg-[#10b981] border border-black inline-block" />
                <span className="text-xs font-bold uppercase">NORMAL (&lt; 1000MS)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 bg-[#f59e0b] border border-black inline-block" />
                <span className="text-xs font-bold uppercase">HIGH LATENCY (≥ 1000MS)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 bg-[#ef4444] border border-black inline-block" />
                <span className="text-xs font-bold uppercase">FAILED PROBE / HTTP 5XX</span>
              </div>
            </div>

            <div className="text-xs font-sans font-bold uppercase opacity-60 text-black">
              STREAM: REAL-TIME (OLDEST → NEWEST)
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
