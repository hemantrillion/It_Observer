'use client';

import React, { useState } from 'react';
import { TopHeaderNavigationBarContainer } from '@/components/containers/top_header_navigation_bar_container';
import { SaveCloudCredentialsButtonOnSettings } from '@/components/buttons/save_cloud_credentials_button_on_settings';

export default function SettingsPage() {
  const [githubToken, setGithubToken] = useState('');
  const [awsKeyId, setAwsKeyId] = useState('');
  const [awsSecret, setAwsSecret] = useState('');
  const [cloudflareToken, setCloudflareToken] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      <TopHeaderNavigationBarContainer />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-6 w-full space-y-6">
        <div>
          <h2 className="font-mono font-black text-xl tracking-tight uppercase mb-1">
            TEST SUITE CONFIGURATION & CLOUD ADAPTERS
          </h2>
          <p className="font-mono text-xs opacity-60">
            CONNECT OPTIONAL PRIVATE CREDENTIALS FOR ENHANCED TELEMETRY LIMITS
          </p>
        </div>

        <div className="border-3 border-black p-6 bg-white shadow-brutal space-y-6">
          {/* GitHub Token */}
          <div className="space-y-2">
            <label className="block font-mono text-xs font-black uppercase">
              GITHUB PERSONAL ACCESS TOKEN (OPTIONAL)
            </label>
            <p className="font-mono text-[11px] opacity-60">
              Increases rate limit from 60 to 5,000 requests/hour for GitHub API adapter.
            </p>
            <input
              type="password"
              value={githubToken}
              onChange={(e) => setGithubToken(e.target.value)}
              placeholder="ghp_..."
              className="w-full p-2.5 border-2 border-black font-mono text-xs bg-white text-black focus:outline-none focus:bg-white"
            />
          </div>

          {/* AWS CloudWatch Keys */}
          <div className="space-y-4 border-t-2 border-black pt-4">
            <div>
              <label className="block font-mono text-xs font-black uppercase">
                AWS IAM CREDENTIALS (OPTIONAL)
              </label>
              <p className="font-mono text-[11px] opacity-60">
                Enables live CloudWatch metric querying and EC2/RDS monitoring across 90.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="block font-mono text-[10px] font-bold uppercase mb-1">ACCESS KEY ID</span>
                <input
                  type="text"
                  value={awsKeyId}
                  onChange={(e) => setAwsKeyId(e.target.value)}
                  placeholder="AKIA..."
                  className="w-full p-2.5 border-2 border-black font-mono text-xs bg-white text-black focus:outline-none"
                />
              </div>
              <div>
                <span className="block font-mono text-[10px] font-bold uppercase mb-1">SECRET ACCESS KEY</span>
                <input
                  type="password"
                  value={awsSecret}
                  onChange={(e) => setAwsSecret(e.target.value)}
                  placeholder="••••••••••••••••"
                  className="w-full p-2.5 border-2 border-black font-mono text-xs bg-white text-black focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Cloudflare Token */}
          <div className="space-y-2 border-t-2 border-black pt-4">
            <label className="block font-mono text-xs font-black uppercase">
              CLOUDFLARE API TOKEN (OPTIONAL)
            </label>
            <p className="font-mono text-[11px] opacity-60">
              Enables live edge network latency and security intelligence metrics.
            </p>
            <input
              type="password"
              value={cloudflareToken}
              onChange={(e) => setCloudflareToken(e.target.value)}
              placeholder="cftoken_..."
              className="w-full p-2.5 border-2 border-black font-mono text-xs bg-white text-black focus:outline-none"
            />
          </div>

          <div className="pt-4 border-t-2 border-black flex justify-end">
            <SaveCloudCredentialsButtonOnSettings onSave={handleSave} isSaved={isSaved} />
          </div>
        </div>
      </main>
    </div>
  );
}
