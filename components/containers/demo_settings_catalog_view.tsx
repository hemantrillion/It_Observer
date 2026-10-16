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
}: DemoSettingsCatalogViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
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

  // Filter catalog items by search query
  const filteredCatalog = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
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
  }, [searchQuery]);

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
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* ======================================================== */}
      {/* 1. TOP SECTION (ABOVE SEARCH BAR)                       */}
      {/* ======================================================== */}
      <div className="space-y-6">
        {/* Main Heading */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e0e2ec] pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#0b57d0] text-white flex items-center justify-center shadow-xs">
                <Sliders className="w-5 h-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#1f1f1f] tracking-tight">
                Demo Settings &amp; Public APIs Catalog
              </h1>
            </div>
            <p className="text-sm text-[#444746] font-medium max-w-3xl">
              Configure telemetry synthetic polling intervals and select target public or private endpoints across the sequential A–Z catalog. Checked endpoints instantly reflect in the live Dashboard.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#e8f0fe] text-[#0b57d0] border border-[#0b57d0]/20 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5" />
              <span>{monitoredServices.length} Active in Dashboard</span>
            </span>
          </div>
        </div>

        {/* 1A. FUNCTIONAL CONSTANT POLLING SETTINGS CARD */}
        <div className="bg-white rounded-2xl border-2 border-[#0b57d0]/30 shadow-md p-6 space-y-5 transition-all">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#e0e2ec] pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <Radio className={`w-5 h-5 ${isConstantPollingEnabled ? 'text-[#0b57d0] animate-pulse' : 'text-[#747775]'}`} />
                <h3 className="text-base sm:text-lg font-bold text-[#1f1f1f]">
                  Automated Constant Polling Engine
                </h3>
                <span
                  className={`px-3 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                    isConstantPollingEnabled
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-[#f0f4f9] text-[#5e5e5e] border border-[#c4c7c5]'
                  }`}
                >
                  {isConstantPollingEnabled ? `Active (${constantPollingInterval / 1000}s Interval)` : 'Disabled (Default)'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#444746]">
                By default, constant polling is <strong>OFF</strong> to prevent unwanted background traffic. When disabled, metrics only refresh when clicking &ldquo;Poll Now&rdquo; manually. Enable to poll automatically at your chosen frequency.
              </p>
            </div>

            {/* Toggle Switch */}
            <div className="flex items-center gap-4 shrink-0">
              <button
                type="button"
                onClick={() => onToggleConstantPolling(!isConstantPollingEnabled)}
                className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isConstantPollingEnabled ? 'bg-[#0b57d0]' : 'bg-[#c4c7c5]'
                }`}
              >
                <span className="sr-only">Toggle Constant Polling</span>
                <span
                  className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    isConstantPollingEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className="text-sm font-bold text-[#1f1f1f]">
                {isConstantPollingEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>

          {/* Interval Selector + Manual Poll Now Button */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#444746] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#0b57d0]" />
                <span>Polling Frequency Interval</span>
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {POLLING_INTERVALS.map((intv) => {
                  const isSelected = constantPollingInterval === intv.value;
                  return (
                    <button
                      key={intv.value}
                      type="button"
                      onClick={() => onChangeConstantPollingInterval(intv.value)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#0b57d0] text-white shadow-xs scale-[1.02]'
                          : 'bg-[#f0f4f9] text-[#444746] hover:bg-[#e0e2ec] hover:text-[#1f1f1f] border border-[#e0e2ec]'
                      }`}
                    >
                      {intv.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Manual Poll Now Button */}
            <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
              <button
                type="button"
                onClick={() => onTriggerManualPoll()}
                disabled={isPolling}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#eaf1fb] hover:bg-[#d3e3fd] text-[#041e49] font-bold text-xs sm:text-sm border border-[#0b57d0]/30 shadow-xs transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 text-[#0b57d0] ${isPolling ? 'animate-spin' : ''}`} />
                <span>{isPolling ? 'Probing Endpoints...' : 'Poll Now (Manual Trigger)'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 1B. DISPLAY-ONLY SHOW SETTINGS (NOT CLICKABLE) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Telemetry Ingestion Engine */}
          <div className="bg-[#f8fafd] rounded-2xl border border-[#e0e2ec] p-4 space-y-2 relative overflow-hidden select-none opacity-90">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#5e5e5e] flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-[#747775]" />
                <span>Ingestion Engine</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#e0e2ec] text-[#444746]">
                Managed (Show Only)
              </span>
            </div>
            <h4 className="text-sm font-bold text-[#1f1f1f]">gRPC &amp; HTTP/2 Stream Pipeline</h4>
            <p className="text-xs text-[#5e5e5e] leading-relaxed">
              Snappy compression enabled. Ingestion buffer throttled at 128 MB with zero-allocation socket pooling.
            </p>
          </div>

          {/* Card 2: Transport Cryptography */}
          <div className="bg-[#f8fafd] rounded-2xl border border-[#e0e2ec] p-4 space-y-2 relative overflow-hidden select-none opacity-90">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#5e5e5e] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#747775]" />
                <span>Cryptographic Protocol</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#e0e2ec] text-[#444746]">
                Enforced (Show Only)
              </span>
            </div>
            <h4 className="text-sm font-bold text-[#1f1f1f]">Strict TLS 1.3 &amp; OCSP Stapling</h4>
            <p className="text-xs text-[#5e5e5e] leading-relaxed">
              Automated certificate revocation verification and ECDHE ephemeral key exchange validation.
            </p>
          </div>

          {/* Card 3: Reserved Configuration Slot (User explicitly requested placeholder) */}
          <div className="bg-[#f8fafd] rounded-2xl border border-dashed border-[#c4c7c5] p-4 space-y-2 relative overflow-hidden select-none">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#5e5e5e] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#0b57d0]" />
                <span>Custom Configuration Slot</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#e8f0fe] text-[#0b57d0]">
                Reserved Slot
              </span>
            </div>
            <h4 className="text-sm font-bold text-[#1f1f1f]">Reserved Parameter Setting</h4>
            <p className="text-xs text-[#5e5e5e] leading-relaxed">
              Slot reserved above search bar for custom configuration parameter to be specified in subsequent refinement.
            </p>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. SEARCH BAR                                           */}
      {/* ======================================================== */}
      <div className="space-y-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#747775]">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search public & cloud APIs by company (e.g. AWS, Stripe, GitHub), target URL, or metric name..."
            className="w-full pl-12 pr-10 py-3.5 rounded-2xl border border-[#c4c7c5] bg-white font-medium text-sm text-[#1f1f1f] shadow-xs focus:outline-none focus:border-[#0b57d0] focus:ring-2 focus:ring-[#0b57d0]/20 transition-all placeholder:text-[#747775]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#747775] hover:text-[#1f1f1f] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-[#5e5e5e] px-1 font-medium">
          <span>
            Showing <strong>{filteredCatalog.length}</strong> APIs across {ALPHABETS.length} alphabetical categories
          </span>
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-[#0b57d0] font-bold hover:underline cursor-pointer"
            >
              Clear search filter
            </button>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. ALPHABET JUMP BAR (LEFT TO RIGHT: A TO Z)             */}
      {/* ======================================================== */}
      <div className="space-y-2 sticky top-0 z-20 bg-white/95 backdrop-blur-md py-3 border-y border-[#e0e2ec] shadow-xs">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#444746]">
            Alphabetical Jump Bar (A &mdash; Z)
          </span>
          <span className="text-[11px] text-[#747775]">
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
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all shrink-0 cursor-pointer ${
              activeLetter === null
                ? 'bg-[#0b57d0] text-white shadow-xs'
                : 'bg-[#f0f4f9] text-[#444746] hover:bg-[#e0e2ec]'
            }`}
          >
            All
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
                className={`min-w-8 h-8 px-2 rounded-xl text-xs font-black transition-all shrink-0 flex items-center justify-center cursor-pointer ${
                  count === 0
                    ? 'opacity-30 cursor-not-allowed bg-transparent text-[#747775]'
                    : isSelected
                    ? 'bg-[#0b57d0] text-white shadow-xs scale-105'
                    : 'bg-[#f0f4f9] text-[#1f1f1f] hover:bg-[#d3e3fd] hover:text-[#041e49]'
                }`}
              >
                <span>{letter}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tooltip Alert when user tries to click an unselectable metric */}
      {unselectableTooltip && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-medium flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{unselectableTooltip}</span>
          </div>
          <button
            type="button"
            onClick={() => setUnselectableTooltip(null)}
            className="p-1 hover:bg-amber-100 rounded-lg text-amber-700"
          >
            <X className="w-3.5 h-3.5" />
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
              className="space-y-4 scroll-mt-28"
            >
              {/* Section Alphabet Header */}
              <div className="flex items-center justify-between border-b-2 border-[#e0e2ec] pb-2">
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-xl bg-[#0b57d0] text-white font-black text-base flex items-center justify-center shadow-xs">
                    {letter}
                  </span>
                  <h2 className="text-xl font-black text-[#1f1f1f] tracking-tight">
                    Alphabet {letter}
                  </h2>
                </div>
                <span className="text-xs font-bold text-[#5e5e5e] px-2.5 py-1 rounded-full bg-[#f0f4f9]">
                  {items.length} {items.length === 1 ? 'API available' : 'APIs available'}
                </span>
              </div>

              {/* Tabulated Card Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((item) => {
                  const isMonitored = monitoredIdSet.has(item.id);
                  const isToggling = togglingServiceId === item.id;
                  const isPrivate = item.access_type === 'PRIVATE';

                  return (
                    <div
                      key={item.id}
                      className={`rounded-2xl border transition-all duration-150 p-5 space-y-4 ${
                        isMonitored
                          ? 'bg-white border-[#0b57d0] shadow-md ring-2 ring-[#0b57d0]/20'
                          : 'bg-white border-[#e0e2ec] hover:border-[#c4c7c5] shadow-xs hover:shadow-sm'
                      }`}
                    >
                      {/* Top Row: Provider & Access Tag */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold uppercase tracking-wider text-[#5e5e5e]">
                              {item.company}
                            </span>
                            <span className="text-[#c4c7c5]">&bull;</span>
                            <span className="text-xs font-medium text-[#747775]">
                              {item.category}
                            </span>
                          </div>
                          <h3 className="text-base font-black text-[#1f1f1f] tracking-tight">
                            {item.name}
                          </h3>
                        </div>

                        {/* Public vs Private Badge */}
                        <div className="shrink-0">
                          {isPrivate ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                              <Lock className="w-3 h-3 text-amber-600" />
                              <span>Private VPC</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                              <Globe className="w-3 h-3 text-emerald-600" />
                              <span>Public API</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Target Endpoint & Description */}
                      <div className="space-y-1.5 bg-[#f8fafd] rounded-xl p-3 border border-[#e0e2ec]">
                        <div className="flex items-center justify-between text-[11px] font-mono text-[#444746] truncate">
                          <span className="truncate">{item.target_url}</span>
                        </div>
                        <p className="text-xs text-[#5e5e5e] leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      {/* Exposed Metric Measurements (Tabulated List) */}
                      <div className="space-y-2 border-t border-[#e0e2ec] pt-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#444746]">
                            Exposed Metric Measurements
                          </span>
                          <span className="text-[10px] text-[#747775]">
                            Only Latency Measurable via HTTP Ping
                          </span>
                        </div>

                        <div className="space-y-1.5 divide-y divide-[#e0e2ec]/60">
                          {item.metrics.map((metric) => {
                            if (metric.selectable) {
                              // Functional Checkbox for Response Time Latency
                              return (
                                <label
                                  key={metric.id}
                                  className={`flex items-center justify-between p-2.5 rounded-xl transition-colors cursor-pointer select-none ${
                                    isMonitored
                                      ? 'bg-[#e8f0fe] text-[#041e49] font-bold'
                                      : 'hover:bg-[#f0f4f9] text-[#1f1f1f]'
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <input
                                      type="checkbox"
                                      checked={isMonitored}
                                      onChange={() => handleToggleService(item)}
                                      disabled={isToggling}
                                      className="w-4 h-4 rounded text-[#0b57d0] focus:ring-[#0b57d0] border-[#c4c7c5] cursor-pointer"
                                    />
                                    <div>
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-xs font-bold">{metric.name}</span>
                                        <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-white/70 font-mono text-[#5e5e5e] border border-[#c4c7c5]">
                                          {metric.unit}
                                        </span>
                                      </div>
                                      <p className="text-[11px] text-[#5e5e5e] font-normal">
                                        {metric.description}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Active in Dashboard Status Tag */}
                                  <div className="shrink-0">
                                    {isToggling ? (
                                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#0b57d0]" />
                                    ) : isMonitored ? (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                                        <Check className="w-3 h-3" />
                                        <span>Active in Dashboard</span>
                                      </span>
                                    ) : (
                                      <span className="text-[10px] font-bold text-[#747775]">
                                        Click to include
                                      </span>
                                    )}
                                  </div>
                                </label>
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
                                className="flex items-center justify-between p-2 rounded-xl opacity-60 hover:opacity-90 transition-opacity cursor-not-allowed select-none"
                              >
                                <div className="flex items-center gap-3">
                                  <input
                                    type="checkbox"
                                    disabled
                                    checked={false}
                                    className="w-4 h-4 rounded text-gray-400 border-gray-300 cursor-not-allowed"
                                  />
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-xs font-medium text-[#747775] line-through">
                                        {metric.name}
                                      </span>
                                      <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-[#f0f4f9] font-mono text-[#747775]">
                                        {metric.unit}
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-[#747775]">
                                      {metric.description}
                                    </p>
                                  </div>
                                </div>

                                <span className="text-[10px] font-medium text-[#747775] px-2 py-0.5 rounded-full bg-[#f0f4f9] shrink-0 border border-[#e0e2ec]">
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
