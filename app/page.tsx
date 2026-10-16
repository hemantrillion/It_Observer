'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { GmailTopNavbar } from '@/components/gmail/gmail_top_navbar';
import { GmailLeftRail, RailTab } from '@/components/gmail/gmail_left_rail';
import {
  GmailLeftSidebar,
  DemoSubView,
  StatusFilter,
} from '@/components/gmail/gmail_left_sidebar';
import { GmailRightRail } from '@/components/gmail/gmail_right_rail';
import { GmailInboxView } from '@/components/gmail/gmail_inbox_view';
import { ObservatoryTelemetryEmbeddedView } from '@/components/gmail/observatory_telemetry_embedded_view';
import {
  GmailQuickSettingsPanel,
  DensityOption,
  ThemeOption,
  PRESET_THEMES,
} from '@/components/gmail/gmail_quick_settings_panel';
import { MonitoredServiceRecord } from '@/lib/database/get_all_monitored_services_query';
import { IncidentAlertRecord } from '@/lib/database/get_all_incidents_history_query';
import { MessageSquare, Video } from 'lucide-react';

export default function ObservatoryGmailLayoutPage() {
  const [activeRailTab, setActiveRailTab] = useState<RailTab>('demo');
  const [demoSubView, setDemoSubView] = useState<DemoSubView>('dashboard');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Flexbox Boundaries Visual Debugger (Default: ON as requested)
  const [showFlexBoundaries, setShowFlexBoundaries] = useState(true);

  // Quick Settings State
  const [isQuickSettingsOpen, setIsQuickSettingsOpen] = useState(false);
  const [density, setDensity] = useState<DensityOption>('compact');
  const [activeTheme, setActiveTheme] = useState<ThemeOption>(PRESET_THEMES[0]);

  // Telemetry data state
  const [services, setServices] = useState<MonitoredServiceRecord[]>([]);
  const [summary, setSummary] = useState({
    total: 0,
    healthy: 0,
    degraded: 0,
    down: 0,
    activeAlerts: 0,
  });
  const [activeIncidents, setActiveIncidents] = useState<IncidentAlertRecord[]>([]);
  const [isPolling, setIsPolling] = useState(false);

  // Restore saved theme and density on mount
  useEffect(() => {
    try {
      const savedThemeId = localStorage.getItem('gmail_theme_id');
      const savedCustomBg = localStorage.getItem('gmail_custom_wallpaper');
      const savedDensity = localStorage.getItem('gmail_density') as DensityOption | null;

      if (savedDensity) {
        setDensity(savedDensity);
      }

      if (savedCustomBg) {
        setActiveTheme({
          id: 'custom_pc',
          name: 'Custom Wallpaper',
          type: 'image',
          previewUrl: savedCustomBg,
          backgroundStyle: `url(${savedCustomBg}) center/cover no-repeat fixed`,
        });
      } else if (savedThemeId) {
        const found = PRESET_THEMES.find((t) => t.id === savedThemeId);
        if (found) setActiveTheme(found);
      }
    } catch {
      // localStorage may fail in private mode
    }
  }, []);

  const handleSelectTheme = (theme: ThemeOption) => {
    setActiveTheme(theme);
    try {
      localStorage.setItem('gmail_theme_id', theme.id);
      localStorage.removeItem('gmail_custom_wallpaper');
    } catch {}
  };

  const handleUploadCustomWallpaper = (dataUrl: string) => {
    const customTheme: ThemeOption = {
      id: 'custom_pc',
      name: 'Custom Wallpaper',
      type: 'image',
      previewUrl: dataUrl,
      backgroundStyle: `url(${dataUrl}) center/cover no-repeat fixed`,
    };
    setActiveTheme(customTheme);
    try {
      localStorage.setItem('gmail_custom_wallpaper', dataUrl);
      localStorage.setItem('gmail_theme_id', 'custom_pc');
    } catch {}
  };

  const handleDensityChange = (d: DensityOption) => {
    setDensity(d);
    try {
      localStorage.setItem('gmail_density', d);
    } catch {}
  };

  const fetchStatus = useCallback(async () => {
    try {
      const [servicesRes, incidentsRes] = await Promise.all([
        fetch('/api/services'),
        fetch('/api/incidents'),
      ]);
      const servicesData = await servicesRes.json();
      const incidentsData = await incidentsRes.json();

      if (servicesData.success) {
        setServices(servicesData.services);
        setSummary(servicesData.summary);
      }
      if (incidentsData.success) {
        const active = incidentsData.incidents.filter(
          (i: IncidentAlertRecord) => i.is_active === 1
        );
        setActiveIncidents(active);
      }
    } catch (e) {
      console.error('Failed to fetch status', e);
    }
  }, []);

  const triggerPoll = useCallback(async () => {
    setIsPolling(true);
    try {
      await fetch('/api/poller', { cache: 'no-store' });
      await fetchStatus();
    } catch (e) {
      console.error('Polling failed', e);
    } finally {
      setIsPolling(false);
    }
  }, [fetchStatus]);

  useEffect(() => {
    fetchStatus();
    triggerPoll();

    const interval = setInterval(() => {
      triggerPoll();
    }, 8000);

    return () => clearInterval(interval);
  }, [fetchStatus, triggerPoll]);

  const hasWallpaper = activeTheme.id !== 'default';

  return (
    <div
      style={hasWallpaper ? { background: activeTheme.backgroundStyle } : undefined}
      className={`h-screen w-screen flex flex-col ${
        hasWallpaper ? 'bg-cover bg-center' : 'bg-[#f6f8fc]'
      } text-[#1f1f1f] overflow-hidden font-sans select-none relative`}
    >
      {/* Zone 3: Top Navigation Bar Flexbox */}
      <div
        className={`relative shrink-0 ${
          hasWallpaper ? 'bg-white/80 backdrop-blur-md' : 'bg-[#f6f8fc]'
        } ${
          showFlexBoundaries
            ? 'border-4 border-[#10b981] m-1 rounded-2xl shadow-lg ring-2 ring-[#10b981]/40'
            : ''
        }`}
      >
        {/* Yellow Box 3 Indicator matching user's drawing */}
        {showFlexBoundaries && (
          <div className="absolute -top-3 left-4 bg-[#fde047] text-black font-extrabold text-[11px] px-3 py-0.5 rounded-full shadow-lg z-50 border-2 border-black flex items-center gap-1.5 animate-pulse">
            <span className="w-4 h-4 rounded-full bg-black text-yellow-300 flex items-center justify-center text-[10px] font-black">
              3
            </span>
            <span className="tracking-wide">FLEXBOX ZONE 3 (TOP NAVBAR)</span>
          </div>
        )}

        <GmailTopNavbar
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeMode={activeRailTab}
          onOpenSettings={() => setIsQuickSettingsOpen((prev) => !prev)}
          isSettingsOpen={isQuickSettingsOpen}
          showFlexBoundaries={showFlexBoundaries}
          onToggleFlexBoundaries={() => setShowFlexBoundaries((prev) => !prev)}
        />
      </div>

      {/* Quick Settings Panel Flyout */}
      <GmailQuickSettingsPanel
        isOpen={isQuickSettingsOpen}
        onClose={() => setIsQuickSettingsOpen(false)}
        density={density}
        onDensityChange={handleDensityChange}
        activeThemeId={activeTheme.id}
        onSelectTheme={handleSelectTheme}
        onUploadCustomWallpaper={handleUploadCustomWallpaper}
        onSeeAllSettings={() => {
          setActiveRailTab('demo');
          setDemoSubView('settings');
        }}
      />

      {/* Main Body Layout: Horizontal Flexbox Container */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Zone 1: Far-Left Narrow Rail (Mail, Chat, Meet, Demo) */}
        <div
          className={`relative shrink-0 ${
            hasWallpaper ? 'bg-white/60 backdrop-blur-sm' : 'bg-[#f6f8fc]'
          } ${
            showFlexBoundaries
              ? 'border-4 border-[#10b981] m-1 rounded-2xl shadow-lg ring-2 ring-[#10b981]/40'
              : ''
          }`}
        >
          {/* Yellow Box 1 Indicator matching user's drawing */}
          {showFlexBoundaries && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#fde047] text-black font-extrabold text-[10px] px-2 py-0.5 rounded-full shadow-lg z-50 border-2 border-black flex items-center gap-1">
              <span className="w-3.5 h-3.5 rounded-full bg-black text-yellow-300 flex items-center justify-center text-[9px] font-black">
                1
              </span>
              <span>RAIL</span>
            </div>
          )}

          <GmailLeftRail
            activeTab={activeRailTab}
            onSelectTab={(tab) => {
              setActiveRailTab(tab);
              if (tab === 'demo') {
                setDemoSubView('dashboard');
              }
            }}
          />
        </div>

        {/* Zone 2: Collapsible Sidebar */}
        {isSidebarOpen && (
          <div
            className={`relative shrink-0 ${
              hasWallpaper ? 'bg-white/60 backdrop-blur-sm' : 'bg-[#f6f8fc]'
            } ${
              showFlexBoundaries
                ? 'border-4 border-[#10b981] m-1 rounded-2xl shadow-lg ring-2 ring-[#10b981]/40'
                : ''
            }`}
          >
            {/* Yellow Box 2 Indicator matching user's drawing */}
            {showFlexBoundaries && (
              <div className="absolute -top-3 left-6 bg-[#fde047] text-black font-extrabold text-[11px] px-2.5 py-0.5 rounded-full shadow-lg z-50 border-2 border-black flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-black text-yellow-300 flex items-center justify-center text-[10px] font-black">
                  2
                </span>
                <span className="tracking-wide">FLEXBOX ZONE 2 (SIDEBAR)</span>
              </div>
            )}

            <GmailLeftSidebar
              activeTab={activeRailTab}
              demoSubView={demoSubView}
              onSelectDemoSubView={setDemoSubView}
              statusFilter={statusFilter}
              onSelectStatusFilter={setStatusFilter}
              onPoll={triggerPoll}
              isPolling={isPolling}
              incidentCount={activeIncidents.length}
              healthyCount={summary.healthy}
              degradedCount={summary.degraded}
              downCount={summary.down}
              totalServicesCount={summary.total}
            />
          </div>
        )}

        {/* Zone 4: Central Main Content Workspace Card */}
        <main
          className={`relative flex-1 flex flex-col rounded-2xl mx-1 my-1 overflow-hidden min-w-0 ${
            hasWallpaper ? 'bg-white/95 backdrop-blur-md shadow-xl' : 'bg-white'
          } ${
            showFlexBoundaries
              ? 'border-4 border-[#10b981] shadow-xl ring-2 ring-[#10b981]/40'
              : 'border border-[#e0e2ec] shadow-sm'
          }`}
        >
          {/* Yellow Box 4 Indicator matching user's drawing */}
          {showFlexBoundaries && (
            <div className="absolute top-2 right-4 bg-[#fde047] text-black font-extrabold text-[11px] px-3 py-1 rounded-full shadow-lg z-40 border-2 border-black flex items-center gap-1.5 animate-pulse">
              <span className="w-4 h-4 rounded-full bg-black text-yellow-300 flex items-center justify-center text-[10px] font-black">
                4
              </span>
              <span className="tracking-wide">FLEXBOX ZONE 4 (MAIN WORKSPACE: DEMO / INBOX)</span>
            </div>
          )}

          {activeRailTab === 'demo' ? (
            <ObservatoryTelemetryEmbeddedView
              services={services}
              summary={summary}
              activeIncidents={activeIncidents}
              triggerPoll={triggerPoll}
              isPolling={isPolling}
              demoSubView={demoSubView}
              statusFilter={statusFilter}
              searchQuery={searchQuery}
              density={density}
            />
          ) : activeRailTab === 'mail' ? (
            <GmailInboxView density={density} />
          ) : activeRailTab === 'chat' ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-[#5e5e5e] space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#eaf1fb] flex items-center justify-center text-[#0b57d0]">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-[#1f1f1f]">Google Chat</h3>
              <p className="max-w-md text-sm text-[#444746]">
                Direct messages and spaces for infrastructure incident response teams and DevOps notifications.
              </p>
              <button
                onClick={() => setActiveRailTab('demo')}
                className="px-5 py-2 rounded-full bg-[#0b57d0] text-white text-xs font-semibold shadow-xs"
              >
                Go to Telemetry Demo
              </button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-[#5e5e5e] space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#eaf1fb] flex items-center justify-center text-[#0b57d0]">
                <Video className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-[#1f1f1f]">Google Meet</h3>
              <p className="max-w-md text-sm text-[#444746]">
                Instant secure video meetings for War Room incident coordination and engineering triage.
              </p>
              <button
                onClick={() => setActiveRailTab('demo')}
                className="px-5 py-2 rounded-full bg-[#0b57d0] text-white text-xs font-semibold shadow-xs"
              >
                Go to Telemetry Demo
              </button>
            </div>
          )}
        </main>

        {/* Zone 5: Far-Right Companion Rail */}
        <div
          className={`relative shrink-0 ${
            hasWallpaper ? 'bg-white/60 backdrop-blur-sm' : 'bg-[#f6f8fc]'
          } ${
            showFlexBoundaries
              ? 'border-4 border-[#10b981] m-1 rounded-2xl shadow-lg ring-2 ring-[#10b981]/40'
              : ''
          }`}
        >
          {/* Yellow Box 5 Indicator matching user's drawing */}
          {showFlexBoundaries && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#fde047] text-black font-extrabold text-[10px] px-2 py-0.5 rounded-full shadow-lg z-50 border-2 border-black flex items-center gap-1">
              <span className="w-3.5 h-3.5 rounded-full bg-black text-yellow-300 flex items-center justify-center text-[9px] font-black">
                5
              </span>
            </div>
          )}

          <GmailRightRail />
        </div>
      </div>
    </div>
  );
}
