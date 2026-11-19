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
import { getActiveAccount, UserAccount, DEFAULT_TEST_USER, syncSessionFromServer, canManageUsers, isDefaultAdmin, isSuperAdmin, DEFAULT_ADMIN_EMAIL } from '@/lib/auth/accounts_manager';
import { Lock } from 'lucide-react';

interface ObservatoryGmailLayoutProps {
  onNavigateLanding?: () => void;
}

export function ObservatoryGmailLayout({ onNavigateLanding }: ObservatoryGmailLayoutProps) {
  const [activeAccount, setActiveAccountState] = useState<UserAccount>(DEFAULT_TEST_USER);
  const [activeRailTab, setActiveRailTab] = useState<RailTab>('chat');
  const [demoSubView, setDemoSubView] = useState<DemoSubView>('dashboard');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [activeMetricsCategory, setActiveMetricsCategory] = useState<MetricsCategory>('Cloud');
  const [activeMetricsSuboption, setActiveMetricsSuboption] = useState<string | null>('aws');
  const [activeUserSection, setActiveUserSection] = useState<UserSection>('accounts');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [visibilityConfigs, setVisibilityConfigs] = useState<Record<string, any>>({});

  // Dynamic role-based visibility configurations
  useEffect(() => {
    const fetchVisibilityConfigs = async () => {
      try {
        const res = await fetch('/api/visibility');
        const data = await res.json();
        if (data.success && data.configs) {
          setVisibilityConfigs(data.configs);
        }
      } catch (err) {
        console.error('Failed to load visibility configs:', err);
      }
    };

    fetchVisibilityConfigs();

    const handleVisibilityUpdate = () => {
      fetchVisibilityConfigs();
    };

    window.addEventListener('infratrace_visibility_updated', handleVisibilityUpdate);
    return () => {
      window.removeEventListener('infratrace_visibility_updated', handleVisibilityUpdate);
    };
  }, []);

  // Compute active role visibility
  const effectiveRole = isSuperAdmin(activeAccount)
    ? 'Super Admin'
    : (activeAccount.role === 'Admin' ? 'Admin' : 'Normal User');

  const currentRoleConfig = visibilityConfigs[effectiveRole];
  const allowedA1Tabs = currentRoleConfig?.a1_tabs as RailTab[] | undefined;
  const allowedA2Elements = currentRoleConfig?.a2_elements as Record<string, string[]> | undefined;

  // Browser History & Back button synchronization + Session sync
  useEffect(() => {
    const initialAccount = getActiveAccount();
    setActiveAccountState(initialAccount);

    if (typeof window !== 'undefined') {
      const isDemoUser = initialAccount?.role === 'Demo';
      if (!isDemoUser && window.location.pathname === '/demo') {
        window.history.replaceState(null, '', '/console' + window.location.search);
      }
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab') as RailTab | null;
      const viewParam = urlParams.get('view') as DemoSubView | null;
      if (tabParam) {
        if (tabParam === 'demo' && initialAccount.role !== 'Demo') {
          setActiveRailTab('chat');
        } else if (tabParam === 'users' && !canManageUsers(initialAccount)) {
          setActiveRailTab('chat');
        } else {
          setActiveRailTab(tabParam);
        }
      } else if (initialAccount.role === 'Demo') {
        setActiveRailTab('demo');
      } else {
        setActiveRailTab('chat');
      }
      if (viewParam) setDemoSubView(viewParam);
    }

    syncSessionFromServer().then((user) => {
      if (user) {
        setActiveAccountState(user);
        if (user.role === 'Demo') {
          setActiveRailTab('demo');
        } else {
          setActiveRailTab((prev) => {
            if (prev === 'demo') return 'chat';
            if (prev === 'users' && !canManageUsers(user)) return 'chat';
            return prev;
          });
          setActiveUserSection((prevSec) => {
            if (prevSec === 'visibility' && !isSuperAdmin(user)) return 'accounts';
            return prevSec;
          });
        }
      }
    });

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
    if (activeAccount.role === 'Demo' && newTab !== 'demo') return;
    if (newTab === 'demo' && activeAccount.role !== 'Demo') return;
    if (newTab === 'users' && !canManageUsers(activeAccount)) return;
    setActiveRailTab(newTab);
    if (typeof window !== 'undefined') {
      const basePath = activeAccount.role === 'Demo' ? '/demo' : '/console';
      window.history.pushState({ tab: newTab, subView: demoSubView }, '', `${basePath}?tab=${newTab}`);
    }
  };

  const navigateDemoSubView = (newView: DemoSubView) => {
    setDemoSubView(newView);
    if (typeof window !== 'undefined') {
      const basePath = activeAccount.role === 'Demo' ? '/demo' : '/console';
      const tabParam = activeAccount.role === 'Demo' ? 'demo' : 'chat';
      window.history.pushState({ tab: tabParam, subView: newView }, '', `${basePath}?tab=${tabParam}&view=${newView}`);
    }
  };

  // Mail Folder Navigation (Inbox vs Phases / Rounds)
  const [activeMailFolder, setActiveMailFolder] = useState<'inbox' | 'phases'>('inbox');

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
          userRole={activeAccount.role}
          canManageUsers={canManageUsers(activeAccount)}
          allowedA1Tabs={allowedA1Tabs}
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
              if (activeAccount.role === 'Demo') return;
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
            userAvatarUrl={activeAccount.profilePicture || activeAccount.avatarUrl || '/infra_trace_logo.png'}
            isDemoMode={activeAccount.role === 'Demo'}
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
                onSelectUserSection={(sec) => {
                  if (sec === 'visibility' && !isSuperAdmin(activeAccount)) {
                    setActiveUserSection('accounts');
                    return;
                  }
                  setActiveUserSection(sec);
                }}
                isSuperAdmin={isSuperAdmin(activeAccount)}
                allowedA2Elements={allowedA2Elements}
                activeMailFolder={activeMailFolder}
                onSelectMailFolder={setActiveMailFolder}
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
              {(activeRailTab === 'demo' || activeRailTab === 'chat') ? (
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
                  userEmail={activeAccount.email}
                  disabledGraphs={allowedA2Elements?.disabled_graphs}
                />
              ) : activeRailTab === 'users' ? (
                canManageUsers(activeAccount) ? (
                  <ObservatoryUsersDatabaseView
                    activeSection={activeUserSection}
                    density={density}
                    hasWallpaper={hasWallpaper}
                    isSuperAdmin={isSuperAdmin(activeAccount)}
                  />
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50">
                    <div className="w-16 h-16 rounded-2xl bg-rose-100 border border-rose-200 flex items-center justify-center mb-4 text-rose-600">
                      <Lock className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Access Denied: Admin Privileges Required</h3>
                    <p className="text-sm text-slate-600 max-w-md leading-relaxed mb-6">
                      Your account (<strong>{activeAccount.email}</strong>) has role <strong>{activeAccount.role || 'Normal User'}</strong> without the <code>U-MGT</code> permission. Only Administrators authorized by <strong>{DEFAULT_ADMIN_EMAIL}</strong> can manage users.
                    </p>
                    <button
                      onClick={() => navigateTab('chat')}
                      className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-colors cursor-pointer"
                    >
                      Return to Console
                    </button>
                  </div>
                )
              ) : activeRailTab === 'mail' ? (
                <GmailInboxView density={density} hasWallpaper={hasWallpaper} userEmail={activeAccount.email} activeMailFolder={activeMailFolder} onSelectMailFolder={setActiveMailFolder} />
              ) : activeRailTab === 'inspect' ? (
                <InspectView />
              ) : activeRailTab === 'delivery' ? (
                <DeliveryView />
              
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
