'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { GmailTopNavbar } from '@/components/gmail/gmail_top_navbar';
import { GmailLeftRail, RailTab } from '@/components/gmail/gmail_left_rail';
import {
  GmailLeftSidebar,
  DemoSubView,
  StatusFilter,
  MetricsCategory,
  UserSection,
} from '@/components/gmail/gmail_left_sidebar';
import { GmailRightRail } from '@/components/gmail/gmail_right_rail';
import { GmailInboxView } from '@/components/gmail/gmail_inbox_view';
import { ObservatoryTelemetryEmbeddedView } from '@/components/gmail/observatory_telemetry_embedded_view';
import { ObservatoryUsersDatabaseView } from '@/components/gmail/observatory_users_database_view';
import { ObservatoryMetricsDomainView } from '@/components/gmail/observatory_metrics_domain_view';
import { SystemOverviewMetricsBarContainer } from '@/components/containers/system_overview_metrics_bar_container';
import { ChaosTestingControlPanelContainer } from '@/components/containers/chaos_testing_control_panel_container';
import { ActiveIncidentAlertNotificationCard } from '@/components/cards/active_incident_alert_notification_card';
import {
  GmailQuickSettingsPanel,
  DensityOption,
  ThemeOption,
  PRESET_THEMES,
} from '@/components/gmail/gmail_quick_settings_panel';
import { GmailAccountFlyoutPanel } from '@/components/gmail/gmail_account_flyout_panel';
import { MonitoredServiceRecord } from '@/lib/database/get_all_monitored_services_query';
import { IncidentAlertRecord } from '@/lib/database/get_all_incidents_history_query';
import { MessageSquare, Video, Plus, Cloud } from 'lucide-react';
import { InspectView } from '@/frontend/box/inspect/box4';
import { DeliveryView } from '@/frontend/box/delivery/box4';
import { getActiveAccount, UserAccount, DEFAULT_TEST_USER } from '@/lib/auth/accounts_manager';

interface ObservatoryGmailLayoutProps {
  onNavigateLanding?: () => void;
}

