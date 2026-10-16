'use client';

import React from 'react';
import {
  Users,
  Globe,
  ShieldCheck,
  Key,
  FileText,
  Lock,
  ExternalLink,
  Plus,
  RefreshCw,
  Info,
} from 'lucide-react';
import { UserSection } from './gmail_left_sidebar';

interface ObservatoryUsersDatabaseViewProps {
  activeSection?: UserSection;
  density?: 'default' | 'comfortable' | 'compact';
  hasWallpaper?: boolean;
}

export function ObservatoryUsersDatabaseView({
  activeSection = 'accounts',
  density = 'compact',
  hasWallpaper = false,
}: ObservatoryUsersDatabaseViewProps) {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white select-text">
      {/* ======================================================== */}
      {/* 1. SECTION HEADER (Clean, Explanatory)                  */}
      {/* ======================================================== */}
      <div className="p-5 border-b border-[#e0e2ec] shrink-0 flex items-start justify-between gap-4 bg-[#f8fafd]">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-[#1f1f1f] tracking-tight">
              {activeSection === 'accounts' && 'User Accounts Directory'}
              {activeSection === 'websites' && 'User Monitored Websites & Endpoints'}
              {activeSection === 'roles' && 'User Roles & Access Control Policy'}
              {activeSection === 'apikeys' && 'API Access Tokens & Notification Webhooks'}
              {activeSection === 'audit' && 'User Security & Session Audit Trail'}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#e8f0fe] text-[#0b57d0] border border-[#0b57d0]/20">
              Database Schema
            </span>
          </div>

          <p className="text-xs text-[#5e5e5e] mt-1.5 max-w-2xl leading-relaxed">
            {activeSection === 'accounts' &&
              'Database table storing registered platform accounts. Sign-up and account creation features are currently disabled, keeping this directory completely empty with zero dummy data.'}
            {activeSection === 'websites' &&
              'Database table storing web domains and REST API endpoints registered by users for automated synthetic ping checks, uptime logging, and SSL certificate expiration alerts.'}
            {activeSection === 'roles' &&
              'Database permissions matrix defining user access tiers across infrastructure telemetry, Prometheus query execution, and chaos injection permissions.'}
            {activeSection === 'apikeys' &&
              'Database table storing hashed API tokens and third-party webhook notification channels (Slack, Discord, PagerDuty) linked to specific platform users.'}
            {activeSection === 'audit' &&
              'Immutable audit log table tracking user authentication events, session IPs, target reconfigurations, and security operations.'}
          </p>
        </div>

        {/* Informational Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#c4c7c5] text-xs font-medium text-[#444746] shadow-xs shrink-0">
          <Info className="w-4 h-4 text-[#0b57d0]" />
          <span>Zero Dummy Records Mode</span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. SECTION CONTENT                                      */}
      {/* ======================================================== */}
      <div className="flex-1 overflow-y-auto p-5">
        {/* SECTION 1: ALL USER ACCOUNTS (CLEAN EMPTY TABLE - NO FAKE DATA) */}
        {activeSection === 'accounts' && (
          <div className="space-y-4">
            <div className="border border-[#e0e2ec] rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f0f4f9] text-[#444746] text-xs font-semibold border-b border-[#e0e2ec]">
                    <th className="py-3 px-4">User ID</th>
                    <th className="py-3 px-4">Full Name</th>
                    <th className="py-3 px-4">Email Address</th>
                    <th className="py-3 px-4">Assigned Role</th>
                    <th className="py-3 px-4">Monitored Websites</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Registered Date</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Clean Empty State */}
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-[#f0f4f9] flex items-center justify-center text-[#747775]">
                          <Users className="w-6 h-6" />
                        </div>
                        <h4 className="text-sm font-bold text-[#1f1f1f]">No Users Registered</h4>
                        <p className="text-xs text-[#5e5e5e] max-w-md">
                          Account creation is currently disabled. No dummy or sample users are loaded. Real user accounts will be populated when the authentication system is activated.
                        </p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SECTION 2: MONITORED WEBSITES (EXPLAINS USER AND THEIR SITES) */}
        {activeSection === 'websites' && (
          <div className="space-y-4">
            <div className="border border-[#e0e2ec] rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f0f4f9] text-[#444746] text-xs font-semibold border-b border-[#e0e2ec]">
                    <th className="py-3 px-4">Website URL / Endpoint</th>
                    <th className="py-3 px-4">Assigned User</th>
                    <th className="py-3 px-4">Check Protocol</th>
                    <th className="py-3 px-4">Scrape Interval</th>
                    <th className="py-3 px-4">Expected HTTP Status</th>
                    <th className="py-3 px-4">SSL Certificate Expiry</th>
                    <th className="py-3 px-4">Current Health</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Clean Empty State */}
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-[#f0f4f9] flex items-center justify-center text-[#747775]">
                          <Globe className="w-6 h-6" />
                        </div>
                        <h4 className="text-sm font-bold text-[#1f1f1f]">No Monitored Websites Registered</h4>
                        <p className="text-xs text-[#5e5e5e] max-w-md">
                          This database table maps registered users to the websites and API endpoints they want to monitor. When users configure targets, automated synthetic checks and SSL metrics will appear here.
                        </p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SECTION 3: ROLES & PERMISSIONS SCHEMA */}
        {activeSection === 'roles' && (
          <div className="space-y-4">
            <div className="border border-[#e0e2ec] rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f0f4f9] text-[#444746] text-xs font-semibold border-b border-[#e0e2ec]">
                    <th className="py-3 px-4">Role Name</th>
                    <th className="py-3 px-4">Access Level</th>
                    <th className="py-3 px-4">Permission Capabilities</th>
                    <th className="py-3 px-4">Assigned Users</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e0e2ec] text-xs font-medium text-[#1f1f1f]">
                  <tr className="hover:bg-[#f8fafd]">
                    <td className="py-3 px-4 font-bold text-[#0b57d0]">Platform Admin</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#e6f4ea] text-[#137333]">
                        Full Control
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#444746]">
                      Cluster administration, raw SQLite queries, chaos injection testing, role assignment.
                    </td>
                    <td className="py-3 px-4 font-mono text-[#5e5e5e]">0 users</td>
                  </tr>
                  <tr className="hover:bg-[#f8fafd]">
                    <td className="py-3 px-4 font-bold text-[#1f1f1f]">SRE / Operator</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#e8f0fe] text-[#0b57d0]">
                        Operational Write
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#444746]">
                      Add/edit monitored websites, trigger manual polling, acknowledge incident alerts.
                    </td>
                    <td className="py-3 px-4 font-mono text-[#5e5e5e]">0 users</td>
                  </tr>
                  <tr className="hover:bg-[#f8fafd]">
                    <td className="py-3 px-4 font-bold text-[#1f1f1f]">Security Auditor</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#fef7e0] text-[#b06000]">
                        Audit Read-Only
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#444746]">
                      Inspect database query logs, session audit trail, and compliance reports.
                    </td>
                    <td className="py-3 px-4 font-mono text-[#5e5e5e]">0 users</td>
                  </tr>
                  <tr className="hover:bg-[#f8fafd]">
                    <td className="py-3 px-4 font-bold text-[#1f1f1f]">Viewer / Developer</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700">
                        Metrics Read-Only
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#444746]">
                      View real-time telemetry dashboards and latency graphs for authorized websites.
                    </td>
                    <td className="py-3 px-4 font-mono text-[#5e5e5e]">0 users</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SECTION 4: API KEYS & WEBHOOKS */}
        {activeSection === 'apikeys' && (
          <div className="space-y-4">
            <div className="border border-[#e0e2ec] rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f0f4f9] text-[#444746] text-xs font-semibold border-b border-[#e0e2ec]">
                    <th className="py-3 px-4">Key ID</th>
                    <th className="py-3 px-4">Assigned User</th>
                    <th className="py-3 px-4">Token Prefix</th>
                    <th className="py-3 px-4">Webhook Target (Slack/Discord)</th>
                    <th className="py-3 px-4">Rate Limit</th>
                    <th className="py-3 px-4">Created Date</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Clean Empty State */}
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-[#f0f4f9] flex items-center justify-center text-[#747775]">
                          <Key className="w-6 h-6" />
                        </div>
                        <h4 className="text-sm font-bold text-[#1f1f1f]">No API Keys or Webhooks Configured</h4>
                        <p className="text-xs text-[#5e5e5e] max-w-md">
                          Users can generate programmatic API keys to query telemetry timeseries and register webhook URLs for automatic incident notifications.
                        </p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SECTION 5: AUDIT LOGS */}
        {activeSection === 'audit' && (
          <div className="space-y-4">
            <div className="border border-[#e0e2ec] rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f0f4f9] text-[#444746] text-xs font-semibold border-b border-[#e0e2ec]">
                    <th className="py-3 px-4">Event ID</th>
                    <th className="py-3 px-4">User Email</th>
                    <th className="py-3 px-4">Action / Operation</th>
                    <th className="py-3 px-4">Target Resource</th>
                    <th className="py-3 px-4">IP Address</th>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Clean Empty State */}
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-[#f0f4f9] flex items-center justify-center text-[#747775]">
                          <FileText className="w-6 h-6" />
                        </div>
                        <h4 className="text-sm font-bold text-[#1f1f1f]">No User Activity Logged</h4>
                        <p className="text-xs text-[#5e5e5e] max-w-md">
                          User sign-ins, website additions, and credential changes will be logged here with timestamps and source IP addresses for security compliance.
                        </p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
