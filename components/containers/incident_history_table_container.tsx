'use client';

import React from 'react';
import { IncidentAlertRecord } from '@/lib/database/get_all_incidents_history_query';

interface IncidentHistoryTableContainerProps {
  incidents: IncidentAlertRecord[];
}

export function IncidentHistoryTableContainer({ incidents }: IncidentHistoryTableContainerProps) {
  return (
    <div className="space-y-3 w-full">
      {/* Centered Section Header in Arial */}
      <div className="text-center space-y-1">
        <h2 className="font-sans font-bold text-3xl md:text-4xl tracking-tight uppercase text-black">
          HISTORICAL INCIDENTS & AUDIT LOGS
        </h2>
        <p className="font-sans text-sm text-black opacity-60">
          Recorded Service Degradations, Outages, And Recovery Timelines (Total: {incidents.length})
        </p>
      </div>

      <div className="border border-black rounded-lg bg-white overflow-hidden w-full">
        {incidents.length === 0 ? (
          <div className="p-10 text-center font-sans text-xs text-black opacity-60">
            [ NO RECORDED INCIDENTS - ALL SERVICES HEALTHY ]
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left font-sans text-xs border-collapse">
              <thead>
                <tr className="border-b border-black bg-neutral-50 text-black">
                  <th className="p-3.5 border-r border-black font-bold">STATE</th>
                  <th className="p-3.5 border-r border-black font-bold">SERVICE</th>
                  <th className="p-3.5 border-r border-black font-bold">SEVERITY</th>
                  <th className="p-3.5 border-r border-black font-bold">TRIGGER REASON</th>
                  <th className="p-3.5 border-r border-black font-bold">STARTED</th>
                  <th className="p-3.5 font-bold">DURATION</th>
                </tr>
              </thead>
              <tbody>
                {incidents.map((incident) => (
                  <tr
                    key={incident.id}
                    className={`border-b border-black/20 ${
                      incident.is_active ? 'bg-black text-white font-semibold' : 'hover:bg-neutral-50'
                    }`}
                  >
                    <td className="p-3.5 border-r border-black/20">
                      {incident.is_active ? '[ ACTIVE ]' : '[ RESOLVED ]'}
                    </td>
                    <td className="p-3.5 border-r border-black/20 uppercase font-semibold">
                      {incident.service_name || incident.service_id}
                    </td>
                    <td className="p-3.5 border-r border-black/20 uppercase">
                      {incident.severity}
                    </td>
                    <td className="p-3.5 border-r border-black/20 max-w-sm truncate">
                      {incident.reason}
                    </td>
                    <td className="p-3.5 border-r border-black/20 whitespace-nowrap">
                      {new Date(incident.started_at).toLocaleTimeString()}
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
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
