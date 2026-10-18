'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { CreateAccountView } from '@/frontend/landing/create_account_page';

export default function SignUpPage() {
  const router = useRouter();

  return (
    <CreateAccountView
      onBack={() => router.push('/')}
      onGoToSignIn={(prefilled) => router.push(prefilled ? `/signin?email=${encodeURIComponent(prefilled)}` : '/signin')}
      onSuccess={() => router.push('/demo')}
    />
  );
}
