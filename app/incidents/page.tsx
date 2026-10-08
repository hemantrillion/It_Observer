'use client';

import React, { useEffect, useState } from 'react';
import { TopHeaderNavigationBarContainer } from '@/components/containers/top_header_navigation_bar_container';
import { IncidentHistoryTableContainer } from '@/components/containers/incident_history_table_container';
import { IncidentAlertRecord } from '@/lib/database/get_all_incidents_history_query';

export default function IncidentsHistoryPage() {
  const [incidents, setIncidents] = useState<IncidentAlertRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchIncidents = async () => {
    try {
      const res = await fetch('/api/incidents');
      const data = await res.json();
      if (data.success) {
        setIncidents(data.incidents);
      }
    } catch (e) {
      console.error('Failed to load incidents', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      <TopHeaderNavigationBarContainer onPoll={fetchIncidents} />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-6 w-full space-y-6">
        <div>
          <h2 className="font-mono font-black text-xl tracking-tight uppercase mb-1">
            INCIDENT INTELLIGENCE & AUDIT TRAIL
          </h2>
          <p className="font-mono text-xs opacity-60">
            RECORDED SERVICE DEGRADATIONS, OUTAGES, AND RECOVERY TIMELINES
          </p>
        </div>

        {isLoading ? (
          <div className="p-12 text-center font-mono font-bold text-sm">
            [ LOADING INCIDENT LOGS... ]
          </div>
        ) : (
          <IncidentHistoryTableContainer incidents={incidents} />
        )}
      </main>
    </div>
  );
}
