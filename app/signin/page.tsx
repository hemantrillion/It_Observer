'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { SignInView } from '@/frontend/landing/signin_page';

export default function SignInPage() {
  const router = useRouter();

  return (
    <SignInView
      onBack={() => router.push('/')}
      onGoToSignUp={() => router.push('/signup')}
      onSuccess={() => router.push('/demo')}
    />
  );
}
