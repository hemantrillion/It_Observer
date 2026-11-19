'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ObservatoryGmailLayout } from '@/components/gmail/observatory_gmail_layout';
import { getActiveAccount, isUserAuthenticated } from '@/lib/auth/accounts_manager';

function DemoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (isUserAuthenticated()) {
      const user = getActiveAccount();
      if (user && user.role !== 'Demo' && user.email !== 'guest.demo@infratrace.internal') {
        const query = searchParams ? searchParams.toString() : '';
        router.replace(`/console${query ? `?${query}` : ''}`);
      }
    }
  }, [router, searchParams]);

  return (
    <ObservatoryGmailLayout
      onNavigateLanding={() => router.push('/')}
    />
  );
}

export default function DemoPage() {
  return (
    <Suspense fallback={null}>
      <DemoContent />
    </Suspense>
  );
}
