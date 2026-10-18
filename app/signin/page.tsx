'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SignInView } from '@/frontend/landing/signin_page';

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefilledEmail = searchParams.get('email') || '';

  return (
    <SignInView
      onBack={() => router.push('/')}
      onGoToSignUp={() => router.push('/signup')}
      onSuccess={() => router.push('/demo')}
      prefilledEmail={prefilledEmail}
    />
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div style={{ backgroundColor: '#0047bb', minHeight: '100vh' }} className="flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full" />
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}
