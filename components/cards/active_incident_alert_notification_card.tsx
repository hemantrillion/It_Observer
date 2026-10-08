'use client';

import React from 'react';
import { IncidentAlertRecord } from '@/lib/database/get_all_incidents_history_query';

interface ActiveIncidentAlertNotificationCardProps {
  incident: IncidentAlertRecord;
}

export function ActiveIncidentAlertNotificationCard({ incident }: ActiveIncidentAlertNotificationCardProps) {
  return (
    <div className="border-3 border-black p-4 bg-black text-white shadow-brutal flex flex-col md:flex-row md:items-center justify-between gap-3 my-2">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-black uppercase px-2 py-0.5 border border-white bg-white text-black">
            ! {incident.severity} ALERT
          </span>
          <span className="font-mono text-xs opacity-75 font-bold">
            SERVICE: {incident.service_name || incident.service_id}
          </span>
        </div>
        <div className="font-mono text-sm font-bold tracking-tight">
          {incident.reason}
        </div>
      </div>

      <div className="font-mono text-xs opacity-80 whitespace-nowrap text-right">
        TRIGGERED: {new Date(incident.started_at).toLocaleTimeString()}
      </div>
    </div>
  );
}
