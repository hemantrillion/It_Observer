'use client';

import React, { useState, useEffect } from 'react';
import { UserAccount } from '@/lib/auth/accounts_manager';

interface GoogleAuthButtonProps {
  onSuccess: (user: UserAccount, isNewUser?: boolean) => void;
  onError?: (error: string) => void;
  text?: string;
  context?: 'signin' | 'signup' | 'continue';
  className?: string;
  disabled?: boolean;
}

export function GoogleAuthButton({
  onSuccess,
  onError,
  text,
  context = 'continue',
  className = '',
  disabled = false,
}: GoogleAuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  // Compute button text
  const buttonLabel = text || (context === 'signup' ? 'Sign up with Google' : context === 'signin' ? 'Sign in with Google' : 'Continue with Google');

  // Load Google Identity Services script
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const existingScript = document.getElementById('google-identity-client-script');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'google-identity-client-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, []);

  // Listen for popup messages if OAuth redirect opens in popup window
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === 'GOOGLE_AUTH_SUCCESS' && event.data.user) {
        setIsLoading(false);
        onSuccess(event.data.user, event.data.isNewUser);
      } else if (event.data?.type === 'GOOGLE_AUTH_ERROR') {
        setIsLoading(false);
        const err = event.data.error || 'Google authentication failed.';
        setLocalError(err);
        onError?.(err);
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onSuccess, onError]);

  const handleGoogleClick = async () => {
    setLocalError(null);

    // If client ID is not configured, inform user clearly
    if (!clientId) {
      const errorMsg = 'Google Client ID is not configured. Please add NEXT_PUBLIC_GOOGLE_CLIENT_ID to your environment variables.';
      setLocalError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    setIsLoading(true);

    try {
      const google = (window as any).google;

      // 1. Try Google Identity Services OAuth 2.0 Code Client (Standard & Recommended)
      if (google?.accounts?.oauth2) {
        const client = google.accounts.oauth2.initCodeClient({
          client_id: clientId,
          scope: 'openid email profile',
          ux_mode: 'popup',
          select_account: true,
          callback: async (response: any) => {
            if (response.error) {
              setIsLoading(false);
              const err = response.error_description || response.error || 'Google login cancelled or failed.';
              setLocalError(err);
              onError?.(err);
              return;
            }

            if (!response.code) {
              setIsLoading(false);
              const err = 'No authorization code received from Google.';
              setLocalError(err);
              onError?.(err);
              return;
            }

            try {
              // Send authorization code to server for backend verification
              const res = await fetch('/api/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  code: response.code,
                  redirectUri: 'postmessage',
                }),
              });

              const data = await res.json();
              setIsLoading(false);

              if (data.success && data.user) {
                onSuccess(data.user, data.isNewUser);
              } else {
                const err = data.error || 'Failed to authenticate with Google on server.';
                setLocalError(err);
                onError?.(err);
              }
            } catch (postErr: any) {
              setIsLoading(false);
              const err = postErr.message || 'Network error verifying Google credentials.';
              setLocalError(err);
              onError?.(err);
            }
          },
          error_callback: (nonOAuthError: any) => {
            setIsLoading(false);
            const err = nonOAuthError.message || 'Google authentication popup was closed or blocked.';
            setLocalError(err);
            onError?.(err);
          },
        });

        client.requestCode();
        return;
      }

      // 2. Fallback: Open server authorization route in popup window
      const width = 500;
      const height = 650;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const popup = window.open(
        '/api/auth/google/authorize',
        'google_oauth_popup',
        `width=${width},height=${height},left=${left},top=${top},status=0,toolbar=0,location=0,menubar=0`
      );

      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        // If popup was blocked by browser, fallback to standard full-page redirect
        window.location.href = '/api/auth/google/authorize';
        return;
      }

      // Poll for popup closing or completion
      const popupCheckTimer = setInterval(() => {
        if (!popup || popup.closed) {
          clearInterval(popupCheckTimer);
          setIsLoading(false);
          // Check session cookie from server
          fetch('/api/auth/session')
            .then((res) => res.json())
            .then((data) => {
              if (data.authenticated && data.user) {
                onSuccess(data.user);
              }
            })
            .catch(() => {});
        }
      }, 800);
    } catch (err: any) {
      setIsLoading(false);
      const errMsg = err.message || 'Failed to initiate Google sign-in.';
      setLocalError(errMsg);
      onError?.(errMsg);
    }
  };

  return (
    <div className="w-full space-y-2">
      <button
        type="button"
        onClick={handleGoogleClick}
        disabled={disabled || isLoading}
        className={`w-full h-11 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm shadow-2xs hover:shadow-xs transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed select-none active:scale-[0.99] ${className}`}
      >
        {isLoading ? (
          <div className="flex items-center gap-2.5 text-slate-600">
            <svg
              className="animate-spin w-4 h-4 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Connecting to Google...</span>
          </div>
        ) : (
          <>
            {/* Official Google 4-color G logo */}
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                fill="#EA4335"
              />
            </svg>
            <span>{buttonLabel}</span>
          </>
        )}
      </button>

      {localError && (
        <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs text-left animate-in fade-in duration-150">
          <p className="font-semibold">{localError}</p>
        </div>
      )}
    </div>
  );
}

