'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { InfratraceMinimalistLandingPage } from '@/components/landing/infratrace_minimalist_landing_page';

export default function RootPage() {
  const router = useRouter();

  return (
    <InfratraceMinimalistLandingPage
      onStartDemo={() => router.push('/demo')}
    />
  );
}
