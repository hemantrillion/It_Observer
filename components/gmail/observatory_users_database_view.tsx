'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Database,
  Terminal,
  Table as TableIcon,
  RefreshCw,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Clock,
  HardDrive,
  Activity,
  Search,
} from 'lucide-react';

interface PlatformUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  last_active_at: string;
}

interface DatabaseQueryLog {
  id: number;
  operation: string;
  table_name: string;
  query_details: string;
  execution_time_ms: number;
  timestamp: string;
  status: string;
}

interface DatabaseStats {
  tableStats: Record<string, number>;
  dbSizeBytes: number;
  dbSizeKb: string;
  pageSize: number;
  pageCount: number;
  integrity: string;
  journalMode: string;
}

interface ObservatoryUsersDatabaseViewProps {
  density?: 'default' | 'comfortable' | 'compact';
  hasWallpaper?: boolean;
}

export function ObservatoryUsersDatabaseView({
  density = 'compact',
  hasWallpaper = false,
}: ObservatoryUsersDatabaseViewProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'logs' | 'tables'>('users');
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [logs, setLogs] = useState<DatabaseQueryLog[]>([]);
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Add User Form State
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('SRE Operator');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsersAndLogs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/users', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setUsers(data.users || []);
        setLogs(data.logs || []);
        setStats(data.stats || null);
      }
    } catch (e) {
      console.error('Failed to load users and database logs', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersAndLogs();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newUserName,
          email: newUserEmail,
          role: newUserRole,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNewUserName('');
        setNewUserEmail('');
        setIsAddUserModalOpen(false);
        await fetchUsersAndLogs();
      }
    } catch (err) {
      console.error('Failed to create user', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLogs = logs.filter(
    (l) =>
      l.operation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.table_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.query_details.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-transparent select-text">
      {/* Top Banner & Header */}
      <div className="p-4 sm:p-5 border-b border-[#e0e2ec]/60 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-[#1f1f1f] tracking-tight">
              Users & Database Explorer
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#e8f0fe] text-[#0b57d0] border border-[#0b57d0]/20">
              Live Inspection
            </span>
          </div>
          <p className="text-xs text-[#5e5e5e] mt-1 max-w-2xl">
            Directly inspect SQLite database records, platform user accounts, and query execution logs. Database tables are currently exposed to immediately verify user sessions and storage transactions.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsAddUserModalOpen(true)}
            className="px-4 py-2 rounded-full bg-[#0b57d0] hover:bg-[#0842a0] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Test User</span>
          </button>

          <button
            onClick={fetchUsersAndLogs}
            disabled={isLoading}
            className="p-2 rounded-full border border-[#c4c7c5] hover:bg-black/5 text-[#444746] transition-colors cursor-pointer disabled:opacity-60"
            title="Refresh database logs"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Database Quick Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 shrink-0 bg-[#f8fafd]/80 border-b border-[#e0e2ec]/60">
        <div className="bg-white p-3 rounded-xl border border-[#e0e2ec] shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#e8f0fe] text-[#0b57d0] flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-[#5e5e5e] uppercase">Total Users</span>
            <div className="text-base font-bold text-[#1f1f1f]">{users.length}</div>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-[#e0e2ec] shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#e6f4ea] text-[#137333] flex items-center justify-center shrink-0">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-[#5e5e5e] uppercase">DB Size on Disk</span>
            <div className="text-base font-bold text-[#1f1f1f]">
              {stats ? `${stats.dbSizeKb} KB` : 'Loading...'}
            </div>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-[#e0e2ec] shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#fef7e0] text-[#b06000] flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-[#5e5e5e] uppercase">Query Logs</span>
            <div className="text-base font-bold text-[#1f1f1f]">{logs.length} logged</div>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-[#e0e2ec] shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#f3e8fd] text-[#7627bb] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-[#5e5e5e] uppercase">SQLite WAL Mode</span>
            <div className="text-base font-bold text-[#137333] flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#137333]" />
              <span>Integrity OK</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs & Search Filter Header */}
      <div className="px-4 py-2.5 border-b border-[#e0e2ec] flex items-center justify-between shrink-0 bg-white">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'users'
                ? 'bg-[#d3e3fd] text-[#041e49]'
                : 'text-[#444746] hover:bg-black/5'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Platform Users ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'logs'
                ? 'bg-[#d3e3fd] text-[#041e49]'
                : 'text-[#444746] hover:bg-black/5'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Query Logs ({logs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('tables')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'tables'
                ? 'bg-[#d3e3fd] text-[#041e49]'
                : 'text-[#444746] hover:bg-black/5'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Database Tables</span>
          </button>
        </div>

        {/* Filter Input */}
        <div className="relative w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Filter ${activeTab}...`}
            className="w-full pl-8 pr-3 py-1 rounded-full border border-[#c4c7c5] text-xs outline-none focus:border-[#0b57d0]"
          />
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Tab 1: Platform Users Table */}
        {activeTab === 'users' && (
          <div className="border border-[#e0e2ec] rounded-xl overflow-hidden bg-white shadow-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f0f4f9] text-[#444746] text-xs font-semibold border-b border-[#e0e2ec]">
                  <th className="py-2.5 px-4">User</th>
                  <th className="py-2.5 px-4">Email</th>
                  <th className="py-2.5 px-4">Role</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Created Date</th>
                  <th className="py-2.5 px-4">User ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e0e2ec] text-xs font-medium text-[#1f1f1f]">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-[#f8fafd] transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#004d40] text-white flex items-center justify-center font-bold text-xs">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-sm">{u.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[#5e5e5e]">{u.email}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#e8f0fe] text-[#0b57d0]">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#137333]">
                        <span className="w-2 h-2 rounded-full bg-[#188038]" />
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#5e5e5e]">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-[#5e5e5e]">{u.id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Query Logs Table */}
        {activeTab === 'logs' && (
          <div className="border border-[#e0e2ec] rounded-xl overflow-hidden bg-white shadow-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f0f4f9] text-[#444746] text-xs font-semibold border-b border-[#e0e2ec]">
                  <th className="py-2.5 px-4">Op</th>
                  <th className="py-2.5 px-4">Table</th>
                  <th className="py-2.5 px-4">SQL Query Details</th>
                  <th className="py-2.5 px-4">Latency</th>
                  <th className="py-2.5 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e0e2ec] text-xs font-mono">
                {filteredLogs.map((l) => (
                  <tr key={l.id} className="hover:bg-[#f8fafd] transition-colors">
                    <td className="py-2.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          l.operation === 'INSERT'
                            ? 'bg-[#e6f4ea] text-[#137333]'
                            : l.operation === 'UPDATE'
                            ? 'bg-[#fef7e0] text-[#b06000]'
                            : 'bg-[#e8f0fe] text-[#0b57d0]'
                        }`}
                      >
                        {l.operation}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-[#1f1f1f]">{l.table_name}</td>
                    <td className="py-2.5 px-4 text-[#444746] max-w-md truncate">
                      {l.query_details}
                    </td>
                    <td className="py-2.5 px-4 text-[#137333] font-semibold">
                      {l.execution_time_ms} ms
                    </td>
                    <td className="py-2.5 px-4 text-[#5e5e5e] text-[11px]">
                      {new Date(l.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Database Tables Schema */}
        {activeTab === 'tables' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(stats.tableStats).map(([table, count]) => (
              <div
                key={table}
                className="bg-white p-4 rounded-xl border border-[#e0e2ec] shadow-xs flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#f0f4f9] text-[#0b57d0] flex items-center justify-center">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#1f1f1f] font-mono">{table}</h4>
                    <span className="text-xs text-[#5e5e5e]">Primary SQLite Storage Table</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-[#0b57d0]">{count}</span>
                  <div className="text-[11px] text-[#5e5e5e]">records</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-[#c4c7c5] p-6 space-y-4 font-sans">
            <h3 className="text-base font-bold text-[#1f1f1f]">Add User to Platform Database</h3>
            <p className="text-xs text-[#5e5e5e]">
              Creates a verified account row in SQLite and writes an entry into the query audit log.
            </p>

            <form onSubmit={handleCreateUser} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#444746] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. Jordan Smith"
                  className="w-full px-3 py-2 border border-[#c4c7c5] rounded-lg text-sm outline-none focus:border-[#0b57d0]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#444746] mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="jordan.smith@infratrace.internal"
                  className="w-full px-3 py-2 border border-[#c4c7c5] rounded-lg text-sm outline-none focus:border-[#0b57d0]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#444746] mb-1">Platform Role</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  className="w-full px-3 py-2 border border-[#c4c7c5] rounded-lg text-sm outline-none focus:border-[#0b57d0] bg-white"
                >
                  <option value="Admin">Admin</option>
                  <option value="Lead SRE">Lead SRE</option>
                  <option value="DevOps Engineer">DevOps Engineer</option>
                  <option value="Auditor">Auditor</option>
                  <option value="Viewer">Viewer</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-[#c4c7c5] text-xs font-semibold text-[#444746] hover:bg-black/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-full bg-[#0b57d0] hover:bg-[#0842a0] text-white text-xs font-semibold shadow-xs disabled:opacity-60"
                >
                  {isSubmitting ? 'Saving to DB...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
