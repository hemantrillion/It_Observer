'use client';

import React, { useEffect, useRef } from 'react';
import { UserAccount } from '@/lib/auth/accounts_manager';

interface RealGoogleIdentityButtonProps {
  onSuccess: (user: UserAccount) => void;
  onError?: (error: string) => void;
  context?: 'signin' | 'signup';
}

export function RealGoogleIdentityButton({
  onSuccess,
  onError,
  context = 'signin',
}: RealGoogleIdentityButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    // If no real Google OAuth Client ID is configured, render nothing (no fake simulation)
    if (!clientId) return;

    const initGsi = () => {
      const google = (window as any).google;
      if (!google?.accounts?.id) return;

      google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: any) => {
          try {
            if (!response?.credential) {
              throw new Error('No Google credential returned.');
            }

            // Decode base64 JWT payload from Google Identity Services
            const base64Url = response.credential.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
              atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
            );
            const payload = JSON.parse(jsonPayload);

            const res = await fetch('/api/auth/google', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: payload.email,
                name: payload.name || payload.given_name || payload.email.split('@')[0],
                avatarUrl: payload.picture || '/infra_trace_logo.png',
              }),
            });

            const data = await res.json();
            if (data.success && data.user) {
              onSuccess(data.user);
            } else {
              onError?.(data.error || 'Failed to authenticate Google identity with server.');
            }
          } catch (err: any) {
            onError?.(err.message || 'Error processing Google identity credential.');
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      if (containerRef.current) {
        containerRef.current.innerHTML = '';
        google.accounts.id.renderButton(containerRef.current, {
          theme: 'outline',
          size: 'large',
          type: 'standard',
          shape: 'rectangular',
          text: context === 'signup' ? 'signup_with' : 'signin_with',
          width: 320,
        });
      }
    };

    const existingScript = document.getElementById('google-gsi-client');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'google-gsi-client';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initGsi;
      document.body.appendChild(script);
    } else {
      initGsi();
    }
  }, [clientId, context, onSuccess, onError]);

  // If no Google Client ID is configured, do not render any fake simulation
  if (!clientId) {
    return null;
  }

  return (
    <div className="w-full flex justify-center py-1">
      <div ref={containerRef} />
    </div>
  );
}