export function ObservatoryGmailLayout({ onNavigateLanding }: ObservatoryGmailLayoutProps) {
  const [activeAccount, setActiveAccountState] = useState<UserAccount>(DEFAULT_TEST_USER);
  const [activeRailTab, setActiveRailTab] = useState<RailTab>('demo');
  const [demoSubView, setDemoSubView] = useState<DemoSubView>('dashboard');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [activeMetricsCategory, setActiveMetricsCategory] = useState<MetricsCategory>('Cloud');
  const [activeMetricsSuboption, setActiveMetricsSuboption] = useState<string | null>('aws');
  const [activeUserSection, setActiveUserSection] = useState<UserSection>('accounts');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Browser History & Back button synchronization
  useEffect(() => {
    setActiveAccountState(getActiveAccount());

    if (typeof window !== 'undefined' && !window.history.state) {
      window.history.replaceState({ tab: 'demo', subView: 'dashboard' }, '');
    }

    const handlePopState = (e: PopStateEvent) => {
      if (e.state) {
        if (e.state.tab) setActiveRailTab(e.state.tab);
        if (e.state.subView) setDemoSubView(e.state.subView);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTab = (newTab: RailTab) => {
    setActiveRailTab(newTab);
    if (typeof window !== 'undefined') {
      window.history.pushState({ tab: newTab, subView: demoSubView }, '', `?tab=${newTab}`);
    }
  };

  const navigateDemoSubView = (newView: DemoSubView) => {
    setDemoSubView(newView);
    if (typeof window !== 'undefined') {
      window.history.pushState({ tab: 'demo', subView: newView }, '', `?tab=demo&view=${newView}`);
    }
  };

  // Flexbox Boundaries Visibility (Default: false as requested)
  const [showFlexboxBorders, setShowFlexboxBorders] = useState(false);

  // Quick Settings State
  const [isQuickSettingsOpen, setIsQuickSettingsOpen] = useState(false);
  // Google Account Flyout State
  const [isAccountFlyoutOpen, setIsAccountFlyoutOpen] = useState(false);
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

  // Constant Polling State (Default: true, 15 seconds as requested by user)
  const [isConstantPollingEnabled, setIsConstantPollingEnabled] = useState(true);
  const [constantPollingInterval, setConstantPollingInterval] = useState(15000); // 15s by default

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

    // Constant Polling is OFF by default.
    // When disabled, no automated background interval runs; polling occurs on manual trigger.
    if (!isConstantPollingEnabled) {
      return;
    }

    const interval = setInterval(() => {
      triggerPoll();
    }, constantPollingInterval);

    return () => clearInterval(interval);
  }, [fetchStatus, triggerPoll, isConstantPollingEnabled, constantPollingInterval]);

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
      {/* ======================================================== */}
      <div
        className={`relative h-full shrink-0 flex flex-col transition-all ${
          showFlexboxBorders
            ? 'border-2 border-red-500 m-0.5 rounded-sm'
            : ''
        } ${hasWallpaper ? 'bg-white/15 backdrop-blur-md border-r border-white/15' : 'bg-[#e9eef6]'}`}
      >
        <GmailLeftRail
          activeTab={activeRailTab}
          onSelectTab={navigateTab}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          hasWallpaper={hasWallpaper}
        />
      </div>

      {/* ======================================================== */}
      {/* Right-Hand Workspace Container (Column: Box 3 top, then   */}
      {/* Box 2, Box 4, Box 5 side-by-side)                         */}
      {/* ======================================================== */}
      <div
        className={`flex-1 flex flex-col h-full overflow-hidden ${
          hasWallpaper ? 'bg-black/30 backdrop-blur-sm' : ''
        }`}
      >
        {/* ====================================================== */}
        {/* FLEXBOX 3: Top Navigation Bar                          */}
        {/* ====================================================== */}
        <div
          className={`relative shrink-0 transition-all ${
            showFlexboxBorders
              ? 'border-2 border-amber-500 m-0.5 rounded-sm'
              : ''
          } ${hasWallpaper ? 'bg-transparent' : 'bg-[#f8fafd]'}`}
        >
          <GmailTopNavbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            activeMode={activeRailTab}
            onOpenSettings={() => {
              setIsQuickSettingsOpen((prev) => !prev);
              setIsAccountFlyoutOpen(false);
            }}
            isSettingsOpen={isQuickSettingsOpen}
            onOpenAccountMenu={() => {
              setIsAccountFlyoutOpen((prev) => !prev);
              setIsQuickSettingsOpen(false);
            }}
            isAccountMenuOpen={isAccountFlyoutOpen}
            showFlexboxBorders={showFlexboxBorders}
            onToggleFlexboxBorders={() => setShowFlexboxBorders((prev) => !prev)}
            isSidebarOpen={isSidebarOpen}
            hasWallpaper={hasWallpaper}
            onNavigateLanding={onNavigateLanding}
            onNavigatePrivateApi={() => window.location.href = '/private-api'}
            userAvatarUrl={activeAccount.avatarUrl || '/infra_trace_logo.png'}
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
            navigateTab('demo');
            navigateDemoSubView('settings');
          }}
        />

        {/* Google Account Flyout Panel */}
        <GmailAccountFlyoutPanel
          isOpen={isAccountFlyoutOpen}
          onClose={() => setIsAccountFlyoutOpen(false)}
          onNavigateLanding={onNavigateLanding}
          onNavigateAccount={() => window.location.href = '/account'}
          onNavigateAddAccount={() => window.location.href = '/signup'}
          onAccountChanged={(acc) => setActiveAccountState(acc)}
        />

        {/* Body below Box 3: Horizontal flex row holding Box 2, 4, 5 */}
        <div className="flex-1 flex flex-row overflow-hidden">
          {/* ==================================================== */}
          {/* FLEXBOX 2: Left Collapsible Sidebar                  */}
          {/* ==================================================== */}
          {isSidebarOpen && (
            <div
              className={`relative h-full shrink-0 flex flex-col transition-all ${
                showFlexboxBorders
                  ? 'border-2 border-green-600 m-0.5 rounded-sm'
                  : ''
              } ${hasWallpaper ? 'bg-transparent' : 'bg-[#f8fafd]'}`}
            >
              <GmailLeftSidebar
                activeTab={activeRailTab}
                demoSubView={demoSubView}
                onSelectDemoSubView={navigateDemoSubView}
                statusFilter={statusFilter}
                onSelectStatusFilter={setStatusFilter}
                onPoll={triggerPoll}
                isPolling={isPolling}
                incidentCount={activeIncidents.length}
                healthyCount={summary.healthy}
                degradedCount={summary.degraded}
                downCount={summary.down}
                totalServicesCount={summary.total}
                hasWallpaper={hasWallpaper}
                activeMetricsCategory={activeMetricsCategory}
                onSelectMetricsCategory={(cat) => {
                  setActiveMetricsCategory(cat);
                  setActiveMetricsSuboption(null);
                }}
                activeMetricsSuboption={activeMetricsSuboption}
                onSelectMetricsSuboption={(cat, subId) => {
                  setActiveMetricsCategory(cat);
                  setActiveMetricsSuboption(subId);
                }}
                activeUserSection={activeUserSection}
                onSelectUserSection={setActiveUserSection}
              />
            </div>
          )}

          {/* ==================================================== */}
          {/* FLEXBOX 4: Central Main Content Area                 */}
          {/* ==================================================== */}
          <div
            className={`relative flex-1 h-full flex flex-col overflow-hidden transition-all ${
              showFlexboxBorders
                ? 'border-2 border-blue-600 m-0.5 rounded-sm'
                : ''
            }`}
          >
            <main
              className={`flex-1 flex flex-col rounded-2xl mr-2 mb-2 ml-1 mt-0 border transition-all overflow-hidden ${
                hasWallpaper
                  ? 'border-white/30 bg-white/85 backdrop-blur-md shadow-2xl'
                  : 'border-[#e0e2ec] bg-white shadow-sm'
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
                  onServicesUpdated={fetchStatus}
                  isConstantPollingEnabled={isConstantPollingEnabled}
                  onToggleConstantPolling={setIsConstantPollingEnabled}
                  constantPollingInterval={constantPollingInterval}
                  onChangeConstantPollingInterval={setConstantPollingInterval}
                  onSelectDemoSubView={navigateDemoSubView}
                  onSelectStatusFilter={setStatusFilter}
                  userEmail={activeAccount.email}
                />
              ) : activeRailTab === 'metrics' ? (
                <ObservatoryMetricsDomainView
                  activeCategory={activeMetricsCategory}
                  activeSuboption={activeMetricsSuboption}
                  density={density}
                  hasWallpaper={hasWallpaper}
                  searchQuery={searchQuery}
                  onSelectSuboption={setActiveMetricsSuboption}
                />
              ) : activeRailTab === 'users' ? (
                <ObservatoryUsersDatabaseView
                  activeSection={activeUserSection}
                  density={density}
                  hasWallpaper={hasWallpaper}
                />
              ) : activeRailTab === 'mail' ? (
                <GmailInboxView density={density} hasWallpaper={hasWallpaper} userEmail={activeAccount.email} />
              ) : activeRailTab === 'inspect' ? (
                <InspectView />
              ) : activeRailTab === 'delivery' ? (
                <DeliveryView />
              ) : activeRailTab === 'chat' ? (
                <div
                  className={`flex-1 flex flex-col h-full ${
                    hasWallpaper ? 'bg-transparent' : 'bg-slate-50/60'
                  } overflow-y-auto font-sans select-text w-full p-4 md:p-6 space-y-4`}
                >
                  {/* 1. Overview Metrics Bar */}
                  <section className="space-y-2.5 w-full">
                    <div className="flex items-center justify-between pb-1">
                      <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                        System Telemetry Overview
                      </h2>
                    </div>
                    <SystemOverviewMetricsBarContainer
                      total={0}
                      healthy={0}
                      degraded={0}
                      down={0}
                      activeAlerts={0}
                      onSelectIncidents={() => {
                        setActiveRailTab('demo');
                        setDemoSubView('incidents');
                      }}
                      onSelectStatusFilter={(filter) => {
                        setActiveRailTab('demo');
                        setDemoSubView('dashboard');
                        setStatusFilter(filter);
                      }}
                    />
                  </section>

                  {/* 2. Interactive Chaos Injection Panel (Box A) & Outage Notifications (Box B) Side-by-Side */}
                  <section className="w-full flex flex-col md:flex-row gap-4">
                    {/* Box A: Chaos Injection Panel (Console Standalone) */}
                    <div className="w-full md:w-80 lg:w-96 shrink-0">
                      <ChaosTestingControlPanelContainer onChaosTriggered={() => {}} />
                    </div>

                    {/* Box B: Outage Notifications (Console has zero active outages since no endpoints configured) */}
                    <div className="flex-1 flex flex-col justify-between bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs">
                      <div>
                        {/* Header with Title and Severity Legend */}
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <h3 className="font-sans font-bold text-sm text-slate-900 tracking-tight">
                              Outage Notifications
                            </h3>
                          </div>

                          <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-amber-500" />
                              <span>Warning</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-rose-500" />
                              <span>Critical</span>
                            </div>
                          </div>
                        </div>

                        {/* Active Outages List */}
                        <div className="mt-2.5 space-y-2">
                          <div className="py-6 text-center text-xs text-slate-500 font-medium">
                            Zero active outages &mdash; all monitored endpoints operating normally.
                          </div>
                        </div>
                      </div>

                      {/* Footer link: more */}
                      <div className="pt-2 border-t border-slate-100 flex justify-end">
                        <button
                          onClick={() => {
                            setActiveRailTab('demo');
                            setDemoSubView('incidents');
                          }}
                          className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                        >
                          more
                        </button>
                      </div>
                    </div>
                  </section>

                  {/* Rest of the screen is kept empty, no extra boxes */}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-[#5e5e5e] space-y-4">
                  <div className="w-16 h-16 rounded-full bg-[#eaf1fb] flex items-center justify-center text-[#0b57d0]">
                    <Video className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-[#1f1f1f]">Google Meet</h3>
                  <p className="max-w-md text-sm text-[#444746]">
                    Real-time video meetings and war room collaboration for live outages.
                  </p>
                </div>
              )}
            </main>
          </div>

          {/* ==================================================== */}
          {/* FLEXBOX 5: Far-Right Companion Rail                  */}
          {/* ==================================================== */}
          <div
            className={`relative h-full shrink-0 flex flex-col transition-all ${
              showFlexboxBorders
                ? 'border-2 border-purple-600 m-0.5 rounded-sm'
                : ''
            } ${hasWallpaper ? 'bg-transparent' : 'bg-[#f8fafd]'}`}
          >
            <GmailRightRail hasWallpaper={hasWallpaper} />
          </div>
        </div>
      </div>
    </div>
  );
}
