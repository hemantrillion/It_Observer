'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Info,
  RefreshCw,
  MoreVertical,
  X,
  Copy,
  Check,
  Heart,
  Activity,
  Maximize2,
} from 'lucide-react';
import { MetricCardData } from '@/lib/catalog/metrics_catalogue_provider';
import { ServiceDetailInfoBlockCard } from './service_detail_info_block_card';
import { LatencyMetricTimeseriesGraphCard, GenericMetricSample } from './latency_metric_timeseries_graph_card';
import { MonitoredServiceRecord } from '@/lib/database/get_all_monitored_services_query';

interface MetricTelemetryChartCardProps {
  data: MetricCardData;
  userEmail?: string;
  isMonitored?: boolean;
  onToggleFavorite?: (id: string, isFav: boolean) => void;
}

export function MetricTelemetryChartCard({
  data,
  userEmail = 'default',
  isMonitored = false,
  onToggleFavorite,
}: MetricTelemetryChartCardProps) {
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Detail Modal State
  const [liveSamples, setLiveSamples] = useState<GenericMetricSample[]>([]);
  const [monitoredService, setMonitoredService] = useState<MonitoredServiceRecord | null>(null);
  const [sampleLimit, setSampleLimit] = useState<number>(120);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>('');

  // Storage key for user-specific favorites (Phase 9 requirement)
  const favStorageKey = `infratrace_favorite_metrics_${userEmail.toLowerCase().trim()}`;

  useEffect(() => {
    try {
      const stored = localStorage.getItem(favStorageKey);
      if (stored) {
        const arr = JSON.parse(stored);
        if (Array.isArray(arr)) {
          setIsFavorite(arr.includes(data.id));
        }
      }
    } catch {
      // ignore JSON parse error
    }
  }, [favStorageKey, data.id]);

  const loadLiveSamples = useCallback(async (lim: number = 120) => {
    try {
      // 1. Try finding in monitored_services
      const sRes = await fetch(`/api/services?t=${Date.now()}`);
      const sData = await sRes.json();
      if (sData.success && Array.isArray(sData.services)) {
        const match = sData.services.find(
          (s: any) =>
            s.id === data.id ||
            s.name.toLowerCase() === data.title.toLowerCase() ||
            s.target_url === data.sampleApi ||
            s.name.includes(data.title)
        );
        if (match) {
          setMonitoredService(match);
          const mRes = await fetch(`/api/services/${match.id}?limit=${lim}&t=${Date.now()}`);
          const mData = await mRes.json();
          if (mData.success && Array.isArray(mData.samples)) {
            setLiveSamples(mData.samples);
            setLastUpdatedTime(new Date().toLocaleTimeString());
            return;
          }
        }
      }

      // 2. Try fetching from /api/metrics/${data.id}
      const res = await fetch(`/api/metrics/${encodeURIComponent(data.id)}?limit=${lim}&t=${Date.now()}`);
      const resData = await res.json();
      if (resData.success && Array.isArray(resData.samples) && resData.samples.length > 0) {
        setLiveSamples(resData.samples);
        setLastUpdatedTime(new Date().toLocaleTimeString());
      } else {
        setLiveSamples([]);
      }
    } catch (err) {
      console.error('Failed to load samples for metric modal:', err);
      setLiveSamples([]);
    }
  }, [data.id, data.title, data.sampleApi]);

  const handleOpenDetailModal = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsDetailModalOpen(true);
    loadLiveSamples(sampleLimit);
  };

  const handleToggleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const stored = localStorage.getItem(favStorageKey);
      let arr: string[] = stored ? JSON.parse(stored) : [];
      if (!Array.isArray(arr)) arr = [];

      let nextFav = false;
      if (arr.includes(data.id)) {
        arr = arr.filter((id) => id !== data.id);
        nextFav = false;
      } else {
        arr.push(data.id);
        nextFav = true;
      }

      localStorage.setItem(favStorageKey, JSON.stringify(arr));
      setIsFavorite(nextFav);
      onToggleFavorite?.(data.id, nextFav);

      window.dispatchEvent(new Event('infratrace_favorites_updated'));
    } catch (err) {
      console.error('Failed to update favorites:', err);
    }
  };

  const handleCopyApi = () => {
    if (!data.sampleApi) return;
    navigator.clipboard.writeText(data.sampleApi);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefresh = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRefreshing(true);
    loadLiveSamples(sampleLimit);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  // Convert points (0.0 to 1.0) into SVG path
  const svgWidth = 600;
  const svgHeight = 135;
  const paddingLeft = 46;
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

  // Display curves only if monitored or has explicit data (Image 3/4)
  const hasLiveFeed = isMonitored || data.hasData;
  const lineD1 = hasLiveFeed ? buildPath(data.points) : '';
  const areaD1 = hasLiveFeed ? buildAreaPath(data.points) : '';
  const lineD2 = hasLiveFeed && data.dualPoints ? buildPath(data.dualPoints) : '';

  const timeTicks = ['05:00', '06:30', '07:00', '08:30', '09:00'];

  const unit = data.unit || '';
  const getYTickLabels = () => {
    if (unit === '%') {
      return [
        { label: '100%', val: 1.0 },
        { label: '75%', val: 0.75 },
        { label: '50%', val: 0.5 },
        { label: '25%', val: 0.25 },
        { label: '0%', val: 0.0 },
      ];
    }
    if (unit === 'KB/s') {
      return [
        { label: '800KB', val: 1.0 },
        { label: '600KB', val: 0.75 },
        { label: '400KB', val: 0.5 },
        { label: '200KB', val: 0.25 },
        { label: '0', val: 0.0 },
      ];
    }
    if (unit === 'ms') {
      return [
        { label: '200ms', val: 1.0 },
        { label: '150ms', val: 0.75 },
        { label: '100ms', val: 0.5 },
        { label: '50ms', val: 0.25 },
        { label: '0ms', val: 0.0 },
      ];
    }
    if (unit === 'MB') {
      return [
        { label: '512MB', val: 1.0 },
        { label: '384MB', val: 0.75 },
        { label: '256MB', val: 0.5 },
        { label: '128MB', val: 0.25 },
        { label: '0MB', val: 0.0 },
      ];
    }
    if (unit === 'IOPS') {
      return [
        { label: '500', val: 1.0 },
        { label: '375', val: 0.75 },
        { label: '250', val: 0.5 },
        { label: '125', val: 0.25 },
        { label: '0', val: 0.0 },
      ];
    }
    if (unit === 'days') {
      return [
        { label: '90d', val: 1.0 },
        { label: '60d', val: 0.66 },
        { label: '30d', val: 0.33 },
        { label: '0d', val: 0.0 },
      ];
    }
    return [
      { label: '1.0', val: 1.0 },
      { label: '0.75', val: 0.75 },
      { label: '0.5', val: 0.5 },
      { label: '0.25', val: 0.25 },
      { label: '0', val: 0.0 },
    ];
  };

  const yTicks = getYTickLabels();

  // Synthetic fallback record for detail inspection modal
  const effectiveServiceRecord: MonitoredServiceRecord = monitoredService
    ? monitoredService
    : {
        id: data.id,
        name: data.title,
        target_type: (data.targetType || (data.parentPath ? data.parentPath.split('›')[0].trim().toUpperCase() : 'TELEMETRY API')) as any,
        target_url: data.sampleApi || data.targetUrl || 'http://localhost:3000/api/metrics',
        check_interval_seconds: 15,
        current_status: isMonitored ? 'HEALTHY' : 'HEALTHY',
        latest_response_time_ms: isMonitored ? 42 : 0,
        uptime_percentage: 100.0,
        total_checks: isMonitored ? 120 : 0,
        failed_checks: 0,
        last_checked_at: new Date().toISOString(),
      };

  return (
    <>
      <div
        onClick={handleOpenDetailModal}
        className="bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:border-blue-400 hover:shadow-xs transition-all p-4 sm:p-4.5 flex flex-col justify-between w-full select-none cursor-pointer group"
        title="Click to open full timeseries graph and operational analysis"
      >
        {/* Header Row */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            {/* Metric Title & Badges */}
            <h4 className="text-xs sm:text-sm font-bold text-slate-800 truncate group-hover:text-blue-700 transition-colors" title={data.title}>
              {data.title}
            </h4>

            {/* Monitoring Status Badge */}
            {isMonitored ? (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Active</span>
              </span>
            ) : (
              <span className="text-[10px] font-medium text-slate-400 px-1.5 py-0.5 rounded bg-slate-100 shrink-0">
                Catalogue
              </span>
            )}

            {/* Info Icon Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsInfoOpen(true);
              }}
              className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 p-1 rounded-full transition-colors shrink-0 cursor-pointer"
              title="Inspect metric definition, collection command & requirements"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Heart / Favourite Button */}
            <button
              type="button"
              onClick={handleToggleFav}
              className={`p-1 rounded-full transition-colors cursor-pointer ${
                isFavorite
                  ? 'text-rose-500 hover:bg-rose-50'
                  : 'text-slate-400 hover:text-rose-500 hover:bg-slate-100'
              }`}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites (Console)'}
            >
              <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-rose-500' : ''}`} />
            </button>

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

            {/* Maximize / Open Detail Button */}
            <button
              type="button"
              onClick={handleOpenDetailModal}
              className="p-1 hover:bg-blue-50 rounded text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
              title="Open full timeseries graph view"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Chart Viewport */}
        <div className="w-full h-32 sm:h-36 relative select-none">
          {hasLiveFeed ? (
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

              {/* Horizontal grid lines & Y labels */}
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
            /* Clean unconfigured empty state (Image 2: no fake data curves) */
            <div className="w-full h-full relative flex items-center justify-center">
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                preserveAspectRatio="none"
                className="w-full h-full absolute inset-0 opacity-40 pointer-events-none"
              >
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
              </svg>

              <div className="relative z-10 flex flex-col items-center gap-1 bg-white/90 backdrop-blur-xs px-4 py-2 rounded-xl border border-slate-200/80 shadow-2xs text-center max-w-xs">
                <Activity className="w-4 h-4 text-slate-400" />
                <span className="text-[11px] font-bold text-slate-700">Awaiting Suite Configuration</span>
                <span className="text-[10px] text-slate-500">
                  Enable in Settings or Private API to start collecting telemetry.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================== */}
      {/* FULL TIMESERIES INSPECTION MODAL (MATCHING IMAGE 1 EXACTLY) */}
      {/* ========================================================== */}
      {isDetailModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsDetailModalOpen(false);
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl p-5 sm:p-6 space-y-4 max-h-[94vh] overflow-y-auto">
            {/* Top: Service Header & Summary 4 Tiles (Image 1) */}
            <ServiceDetailInfoBlockCard
              service={effectiveServiceRecord}
              onClose={() => setIsDetailModalOpen(false)}
            />

            {/* Bottom: Detailed High-Resolution Timeseries Card (Image 1) */}
            <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs">
              <LatencyMetricTimeseriesGraphCard
                samples={liveSamples}
                service={effectiveServiceRecord}
                currentLimit={sampleLimit}
                onLimitChange={(lim) => {
                  setSampleLimit(lim);
                  loadLiveSamples(lim);
                }}
                lastUpdatedTime={lastUpdatedTime}
                isLivePolling={isMonitored}
              />
            </div>
          </div>
        </div>
      )}

      {/* Info Popover Modal */}
      {isInfoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 text-slate-900 font-sans space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {data.parentPath || 'General Telemetry'}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">{data.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsInfoOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">{data.description}</p>

            {data.sampleApi && (
              <div className="p-3 bg-slate-900 text-slate-100 rounded-xl space-y-1.5 font-mono text-[11px]">
                <div className="flex items-center justify-between text-slate-400 text-[10px]">
                  <span>Sample Telemetry Endpoint</span>
                  <button
                    type="button"
                    onClick={handleCopyApi}
                    className="hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="text-blue-400 truncate">{data.sampleApi}</div>
              </div>
            )}

            {data.requirements && (
              <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-amber-900 text-xs space-y-1">
                <span className="font-bold block text-[11px] uppercase tracking-wider text-amber-800">
                  Collection Prerequisites
                </span>
                <p className="text-[11px] leading-relaxed text-amber-800/90">{data.requirements}</p>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setIsInfoOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-colors cursor-pointer"
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
