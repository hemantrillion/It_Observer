'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ObservatoryGmailLayout } from '@/components/gmail/observatory_gmail_layout';

export default function DemoPage() {
  const router = useRouter();

  return (
    <ObservatoryGmailLayout
      onNavigateLanding={() => router.push('/')}
    />
  );
}
