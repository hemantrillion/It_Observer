'use client';

import React, { useState, useEffect } from 'react';
import { InfratraceMinimalistLandingPage } from '@/components/landing/infratrace_minimalist_landing_page';
import { ObservatoryGmailLayout } from '@/components/gmail/observatory_gmail_layout';

export default function RootPage() {
  const [view, setView] = useState<'landing' | 'demo'>('landing');

  // Check URL params for ?mode=demo or ?view=demo
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('mode') === 'demo' || params.get('view') === 'demo') {
        setView('demo');
      }
    } catch {
      // safe fallback
    }
  }, []);

  if (view === 'demo') {
    return (
      <ObservatoryGmailLayout
        onNavigateLanding={() => setView('landing')}
      />
    );
  }

  return (
    <InfratraceMinimalistLandingPage
      onStartDemo={() => setView('demo')}
    />
  );
}
