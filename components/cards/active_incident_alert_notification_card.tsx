'use client';

import React from 'react';
import { IncidentAlertRecord } from '@/lib/database/get_all_incidents_history_query';
import { AlertCircle, Clock } from 'lucide-react';

interface ActiveIncidentAlertNotificationCardProps {
  incident: IncidentAlertRecord;
}

export function ActiveIncidentAlertNotificationCard({
  incident,
}: ActiveIncidentAlertNotificationCardProps) {
  return (
    <div className="border border-[#f5c2c7] rounded-2xl p-4 bg-[#fce8e6] text-[#842029] flex flex-col md:flex-row md:items-center justify-between gap-3 my-2 w-full shadow-xs">
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 font-sans text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#c5221f] text-white">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{incident.severity} ALERT</span>
          </span>
          <span className="font-sans text-xs font-semibold bg-white/80 px-2.5 py-0.5 rounded-full text-[#58151c] border border-[#f5c2c7]">
            {incident.service_name || incident.service_id}
          </span>
        </div>
        <div className="font-sans text-sm font-semibold tracking-tight text-[#58151c]">
          {incident.reason}
        </div>
      </div>

      <div className="inline-flex items-center gap-1.5 font-sans text-xs text-[#842029] bg-white/60 px-3 py-1 rounded-full border border-[#f5c2c7] shrink-0 self-start md:self-center font-mono">
        <Clock className="w-3.5 h-3.5" />
        <span>TRIGGERED: {new Date(incident.started_at).toLocaleTimeString()}</span>
      </div>
    </div>
  );
}
