'use client';

import React from 'react';
import {
  Users,
  Globe,
  Key,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import { UserSection } from './gmail_left_sidebar';

interface ObservatoryUsersDatabaseViewProps {
  activeSection?: UserSection;
  density?: 'default' | 'comfortable' | 'compact';
  hasWallpaper?: boolean;
}

export function ObservatoryUsersDatabaseView({
  activeSection = 'accounts',
}: ObservatoryUsersDatabaseViewProps) {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/60 select-text font-sans">
      {/* 1. SECTION HEADER */}
      <div className="p-5 sm:p-6 border-b border-slate-200/80 shrink-0 flex items-start justify-between gap-4 bg-white">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {activeSection === 'accounts' && 'User Accounts Directory'}
              {activeSection === 'websites' && 'User Monitored Websites & Endpoints'}
              {activeSection === 'roles' && 'User Roles & Access Control Policy'}
              {activeSection === 'apikeys' && 'API Access Tokens & Notification Webhooks'}
              {activeSection === 'audit' && 'User Security & Session Audit Trail'}
            </h2>
          </div>

          <p className="text-xs text-slate-500 mt-1.5 max-w-2xl leading-relaxed font-medium">
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
      </div>

      {/* 2. SECTION CONTENT */}
      <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
        {/* SECTION 1: ALL USER ACCOUNTS */}
        {activeSection === 'accounts' && (
          <div className="border border-slate-200/90 rounded-xl overflow-hidden bg-white shadow-2xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200/80 uppercase text-[11px] tracking-wider">
                  <th className="py-2.5 px-4">User ID</th>
                  <th className="py-2.5 px-4">Full Name</th>
                  <th className="py-2.5 px-4">Email Address</th>
                  <th className="py-2.5 px-4">Assigned Role</th>
                  <th className="py-2.5 px-4">Monitored Websites</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Registered Date</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                        <Users className="w-5 h-5" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">No Users Registered</h4>
                      <p className="text-xs text-slate-500 max-w-md font-medium">
                        Account creation is currently disabled. No dummy or sample users are loaded. Real user accounts will be populated when the authentication system is activated.
                      </p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* SECTION 2: MONITORED WEBSITES */}
        {activeSection === 'websites' && (
          <div className="border border-slate-200/90 rounded-xl overflow-hidden bg-white shadow-2xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200/80 uppercase text-[11px] tracking-wider">
                  <th className="py-2.5 px-4">Website URL / Endpoint</th>
                  <th className="py-2.5 px-4">Assigned User</th>
                  <th className="py-2.5 px-4">Check Protocol</th>
                  <th className="py-2.5 px-4">Scrape Interval</th>
                  <th className="py-2.5 px-4">Expected HTTP Status</th>
                  <th className="py-2.5 px-4">SSL Expiry</th>
                  <th className="py-2.5 px-4">Current Health</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                        <Globe className="w-5 h-5" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">No Monitored Websites Registered</h4>
                      <p className="text-xs text-slate-500 max-w-md font-medium">
                        This database table maps registered users to the websites and API endpoints they want to monitor. When users configure targets, automated synthetic checks and SSL metrics will appear here.
                      </p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* SECTION 3: ROLES & PERMISSIONS */}
        {activeSection === 'roles' && (
          <div className="border border-slate-200/90 rounded-xl overflow-hidden bg-white shadow-2xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200/80 uppercase text-[11px] tracking-wider">
                  <th className="py-2.5 px-4">Role Name</th>
                  <th className="py-2.5 px-4">Access Level</th>
                  <th className="py-2.5 px-4">Permission Capabilities</th>
                  <th className="py-2.5 px-4">Assigned Users</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={4} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">No Roles Configured</h4>
                      <p className="text-xs text-slate-500 max-w-md font-medium">
                        Role definitions and access control policies have not been decided yet. Custom user roles and capabilities will be displayed here once established.
                      </p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* SECTION 4: API KEYS & WEBHOOKS */}
        {activeSection === 'apikeys' && (
          <div className="border border-slate-200/90 rounded-xl overflow-hidden bg-white shadow-2xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200/80 uppercase text-[11px] tracking-wider">
                  <th className="py-2.5 px-4">Key ID</th>
                  <th className="py-2.5 px-4">Assigned User</th>
                  <th className="py-2.5 px-4">Token Prefix</th>
                  <th className="py-2.5 px-4">Webhook Target</th>
                  <th className="py-2.5 px-4">Rate Limit</th>
                  <th className="py-2.5 px-4">Created Date</th>
                  <th className="py-2.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                        <Key className="w-5 h-5" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">No API Keys or Webhooks Configured</h4>
                      <p className="text-xs text-slate-500 max-w-md font-medium">
                        Users can generate programmatic API keys to query telemetry timeseries and register webhook URLs for automatic incident notifications.
                      </p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* SECTION 5: AUDIT LOGS */}
        {activeSection === 'audit' && (
          <div className="border border-slate-200/90 rounded-xl overflow-hidden bg-white shadow-2xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200/80 uppercase text-[11px] tracking-wider">
                  <th className="py-2.5 px-4">Event ID</th>
                  <th className="py-2.5 px-4">User Email</th>
                  <th className="py-2.5 px-4">Action / Operation</th>
                  <th className="py-2.5 px-4">Target Resource</th>
                  <th className="py-2.5 px-4">IP Address</th>
                  <th className="py-2.5 px-4">Timestamp</th>
                  <th className="py-2.5 px-4">Result</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                        <FileText className="w-5 h-5" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">No User Activity Logged</h4>
                      <p className="text-xs text-slate-500 max-w-md font-medium">
                        User sign-ins, website additions, and credential changes will be logged here with timestamps and source IP addresses for security compliance.
                      </p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
