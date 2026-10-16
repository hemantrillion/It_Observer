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

  // Flexbox Boundaries Visibility (Default: true as requested by user)
  const [showFlexboxBorders, setShowFlexboxBorders] = useState(true);

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
      className={`h-screen w-screen flex flex-row ${
        hasWallpaper ? 'bg-cover bg-center' : 'bg-[#f8fafd]'
      } text-[#1f1f1f] overflow-hidden font-sans select-none relative`}
    >
      {/* ======================================================== */}
      {/* FLEXBOX 1: Far-Left Narrow Rail (Level 1: Darkest tint)  */}
      {/* Contains: Hamburger collapse button at top, Mail, Chat,   */}
      {/*           Meet, Demo. Matches Search Box darkness.        */}
      {/* ======================================================== */}
      <div
        className={`relative h-full shrink-0 flex flex-col transition-all ${
          showFlexboxBorders
            ? 'border-2 border-red-500 m-0.5 rounded-sm'
            : ''
        } ${hasWallpaper ? 'bg-[#e9eef6]/65 backdrop-blur-md' : 'bg-[#e9eef6]'}`}
      >
        <GmailLeftRail
          activeTab={activeRailTab}
          onSelectTab={(tab) => {
            setActiveRailTab(tab);
            if (tab === 'demo') {
              setDemoSubView('dashboard');
            }
          }}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        />
      </div>

      {/* ======================================================== */}
      {/* Right-Hand Workspace Container (Column: Box 3 top, then   */}
      {/* Box 2, Box 4, Box 5 side-by-side)                         */}
      {/* ======================================================== */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* ====================================================== */}
        {/* FLEXBOX 3: Top Navigation Bar (Level 2: Medium tint)   */}
        {/* Starts with Gmail logo & wordmark, search, controls    */}
        {/* ====================================================== */}
        <div
          className={`relative shrink-0 transition-all ${
            showFlexboxBorders
              ? 'border-2 border-amber-500 m-0.5 rounded-sm'
              : ''
          } ${hasWallpaper ? 'bg-[#f8fafd]/45 backdrop-blur-md' : 'bg-[#f8fafd]'}`}
        >
          <GmailTopNavbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            activeMode={activeRailTab}
            onOpenSettings={() => setIsQuickSettingsOpen((prev) => !prev)}
            isSettingsOpen={isQuickSettingsOpen}
            showFlexboxBorders={showFlexboxBorders}
            onToggleFlexboxBorders={() => setShowFlexboxBorders((prev) => !prev)}
            isSidebarOpen={isSidebarOpen}
            hasWallpaper={hasWallpaper}
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

        {/* Body below Box 3: Horizontal flex row holding Box 2, 4, 5 */}
        <div className="flex-1 flex flex-row overflow-hidden">
          {/* ==================================================== */}
          {/* FLEXBOX 2: Left Collapsible Sidebar                  */}
          {/* In Demo mode: Poll Now + Observatory nav + filters   */}
          {/* In Mail mode: + Compose + Folders + Labels           */}
          {/* ==================================================== */}
          {/* ==================================================== */}
          {/* FLEXBOX 2: Left Collapsible Sidebar (Level 2)       */}
          {/* In Demo mode: Poll Now + Observatory nav + filters   */}
          {/* In Mail mode: + Compose + Folders + Labels           */}
          {/* ==================================================== */}
          {isSidebarOpen && (
            <div
              className={`relative h-full shrink-0 flex flex-col transition-all ${
                showFlexboxBorders
                  ? 'border-2 border-green-600 m-0.5 rounded-sm'
                  : ''
              } ${hasWallpaper ? 'bg-[#f8fafd]/45 backdrop-blur-md' : 'bg-[#f8fafd]'}`}
            >
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

          {/* ==================================================== */}
          {/* FLEXBOX 4: Central Main Content Area (Level 3: White) */}
          {/* White rounded card with either Demo Cockpit or Inbox */}
          {/* ==================================================== */}
          <div
            className={`relative flex-1 h-full flex flex-col overflow-hidden transition-all ${
              showFlexboxBorders
                ? 'border-2 border-blue-600 m-0.5 rounded-sm'
                : ''
            }`}
          >
            <main
              className={`flex-1 flex flex-col rounded-2xl mx-1 my-2 border border-[#e0e2ec] overflow-hidden shadow-sm ${
                hasWallpaper ? 'bg-white/90 backdrop-blur-md shadow-xl' : 'bg-white'
              }`}
            >
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
                  hasWallpaper={hasWallpaper}
                />
              ) : activeRailTab === 'mail' ? (
                <GmailInboxView density={density} hasWallpaper={hasWallpaper} />
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
                    className="px-5 py-2 rounded-full bg-[#0b57d0] text-white text-xs font-semibold shadow-xs cursor-pointer"
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
                    className="px-5 py-2 rounded-full bg-[#0b57d0] text-white text-xs font-semibold shadow-xs cursor-pointer"
                  >
                    Go to Telemetry Demo
                  </button>
                </div>
              )}
            </main>
          </div>

          {/* ==================================================== */}
          {/* FLEXBOX 5: Far-Right Companion Rail (Level 2)        */}
          {/* Contains: Calendar, Keep, Tasks, Contacts, +, >      */}
          {/* ==================================================== */}
          <div
            className={`relative h-full shrink-0 flex flex-col transition-all ${
              showFlexboxBorders
                ? 'border-2 border-purple-600 m-0.5 rounded-sm'
                : ''
            } ${hasWallpaper ? 'bg-[#f8fafd]/45 backdrop-blur-md' : 'bg-[#f8fafd]'}`}
          >
            <GmailRightRail />
          </div>
        </div>
      </div>
    </div>
  );
}
