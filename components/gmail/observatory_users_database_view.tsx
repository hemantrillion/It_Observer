'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Globe,
  Key,
  FileText,
  Search,
  CheckCircle2,
  Lock,
  ShieldCheck,
  BarChart2,
  Send,
  ScanSearch,
} from 'lucide-react';
import { UserSection } from './gmail_left_sidebar';
import { getActiveAccount, DEFAULT_ADMIN_EMAIL } from '@/lib/auth/accounts_manager';
import rawCatalog from '@/lib/catalog/excel_metrics_catalog.json';

interface ObservatoryUsersDatabaseViewProps {
  activeSection?: UserSection;
  density?: 'default' | 'comfortable' | 'compact';
  hasWallpaper?: boolean;
  isSuperAdmin?: boolean;
}

export const PERMISSION_CODES = [
  {
    code: 'VT1',
    name: 'View Telemetry',
    description: 'Dashboards, gauge metrics, service latency curves & health status.',
  },
  {
    code: 'EM1',
    name: 'Edit Metrics',
    description: 'Configure scrape intervals, update target endpoints & thresholds.',
  },
  {
    code: 'PA1',
    name: 'Private API',
    description: 'Create and run private API endpoint monitoring suites.',
  },
  {
    code: 'CI1',
    name: 'Chaos & Incidents',
    description: 'Inject latency, 500 error faults & manage incident alerts.',
  },
  {
    code: 'UM1',
    name: 'User Management',
    description: 'Access user directory, change roles and permissions.',
  },
  {
    code: 'SC1',
    name: 'System Config',
    description: 'Database logs, SQLite internals and WAL execution.',
  },
];

const METRICS_CATEGORIES_LIST = [
  'Cloud',
  'Containers',
  'Frontend',
  'Infrastructure',
  'Kubernetes',
  'Process',
  'Runtime',
  'Service',
  'Synthetic',
  'Billing',
  'Database',
  'Security',
  'Queues',
  'Reliability & Alerts',
];

