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
  const r = (incident.reason || '').toLowerCase();
  const isCritical =
    incident.severity === 'CRITICAL' ||
    r.includes('503') ||
    r.includes('unreachable') ||
    r.includes('down') ||
    r.includes('crash');

  const formatTriggered = (iso: string) => {
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return iso;
      const day = d.getDate();
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = months[d.getMonth()];
      const year = d.getFullYear();
      const timeStr = d.toTimeString().split(' ')[0];
      return `${day} ${month} ${year}, ${timeStr}`;
    } catch {
      return iso;
    }
  };

  return (
    <div className="flex items-center justify-between py-2 px-3 bg-slate-50/80 hover:bg-slate-50 rounded-lg border border-slate-200/80 font-sans text-xs transition-colors">
      <div className="flex items-center gap-2.5">
        <span
          className={`w-2.5 h-2.5 rounded-full shrink-0 ${
            isCritical ? 'bg-rose-500' : 'bg-amber-500'
          }`}
          title={isCritical ? 'Critical' : 'Warning'}
        />
        <span className="font-bold text-slate-900 text-xs sm:text-sm">
          {incident.service_name || incident.service_id}
        </span>
      </div>
      <span className="text-slate-500 font-mono text-[11px] sm:text-xs font-medium">
        Triggered: {formatTriggered(incident.started_at)}
      </span>
    </div>
  );
}
