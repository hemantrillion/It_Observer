'use client';

import React from 'react';
import { UserAccount } from '@/lib/auth/accounts_manager';
import { GoogleAuthButton } from './google_auth_button';

interface RealGoogleIdentityButtonProps {
  onSuccess: (user: UserAccount, isNewUser?: boolean) => void;
  onError?: (error: string) => void;
  context?: 'signin' | 'signup' | 'continue';
  className?: string;
}

export function RealGoogleIdentityButton({
  onSuccess,
  onError,
  context = 'signin',
  className = '',
}: RealGoogleIdentityButtonProps) {
  return (
    <GoogleAuthButton
      onSuccess={onSuccess}
      onError={onError}
      context={context}
      className={className}
    />
  );
}

export { GoogleAuthButton };
