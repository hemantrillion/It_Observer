'use client';

import React from 'react';
import { IncidentAlertRecord } from '@/lib/database/get_all_incidents_history_query';

interface IncidentHistoryTableContainerProps {
  incidents: IncidentAlertRecord[];
}

export function IncidentHistoryTableContainer({ incidents }: IncidentHistoryTableContainerProps) {
  return (
    <div className="border-3 border-black bg-white shadow-brutal space-y-2">
      <div className="p-4 border-b-2 border-black flex justify-between items-center">
        <h3 className="font-mono font-black text-sm uppercase tracking-wider">
          // HISTORICAL INCIDENTS & ALERT LOGS
        </h3>
        <span className="font-mono text-xs font-bold">TOTAL: {incidents.length}</span>
      </div>

      {incidents.length === 0 ? (
        <div className="p-8 text-center font-mono text-xs opacity-60">
          [ NO RECORDED INCIDENTS - ALL SERVICES HEALTHY ]
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-black bg-white text-black">
                <th className="p-3 border-r-2 border-black">STATE</th>
                <th className="p-3 border-r-2 border-black">SERVICE</th>
                <th className="p-3 border-r-2 border-black">SEVERITY</th>
                <th className="p-3 border-r-2 border-black">TRIGGER REASON</th>
                <th className="p-3 border-r-2 border-black">STARTED</th>
                <th className="p-3">DURATION</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map((incident) => (
                <tr
                  key={incident.id}
                  className={`border-b border-black ${
                    incident.is_active ? 'bg-black text-white font-bold' : 'hover:bg-white'
                  }`}
                >
                  <td className="p-3 border-r border-black">
                    {incident.is_active ? '[ ACTIVE ]' : '[ RESOLVED ]'}
                  </td>
                  <td className="p-3 border-r border-black uppercase">
                    {incident.service_name || incident.service_id}
                  </td>
                  <td className="p-3 border-r border-black uppercase">
                    {incident.severity}
                  </td>
                  <td className="p-3 border-r border-black max-w-xs truncate">
                    {incident.reason}
                  </td>
                  <td className="p-3 border-r border-black whitespace-nowrap">
                    {new Date(incident.started_at).toLocaleTimeString()}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    {incident.is_active ? 'Ongoing...' : `${incident.duration_seconds}s`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