export function ObservatoryUsersDatabaseView({
  activeSection = 'accounts',
  isSuperAdmin = false,
}: ObservatoryUsersDatabaseViewProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [userWebsites, setUserWebsites] = useState<any[]>([]);
  const [rolesMatrix, setRolesMatrix] = useState<any[]>([]);
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [filterQuery, setFilterQuery] = useState('');
  const [activeAccountEmail, setActiveAccountEmail] = useState('');
  const [updatingUserEmail, setUpdatingUserEmail] = useState<string | null>(null);
  const [statusNotification, setStatusNotification] = useState<string | null>(null);

  // Visibility Configuration State
  const [selectedRoleForVisibility, setSelectedRoleForVisibility] = useState<'Normal User' | 'Admin' | 'Super Admin'>('Normal User');
  const [visibilityConfigs, setVisibilityConfigs] = useState<Record<string, any>>({});
  const [isSavingVisibility, setIsSavingVisibility] = useState(false);
  const [activeGraphCategory, setActiveGraphCategory] = useState<string>('Cloud');
  const [graphFilterQuery, setGraphFilterQuery] = useState<string>('');

  const loadUserData = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data.success) {
        setUsers(data.users || []);
        setUserWebsites(data.userWebsites || []);
        setRolesMatrix(data.rolesMatrix || []);
        setApiKeys(data.apiKeys || []);
        setAuditLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Failed to load user directory data:', err);
    }
  };

  const loadVisibilityConfigs = async () => {
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

  useEffect(() => {
    const current = getActiveAccount();
    setActiveAccountEmail(current.email);
    loadUserData();
    loadVisibilityConfigs();
  }, []);

  const handleUpdateRole = async (targetEmail: string, newRole: string) => {
    setUpdatingUserEmail(targetEmail);
    const newPerms = (newRole === 'Super Admin' || newRole === 'Admin')
      ? ['VT1', 'EM1', 'PA1', 'CI1', 'UM1', 'SC1']
      : ['VT1'];

    try {
      const res = await fetch('/api/users/role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetEmail,
          newRole,
          permissions: newPerms,
          adminEmail: activeAccountEmail || DEFAULT_ADMIN_EMAIL,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusNotification(`Role for ${targetEmail} updated to ${newRole}`);
        await loadUserData();
      } else {
        setStatusNotification(`Failed: ${data.error}`);
      }
    } catch (err: any) {
      setStatusNotification(`Error: ${err.message}`);
    } finally {
      setUpdatingUserEmail(null);
      setTimeout(() => setStatusNotification(null), 3500);
    }
  };

  const handleToggleA1Tab = async (tabId: string) => {
    // Invariant: Super Admin can NEVER remove 'users' tab!
    if (selectedRoleForVisibility === 'Super Admin' && tabId === 'users') {
      return;
    }
    const currentRoleCfg = visibilityConfigs[selectedRoleForVisibility] || {
      a1_tabs: ['chat', 'mail', 'metrics', 'inspect', 'delivery'],
      a2_elements: {},
    };
    const currentA1: string[] = currentRoleCfg.a1_tabs || [];
    let updatedA1: string[];
    if (currentA1.includes(tabId)) {
      updatedA1 = currentA1.filter((t) => t !== tabId);
    } else {
      updatedA1 = [...currentA1, tabId];
    }

    const updatedCfg = {
      role: selectedRoleForVisibility,
      a1_tabs: updatedA1,
      a2_elements: currentRoleCfg.a2_elements || {},
    };

    setVisibilityConfigs((prev) => ({
      ...prev,
      [selectedRoleForVisibility]: {
        ...currentRoleCfg,
        a1_tabs: updatedA1,
      },
    }));

    try {
      setIsSavingVisibility(true);
      const res = await fetch('/api/visibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCfg),
      });
      const data = await res.json();
      if (data.success) {
        setVisibilityConfigs(data.configs);
        window.dispatchEvent(new Event('infratrace_visibility_updated'));
      }
    } catch (err) {
      console.error('Failed to save visibility config:', err);
    } finally {
      setIsSavingVisibility(false);
    }
  };

  const handleToggleA2Element = async (category: string, elemId: string) => {
    // Invariant: Super Admin can NEVER remove 'visibility' under 'users'!
    if (selectedRoleForVisibility === 'Super Admin' && category === 'users' && elemId === 'visibility') {
      return;
    }
    // Invariant: Non-Super Admin can NEVER have 'visibility'!
    if (selectedRoleForVisibility !== 'Super Admin' && category === 'users' && elemId === 'visibility') {
      return;
    }
    const currentRoleCfg = visibilityConfigs[selectedRoleForVisibility] || {
      a1_tabs: ['chat', 'mail', 'metrics', 'inspect', 'delivery'],
      a2_elements: {},
    };
    const currentCatList: string[] = currentRoleCfg.a2_elements?.[category] || [];
    let updatedCatList: string[];
    if (currentCatList.includes(elemId)) {
      updatedCatList = currentCatList.filter((e) => e !== elemId);
    } else {
      updatedCatList = [...currentCatList, elemId];
    }

    const updatedA2 = {
      ...(currentRoleCfg.a2_elements || {}),
      [category]: updatedCatList,
    };

    const updatedCfg = {
      role: selectedRoleForVisibility,
      a1_tabs: currentRoleCfg.a1_tabs || [],
      a2_elements: updatedA2,
    };

    setVisibilityConfigs((prev) => ({
      ...prev,
      [selectedRoleForVisibility]: {
        ...currentRoleCfg,
        a2_elements: updatedA2,
      },
    }));

    try {
      setIsSavingVisibility(true);
      const res = await fetch('/api/visibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCfg),
      });
      const data = await res.json();
      if (data.success) {
        setVisibilityConfigs(data.configs);
        window.dispatchEvent(new Event('infratrace_visibility_updated'));
      }
    } catch (err) {
      console.error('Failed to save visibility config:', err);
    } finally {
      setIsSavingVisibility(false);
    }
  };

  // Toggle single graph visibility in disabled_graphs
  const handleToggleGraph = async (metricName: string) => {
    const currentRoleCfg = visibilityConfigs[selectedRoleForVisibility] || {
      a1_tabs: ['chat', 'mail', 'metrics', 'inspect', 'delivery'],
      a2_elements: {},
    };

    const currentDisabled: string[] = currentRoleCfg.a2_elements?.disabled_graphs || [];
    let updatedDisabled: string[];
    if (currentDisabled.includes(metricName)) {
      updatedDisabled = currentDisabled.filter((g) => g !== metricName);
    } else {
      updatedDisabled = [...currentDisabled, metricName];
    }

    const updatedA2 = {
      ...(currentRoleCfg.a2_elements || {}),
      disabled_graphs: updatedDisabled,
    };

    const updatedCfg = {
      role: selectedRoleForVisibility,
      a1_tabs: currentRoleCfg.a1_tabs || [],
      a2_elements: updatedA2,
    };

    setVisibilityConfigs((prev) => ({
      ...prev,
      [selectedRoleForVisibility]: {
        ...currentRoleCfg,
        a2_elements: updatedA2,
      },
    }));

    try {
      setIsSavingVisibility(true);
      const res = await fetch('/api/visibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCfg),
      });
      const data = await res.json();
      if (data.success) {
        setVisibilityConfigs(data.configs);
        window.dispatchEvent(new Event('infratrace_visibility_updated'));
      }
    } catch (err) {
      console.error('Failed to save graph visibility:', err);
    } finally {
      setIsSavingVisibility(false);
    }
  };

  // Bulk enable / disable all graphs in a category
  const handleBulkToggleGraphsInCategory = async (category: string, enableAll: boolean) => {
    const categoryMetrics = (rawCatalog as Record<string, any[]>)[category] || [];
    const metricNames = categoryMetrics.map((m) => m.metric);

    const currentRoleCfg = visibilityConfigs[selectedRoleForVisibility] || {
      a1_tabs: ['chat', 'mail', 'metrics', 'inspect', 'delivery'],
      a2_elements: {},
    };

    const currentDisabled: string[] = currentRoleCfg.a2_elements?.disabled_graphs || [];
    let updatedDisabled: string[];

    if (enableAll) {
      updatedDisabled = currentDisabled.filter((g) => !metricNames.includes(g));
    } else {
      const set = new Set(currentDisabled);
      metricNames.forEach((n) => set.add(n));
      updatedDisabled = Array.from(set);
    }

    const updatedA2 = {
      ...(currentRoleCfg.a2_elements || {}),
      disabled_graphs: updatedDisabled,
    };

    const updatedCfg = {
      role: selectedRoleForVisibility,
      a1_tabs: currentRoleCfg.a1_tabs || [],
      a2_elements: updatedA2,
    };

    setVisibilityConfigs((prev) => ({
      ...prev,
      [selectedRoleForVisibility]: {
        ...currentRoleCfg,
        a2_elements: updatedA2,
      },
    }));

    try {
      setIsSavingVisibility(true);
      const res = await fetch('/api/visibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCfg),
      });
      const data = await res.json();
      if (data.success) {
        setVisibilityConfigs(data.configs);
        window.dispatchEvent(new Event('infratrace_visibility_updated'));
      }
    } catch (err) {
      console.error('Failed to save bulk graph visibility:', err);
    } finally {
      setIsSavingVisibility(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = filterQuery.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q) ||
      u.company?.toLowerCase().includes(q)
    );
  });

  const filteredWebsites = userWebsites.filter((w) => {
    const q = filterQuery.toLowerCase();
    return (
      w.endpointName?.toLowerCase().includes(q) ||
      w.endpointUrl?.toLowerCase().includes(q) ||
      w.userName?.toLowerCase().includes(q) ||
      w.userEmail?.toLowerCase().includes(q)
    );
  });

  const filteredLogs = auditLogs.filter((l) => {
    const q = filterQuery.toLowerCase();
    return (
      l.operation?.toLowerCase().includes(q) ||
      l.table_name?.toLowerCase().includes(q) ||
      l.query_details?.toLowerCase().includes(q)
    );
  });

  // Current category graphs list
  const currentCategoryMetrics = useMemo(() => {
    return (rawCatalog as Record<string, any[]>)[activeGraphCategory] || [];
  }, [activeGraphCategory]);

  const filteredCategoryMetrics = useMemo(() => {
    const q = graphFilterQuery.trim().toLowerCase();
    if (!q) return currentCategoryMetrics;
    return currentCategoryMetrics.filter(
      (m) =>
        m.metric.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.parent_path.toLowerCase().includes(q)
    );
  }, [currentCategoryMetrics, graphFilterQuery]);

  const disabledGraphsForRole: string[] = useMemo(() => {
    return visibilityConfigs[selectedRoleForVisibility]?.a2_elements?.disabled_graphs || [];
  }, [visibilityConfigs, selectedRoleForVisibility]);

  const activeGraphsCountInCategory = useMemo(() => {
    return currentCategoryMetrics.filter((m) => !disabledGraphsForRole.includes(m.metric)).length;
  }, [currentCategoryMetrics, disabledGraphsForRole]);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafd] overflow-hidden select-none font-sans">
      {/* Toast Notification */}
      {statusNotification && (
        <div className="absolute top-4 right-6 z-50 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-medium shadow-xl border border-slate-700 animate-in fade-in slide-in-from-top-2">
          {statusNotification}
        </div>
      )}

      {/* 1. TOP HEADER (Simple Title, No Refresh Button, No Subtitle Description) */}
      <div className="p-5 sm:p-6 pb-4 border-b border-slate-200/80 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {activeSection === 'accounts' && 'User Accounts'}
            {activeSection === 'permissions' && 'Permissions'}
            {activeSection === 'visibility' && 'Visibility Configuration'}
            {activeSection === 'websites' && 'Monitored Websites'}
            {activeSection === 'roles' && 'Roles'}
            {activeSection === 'apikeys' && 'API Keys'}
            {activeSection === 'audit' && 'Audit Logs'}
          </h2>
        </div>

        {/* Search Bar for directory */}
        {activeSection !== 'visibility' && (
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Search records..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 text-slate-900"
            />
          </div>
        )}
      </div>

      {/* 2. SECTION CONTENT */}
      <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
        {/* ======================================================== */}
        {/* SECTION: VISIBILITY CONFIGURATION (SUPER ADMIN ONLY)     */}
        {/* ======================================================== */}
        {activeSection === 'visibility' && (
          !isSuperAdmin ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
              <Lock className="w-12 h-12 text-slate-400 mb-3" />
              <h3 className="text-base font-bold text-slate-800">Super Admin Privileges Required</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Only platform Super Administrators have access to configure role-based UI visibility.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Role Selector Tabs */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                    Role Visibility Configuration
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Select a role to configure which Rail tabs (Box a1), Sidebar elements (Box a2), and Telemetry Graphs are visible.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
                  {(['Normal User', 'Admin', 'Super Admin'] as const).map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setSelectedRoleForVisibility(role)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        selectedRoleForVisibility === role
                          ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              {/* Box a1: Rail Tabs */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                      Box a1 &mdash; Far-Left Rail Tabs
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Toggle navigation icons visible in the rail for <span className="font-semibold text-slate-800">{selectedRoleForVisibility}</span>.
                    </p>
                  </div>
                  {isSavingVisibility && (
                    <span className="text-[11px] font-semibold text-slate-500 animate-pulse">
                      Updating...
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { id: 'chat', label: 'Console', desc: 'Primary telemetry cockpit and chaos control' },
                    { id: 'mail', label: 'Mail', desc: 'System alerts and mailbox communication' },
                    { id: 'metrics', label: 'Metrics', desc: 'Domain-level Prometheus charts and analytics' },
                    { id: 'inspect', label: 'Inspect', desc: 'Deep query telemetry and packet inspection' },
                    { id: 'delivery', label: 'Delivery', desc: 'Ingestion pipelines and webhook delivery status' },
                    { id: 'users', label: 'Users', desc: 'User accounts directory, permissions, and roles' },
                  ].map((tab) => {
                    const isLocked = selectedRoleForVisibility === 'Super Admin' && tab.id === 'users';
                    const currentCfg = visibilityConfigs[selectedRoleForVisibility];
                    const isChecked = isLocked
                      ? true
                      : currentCfg?.a1_tabs
                      ? currentCfg.a1_tabs.includes(tab.id)
                      : (selectedRoleForVisibility === 'Normal User' ? tab.id !== 'users' : true);

                    return (
                      <label
                        key={tab.id}
                        className={`p-3.5 rounded-xl border flex items-start gap-3 transition-colors ${
                          isLocked
                            ? 'bg-slate-100/90 border-slate-300 cursor-not-allowed select-none'
                            : isChecked
                            ? 'bg-slate-50/80 border-slate-300 cursor-pointer'
                            : 'bg-white border-slate-200 opacity-60 hover:opacity-100 cursor-pointer'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={isLocked}
                          onChange={() => !isLocked && handleToggleA1Tab(tab.id)}
                          className={`mt-0.5 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400 ${
                            isLocked ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'
                          }`}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-slate-900 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <span>{tab.label}</span>
                              <span className="text-[10px] text-slate-400 font-normal">[{tab.id}]</span>
                            </div>
                            {isLocked && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-600 bg-slate-200 px-1.5 py-0.5 rounded border border-slate-300">
                                <Lock className="w-2.5 h-2.5 text-slate-500" />
                                <span>Locked</span>
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                            {tab.desc}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Box a2: Sidebar Elements */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-6">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                    Box a2 &mdash; Left Sidebar Navigation Elements
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Toggle individual section options displayed inside the sidebar for <span className="font-semibold text-slate-800">{selectedRoleForVisibility}</span>.
                  </p>
                </div>

                {/* Sub-group 1: Users Sidebar */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    <span>Users Mode Navigation</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {[
                      { id: 'accounts', label: 'User Accounts' },
                      { id: 'permissions', label: 'Permissions' },
                      ...(selectedRoleForVisibility === 'Super Admin'
                        ? [{ id: 'visibility', label: 'Visibility' }]
                        : []),
                      { id: 'websites', label: 'Monitored Websites' },
                      { id: 'roles', label: 'Roles Matrix' },
                      { id: 'apikeys', label: 'API Keys' },
                      { id: 'audit', label: 'Audit Logs' },
                    ].map((elem) => {
                      const isLocked = selectedRoleForVisibility === 'Super Admin' && elem.id === 'visibility';
                      const currentCfg = visibilityConfigs[selectedRoleForVisibility];
                      const isChecked = isLocked
                        ? true
                        : currentCfg?.a2_elements?.users
                        ? currentCfg.a2_elements.users.includes(elem.id)
                        : (selectedRoleForVisibility !== 'Normal User');

                      return (
                        <label
                          key={elem.id}
                          className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                            isLocked
                              ? 'bg-slate-100/90 border-slate-300 cursor-not-allowed select-none'
                              : isChecked
                              ? 'bg-slate-50/80 border-slate-300 cursor-pointer'
                              : 'bg-white border-slate-200 opacity-60 hover:opacity-100 cursor-pointer'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              disabled={isLocked}
                              onChange={() => !isLocked && handleToggleA2Element('users', elem.id)}
                              className={`h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400 ${
                                isLocked ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'
                              }`}
                            />
                            <span className="text-xs font-semibold text-slate-800 truncate">{elem.label}</span>
                          </div>
                          {isLocked && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-600 bg-slate-200 px-1.5 py-0.5 rounded border border-slate-300 shrink-0">
                              <Lock className="w-2.5 h-2.5 text-slate-500" />
                              <span>Locked</span>
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Sub-group 2: Inspect Sidebar */}
                <div className="space-y-2.5 pt-3 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                    <ScanSearch className="w-3.5 h-3.5 text-slate-500" />
                    <span>Inspect Mode Navigation</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {[
                      { id: 'traces', label: 'Deep Traces' },
                      { id: 'probes', label: 'Synthetic Probes' },
                      { id: 'latency', label: 'Latency Diagnostics' },
                      { id: 'audits', label: 'Inspection Audits' },
                      { id: 'payload', label: 'Raw Payload Trace' },
                    ].map((elem) => {
                      const currentCfg = visibilityConfigs[selectedRoleForVisibility];
                      const isChecked = currentCfg?.a2_elements?.inspect
                        ? currentCfg.a2_elements.inspect.includes(elem.id)
                        : true;

                      return (
                        <label
                          key={elem.id}
                          className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-colors ${
                            isChecked
                              ? 'bg-slate-50/80 border-slate-300'
                              : 'bg-white border-slate-200 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleA2Element('inspect', elem.id)}
                            className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400 cursor-pointer"
                          />
                          <span className="text-xs font-semibold text-slate-800">{elem.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Sub-group 3: Delivery Sidebar */}
                <div className="space-y-2.5 pt-3 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                    <Send className="w-3.5 h-3.5 text-slate-500" />
                    <span>Delivery Mode Navigation</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {[
                      { id: 'pipelines', label: 'Notification Pipelines' },
                      { id: 'rules', label: 'Alert Routing Rules' },
                      { id: 'channels', label: 'Delivery Channels' },
                      { id: 'sla', label: 'SLA Delivery Status' },
                      { id: 'dlq', label: 'Dead Letter Queue' },
                    ].map((elem) => {
                      const currentCfg = visibilityConfigs[selectedRoleForVisibility];
                      const isChecked = currentCfg?.a2_elements?.delivery
                        ? currentCfg.a2_elements.delivery.includes(elem.id)
                        : true;

                      return (
                        <label
                          key={elem.id}
                          className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-colors ${
                            isChecked
                              ? 'bg-slate-50/80 border-slate-300'
                              : 'bg-white border-slate-200 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleA2Element('delivery', elem.id)}
                            className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400 cursor-pointer"
                          />
                          <span className="text-xs font-semibold text-slate-800">{elem.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Sub-group 4: Metrics Sidebar Categories */}
                <div className="space-y-2.5 pt-3 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                    <BarChart2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Metrics Sidebar Categories (Box a2)</span>
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                    {METRICS_CATEGORIES_LIST.map((catName) => {
                      const currentCfg = visibilityConfigs[selectedRoleForVisibility];
                      const isChecked = currentCfg?.a2_elements?.metrics
                        ? currentCfg.a2_elements.metrics.includes(catName)
                        : true;

                      return (
                        <label
                          key={catName}
                          className={`p-2.5 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-colors ${
                            isChecked
                              ? 'bg-slate-50/80 border-slate-300'
                              : 'bg-white border-slate-200 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleA2Element('metrics', catName)}
                            className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400 cursor-pointer"
                          />
                          <span className="text-xs font-semibold text-slate-800 truncate">{catName}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Sub-group 5: Console Sidebar */}
                <div className="space-y-2.5 pt-3 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Console Mode Navigation
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {[
                      { id: 'dashboard', label: 'Dashboard' },
                      { id: 'incidents', label: 'Incidents' },
                      { id: 'settings', label: 'Settings' },
                    ].map((elem) => {
                      const currentCfg = visibilityConfigs[selectedRoleForVisibility];
                      const isChecked = currentCfg?.a2_elements?.console
                        ? currentCfg.a2_elements.console.includes(elem.id)
                        : true;

                      return (
                        <label
                          key={elem.id}
                          className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-colors ${
                            isChecked
                              ? 'bg-slate-50/80 border-slate-300'
                              : 'bg-white border-slate-200 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleA2Element('console', elem.id)}
                            className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400 cursor-pointer"
                          />
                          <span className="text-xs font-semibold text-slate-800">{elem.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Sub-group 6: Mail Sidebar */}
                <div className="space-y-2.5 pt-3 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Mail Mode Navigation
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                    {[
                      { id: 'inbox', label: 'Inbox' },
                      { id: 'starred', label: 'Starred' },
                      { id: 'snoozed', label: 'Snoozed' },
                      { id: 'sent', label: 'Sent' },
                      { id: 'drafts', label: 'Drafts' },
                    ].map((elem) => {
                      const currentCfg = visibilityConfigs[selectedRoleForVisibility];
                      const isChecked = currentCfg?.a2_elements?.mail
                        ? currentCfg.a2_elements.mail.includes(elem.id)
                        : true;

                      return (
                        <label
                          key={elem.id}
                          className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-colors ${
                            isChecked
                              ? 'bg-slate-50/80 border-slate-300'
                              : 'bg-white border-slate-200 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleA2Element('mail', elem.id)}
                            className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400 cursor-pointer"
                          />
                          <span className="text-xs font-semibold text-slate-800">{elem.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Box 3: Metrics Telemetry Graphs Visibility Manager (FOR EACH GRAPH!) */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                      <BarChart2 className="w-4 h-4 text-slate-700" />
                      <span>Telemetry Graphs Visibility &mdash; Individual Graph Scopes</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Toggle specific metrics graphs on or off for <span className="font-semibold text-slate-800">{selectedRoleForVisibility}</span>. Graphs turned off will not appear in the dashboard.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleBulkToggleGraphsInCategory(activeGraphCategory, true)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 transition-colors cursor-pointer"
                    >
                      Enable All in Category
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBulkToggleGraphsInCategory(activeGraphCategory, false)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 transition-colors cursor-pointer"
                    >
                      Disable All in Category
                    </button>
                  </div>
                </div>

                {/* Category Selector Tabs for Graphs */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {METRICS_CATEGORIES_LIST.map((cat) => {
                    const isSelected = activeGraphCategory === cat;
                    const count = (rawCatalog as Record<string, any[]>)[cat]?.length || 0;

                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setActiveGraphCategory(cat);
                          setGraphFilterQuery('');
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 hover:text-slate-900'
                        }`}
                      >
                        {cat} ({count})
                      </button>
                    );
                  })}
                </div>

                {/* Graph Search Bar & Status Counter */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={graphFilterQuery}
                      onChange={(e) => setGraphFilterQuery(e.target.value)}
                      placeholder={`Search graphs in ${activeGraphCategory}...`}
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 text-slate-900"
                    />
                  </div>

                  <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 shrink-0">
                    {activeGraphsCountInCategory} of {currentCategoryMetrics.length} graphs visible
                  </span>
                </div>

                {/* Grid of Individual Graphs */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[480px] overflow-y-auto pr-1">
                  {filteredCategoryMetrics.map((m: any, idx: number) => {
                    const isGraphDisabled = disabledGraphsForRole.includes(m.metric);
                    const isChecked = !isGraphDisabled;

                    return (
                      <label
                        key={idx}
                        className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-slate-50/80 border-slate-300'
                            : 'bg-white border-slate-200 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleGraph(m.metric)}
                          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400 cursor-pointer"
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 truncate">
                            {m.metric}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate mt-0.5">
                            {m.parent_path}
                          </div>
                          {m.description && (
                            <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 leading-tight">
                              {m.description}
                            </div>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          )
        )}

        {/* ======================================================== */}
        {/* SECTION: PERMISSIONS                                     */}
        {/* ======================================================== */}
        {activeSection === 'permissions' && (
          <div className="space-y-5">
            {/* Block 1: Permissions */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-3.5">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Permissions
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {PERMISSION_CODES.map((perm) => (
                  <div
                    key={perm.code}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3"
                  >
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-200 text-slate-800 border border-slate-300 shrink-0">
                      {perm.code}
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-900">{perm.name}</div>
                      <div className="text-[11px] text-slate-500 leading-tight mt-0.5">{perm.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Block 2: Roles */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-3.5">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Roles
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Super Admin</span>
                    <span className="text-[11px] text-slate-500">Full Access & Visibility</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {['VT1', 'EM1', 'PA1', 'CI1', 'UM1', 'SC1'].map((code) => (
                      <span key={code} className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-200 text-slate-800 border border-slate-300">
                        {code}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Admin</span>
                    <span className="text-[11px] text-slate-500">Full System Access</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {['VT1', 'EM1', 'PA1', 'CI1', 'UM1', 'SC1'].map((code) => (
                      <span key={code} className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-200 text-slate-800 border border-slate-300">
                        {code}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Normal User</span>
                    <span className="text-[11px] text-slate-500">Standard View Access</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {['VT1'].map((code) => (
                      <span key={code} className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-200 text-slate-800 border border-slate-300">
                        {code}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Block 3: User Permissions Table */}
            <div className="border border-slate-200/90 rounded-2xl overflow-hidden bg-white shadow-2xs">
              <div className="p-4 border-b border-slate-200 bg-slate-50">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  User Permissions
                </h3>
              </div>

              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[11px] tracking-wider">
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-10 text-center text-slate-500">
                        No registered users found.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const isDefaultSuperAdmin = u.email.toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase();
                      const isActive = u.email.toLowerCase() === activeAccountEmail.toLowerCase();
                      const lastOperated = u.last_active_at
                        ? new Date(u.last_active_at).toLocaleDateString()
                        : (u.created_at ? new Date(u.created_at).toLocaleDateString() : 'Active');

                      return (
                        <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                                <img
                                  src={u.avatar_url || '/infra_trace_logo.png'}
                                  alt={u.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="min-w-0">
                                <span className="font-semibold text-slate-900 block truncate">{u.name}</span>
                                <span className="text-[11px] text-slate-500 block truncate">{u.email}</span>
                              </div>
                            </div>
                          </td>

                          {/* Role selector dropdown */}
                          <td className="py-3 px-4">
                            {isDefaultSuperAdmin ? (
                              <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-300">
                                Super Admin
                              </span>
                            ) : (
                              <select
                                value={u.role || 'Normal User'}
                                disabled={updatingUserEmail === u.email}
                                onChange={(e) => handleUpdateRole(u.email, e.target.value)}
                                className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer"
                              >
                                <option value="Normal User">Normal User</option>
                                <option value="Admin">Admin</option>
                                <option value="Super Admin">Super Admin</option>
                              </select>
                            )}
                          </td>

                          {/* Status: Active or last operated date */}
                          <td className="py-3 px-4 text-right">
                            {isActive ? (
                              <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-300">
                                Active
                              </span>
                            ) : (
                              <span className="text-slate-500 text-xs">
                                {lastOperated}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* SECTION: ALL USER ACCOUNTS                               */}
        {/* ======================================================== */}
        {activeSection === 'accounts' && (
          <div className="border border-slate-200/90 rounded-2xl overflow-hidden bg-white shadow-2xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[11px] tracking-wider">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email Address</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Company / Job Title</th>
                  <th className="py-3 px-4 text-center">Private Suites</th>
                  <th className="py-3 px-4">Registered Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      No user accounts match your search filter.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const roleLabel = u.role || 'Normal User';

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                              <img src={u.avatar_url || '/infra_trace_logo.png'} alt={u.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="min-w-0">
                              <span className="font-semibold text-slate-900 block truncate">{u.name}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-slate-700">{u.email}</td>

                        <td className="py-3 px-4">
                          <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-300">
                            {roleLabel}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-slate-600">
                          <div>{u.company || 'InfraTrace Internal'}</div>
                          <div className="text-[10px] text-slate-400">{u.job_title || 'Observability Lead'}</div>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-800">
                            {u.suitesCount || 0} suite{u.suitesCount === 1 ? '' : 's'}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-slate-500 text-xs">
                          {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'Active'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ======================================================== */}
        {/* SECTION: MONITORED WEBSITES & ENDPOINTS                  */}
        {/* ======================================================== */}
        {activeSection === 'websites' && (
          <div className="border border-slate-200/90 rounded-2xl overflow-hidden bg-white shadow-2xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[11px] tracking-wider">
                  <th className="py-3 px-4">Endpoint / Metric Name</th>
                  <th className="py-3 px-4">Target URL</th>
                  <th className="py-3 px-4">Owner Account</th>
                  <th className="py-3 px-4">Test Suite</th>
                  <th className="py-3 px-4">Region / CSP</th>
                  <th className="py-3 px-4 text-center">Interval</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredWebsites.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      No custom websites or private endpoints found. Create a Private API Suite to add monitored targets.
                    </td>
                  </tr>
                ) : (
                  filteredWebsites.map((w, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">{w.endpointName}</td>
                      <td className="py-3 px-4 text-slate-600 truncate max-w-xs">{w.endpointUrl}</td>
                      <td className="py-3 px-4 text-slate-700">
                        <div className="font-semibold">{w.userName}</div>
                        <div className="text-[10px] text-slate-400">{w.userEmail}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{w.suiteName}</td>
                      <td className="py-3 px-4 text-slate-600">{w.region}</td>
                      <td className="py-3 px-4 text-center text-slate-700">{w.intervalSeconds}s</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-300">
                          <CheckCircle2 className="w-3 h-3 text-slate-600" />
                          <span>HEALTHY</span>
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ======================================================== */}
        {/* SECTION: ROLES MATRIX                                    */}
        {/* ======================================================== */}
        {activeSection === 'roles' && (
          <div className="border border-slate-200/90 rounded-2xl overflow-hidden bg-white shadow-2xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[11px] tracking-wider">
                  <th className="py-3 px-4">Role Name</th>
                  <th className="py-3 px-4">Access Level</th>
                  <th className="py-3 px-4">Permission Scope</th>
                  <th className="py-3 px-4 text-center">Assigned Users</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rolesMatrix.map((r) => (
                  <tr key={r.name} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {r.name}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700">{r.accessLevel}</td>
                    <td className="py-3 px-4 text-slate-600 leading-relaxed">{r.permissions}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-300">
                        {r.assignedCount} user{r.assignedCount === 1 ? '' : 's'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ======================================================== */}
        {/* SECTION: API ACCESS TOKENS                               */}
        {/* ======================================================== */}
        {activeSection === 'apikeys' && (
          <div className="border border-slate-200/90 rounded-2xl overflow-hidden bg-white shadow-2xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[11px] tracking-wider">
                  <th className="py-3 px-4">Key ID</th>
                  <th className="py-3 px-4">Assigned User</th>
                  <th className="py-3 px-4">Token Prefix</th>
                  <th className="py-3 px-4">Webhook Target</th>
                  <th className="py-3 px-4">Rate Limit</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {apiKeys.map((k) => (
                  <tr key={k.keyId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">{k.keyId}</td>
                    <td className="py-3 px-4 text-slate-700">
                      <div className="font-semibold">{k.userName}</div>
                      <div className="text-[10px] text-slate-400">{k.userEmail}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{k.tokenPrefix}</td>
                    <td className="py-3 px-4 text-slate-500 truncate max-w-xs">{k.webhookTarget}</td>
                    <td className="py-3 px-4 text-slate-600">{k.rateLimit}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-800 border border-slate-300">
                        {k.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ======================================================== */}
        {/* SECTION: AUDIT LOGS                                      */}
        {/* ======================================================== */}
        {activeSection === 'audit' && (
          <div className="border border-slate-200/90 rounded-2xl overflow-hidden bg-white shadow-2xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[11px] tracking-wider">
                  <th className="py-3 px-4">Log ID</th>
                  <th className="py-3 px-4">Operation</th>
                  <th className="py-3 px-4">Table</th>
                  <th className="py-3 px-4">Query Details</th>
                  <th className="py-3 px-4 text-center">Execution Time</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      No audit log records found.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-4 font-semibold text-slate-700">#{l.id}</td>
                      <td className="py-2.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-800 border border-slate-300">
                          {l.operation}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-800">{l.table_name}</td>
                      <td className="py-2.5 px-4 text-slate-600 truncate max-w-md">{l.query_details}</td>
                      <td className="py-2.5 px-4 text-center text-slate-500">{l.execution_time_ms} ms</td>
                      <td className="py-2.5 px-4 text-slate-400 text-[10px]">
                        {l.timestamp ? new Date(l.timestamp).toLocaleString() : 'Just now'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
