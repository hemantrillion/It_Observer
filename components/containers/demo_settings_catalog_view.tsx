'use client';

import React, { useState, useMemo } from 'react';
import {
  Check,
  Lock,
  Globe,
  Radio,
  RefreshCw,
  Clock,
  ShieldCheck,
  Cpu,
  Sliders,
  AlertCircle,
  X,
  Server,
  Layers,
  LineChart,
} from 'lucide-react';
import { PREMADE_APIS_CATALOG, PremadeApiItem } from '@/lib/catalog/premade_apis_catalog';
import { MonitoredServiceRecord } from '@/lib/database/get_all_monitored_services_query';

interface DemoSettingsCatalogViewProps {
  monitoredServices: MonitoredServiceRecord[];
  onServicesUpdated: () => void | Promise<void>;
  isConstantPollingEnabled: boolean;
  onToggleConstantPolling: (enabled: boolean) => void;
  constantPollingInterval: number;
  onChangeConstantPollingInterval: (intervalMs: number) => void;
  onTriggerManualPoll: () => void | Promise<void>;
  isPolling: boolean;
  hasWallpaper?: boolean;
  onInspectService?: (serviceId: string) => void;
  searchQuery?: string;
}

const ALPHABETS = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
  'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
];

const POLLING_INTERVALS = [
  { label: '5s (Aggressive)', value: 5000 },
  { label: '8s (Default / Standard)', value: 8000 },
  { label: '10s (Moderate)', value: 10000 },
  { label: '15s (Relaxed)', value: 15000 },
  { label: '30s (Low Overhead)', value: 30000 },
  { label: '60s (Periodic)', value: 60000 },
];

