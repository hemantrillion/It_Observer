'use client';

import React from 'react';
import { IncidentAlertRecord } from '@/lib/database/get_all_incidents_history_query';

interface ActiveIncidentAlertNotificationCardProps {
  incident: IncidentAlertRecord;
}

export function ActiveIncidentAlertNotificationCard({ incident }: ActiveIncidentAlertNotificationCardProps) {
  return (
    <div className="border border-black rounded-lg p-4 bg-black text-white flex flex-col md:flex-row md:items-center justify-between gap-3 my-2 w-full">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-sans text-[11px] font-bold uppercase px-2 py-0.5 border border-white rounded bg-white text-black">
            ! {incident.severity} ALERT
          </span>
          <span className="font-sans text-xs opacity-80 font-bold">
            SERVICE: {incident.service_name || incident.service_id}
          </span>
        </div>
        <div className="font-sans text-sm font-semibold tracking-tight">
          {incident.reason}
        </div>
      </div>

      <div className="font-sans text-xs opacity-75 whitespace-nowrap text-right">
        TRIGGERED: {new Date(incident.started_at).toLocaleTimeString()}
      </div>
    </div>
  );
}
