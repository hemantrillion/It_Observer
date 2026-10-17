'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
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
  ExternalLink,
  ChevronRight,
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
  hasWallpaper = false,
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
    <div className="space-y-8 max-w-7xl mx-auto pb-20 font-sans select-none">
      {/* ======================================================== */}
      {/* 1. TOP SECTION (GRAPH-STYLE HIGH CONTRAST & TRANSPARENT) */}
      {/* ======================================================== */}
      <div className="space-y-6">
        {/* Main Heading - Neo-Brutalist & Large Typography */}
        <div className="bg-white/85 backdrop-blur-md rounded-2xl border-2 border-black p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-lg bg-black text-white flex items-center justify-center font-bold text-lg">
                <Sliders className="w-5 h-5 text-white" />
              </span>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-black uppercase tracking-tight">
                DEMO SETTINGS &amp; PUBLIC APIS CATALOG
              </h1>
            </div>
            <p className="text-sm sm:text-base font-semibold text-neutral-800 max-w-4xl leading-relaxed">
              Configure telemetry synthetic polling intervals and select target public or private endpoints across the sequential A–Z catalog. Checked endpoints instantly reflect in the live Dashboard and can be inspected in the time-series graph.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="border-2 border-black rounded-lg px-4 py-2 bg-white/90 text-xs sm:text-sm font-black uppercase text-black flex items-center gap-2 shadow-xs">
              <Server className="w-4 h-4 text-black" />
              <span>{monitoredServices.length} ACTIVE TARGETS</span>
            </div>
          </div>
        </div>

        {/* 1A. AUTOMATED CONSTANT POLLING CONTROL CARD (NEO-BRUTALIST GRAPH STYLE) */}
        <div className="bg-white/85 backdrop-blur-md rounded-2xl border-2 border-black p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b-2 border-black/20 pb-5">
            <div className="space-y-1.5">
              <div className="flex items-center gap-3">
                <Radio className={`w-5 h-5 ${isConstantPollingEnabled ? 'text-black animate-pulse' : 'text-neutral-500'}`} />
                <h3 className="text-lg sm:text-xl font-black text-black uppercase tracking-tight">
                  AUTOMATED CONSTANT POLLING ENGINE
                </h3>
                <span
                  className={`px-3 py-1 rounded-md text-xs sm:text-sm font-black uppercase tracking-wider border border-black ${
                    isConstantPollingEnabled
                      ? 'bg-black text-white'
                      : 'bg-neutral-100 text-neutral-700'
                  }`}
                >
                  {isConstantPollingEnabled ? `ACTIVE (${constantPollingInterval / 1000}S INTERVAL)` : 'DISABLED (DEFAULT)'}
                </span>
              </div>
              <p className="text-sm sm:text-base font-semibold text-neutral-700 leading-relaxed max-w-3xl">
                By default, constant polling is <strong>OFF</strong> to prevent unwanted background traffic. When disabled, metrics only refresh when clicking &ldquo;Poll Now&rdquo; manually. Enable to probe all selected target endpoints continuously at your chosen interval.
              </p>
            </div>

            {/* Toggle Switch - High Contrast */}
            <div className="flex items-center gap-4 shrink-0">
              <button
                type="button"
                onClick={() => onToggleConstantPolling(!isConstantPollingEnabled)}
                className={`relative inline-flex h-9 w-16 shrink-0 cursor-pointer rounded-full border-2 border-black transition-colors duration-200 ease-in-out focus:outline-none ${
                  isConstantPollingEnabled ? 'bg-black' : 'bg-neutral-200'
                }`}
              >
                <span className="sr-only">Toggle Constant Polling</span>
                <span
                  className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white border border-black shadow-md ring-0 transition duration-200 ease-in-out mt-0.5 ml-0.5 ${
                    isConstantPollingEnabled ? 'translate-x-7' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className="text-base font-black text-black uppercase">
                {isConstantPollingEnabled ? 'ENABLED' : 'DISABLED'}
              </span>
            </div>
          </div>

          {/* Interval Selector + Manual Poll Now Button */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pt-1">
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-black uppercase tracking-wider text-black flex items-center gap-2">
                <Clock className="w-4 h-4 text-black" />
                <span>POLLING FREQUENCY INTERVAL</span>
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {POLLING_INTERVALS.map((intv) => {
                  const isSelected = constantPollingInterval === intv.value;
                  return (
                    <button
                      key={intv.value}
                      type="button"
                      onClick={() => onChangeConstantPollingInterval(intv.value)}
                      className={`px-3.5 py-2 text-xs sm:text-sm font-bold border-2 border-black rounded-lg uppercase transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-black text-white shadow-xs scale-[1.02]'
                          : 'bg-white/80 text-black hover:bg-neutral-100'
                      }`}
                    >
                      {intv.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Manual Poll Now Button */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => onTriggerManualPoll()}
                disabled={isPolling}
                className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-black hover:bg-neutral-800 text-white font-black text-xs sm:text-sm uppercase border-2 border-black shadow-xs transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 text-white ${isPolling ? 'animate-spin' : ''}`} />
                <span>{isPolling ? 'PROBING TARGETS...' : 'POLL NOW (MANUAL TRIGGER)'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 1B. DISPLAY-ONLY SHOW SETTINGS (GRAPH-STYLE CARDS, TRANSPARENT & SHARP) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Telemetry Ingestion Engine */}
          <div className="bg-white/80 backdrop-blur-md rounded-xl border-2 border-black p-5 space-y-2 select-none shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-black flex items-center gap-1.5 opacity-70">
                <Cpu className="w-4 h-4 text-black" />
                <span>INGESTION ENGINE</span>
              </span>
              <span className="px-2.5 py-0.5 rounded border border-black text-xs font-bold bg-neutral-100 text-black uppercase">
                MANAGED (SHOW ONLY)
              </span>
            </div>
            <h4 className="text-base sm:text-lg font-black text-black uppercase">gRPC &amp; HTTP/2 STREAM PIPELINE</h4>
            <p className="text-xs sm:text-sm font-medium text-neutral-700 leading-relaxed">
              Snappy compression enabled. Ingestion buffer throttled at 128 MB with zero-allocation socket pooling.
            </p>
          </div>

          {/* Card 2: Transport Cryptography */}
          <div className="bg-white/80 backdrop-blur-md rounded-xl border-2 border-black p-5 space-y-2 select-none shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-black flex items-center gap-1.5 opacity-70">
                <ShieldCheck className="w-4 h-4 text-black" />
                <span>CRYPTOGRAPHY</span>
              </span>
              <span className="px-2.5 py-0.5 rounded border border-black text-xs font-bold bg-neutral-100 text-black uppercase">
                ENFORCED (SHOW ONLY)
              </span>
            </div>
            <h4 className="text-base sm:text-lg font-black text-black uppercase">STRICT TLS 1.3 &amp; OCSP STAPLING</h4>
            <p className="text-xs sm:text-sm font-medium text-neutral-700 leading-relaxed">
              Automated certificate revocation verification and ECDHE ephemeral key exchange validation.
            </p>
          </div>

          {/* Card 3: Reserved Configuration Slot (User explicitly requested placeholder) */}
          <div className="bg-white/80 backdrop-blur-md rounded-xl border-2 border-dashed border-black p-5 space-y-2 select-none shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-black flex items-center gap-1.5 opacity-70">
                <Layers className="w-4 h-4 text-black" />
                <span>CUSTOM PARAMETER</span>
              </span>
              <span className="px-2.5 py-0.5 rounded border border-black text-xs font-bold bg-black text-white uppercase">
                RESERVED SLOT
              </span>
            </div>
            <h4 className="text-base sm:text-lg font-black text-black uppercase">RESERVED CONFIGURATION SLOT</h4>
            <p className="text-xs sm:text-sm font-medium text-neutral-700 leading-relaxed">
              Slot reserved above search bar for custom configuration parameter to be specified in subsequent refinement.
            </p>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. CATALOG STATUS & GLOBAL FILTER INFO                   */}
      {/* ======================================================== */}
      <div className="flex flex-wrap items-center justify-between text-xs sm:text-sm text-neutral-800 px-1 font-bold gap-2">
        <span className="uppercase tracking-wide">
          SHOWING <strong>{filteredCatalog.length}</strong> TARGET APIS ACROSS {ALPHABETS.length} ALPHABETICAL CATEGORIES
        </span>
        {externalSearchQuery && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-black text-white text-xs font-black uppercase shadow-xs">
            <span>FILTERED BY TOP SEARCH: &ldquo;{externalSearchQuery}&rdquo;</span>
          </span>
        )}
      </div>

      {/* ======================================================== */}
      {/* 3. ALPHABET JUMP BAR (LEFT TO RIGHT: A TO Z)             */}
      {/* ======================================================== */}
      <div className="space-y-2 sticky top-0 z-20 bg-white/90 backdrop-blur-md py-3.5 border-y-2 border-black shadow-xs">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-black">
            ALPHABETICAL JUMP BAR (A &mdash; Z)
          </span>
          <span className="text-xs sm:text-sm font-semibold text-neutral-600">
            Click to jump or scroll sequentially
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <button
            type="button"
            onClick={() => {
              setActiveLetter(null);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-black uppercase border-2 border-black transition-all shrink-0 cursor-pointer ${
              activeLetter === null
                ? 'bg-black text-white shadow-xs'
                : 'bg-white/80 text-black hover:bg-neutral-100'
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
                className={`min-w-9 h-9 sm:min-w-10 sm:h-10 px-2 rounded-lg text-xs sm:text-sm font-black transition-all shrink-0 flex items-center justify-center border-2 border-black cursor-pointer ${
                  count === 0
                    ? 'opacity-25 cursor-not-allowed bg-transparent text-neutral-400 border-neutral-300'
                    : isSelected
                    ? 'bg-black text-white shadow-xs scale-105'
                    : 'bg-white/80 text-black hover:bg-neutral-100'
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
        <div className="p-4 rounded-xl bg-amber-100/90 backdrop-blur-md border-2 border-black text-black text-xs sm:text-sm font-bold flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-700 shrink-0" />
            <span>{unselectableTooltip}</span>
          </div>
          <button
            type="button"
            onClick={() => setUnselectableTooltip(null)}
            className="p-1 hover:bg-black/10 rounded-lg text-black cursor-pointer"
          >
            <X className="w-4 h-4 text-black" />
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. SEQUENTIAL ALPHABETICAL CATALOG (A TO Z)             */}
      {/* ======================================================== */}
      <div className="space-y-12">
        {ALPHABETS.map((letter) => {
          const items = groupedByLetter.get(letter) || [];
          if (items.length === 0) return null;

          return (
            <section
              key={letter}
              id={`catalog-alpha-${letter}`}
              className="space-y-4 scroll-mt-32"
            >
              {/* Section Alphabet Header */}
              <div className="flex items-center justify-between border-b-2 border-black pb-2.5">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-lg bg-black text-white font-black text-base sm:text-lg flex items-center justify-center shadow-xs">
                    {letter}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-black uppercase tracking-tight">
                    ALPHABET {letter}
                  </h2>
                </div>
                <span className="text-xs sm:text-sm font-black uppercase text-black px-3 py-1 rounded-md border border-black bg-white/80">
                  {items.length} {items.length === 1 ? 'API AVAILABLE' : 'APIS AVAILABLE'}
                </span>
              </div>

              {/* Tabulated Card Grid (Smaller Compact Cards - Neo-Brutalist + Translucent) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((item) => {
                  const isMonitored = monitoredIdSet.has(item.id);
                  const isToggling = togglingServiceId === item.id;
                  const isPrivate = item.access_type === 'PRIVATE';

                  return (
                    <div
                      key={item.id}
                      className={`rounded-xl border-2 transition-all duration-150 p-4 space-y-3 ${
                        isMonitored
                          ? 'bg-white/95 backdrop-blur-md border-black shadow-md ring-2 ring-black'
                          : 'bg-white/80 backdrop-blur-md border-black hover:bg-white/95 shadow-xs'
                      }`}
                    >
                      {/* Top Row: Provider, Title & Access Tag on one compact row */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xs font-black uppercase text-neutral-600 truncate">
                            {item.company}
                          </span>
                          <span className="text-neutral-400 font-bold">&bull;</span>
                          <h3 className="text-base font-black text-black tracking-tight truncate">
                            {item.name}
                          </h3>
                        </div>

                        {/* Public vs Private Badge */}
                        <div className="shrink-0">
                          {isPrivate ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-black uppercase bg-amber-100 text-black border border-black">
                              <Lock className="w-3 h-3 text-black" />
                              <span>PRIVATE</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-black uppercase bg-emerald-100 text-black border border-black">
                              <Globe className="w-3 h-3 text-black" />
                              <span>PUBLIC</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Target Endpoint & Description in compact box */}
                      <div className="space-y-1 bg-neutral-100/90 rounded-lg p-2.5 border border-black text-xs">
                        <div className="font-mono font-bold text-black truncate text-[11px] sm:text-xs">
                          {item.target_url}
                        </div>
                        <p className="font-semibold text-neutral-800 line-clamp-2 text-xs leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      {/* Exposed Metric Measurements (Tabulated List) */}
                      <div className="space-y-2 border-t-2 border-black/20 pt-2.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-black uppercase tracking-wider text-black text-[11px] sm:text-xs">
                            EXPOSED METRICS
                          </span>
                          <span className="font-bold text-neutral-600 uppercase text-[10px] sm:text-[11px]">
                            HTTP Latency Measurable
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          {item.metrics.map((metric) => {
                            if (metric.selectable) {
                              // Functional Checkbox for Response Time Latency
                              return (
                                <div
                                  key={metric.id}
                                  className={`flex items-center justify-between p-2 rounded-lg border-2 transition-all select-none ${
                                    isMonitored
                                      ? 'bg-neutral-50/95 border-black shadow-xs'
                                      : 'border-neutral-300 hover:border-black bg-white/70'
                                  }`}
                                >
                                  <label className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0">
                                    <input
                                      type="checkbox"
                                      checked={isMonitored}
                                      onChange={() => handleToggleService(item)}
                                      disabled={isToggling}
                                      className="w-4 h-4 rounded border-2 border-black text-black focus:ring-black cursor-pointer accent-black shrink-0"
                                    />
                                    <div className="min-w-0 truncate">
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-xs sm:text-sm font-black text-black truncate">
                                          {metric.name}
                                        </span>
                                        <span className="text-[10px] px-1.5 py-0.2 rounded border border-black font-mono font-bold bg-white text-black shrink-0">
                                          {metric.unit}
                                        </span>
                                      </div>
                                    </div>
                                  </label>

                                  {/* Actions & Status Tag */}
                                  <div className="shrink-0 flex items-center gap-1.5 ml-2">
                                    {isToggling ? (
                                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-black" />
                                    ) : isMonitored ? (
                                      <div className="flex items-center gap-1.5">
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-black uppercase bg-black text-white border border-black">
                                          <Check className="w-3 h-3 text-white" />
                                          <span>ACTIVE</span>
                                        </span>
                                        {onInspectService && (
                                          <button
                                            type="button"
                                            onClick={() => onInspectService(item.id)}
                                            className="px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-black uppercase bg-white hover:bg-neutral-100 text-black border border-black flex items-center gap-1 cursor-pointer"
                                            title="Inspect live time-series graph"
                                          >
                                            <LineChart className="w-3 h-3" />
                                            <span>GRAPH</span>
                                          </button>
                                        )}
                                      </div>
                                    ) : (
                                      <span className="text-[10px] sm:text-xs font-bold uppercase text-neutral-600 px-2 py-0.5 rounded border border-neutral-300">
                                        Include
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            }

                            // Unselectable other metrics (CPU, Memory, IOPS, etc.)
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
                                    className="w-3.5 h-3.5 rounded text-neutral-400 border-neutral-400 cursor-not-allowed shrink-0"
                                  />
                                  <div className="flex items-center gap-1.5 truncate">
                                    <span className="text-xs font-bold text-neutral-700 line-through truncate">
                                      {metric.name}
                                    </span>
                                    <span className="text-[10px] px-1 rounded bg-neutral-200 font-mono text-neutral-700 shrink-0">
                                      {metric.unit}
                                    </span>
                                  </div>
                                </div>

                                <span className="text-[10px] font-bold text-neutral-600 px-1.5 py-0.5 rounded border border-neutral-300 bg-neutral-100 shrink-0 uppercase ml-2">
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
