'use client';

import React, { useState, useMemo } from 'react';
import { IncidentAlertRecord } from '@/lib/database/get_all_incidents_history_query';
import { MonitoredServiceRecord } from '@/lib/database/get_all_monitored_services_query';
import { BarChart2 } from 'lucide-react';

interface IncidentHistoryTableContainerProps {
  incidents: IncidentAlertRecord[];
  monitoredServices?: MonitoredServiceRecord[];
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

export function IncidentHistoryTableContainer({
  incidents,
  monitoredServices = [],
}: IncidentHistoryTableContainerProps) {
  const [selectedTarget, setSelectedTarget] = useState<string>('ALL');

  // Filter options: picked from checked/monitored services
  const targetOptions = useMemo(() => {
    if (monitoredServices && monitoredServices.length > 0) {
      return monitoredServices.map((s) => s.name);
    }
    const set = new Set<string>();
    incidents.forEach((inc) => {
      const name = inc.service_name || inc.service_id;
      if (name) set.add(name);
    });
    return Array.from(set).sort();
  }, [monitoredServices, incidents]);

  // Filter incidents only showing triggered events for the selected target
  const filteredIncidents = useMemo(() => {
    // Only show incidents where an actual issue was triggered (warning or critical)
    const valid = incidents.filter((inc) => {
      const sev = inc.severity?.toUpperCase();
      return sev === 'CRITICAL' || sev === 'WARNING';
    });

    if (selectedTarget === 'ALL') return valid;
    return valid.filter(
      (inc) => (inc.service_name || inc.service_id) === selectedTarget
    );
  }, [incidents, selectedTarget]);

  return (
    /* Entire historical logs section enclosed in a single rectangular card */
    <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs space-y-3.5 w-full font-sans">
      {/* Title */}
      <div className="pb-1">
        <h3 className="font-sans font-bold text-sm text-slate-900 tracking-tight">
          Historical Incident Logs
        </h3>
      </div>

      {/* Target Options - written below, scrollable left to right without :Target: label */}
      <div className="overflow-x-auto pb-1 flex items-center gap-1.5 scrollbar-thin">
        <button
          type="button"
          onClick={() => setSelectedTarget('ALL')}
          className={`px-3 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer shrink-0 ${
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
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer shrink-0 whitespace-nowrap ${
              selectedTarget === tgt
                ? 'bg-slate-900 text-white font-bold'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            {tgt}
          </button>
        ))}
      </div>

      {/* Table: STATUS, TARGET, REASON (empty), TIMESTAMP. No SEVERITY column, no DURATION column */}
      <div className="border border-slate-200/90 rounded-lg overflow-hidden bg-white">
        {filteredIncidents.length === 0 ? (
          <div className="p-8 text-center text-xs font-medium text-slate-500">
            No incident events recorded for the selected filter.
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-600 font-bold uppercase text-[11px] tracking-wider">
                  <th className="py-2.5 px-3.5">Status</th>
                  <th className="py-2.5 px-3.5">Target</th>
                  <th className="py-2.5 px-3.5">Reason</th>
                  <th className="py-2.5 px-3.5">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredIncidents.map((incident) => {
                  const r = (incident.reason || '').toLowerCase();
                  const isCritical =
                    incident.severity === 'CRITICAL' ||
                    r.includes('503') ||
                    r.includes('unreachable') ||
                    r.includes('down') ||
                    r.includes('crash');

                  return (
                    <tr
                      key={incident.id}
                      className="hover:bg-slate-50/70 transition-colors text-slate-700 font-medium"
                    >
                      <td className="py-2 px-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold ${
                            isCritical
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isCritical ? 'bg-rose-500' : 'bg-amber-500'
                            }`}
                          />
                          <span>{isCritical ? 'critical' : 'warning'}</span>
                        </span>
                      </td>
                      <td className="py-2 px-3.5 font-bold text-slate-900 whitespace-nowrap">
                        {incident.service_name || incident.service_id}
                      </td>
                      {/* Reason column kept but empty as requested */}
                      <td className="py-2 px-3.5 text-slate-400 font-mono text-[11px]">
                        &mdash;
                      </td>
                      <td className="py-2 px-3.5 whitespace-nowrap font-mono text-[11px] text-slate-600">
                        {formatIncidentDate(incident.started_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bottom Footer with Showing count and relocated Raw Metrics button */}
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
