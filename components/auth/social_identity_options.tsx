'use client';

import React, { useState } from 'react';
import { UserAccount } from '@/lib/auth/accounts_manager';
import { ShieldAlert, ExternalLink, X, CheckCircle2 } from 'lucide-react';
import { RealGoogleIdentityButton } from './real_google_identity';

interface SocialIdentityOptionsProps {
  onSuccess: (user: UserAccount) => void;
  onError?: (error: string) => void;
  context?: 'signin' | 'signup';
}

export function SocialIdentityOptions({
  onSuccess,
  onError,
  context = 'signin',
}: SocialIdentityOptionsProps) {
  const [providerConfigModal, setProviderConfigModal] = useState<string | null>(null);

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const microsoftClientId = process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID;
  const appleClientId = process.env.NEXT_PUBLIC_APPLE_CLIENT_ID;

  const handleProviderClick = (provider: 'google' | 'microsoft' | 'apple') => {
    if (provider === 'google' && googleClientId) {
      // Real Google Identity Services will render / trigger
      return;
    }
    if (provider === 'microsoft' && microsoftClientId) {
      window.location.href = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${microsoftClientId}&response_type=code&redirect_uri=${encodeURIComponent(window.location.origin + '/api/auth/social/callback')}&response_mode=query&scope=openid%20profile%20email`;
      return;
    }
    if (provider === 'apple' && appleClientId) {
      window.location.href = `https://appleid.apple.com/auth/authorize?client_id=${appleClientId}&redirect_uri=${encodeURIComponent(window.location.origin + '/api/auth/social/callback')}&response_type=code%20id_token&scope=name%20email&response_mode=form_post`;
      return;
    }

    // Explicitly inform user that developer OAuth credentials need to be set in .env.local
    setProviderConfigModal(provider);
  };

  return (
    <div className="w-full space-y-2.5">
      {/* If Google Client ID is configured, render official Google Identity Services */}
      {googleClientId ? (
        <RealGoogleIdentityButton
          context={context}
          onSuccess={onSuccess}
          onError={onError}
        />
      ) : (
        <button
          type="button"
          onClick={() => handleProviderClick('google')}
          className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2.5 transition-colors cursor-pointer shadow-2xs bg-white"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>{context === 'signup' ? 'Sign up with Google' : 'Sign in with Google'}</span>
        </button>
      )}

      {/* Microsoft Social Button */}
      <button
        type="button"
        onClick={() => handleProviderClick('microsoft')}
        className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2.5 transition-colors cursor-pointer shadow-2xs bg-white"
      >
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 23 23">
          <path fill="#f35325" d="M1 1h10v10H1z" />
          <path fill="#81bc06" d="M12 1h10v10H12z" />
          <path fill="#05a6f0" d="M1 12h10v10H1z" />
          <path fill="#ffba08" d="M12 12h10v10H12z" />
        </svg>
        <span>{context === 'signup' ? 'Sign up with Microsoft' : 'Sign in with Microsoft'}</span>
      </button>

      {/* Apple Social Button */}
      <button
        type="button"
        onClick={() => handleProviderClick('apple')}
        className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2.5 transition-colors cursor-pointer shadow-2xs bg-white"
      >
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 0.92-2.85-.9.04-2.04.62-2.69 1.37-.57.65-.89 1.68-.89 2.76 1.01.08 2.05-.53 2.66-1.28z" />
        </svg>
        <span>{context === 'signup' ? 'Sign up with Apple' : 'Sign in with Apple'}</span>
      </button>

      {/* OAuth Configuration Instructions Modal */}
      {providerConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 text-slate-900 font-sans space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-blue-700">
                <ShieldAlert className="w-5 h-5 shrink-0" />
                <h3 className="text-sm font-bold capitalize">
                  {providerConfigModal} OAuth Setup Required
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setProviderConfigModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              InfraTrace does not use fake credentials. To authenticate through <strong>{providerConfigModal.toUpperCase()}</strong>, configure your client credentials in <code className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-[11px] text-blue-800">.env.local</code>:
            </p>

            <div className="p-3 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px] space-y-1">
              <div># In .env.local:</div>
              {providerConfigModal === 'google' && <div>NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com</div>}
              {providerConfigModal === 'microsoft' && <div>NEXT_PUBLIC_MICROSOFT_CLIENT_ID=your-azure-ad-app-id</div>}
              {providerConfigModal === 'apple' && <div>NEXT_PUBLIC_APPLE_CLIENT_ID=com.yourcompany.infratrace</div>}
            </div>

            <div className="text-[11px] text-slate-500 space-y-1">
              <div>&bull; Authorized Origin: <code className="text-slate-700 font-mono">http://localhost:3000</code></div>
              <div>&bull; Callback URL: <code className="text-slate-700 font-mono">http://localhost:3000/api/auth/social/callback</code></div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setProviderConfigModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
