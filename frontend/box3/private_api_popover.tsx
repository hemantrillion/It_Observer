'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Shield, ExternalLink, RefreshCw, Layers } from 'lucide-react';
import { getActiveAccount } from '@/lib/auth/accounts_manager';

interface PrivateSuite {
  id: string;
  name: string;
  suite_type: string;
  csp_provider: string;
  service_category: string;
  endpoints_json: string;
  status: string;
  created_at: string;
}

interface PrivateApiPopoverProps {
  onClose?: () => void;
  onNavigateToPrivateApi?: (suiteId?: string) => void;
}

export function PrivateApiPopover({ onClose, onNavigateToPrivateApi }: PrivateApiPopoverProps) {
  const activeUser = getActiveAccount();
  const [suites, setSuites] = useState<PrivateSuite[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadSuites() {
      try {
        const email = activeUser?.email || '';
        const url = email ? `/api/private-api?email=${encodeURIComponent(email)}` : '/api/private-api';
        const res = await fetch(url);
        const data = await res.json();
        if (isMounted && data.success && Array.isArray(data.suites)) {
          setSuites(data.suites);
        }
      } catch (err) {
        console.error('Failed to load private API suites:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadSuites();
    return () => {
      isMounted = false;
    };
  }, [activeUser?.email]);

  const handleSuiteClick = (suiteId: string) => {
    onClose?.();
    if (onNavigateToPrivateApi) {
      onNavigateToPrivateApi(suiteId);
    } else {
      window.location.href = `/private-api?suiteId=${encodeURIComponent(suiteId)}`;
    }
  };

  const handleAddNew = () => {
    onClose?.();
    if (onNavigateToPrivateApi) {
      onNavigateToPrivateApi();
    } else {
      window.location.href = '/private-api';
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-3 z-50 animate-in fade-in zoom-in-95 text-slate-900 font-sans select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 px-1">
        <div className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-xs font-bold text-slate-800">Private API Suites</span>
        </div>
        <span className="text-[10px] font-semibold text-slate-500 font-mono">
          {suites.length} {suites.length === 1 ? 'suite' : 'suites'}
        </span>
      </div>

      {/* Suites List */}
      <div className="space-y-1.5 max-h-64 overflow-y-auto py-2 pr-0.5">
        {isLoading ? (
          <div className="flex items-center justify-center py-6 text-slate-400 gap-2 text-xs">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Loading suites...</span>
          </div>
        ) : suites.length === 0 ? (
          <div className="p-3 text-center rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <p className="text-xs font-semibold text-slate-700">No private suites yet</p>
            <p className="text-[11px] text-slate-500">
              Create an isolated private suite to monitor VPC microservices & custom endpoints.
            </p>
          </div>
        ) : (
          suites.map((suite) => {
            let epCount = 0;
            try {
              const parsed = JSON.parse(suite.endpoints_json);
              epCount = Array.isArray(parsed) ? parsed.length : 0;
            } catch {
              epCount = 0;
            }

            return (
              <div
                key={suite.id}
                onClick={() => handleSuiteClick(suite.id)}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200/80 hover:border-blue-300 space-y-1 cursor-pointer transition-all group"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs font-bold text-slate-900 group-hover:text-blue-700 truncate">
                    {suite.name}
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                    {suite.status || 'ACTIVE'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="truncate">{suite.csp_provider || 'Cloud'} &bull; {epCount} {epCount === 1 ? 'metric' : 'metrics'}</span>
                  <span className="text-blue-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity text-[10px]">
                    Edit &rarr;
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add New Private API Button */}
      <div className="pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={handleAddNew}
          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-dashed border-blue-400 bg-blue-50/60 hover:bg-blue-100/80 text-blue-700 text-xs font-bold cursor-pointer transition-colors shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add new private API</span>
        </button>
      </div>
    </div>
  );
}
