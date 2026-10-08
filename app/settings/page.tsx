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
    <div className="min-h-screen bg-white text-black flex flex-col w-full font-sans">
      <TopHeaderNavigationBarContainer />

      <main className="flex-1 w-full px-6 md:px-10 py-8 space-y-6">
        {/* Centered Section Header in Arial */}
        <div className="text-center">
          <h2 className="font-sans font-bold text-sm tracking-wider uppercase text-black">
            // TEST SUITE CONFIGURATION & CLOUD ADAPTERS
          </h2>
          <p className="font-sans text-xs text-black opacity-60">
            Connect Optional Private Credentials For Extended Telemetry Limits
          </p>
        </div>

        <div className="border border-black rounded-lg p-6 bg-white space-y-6 w-full max-w-4xl mx-auto">
          {/* GitHub Token */}
          <div className="space-y-2">
            <label className="block font-sans text-xs font-bold uppercase text-black">
              GITHUB PERSONAL ACCESS TOKEN (OPTIONAL)
            </label>
            <p className="font-sans text-xs opacity-60 text-black">
              Increases rate limit from 60 to 5,000 requests/hour for GitHub API adapter.
            </p>
            <input
              type="password"
              value={githubToken}
              onChange={(e) => setGithubToken(e.target.value)}
              placeholder="ghp_..."
              className="w-full p-2.5 border border-black rounded-md font-mono text-xs bg-white text-black focus:outline-none"
            />
          </div>

          {/* AWS CloudWatch Keys */}
          <div className="space-y-4 border-t border-black/20 pt-4">
            <div>
              <label className="block font-sans text-xs font-bold uppercase text-black">
                AWS IAM CREDENTIALS (OPTIONAL)
              </label>
              <p className="font-sans text-xs opacity-60 text-black">
                Enables live CloudWatch metric querying and EC2/RDS monitoring across 90.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="block font-sans text-[10px] font-bold uppercase mb-1 opacity-70">ACCESS KEY ID</span>
                <input
                  type="text"
                  value={awsKeyId}
                  onChange={(e) => setAwsKeyId(e.target.value)}
                  placeholder="AKIA..."
                  className="w-full p-2.5 border border-black rounded-md font-mono text-xs bg-white text-black focus:outline-none"
                />
              </div>
              <div>
                <span className="block font-sans text-[10px] font-bold uppercase mb-1 opacity-70">SECRET ACCESS KEY</span>
                <input
                  type="password"
                  value={awsSecret}
                  onChange={(e) => setAwsSecret(e.target.value)}
                  placeholder="••••••••••••••••"
                  className="w-full p-2.5 border border-black rounded-md font-mono text-xs bg-white text-black focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Cloudflare Token */}
          <div className="space-y-2 border-t border-black/20 pt-4">
            <label className="block font-sans text-xs font-bold uppercase text-black">
              CLOUDFLARE API TOKEN (OPTIONAL)
            </label>
            <p className="font-sans text-xs opacity-60 text-black">
              Enables live edge network latency and security intelligence metrics.
            </p>
            <input
              type="password"
              value={cloudflareToken}
              onChange={(e) => setCloudflareToken(e.target.value)}
              placeholder="cftoken_..."
              className="w-full p-2.5 border border-black rounded-md font-mono text-xs bg-white text-black focus:outline-none"
            />
          </div>

          <div className="pt-4 border-t border-black/20 flex justify-end">
            <SaveCloudCredentialsButtonOnSettings onSave={handleSave} isSaved={isSaved} />
          </div>
        </div>
      </main>
    </div>
  );
}
