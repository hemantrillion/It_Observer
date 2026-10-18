'use client';

import React, { useState, useMemo } from 'react';
import { IncidentAlertRecord } from '@/lib/database/get_all_incidents_history_query';
import { BarChart2, Filter } from 'lucide-react';

interface IncidentHistoryTableContainerProps {
  incidents: IncidentAlertRecord[];
}

function formatIncidentDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = String(d.getDate()).padStart(2, '0');
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${day} ${month} ${year}, ${hours}:${minutes}:${seconds}`;
  } catch {
    return isoString;
  }
}

export function IncidentHistoryTableContainer({ incidents }: IncidentHistoryTableContainerProps) {
  const [selectedTarget, setSelectedTarget] = useState<string>('ALL');

  // Extract unique targets for filter pills
  const targetOptions = useMemo(() => {
    const set = new Set<string>();
    incidents.forEach((inc) => {
      const name = inc.service_name || inc.service_id;
      if (name) set.add(name);
    });
    return Array.from(set).sort();
  }, [incidents]);

  // Filtered incidents
  const filteredIncidents = useMemo(() => {
    if (selectedTarget === 'ALL') return incidents;
    return incidents.filter(
      (inc) => (inc.service_name || inc.service_id) === selectedTarget
    );
  }, [incidents, selectedTarget]);

  return (
    <div className="space-y-3.5 w-full font-sans">
      {/* Header and Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <h3 className="font-sans font-bold text-base text-slate-900 tracking-tight">
            Historical Incident Logs
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Audit history of detected outages and recovery timelines (Total: {filteredIncidents.length})
          </p>
        </div>

        {/* Filter Pills */}
        {targetOptions.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3" />
              <span>Target:</span>
            </span>
            <button
              type="button"
              onClick={() => setSelectedTarget('ALL')}
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                selectedTarget === 'ALL'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              ALL
            </button>
            {targetOptions.map((tgt) => (
              <button
                key={tgt}
                type="button"
                onClick={() => setSelectedTarget(tgt)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  selectedTarget === tgt
                    ? 'bg-slate-900 text-white font-bold'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {tgt}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Compact Table */}
      <div className="border border-slate-200/90 rounded-xl bg-white overflow-hidden shadow-2xs">
        {filteredIncidents.length === 0 ? (
          <div className="p-8 text-center text-xs font-medium text-slate-500">
            Zero recorded incidents for the selected filter &mdash; all monitored targets operational.
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-600 font-bold uppercase text-[11px] tracking-wider">
                  <th className="py-2.5 px-3.5">Status</th>
                  <th className="py-2.5 px-3.5">Target</th>
                  <th className="py-2.5 px-3.5">Severity</th>
                  <th className="py-2.5 px-3.5">Reason</th>
                  <th className="py-2.5 px-3.5">Timestamp</th>
                  <th className="py-2.5 px-3.5">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredIncidents.map((incident) => {
                  const isCritical = incident.severity === 'CRITICAL';
                  return (
                    <tr
                      key={incident.id}
                      className="hover:bg-slate-50/70 transition-colors text-slate-700 font-medium"
                    >
                      <td className="py-2 px-3.5 whitespace-nowrap">
                        {incident.is_active ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                            Resolved
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3.5 font-bold text-slate-900 whitespace-nowrap">
                        {incident.service_name || incident.service_id}
                      </td>
                      <td className="py-2 px-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                            isCritical ? 'text-rose-600' : 'text-amber-600'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isCritical ? 'bg-rose-500' : 'bg-amber-500'
                            }`}
                          />
                          <span>{incident.severity}</span>
                        </span>
                      </td>
                      <td className="py-2 px-3.5 max-w-sm truncate text-slate-600" title={incident.reason}>
                        {incident.reason}
                      </td>
                      <td className="py-2 px-3.5 whitespace-nowrap font-mono text-[11px] text-slate-600">
                        {formatIncidentDate(incident.started_at)}
                      </td>
                      <td className="py-2 px-3.5 whitespace-nowrap font-mono text-[11px] text-slate-500">
                        {incident.is_active ? 'Ongoing' : `${incident.duration_seconds}s`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bottom Footer with Relocated "Raw Metrics" button */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-xs text-slate-400 font-medium">
          Showing {filteredIncidents.length} event records
        </span>

        <a
          href="/metrics"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors"
          title="Open Prometheus plain-text /metrics endpoint"
        >
          <BarChart2 className="w-3.5 h-3.5 text-slate-500" />
          <span>Raw Metrics</span>
        </a>
      </div>
    </div>
  );
}