export function DemoSettingsCatalogView({
  monitoredServices,
  onServicesUpdated,
  isConstantPollingEnabled,
  onToggleConstantPolling,
  constantPollingInterval,
  onChangeConstantPollingInterval,
  onTriggerManualPoll,
  isPolling,
  onInspectService,
  searchQuery: externalSearchQuery = '',
}: DemoSettingsCatalogViewProps) {
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const [togglingServiceId, setTogglingServiceId] = useState<string | null>(null);
  const [unselectableTooltip, setUnselectableTooltip] = useState<string | null>(null);

  // Set of currently monitored service IDs in SQLite database
  const monitoredIdSet = useMemo(() => {
    return new Set(monitoredServices.map((s) => s.id));
  }, [monitoredServices]);

  // Handle toggling an API in/out of the test suite
  const handleToggleService = async (item: PremadeApiItem) => {
    setTogglingServiceId(item.id);
    try {
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle',
          service: {
            id: item.id,
            name: item.name,
            target_type: item.target_type,
            target_url: item.target_url,
            check_interval_seconds: Math.round(constantPollingInterval / 1000),
          },
        }),
      });

      if (response.ok) {
        await onServicesUpdated();
      }
    } catch (err) {
      console.error('Failed to toggle monitored service:', err);
    } finally {
      setTogglingServiceId(null);
    }
  };

  // Filter catalog items by search query (unified with Box 3 Top Nav Search Bar)
  const filteredCatalog = useMemo(() => {
    const q = (externalSearchQuery || '').trim().toLowerCase();
    return PREMADE_APIS_CATALOG.filter((item) => {
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.company.toLowerCase().includes(q) ||
        item.target_url.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.metrics.some((m) => m.name.toLowerCase().includes(q))
      );
    });
  }, [externalSearchQuery]);

  // Group items by alphabet letter
  const groupedByLetter = useMemo(() => {
    const map = new Map<string, PremadeApiItem[]>();
    for (const letter of ALPHABETS) {
      map.set(letter, []);
    }
    for (const item of filteredCatalog) {
      const letter = item.alphabet.toUpperCase();
      if (!map.has(letter)) {
        map.set(letter, []);
      }
      map.get(letter)!.push(item);
    }
    return map;
  }, [filteredCatalog]);

  // Scroll to alphabet anchor
  const handleAlphabetClick = (letter: string) => {
    setActiveLetter(letter);
    const element = document.getElementById(`catalog-alpha-${letter}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans select-text">
      {/* 1. TOP SECTION: CONTROLS & CONFIGURATION */}
      <div className="space-y-4">
        {/* Main Heading */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Sliders className="w-4 h-4" />
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Demo Settings &amp; Public APIs Catalog
              </h1>
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-500 max-w-3xl leading-relaxed">
              Configure telemetry synthetic polling intervals and select target public or private endpoints across the sequential A–Z catalog.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="border border-slate-200/90 rounded-lg px-3 py-1.5 bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-2">
              <Server className="w-3.5 h-3.5 text-slate-500" />
              <span>{monitoredServices.length} Active Targets</span>
            </div>
          </div>
        </div>

        {/* 1A. AUTOMATED CONSTANT POLLING CONTROL CARD */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 sm:p-6 space-y-5 shadow-2xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <Radio className={`w-4 h-4 ${isConstantPollingEnabled ? 'text-emerald-600 animate-pulse' : 'text-slate-400'}`} />
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Automated Constant Polling Engine
                </h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    isConstantPollingEnabled
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {isConstantPollingEnabled ? `Active (${constantPollingInterval / 1000}s interval)` : 'Disabled (Default)'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-2xl">
                By default, constant polling is off to prevent unwanted background traffic. When disabled, metrics only refresh when clicking &ldquo;Poll Now&rdquo; manually.
              </p>
            </div>

            {/* Toggle Switch */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => onToggleConstantPolling(!isConstantPollingEnabled)}
                className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border border-slate-300 transition-colors duration-200 ease-in-out focus:outline-none ${
                  isConstantPollingEnabled ? 'bg-blue-600' : 'bg-slate-200'
                }`}
              >
                <span className="sr-only">Toggle Constant Polling</span>
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out mt-0.5 ml-0.5 ${
                    isConstantPollingEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                {isConstantPollingEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>

          {/* Interval Selector + Manual Poll Now Button */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-0.5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Polling Frequency Interval</span>
              </label>
              <div className="flex flex-wrap items-center gap-1.5">
                {POLLING_INTERVALS.map((intv) => {
                  const isSelected = constantPollingInterval === intv.value;
                  return (
                    <button
                      key={intv.value}
                      type="button"
                      onClick={() => onChangeConstantPollingInterval(intv.value)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-slate-900 text-white font-bold border-slate-900 shadow-2xs'
                          : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200/90'
                      }`}
                    >
                      {intv.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Manual Poll Now Button */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => onTriggerManualPoll()}
                disabled={isPolling}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase shadow-2xs transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-white ${isPolling ? 'animate-spin' : ''}`} />
                <span>{isPolling ? 'Probing...' : 'Poll Now'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 1B. SHOW SETTINGS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          <div className="bg-white rounded-xl border border-slate-200/90 p-4 space-y-1.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-slate-500" />
                <span>Ingestion Engine</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 uppercase">
                Managed
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-900">gRPC &amp; HTTP/2 Stream</h4>
            <p className="text-xs font-medium text-slate-500 leading-relaxed">
              Snappy compression enabled. Ingestion buffer throttled at 128 MB with zero-allocation socket pooling.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/90 p-4 space-y-1.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                <span>Cryptography</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 uppercase">
                Enforced
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-900">Strict TLS 1.3 &amp; OCSP</h4>
            <p className="text-xs font-medium text-slate-500 leading-relaxed">
              Automated certificate revocation verification and ECDHE ephemeral key exchange validation.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-dashed border-slate-300 p-4 space-y-1.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                <span>Custom Parameter</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 uppercase">
                Reserved Slot
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-700">Reserved Configuration</h4>
            <p className="text-xs font-medium text-slate-500 leading-relaxed">
              Slot reserved above search bar for custom configuration parameter to be specified.
            </p>
          </div>
        </div>
      </div>

      {/* 2. CATALOG STATUS INFO */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 px-1 font-semibold gap-2">
        <span>
          Showing <strong className="text-slate-900 font-bold">{filteredCatalog.length}</strong> target APIs across {ALPHABETS.length} alphabetical categories
        </span>
        {externalSearchQuery && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
            <span>Filtered by: &ldquo;{externalSearchQuery}&rdquo;</span>
          </span>
        )}
      </div>

      {/* 3. ALPHABET JUMP BAR */}
      <div className="space-y-2 sticky top-0 z-20 bg-white/95 backdrop-blur-md py-3 border-y border-slate-200/90 shadow-2xs">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Alphabetical Jump Bar (A &mdash; Z)
          </span>
          <span className="text-xs text-slate-400 font-medium">
            Click to jump or scroll sequentially
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          <button
            type="button"
            onClick={() => {
              setActiveLetter(null);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeLetter === null
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            ALL
          </button>

          {ALPHABETS.map((letter) => {
            const count = groupedByLetter.get(letter)?.length || 0;
            const isSelected = activeLetter === letter;

            return (
              <button
                key={letter}
                type="button"
                onClick={() => handleAlphabetClick(letter)}
                disabled={count === 0}
                className={`min-w-8 h-8 px-2 rounded-md text-xs font-bold transition-all shrink-0 flex items-center justify-center cursor-pointer ${
                  count === 0
                    ? 'opacity-30 cursor-not-allowed bg-transparent text-slate-400'
                    : isSelected
                    ? 'bg-slate-900 text-white font-black shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{letter}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tooltip Alert when user clicks an unselectable metric */}
      {unselectableTooltip && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-center justify-between shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{unselectableTooltip}</span>
          </div>
          <button
            type="button"
            onClick={() => setUnselectableTooltip(null)}
            className="p-1 hover:bg-amber-100 rounded text-amber-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 4. SEQUENTIAL ALPHABETICAL CATALOG (A TO Z) */}
      <div className="space-y-8">
        {ALPHABETS.map((letter) => {
          const items = groupedByLetter.get(letter) || [];
          if (items.length === 0) return null;

          return (
            <section
              key={letter}
              id={`catalog-alpha-${letter}`}
              className="space-y-3 scroll-mt-28"
            >
              {/* Section Alphabet Header */}
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-md bg-slate-900 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
                    {letter}
                  </span>
                  <h2 className="text-base font-bold text-slate-900 uppercase tracking-tight">
                    Alphabet {letter}
                  </h2>
                </div>
                <span className="text-xs font-semibold text-slate-400">
                  {items.length} {items.length === 1 ? 'API available' : 'APIs available'}
                </span>
              </div>

              {/* Tabulated Card Grid (Compact Light SaaS Cards) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {items.map((item) => {
                  const isMonitored = monitoredIdSet.has(item.id);
                  const isToggling = togglingServiceId === item.id;
                  const isPrivate = item.access_type === 'PRIVATE';

                  return (
                    <div
                      key={item.id}
                      className={`rounded-xl border transition-all duration-150 p-4 space-y-3 bg-white shadow-2xs ${
                        isMonitored
                          ? 'border-blue-500/80 ring-1 ring-blue-500/20'
                          : 'border-slate-200/90 hover:border-slate-300'
                      }`}
                    >
                      {/* Top Row: Provider, Title & Access Tag */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xs font-bold uppercase text-slate-500 truncate">
                            {item.company}
                          </span>
                          <span className="text-slate-300 font-bold">&bull;</span>
                          <h3 className="text-sm font-bold text-slate-900 tracking-tight truncate">
                            {item.name}
                          </h3>
                        </div>

                        {/* Public vs Private Badge */}
                        <div className="shrink-0">
                          {isPrivate ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200">
                              <Lock className="w-2.5 h-2.5" />
                              <span>Private</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <Globe className="w-2.5 h-2.5" />
                              <span>Public</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Target Endpoint & Description in compact box */}
                      <div className="space-y-1 bg-slate-50/70 rounded-lg p-2.5 border border-slate-200/60 text-xs">
                        <div className="font-mono font-medium text-slate-800 truncate text-[11px]">
                          {item.target_url}
                        </div>
                        <p className="font-medium text-slate-500 line-clamp-2 text-xs leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      {/* Exposed Metric Measurements */}
                      <div className="space-y-1.5 border-t border-slate-100 pt-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
                            Exposed Metrics
                          </span>
                          <span className="font-semibold text-slate-400 text-[10px]">
                            HTTP Latency Measurable
                          </span>
                        </div>

                        <div className="space-y-1">
                          {item.metrics.map((metric) => {
                            if (metric.selectable) {
                              return (
                                <div
                                  key={metric.id}
                                  className={`flex items-center justify-between p-2 rounded-lg border transition-all select-none ${
                                    isMonitored
                                      ? 'bg-blue-50/40 border-blue-200'
                                      : 'border-slate-200/70 hover:border-slate-300 bg-white'
                                  }`}
                                >
                                  <label className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0">
                                    <input
                                      type="checkbox"
                                      checked={isMonitored}
                                      onChange={() => handleToggleService(item)}
                                      disabled={isToggling}
                                      className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600 shrink-0"
                                    />
                                    <div className="min-w-0 truncate">
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-xs font-bold text-slate-900 truncate">
                                          {metric.name}
                                        </span>
                                        <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-medium bg-slate-100 text-slate-600 shrink-0">
                                          {metric.unit}
                                        </span>
                                      </div>
                                    </div>
                                  </label>

                                  {/* Actions & Status Tag */}
                                  <div className="shrink-0 flex items-center gap-1.5 ml-2">
                                    {isToggling ? (
                                      <RefreshCw className="w-3 h-3 animate-spin text-slate-500" />
                                    ) : isMonitored ? (
                                      <div className="flex items-center gap-1.5">
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-600 text-white">
                                          <Check className="w-2.5 h-2.5 text-white" />
                                          <span>Active</span>
                                        </span>
                                        {onInspectService && (
                                          <button
                                            type="button"
                                            onClick={() => onInspectService(item.id)}
                                            className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
                                            title="Inspect live time-series graph"
                                          >
                                            <LineChart className="w-2.5 h-2.5" />
                                            <span>Graph</span>
                                          </button>
                                        )}
                                      </div>
                                    ) : (
                                      <span className="text-[10px] font-medium uppercase text-slate-400 px-1.5 py-0.5 rounded border border-slate-200">
                                        Include
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            }

                            return (
                              <div
                                key={metric.id}
                                onClick={() =>
                                  setUnselectableTooltip(
                                    `"${metric.name}" cannot be checked: Synthetic HTTP probing can only measure Response Time / Latency. Host telemetry agent required for internal metrics.`
                                  )
                                }
                                className="flex items-center justify-between p-1.5 rounded-lg opacity-60 hover:opacity-100 transition-opacity cursor-not-allowed select-none text-xs"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <input
                                    type="checkbox"
                                    disabled
                                    checked={false}
                                    className="w-3.5 h-3.5 rounded text-slate-300 border-slate-300 cursor-not-allowed shrink-0"
                                  />
                                  <div className="flex items-center gap-1.5 truncate">
                                    <span className="text-xs font-medium text-slate-600 line-through truncate">
                                      {metric.name}
                                    </span>
                                    <span className="text-[10px] px-1 rounded bg-slate-100 font-mono text-slate-500 shrink-0">
                                      {metric.unit}
                                    </span>
                                  </div>
                                </div>

                                <span className="text-[10px] font-medium text-slate-400 px-1.5 py-0.5 rounded bg-slate-100 shrink-0 uppercase ml-2">
                                  Agent Required
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
