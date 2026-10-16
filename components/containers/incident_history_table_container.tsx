'use client';

import React from 'react';
import { IncidentAlertRecord } from '@/lib/database/get_all_incidents_history_query';

interface IncidentHistoryTableContainerProps {
  incidents: IncidentAlertRecord[];
}

export function IncidentHistoryTableContainer({ incidents }: IncidentHistoryTableContainerProps) {
  return (
    <div className="space-y-4 w-full font-sans">
      {/* Centered Section Header in Neo-Brutalist Graph Style */}
      <div className="text-center space-y-1.5 border-b-2 border-black pb-4">
        <h2 className="font-sans font-black text-3xl md:text-4xl lg:text-5xl tracking-tight uppercase text-black">
          HISTORICAL INCIDENTS &amp; AUDIT LOGS
        </h2>
        <p className="font-sans text-base font-bold text-neutral-700">
          Recorded Service Degradations, Outages, and Recovery Timelines (Total Events: {incidents.length})
        </p>
      </div>

      <div className="border-2 border-black rounded-xl bg-white/95 backdrop-blur-md overflow-hidden w-full shadow-sm">
        {incidents.length === 0 ? (
          <div className="p-12 text-center font-sans text-sm sm:text-base font-bold text-neutral-600">
            [ ZERO RECORDED INCIDENTS &mdash; ALL MONITORED TARGETS HEALTHY ]
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left font-sans text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-black bg-neutral-100 text-black">
                  <th className="p-4 border-r-2 border-black font-black uppercase text-xs sm:text-sm tracking-wider">STATE</th>
                  <th className="p-4 border-r-2 border-black font-black uppercase text-xs sm:text-sm tracking-wider">SERVICE TARGET</th>
                  <th className="p-4 border-r-2 border-black font-black uppercase text-xs sm:text-sm tracking-wider">SEVERITY</th>
                  <th className="p-4 border-r-2 border-black font-black uppercase text-xs sm:text-sm tracking-wider">TRIGGER REASON</th>
                  <th className="p-4 border-r-2 border-black font-black uppercase text-xs sm:text-sm tracking-wider">TIMESTAMP</th>
                  <th className="p-4 font-black uppercase text-xs sm:text-sm tracking-wider">DURATION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/20">
                {incidents.map((incident) => (
                  <tr
                    key={incident.id}
                    className={`transition-colors ${
                      incident.is_active ? 'bg-black text-white font-bold' : 'hover:bg-neutral-50 text-black font-medium'
                    }`}
                  >
                    <td className="p-4 border-r border-black/20 font-black whitespace-nowrap">
                      {incident.is_active ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-600 text-white text-xs font-black uppercase">
                          [ ACTIVE OUTAGE ]
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-100 text-black border border-black text-xs font-black uppercase">
                          [ RESOLVED ]
                        </span>
                      )}
                    </td>
                    <td className="p-4 border-r border-black/20 uppercase font-black text-sm sm:text-base whitespace-nowrap">
                      {incident.service_name || incident.service_id}
                    </td>
                    <td className="p-4 border-r border-black/20 uppercase font-bold text-xs sm:text-sm">
                      <span className={incident.severity === 'CRITICAL' ? 'text-rose-600 font-black' : 'text-amber-600 font-black'}>
                        {incident.severity}
                      </span>
                    </td>
                    <td className="p-4 border-r border-black/20 max-w-md truncate text-xs sm:text-sm font-semibold">
                      {incident.reason}
                    </td>
                    <td className="p-4 border-r border-black/20 whitespace-nowrap font-mono text-xs sm:text-sm font-bold">
                      {new Date(incident.started_at).toLocaleTimeString()}
                    </td>
                    <td className="p-4 whitespace-nowrap font-mono text-xs sm:text-sm font-bold">
                      {incident.is_active ? 'Ongoing...' : `${incident.duration_seconds}s`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
