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
    <div className="min-h-screen bg-white text-black flex flex-col w-full font-sans">
      <TopHeaderNavigationBarContainer onPoll={fetchIncidents} />

      <main className="flex-1 w-full px-6 md:px-10 py-8 space-y-6">
        {isLoading ? (
          <div className="p-16 text-center font-sans font-bold text-sm border border-black rounded-lg">
            [ LOADING INCIDENT LOGS... ]
          </div>
        ) : (
          <IncidentHistoryTableContainer incidents={incidents} />
        )}
      </main>
    </div>
  );
}
