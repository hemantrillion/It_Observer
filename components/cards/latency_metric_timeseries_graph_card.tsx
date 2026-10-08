'use client';

import React, { useState, useMemo } from 'react';
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
  samples: GenericMetricSample[];
  service?: MonitoredServiceRecord | null;
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
}: LatencyMetricTimeseriesGraphCardProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

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

  // SVG Coordinate Constants
  const svgWidth = 1000;
  const svgHeight = 330;
  const paddingLeft = 70;
  const paddingRight = 35;
  const paddingTop = 25;
  const paddingBottom = 45;
  const plotWidth = svgWidth - paddingLeft - paddingRight; // 895
  const plotHeight = svgHeight - paddingTop - paddingBottom; // 260
  const plotBaseline = paddingTop + plotHeight; // 285

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

      // Control points
      let cp1x = p1.x + (p2.x - p0.x) / 6;
      let cp1y = p1.y + (p2.y - p0.y) / 6;
      let cp2x = p2.x - (p3.x - p1.x) / 6;
      let cp2y = p2.y - (p3.y - p1.y) / 6;

      // Clamp control points to chart domain
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

  return (
    <div className="border border-black rounded-lg p-5 bg-white space-y-4 w-full">
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-black/20 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-sans text-[10px] uppercase font-bold px-2 py-0.5 border border-black rounded bg-neutral-100 text-black">
              GRAFANA TSDB
            </span>
            <span className="font-sans text-[10px] uppercase font-bold px-2 py-0.5 border border-black rounded bg-black text-white">
              VECTOR SERIES
            </span>
          </div>
          <h4 className="font-sans font-bold text-base md:text-lg uppercase text-black mt-1">
            RESPONSE LATENCY TIME-SERIES MONITOR
          </h4>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="font-sans text-[11px] font-bold text-black opacity-60">
              PROMETHEUS QUERY:
            </span>
            <code className="text-[11px] font-mono bg-neutral-100 px-2 py-0.5 rounded border border-black/20 text-black break-all">
              http_response_latency_ms&#123;service=&quot;{serviceId}&quot;, endpoint=&quot;{targetUrl}&quot;&#125;
            </code>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-center">
          <a
            href="/metrics"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold font-sans border border-black rounded bg-white hover:bg-black hover:text-white transition-colors text-black"
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
            <span>VIEW /METRICS SCRAPE</span>
          </a>
        </div>
      </div>

      {/* Prometheus Telemetry Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <div className="border border-black rounded-md p-2.5 bg-white">
          <div className="text-[10px] font-bold uppercase opacity-60 font-sans">CURRENT</div>
          <div className="text-lg font-bold font-mono text-black">
            {stats.latest} <span className="text-xs font-normal">ms</span>
          </div>
        </div>
        <div className="border border-black rounded-md p-2.5 bg-white">
          <div className="text-[10px] font-bold uppercase opacity-60 font-sans">AVERAGE</div>
          <div className="text-lg font-bold font-mono text-black">
            {stats.avg} <span className="text-xs font-normal">ms</span>
          </div>
        </div>
        <div className="border border-black rounded-md p-2.5 bg-white">
          <div className="text-[10px] font-bold uppercase opacity-60 font-sans">MINIMUM</div>
          <div className="text-lg font-bold font-mono text-black">
            {stats.min} <span className="text-xs font-normal">ms</span>
          </div>
        </div>
        <div className="border border-black rounded-md p-2.5 bg-white">
          <div className="text-[10px] font-bold uppercase opacity-60 font-sans">MAXIMUM</div>
          <div className="text-lg font-bold font-mono text-black">
            {stats.max} <span className="text-xs font-normal">ms</span>
          </div>
        </div>
        <div className="border border-black rounded-md p-2.5 bg-white">
          <div className="text-[10px] font-bold uppercase opacity-60 font-sans">95TH % (P95)</div>
          <div className="text-lg font-bold font-mono text-black">
            {stats.p95} <span className="text-xs font-normal">ms</span>
          </div>
        </div>
        <div className="border border-black rounded-md p-2.5 bg-white">
          <div className="text-[10px] font-bold uppercase opacity-60 font-sans">SAMPLES</div>
          <div className="text-lg font-bold font-mono text-black">
            {chronological.length}
          </div>
        </div>
      </div>

      {/* Main Graph Viewport */}
      {chronological.length === 0 ? (
        <div className="p-16 text-center font-sans font-bold text-xs opacity-60 border border-black rounded-md bg-neutral-50 text-black">
          [ NO TELEMETRY METRIC SAMPLES RECORDED YET // PROMETHEUS SCRAPING IDLE ]
        </div>
      ) : (
        <div className="space-y-3">
          {/* Dark Grafana Viewport Canvas */}
          <div
            className="relative w-full rounded-md border border-black overflow-hidden bg-[#0b0f19] select-none cursor-crosshair shadow-none"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            {/* Viewport Top Status Line */}
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#1e293b] text-[10px] font-mono text-neutral-400 bg-[#070b13]">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-neutral-300 font-bold">GRAFANA OBSERVABILITY // TIME-SERIES</span>
              </div>
              <div>
                {hoveredPoint ? (
                  <span className="text-cyan-300">
                    SAMPLE #{hoveredPoint.index + 1} OF {points.length} ({hoveredPoint.latency}ms)
                  </span>
                ) : (
                  <span>HOVER SAMPLE POINT FOR DETAILED PROBE</span>
                )}
              </div>
            </div>

            {/* SVG Vector Chart */}
            <div className="w-full h-72 md:h-84">
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full h-full overflow-visible"
                preserveAspectRatio="none"
              >
                <defs>
                  {/* Subtle Gradient Area Fill under the line */}
                  <linearGradient id="latencyAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.38" />
                    <stop offset="60%" stopColor="#06b6d4" stopOpacity="0.10" />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                  </linearGradient>

                  {/* Gradient for the line stroke */}
                  <linearGradient id="latencyLineGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="50%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>

                  {/* Glow filter for active anomaly markers */}
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Y-Axis Horizontal Dashed Gridlines & Numeric Tick Labels */}
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
                        stroke="#1e293b"
                        strokeDasharray="4 4"
                        strokeWidth="1"
                      />
                      <text
                        x={paddingLeft - 10}
                        y={tickY + 4}
                        textAnchor="end"
                        fill="#94a3b8"
                        fontSize="11"
                        fontFamily="ui-monospace, monospace"
                      >
                        {tickVal} ms
                      </text>
                    </g>
                  );
                })}

                {/* Baseline Axis Line */}
                <line
                  x1={paddingLeft}
                  y1={plotBaseline}
                  x2={paddingLeft + plotWidth}
                  y2={plotBaseline}
                  stroke="#334155"
                  strokeWidth="1.5"
                />

                {/* X-Axis Vertical Gridlines & Timestamps */}
                {xTickIndices.map((idx) => {
                  const pt = points[idx];
                  if (!pt) return null;
                  const timeLabel = formatTime(pt.sample.timestamp);
                  return (
                    <g key={idx}>
                      <line
                        x1={pt.x}
                        y1={paddingTop}
                        x2={pt.x}
                        y2={plotBaseline}
                        stroke="#1e293b"
                        strokeDasharray="3 3"
                        strokeWidth="1"
                      />
                      <text
                        x={pt.x}
                        y={plotBaseline + 22}
                        textAnchor="middle"
                        fill="#94a3b8"
                        fontSize="11"
                        fontFamily="ui-monospace, monospace"
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
                    fill="url(#latencyAreaGrad)"
                    className="transition-all duration-300"
                  />
                )}

                {/* Smooth Cubic Bezier Vector Line */}
                {linePathD && (
                  <path
                    d={linePathD}
                    fill="none"
                    stroke="url(#latencyLineGrad)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Color-Coded Sample Points & Anomaly Markers */}
                {points.map((pt, i) => {
                  const isError =
                    pt.sample.http_status === 0 ||
                    (pt.sample.http_status !== undefined && pt.sample.http_status >= 500);
                  const isHighLatency = !isError && pt.latency >= 1000;
                  const pointColor = isError
                    ? '#ef4444' // Red
                    : isHighLatency
                    ? '#f59e0b' // Amber
                    : '#10b981'; // Green

                  const isHovered = hoveredIdx === i;

                  return (
                    <g key={i}>
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isHovered ? 5.5 : 3.5}
                        fill={pointColor}
                        stroke="#0b0f19"
                        strokeWidth={isHovered ? 2 : 1.5}
                        className="transition-all duration-150"
                      />
                      {/* Pulsing ring for anomalies or hovered point */}
                      {(isHovered || isError || isHighLatency) && (
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={isHovered ? 8.5 : 6}
                          fill="none"
                          stroke={pointColor}
                          strokeWidth="1.5"
                          opacity={isHovered ? 0.9 : 0.4}
                        />
                      )}
                    </g>
                  );
                })}

                {/* Interactive Dynamic Crosshairs */}
                {hoveredPoint && (
                  <g pointerEvents="none">
                    {/* Vertical tracking line */}
                    <line
                      x1={hoveredPoint.x}
                      y1={paddingTop}
                      x2={hoveredPoint.x}
                      y2={plotBaseline}
                      stroke="#38bdf8"
                      strokeWidth="1.2"
                      strokeDasharray="4 3"
                      opacity="0.85"
                    />
                    {/* Horizontal tracking line */}
                    <line
                      x1={paddingLeft}
                      y1={hoveredPoint.y}
                      x2={paddingLeft + plotWidth}
                      y2={hoveredPoint.y}
                      stroke="#38bdf8"
                      strokeWidth="1.2"
                      strokeDasharray="4 3"
                      opacity="0.85"
                    />
                    {/* Glowing cursor target */}
                    <circle
                      cx={hoveredPoint.x}
                      cy={hoveredPoint.y}
                      r="9"
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="2"
                      opacity="0.6"
                      filter="url(#glow)"
                    />
                    <circle
                      cx={hoveredPoint.x}
                      cy={hoveredPoint.y}
                      r="4.5"
                      fill="#ffffff"
                      stroke="#0284c7"
                      strokeWidth="2"
                    />
                  </g>
                )}
              </svg>
            </div>

            {/* Grafana-style Dark Floating Tooltip Overlay */}
            {hoveredPoint && hoveredSample && (
              <div
                style={{
                  left: `${Math.min(
                    82,
                    Math.max(18, (hoveredPoint.x / svgWidth) * 100)
                  )}%`,
                  top:
                    hoveredPoint.y < 120
                      ? `${((hoveredPoint.y + 40) / svgHeight) * 100}%`
                      : `${((hoveredPoint.y - 12) / svgHeight) * 100}%`,
                  transform:
                    hoveredPoint.y < 120
                      ? 'translate(-50%, 0%)'
                      : 'translate(-50%, -100%)',
                }}
                className="absolute z-30 pointer-events-none bg-[#090d16]/95 border border-[#334155] rounded-md shadow-2xl p-3 text-white font-mono text-xs backdrop-blur-md min-w-[260px] max-w-[340px]"
              >
                {/* Tooltip Header: Timestamp */}
                <div className="flex items-center justify-between border-b border-[#1e293b] pb-2 mb-2 text-[11px] text-neutral-400">
                  <span className="font-bold text-neutral-200">
                    PROMETHEUS SAMPLE #{hoveredPoint.index + 1}
                  </span>
                  <span>{formatFullDateTime(hoveredSample.timestamp)}</span>
                </div>

                {/* Tooltip Body: Latency & Status */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-neutral-400">Latency:</span>
                    <span className="font-bold text-cyan-300 text-sm">
                      {hoveredPoint.latency} ms
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-neutral-400">HTTP Status:</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                        hoveredSample.http_status === 200
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60'
                          : hoveredSample.http_status === 0
                          ? 'bg-red-950 text-red-300 border border-red-700/60'
                          : 'bg-amber-950 text-amber-300 border border-amber-700/60'
                      }`}
                    >
                      {hoveredSample.http_status
                        ? `${hoveredSample.http_status}`
                        : '0 (NETWORK FAILURE)'}
                    </span>
                  </div>

                  {/* Classification Anomaly Badge */}
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-neutral-400">Health State:</span>
                    <span
                      className={`font-bold text-[11px] ${
                        hoveredSample.http_status === 0 ||
                        (hoveredSample.http_status && hoveredSample.http_status >= 500)
                          ? 'text-red-400'
                          : hoveredPoint.latency >= 1000
                          ? 'text-amber-400'
                          : 'text-emerald-400'
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
                    <div className="flex items-center justify-between gap-3 border-t border-[#1e293b] pt-1.5 text-[11px] text-neutral-400">
                      <span>CPU: {hoveredSample.cpu_percentage ?? 0}%</span>
                      <span>RAM: {hoveredSample.memory_mb ?? 0} MB</span>
                    </div>
                  )}

                  {/* Error Message if present */}
                  {hoveredSample.error_message && (
                    <div className="mt-2 p-1.5 bg-red-950/80 border border-red-700/60 rounded text-[11px] text-red-200 break-words">
                      <span className="font-bold">Error: </span>
                      {hoveredSample.error_message}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Observability Legend Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-black/10 rounded-md p-3 bg-neutral-50 font-sans text-xs text-black">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="font-bold uppercase opacity-60 text-[10px]">LEGEND:</span>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] inline-block" />
                <span className="text-[11px] font-medium">Normal (&lt; 1000ms)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] inline-block" />
                <span className="text-[11px] font-medium">High Latency (≥ 1000ms)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] inline-block" />
                <span className="text-[11px] font-medium">Failed Probe / HTTP 5xx</span>
              </div>
            </div>

            <div className="text-[10px] font-mono opacity-60 text-black">
              STREAM: CHRONOLOGICAL (OLDEST → NEWEST)
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
