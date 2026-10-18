'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar,
  ChevronDown,
  ChevronRight,
  Filter,
  Layers,
  Search,
} from 'lucide-react';
import { MetricsCategory } from './gmail_left_sidebar';
import { DensityOption } from './gmail_quick_settings_panel';
import {
  getCategoryMetadata,
  getCategoryMetricGroups,
  MetricGroup,
} from '@/lib/catalog/metrics_catalogue_provider';
import { MetricTelemetryChartCard } from '@/components/cards/metric_telemetry_chart_card';

interface ObservatoryMetricsDomainViewProps {
  activeCategory?: MetricsCategory;
  activeSuboption?: string | null;
  density?: DensityOption;
  hasWallpaper?: boolean;
  searchQuery?: string;
  onSelectSuboption?: (subId: string) => void;
}

const TIME_RANGES = [
  { id: '1h', label: 'Last 1 hour' },
  { id: '3h', label: 'Last 3 hours' },
  { id: '6h', label: 'Last 6 hours' },
  { id: '12h', label: 'Last 12 hours' },
  { id: '24h', label: 'Last 24 hours' },
  { id: '7d', label: 'Last 7 days' },
];

export function ObservatoryMetricsDomainView({
  activeCategory = 'Cloud',
  activeSuboption,
  density = 'compact',
  hasWallpaper = false,
  searchQuery = '',
  onSelectSuboption,
}: ObservatoryMetricsDomainViewProps) {
  // Category Metadata from Excel Catalogue
  const meta = useMemo(() => getCategoryMetadata(activeCategory), [activeCategory]);

  // Active sub-tab state (e.g. AWS, Azure, Cloud Foundry, GCP)
  const defaultTab = meta.tabs[0]?.id || 'aws';
  const [activeTabId, setActiveTabId] = useState<string>(activeSuboption || defaultTab);

  // Time range selector state
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('3h');
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);

  // Accordion collapsed groups set (all expanded by default like Image 4)
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  // Keep activeTabId in sync if parent passed activeSuboption or activeCategory changed
  useEffect(() => {
    if (activeSuboption && meta.tabs.some((t) => t.id === activeSuboption)) {
      setActiveTabId(activeSuboption);
    } else {
      setActiveTabId(meta.tabs[0]?.id || 'all');
    }
  }, [activeCategory, activeSuboption, meta.tabs]);

  const handleSelectTab = (tabId: string) => {
    setActiveTabId(tabId);
    onSelectSuboption?.(tabId);
  };

  const toggleGroupCollapse = (groupId: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  // Fetch metric groups from Excel catalog
  const rawGroups = useMemo(() => {
    return getCategoryMetricGroups(activeCategory, activeTabId);
  }, [activeCategory, activeTabId]);

  // Apply search query filter if user typed in Box 3 top search bar
  const metricGroups: MetricGroup[] = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return rawGroups;

    return rawGroups
      .map((group) => {
        const filtered = group.metrics.filter(
          (m) =>
            m.title.toLowerCase().includes(q) ||
            m.description.toLowerCase().includes(q) ||
            m.parentPath.toLowerCase().includes(q) ||
            m.sampleApi.toLowerCase().includes(q)
        );
        return {
          ...group,
          metrics: filtered,
        };
      })
      .filter((group) => group.metrics.length > 0);
  }, [rawGroups, searchQuery]);

  const totalMetricsCount = useMemo(() => {
    return metricGroups.reduce((acc, g) => acc + g.metrics.length, 0);
  }, [metricGroups]);

  const activeTimeRangeLabel =
    TIME_RANGES.find((tr) => tr.id === selectedTimeRange)?.label || 'Last 3 hours';

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-50/60 select-text font-sans w-full">
      {/* ======================================================== */}
      {/* 1. TOP HEADER (MATCHING IMAGE 4 EXACTLY)                  */}
      {/* ======================================================== */}
      <div className="p-6 sm:p-7 border-b border-slate-200/80 bg-white shrink-0 w-full">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 w-full">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl lg:text-[26px] font-black text-slate-900 tracking-tight">
              {meta.title}
            </h1>
            <p className="text-xs sm:text-sm font-medium text-slate-500 leading-relaxed max-w-4xl">
              {meta.subtitle}
            </p>
          </div>


        </div>

        {/* ====================================================== */}
        {/* 2. SUB-PROVIDER TABS & TIME PICKER (IMAGE 4)          */}
        {/* ====================================================== */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-5 mt-2 border-t border-slate-100">
          {/* Provider / Sub-Category Pill Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {meta.tabs.map((tab) => {
              const isActive = activeTabId === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleSelectTab(tab.id)}
                  className={`px-4 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#d3e3fd] text-[#041e49] shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Time Range Dropdown Selector */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setIsTimeDropdownOpen((prev) => !prev)}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs cursor-pointer transition-colors"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{activeTimeRangeLabel}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isTimeDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setIsTimeDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-1.5 w-44 rounded-xl bg-white border border-slate-200 shadow-lg py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100 divide-y divide-slate-100 text-xs">
                  {TIME_RANGES.map((tr) => (
                    <button
                      key={tr.id}
                      type="button"
                      onClick={() => {
                        setSelectedTimeRange(tr.id);
                        setIsTimeDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 font-medium transition-colors cursor-pointer ${
                        selectedTimeRange === tr.id
                          ? 'bg-blue-50 text-blue-700 font-bold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {tr.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. METRIC GROUPS (ACCORDIONS SPANNING FULL WIDTH)        */}
      {/* ======================================================== */}
      <div className="p-6 sm:p-7 space-y-7 w-full max-w-none">
        {/* Global search feedback if query exists */}
        {searchQuery && (
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 bg-blue-50/70 border border-blue-200/60 rounded-xl px-4 py-2.5">
            <span>
              Filtering metrics by &ldquo;<strong>{searchQuery}</strong>&rdquo; &bull; Found{' '}
              <strong>{totalMetricsCount}</strong> matching metrics
            </span>
          </div>
        )}

        {metricGroups.length === 0 ? (
          <div className="p-12 text-center text-slate-500 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-2">
            <Filter className="w-8 h-8 text-slate-400 mx-auto" />
            <h4 className="text-sm font-bold text-slate-700">No matching metrics found</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              No telemetry metrics in this category match your search criteria. Clear your search query in the top bar to restore all cards.
            </p>
          </div>
        ) : (
          metricGroups.map((group) => {
            const isCollapsed = collapsedGroups.has(group.id);

            return (
              <section key={group.id} className="space-y-3.5 w-full">
                {/* Accordion Group Header (Matching Image 4) */}
                <button
                  type="button"
                  onClick={() => toggleGroupCollapse(group.id)}
                  className="w-full flex items-center justify-between py-1 group cursor-pointer text-left select-none"
                >
                  <div className="flex items-center gap-2 text-slate-800 group-hover:text-slate-900 transition-colors">
                    {isCollapsed ? (
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
                    )}
                    <h3 className="text-sm sm:text-base font-bold tracking-tight">
                      {group.title}
                    </h3>
                  </div>

                  <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-600 transition-colors">
                    {group.metrics.length} {group.metrics.length === 1 ? 'metric' : 'metrics'}
                  </span>
                </button>

                {/* 2-Column Grid of Metric Cards (Full Width) */}
                {!isCollapsed && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                    {group.metrics.map((metric) => (
                      <MetricTelemetryChartCard key={metric.id} data={metric} />
                    ))}
                  </div>
                )}
              </section>
            );
          })
        )}
      </div>
    </div>
  );
}
