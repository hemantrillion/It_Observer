'use client';

import React, { useState } from 'react';
import { Info, RefreshCw, MoreVertical, X, Terminal, CheckCircle2, Copy, Check } from 'lucide-react';
import { MetricCardData } from '@/lib/catalog/metrics_catalogue_provider';

interface MetricTelemetryChartCardProps {
  data: MetricCardData;
}

export function MetricTelemetryChartCard({ data }: MetricTelemetryChartCardProps) {
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleCopyApi = () => {
    if (!data.sampleApi) return;
    navigator.clipboard.writeText(data.sampleApi);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefresh = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  // Convert points (0.0 to 1.0) into SVG path
  const svgWidth = 600;
  const svgHeight = 135;
  const paddingLeft = 40;
  const paddingRight = 15;
  const paddingTop = 12;
  const paddingBottom = 26;
  const plotWidth = svgWidth - paddingLeft - paddingRight;
  const plotHeight = svgHeight - paddingTop - paddingBottom;
  const baseline = paddingTop + plotHeight;

  const buildPath = (pts: number[]) => {
    if (!pts || pts.length < 2) return '';
    return pts
      .map((val, i) => {
        const x = paddingLeft + (i / (pts.length - 1)) * plotWidth;
        const y = baseline - val * plotHeight;
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  };

  const buildAreaPath = (pts: number[]) => {
    if (!pts || pts.length < 2) return '';
    const lineStr = buildPath(pts);
    const lastX = paddingLeft + plotWidth;
    return `${lineStr} L ${lastX} ${baseline} L ${paddingLeft} ${baseline} Z`;
  };

  const lineD1 = data.hasData ? buildPath(data.points) : '';
  const areaD1 = data.hasData ? buildAreaPath(data.points) : '';
  const lineD2 = data.hasData && data.dualPoints ? buildPath(data.dualPoints) : '';

  const timeTicks = ['05:00', '06:30', '07:00', '08:30', '09:00'];
  const yTicks = [
    { label: '1', val: 1 },
    { label: '0.75', val: 0.75 },
    { label: '0.5', val: 0.5 },
    { label: '0.25', val: 0.25 },
    { label: '0', val: 0 },
  ];

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all p-4 sm:p-4.5 flex flex-col justify-between w-full select-none">
        {/* Header Row */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            {/* Drag Handle Dots */}
            <span
              className="text-slate-300 hover:text-slate-500 font-mono text-xs select-none cursor-grab shrink-0 tracking-tighter"
              title="Reorder card"
            >
              :::
            </span>

            {/* Metric Title */}
            <h4 className="text-xs sm:text-sm font-bold text-slate-800 truncate" title={data.title}>
              {data.title}
            </h4>

            {/* Info Icon Button (Opens Full Excel Description & Query Popover) */}
            <button
              type="button"
              onClick={() => setIsInfoOpen(true)}
              className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 p-1 rounded-full transition-colors shrink-0 cursor-pointer"
              title="Inspect metric definition, collection command & requirements"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Dual Series Legend */}
            {data.dualPoints && (
              <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-semibold mr-1.5">
                <span className="inline-flex items-center gap-1 text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                  <span>{data.series1Name || 'Series 1'}</span>
                </span>
                <span className="inline-flex items-center gap-1 text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" />
                  <span>{data.series2Name || 'Series 2'}</span>
                </span>
              </div>
            )}

            {/* Refresh Icon */}
            <button
              type="button"
              onClick={handleRefresh}
              className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              title="Refresh metric sample stream"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
            </button>

            {/* Menu Icon */}
            <button
              type="button"
              onClick={() => setIsInfoOpen(true)}
              className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              title="More metric options"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Chart Viewport */}
        <div className="w-full h-32 sm:h-36 relative select-none">
          {data.hasData ? (
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              preserveAspectRatio="none"
              className="w-full h-full block"
            >
              <defs>
                <linearGradient id={`grad-${data.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={data.color} stopOpacity="0.18" />
                  <stop offset="80%" stopColor={data.color} stopOpacity="0.02" />
                  <stop offset="100%" stopColor={data.color} stopOpacity="0.00" />
                </linearGradient>
              </defs>

              {/* Horizontal faint grid lines & Y labels */}
              {yTicks.map((tick, i) => {
                const y = baseline - tick.val * plotHeight;
                return (
                  <g key={i}>
                    <line
                      x1={paddingLeft}
                      y1={y}
                      x2={svgWidth - paddingRight}
                      y2={y}
                      stroke="#f1f5f9"
                      strokeWidth="1"
                    />
                    <text
                      x={paddingLeft - 8}
                      y={y + 3.5}
                      textAnchor="end"
                      fill="#94a3b8"
                      fontSize="9.5"
                      fontFamily="Arial, sans-serif"
                    >
                      {tick.label}
                    </text>
                  </g>
                );
              })}

              {/* X-axis time ticks */}
              {timeTicks.map((timeStr, i) => {
                const x = paddingLeft + (i / (timeTicks.length - 1)) * plotWidth;
                const anchor = i === 0 ? 'start' : i === timeTicks.length - 1 ? 'end' : 'middle';
                return (
                  <text
                    key={i}
                    x={x}
                    y={baseline + 16}
                    textAnchor={anchor}
                    fill="#94a3b8"
                    fontSize="9.5"
                    fontFamily="Arial, sans-serif"
                  >
                    {timeStr}
                  </text>
                );
              })}

              {/* Area fill */}
              {areaD1 && <path d={areaD1} fill={`url(#grad-${data.id})`} />}

              {/* Dual series second line */}
              {lineD2 && (
                <path
                  d={lineD2}
                  fill="none"
                  stroke={data.dualColor || '#22d3ee'}
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Main curve line */}
              {lineD1 && (
                <path
                  d={lineD1}
                  fill="none"
                  stroke={data.color}
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </svg>
          ) : (
            /* Empty State Chart (Matching Image 4 & Image 2) */
            <div className="w-full h-full relative flex items-center justify-center">
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                preserveAspectRatio="none"
                className="w-full h-full absolute inset-0"
              >
                {/* Horizontal faint grid lines & Y labels */}
                {yTicks.map((tick, i) => {
                  const y = baseline - tick.val * plotHeight;
                  return (
                    <g key={i}>
                      <line
                        x1={paddingLeft}
                        y1={y}
                        x2={svgWidth - paddingRight}
                        y2={y}
                        stroke="#f1f5f9"
                        strokeWidth="1"
                      />
                      <text
                        x={paddingLeft - 8}
                        y={y + 3.5}
                        textAnchor="end"
                        fill="#94a3b8"
                        fontSize="9.5"
                        fontFamily="Arial, sans-serif"
                      >
                        {tick.label}
                      </text>
                    </g>
                  );
                })}

                {/* X-axis time ticks */}
                {timeTicks.map((timeStr, i) => {
                  const x = paddingLeft + (i / (timeTicks.length - 1)) * plotWidth;
                  const anchor = i === 0 ? 'start' : i === timeTicks.length - 1 ? 'end' : 'middle';
                  return (
                    <text
                      key={i}
                      x={x}
                      y={baseline + 16}
                      textAnchor={anchor}
                      fill="#94a3b8"
                      fontSize="9.5"
                      fontFamily="Arial, sans-serif"
                    >
                      {timeStr}
                    </text>
                  );
                })}
              </svg>

              {/* Centered empty message badge */}
              <div className="relative z-10 px-3.5 py-1.5 bg-white/95 backdrop-blur-xs border border-slate-200/90 rounded-md text-xs font-medium text-slate-500 shadow-2xs">
                No data available within the time range.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Info Popover Modal (Full details from Excel Catalogue) */}
      {isInfoOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setIsInfoOpen(false)}
        >
          <div
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-5 select-text animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <span className="text-[11px] font-mono font-semibold text-blue-600 uppercase tracking-wider">
                  {data.parentPath}
                </span>
                <h3 className="text-xl font-bold text-slate-900">{data.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsInfoOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-4 text-sm text-slate-700">
              {/* Description */}
              <div className="space-y-1.5">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  What it Measures
                </h5>
                <p className="text-sm text-slate-800 leading-relaxed font-medium bg-slate-50 rounded-xl p-3 border border-slate-200/60">
                  {data.description || 'No detailed description available.'}
                </p>
              </div>

              {/* Sample API / Collection Command */}
              {data.sampleApi && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5" />
                      <span>Sample API / How to Collect It</span>
                    </h5>
                    <button
                      type="button"
                      onClick={handleCopyApi}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800 whitespace-pre-wrap">
                    {data.sampleApi}
                  </pre>
                </div>
              )}

              {/* Requirements */}
              {data.requirements && (
                <div className="space-y-1.5">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>What You Need to Make it Measurable</span>
                  </h5>
                  <p className="text-xs text-slate-600 bg-slate-50 rounded-lg p-2.5 border border-slate-200/60">
                    {data.requirements}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsInfoOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
