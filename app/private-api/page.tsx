'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Cloud,
  FileCode,
  Upload,
  CheckCircle2,
  Server,
  Activity,
  Layers,
  Key,
  Database,
  Plus,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { getActiveAccount } from '@/lib/auth/accounts_manager';

const AWS_METRIC_TEMPLATES = [
  {
    category: 'EC2 Compute & Utilization',
    metrics: [
      { id: 'ec2_cpu', name: 'EC2 CPU Utilization', description: 'Tracks percentage of allocated EC2 compute units in use (% CPU).', defaultEndpoint: 'https://monitoring.us-east-1.amazonaws.com/ec2/cpu' },
      { id: 'ec2_network', name: 'EC2 Network In/Out', description: 'Monitors bytes received and transmitted across all instance ENIs.', defaultEndpoint: 'https://monitoring.us-east-1.amazonaws.com/ec2/network' },
      { id: 'ec2_instance_state', name: 'EC2 Instance State', description: 'Synthetic probe tracking active instance lifecycle state (running/stopping).', defaultEndpoint: 'https://monitoring.us-east-1.amazonaws.com/ec2/state' },
      { id: 'ec2_status_checks', name: 'EC2 Status Checks', description: 'Monitors StatusCheckFailed_System and StatusCheckFailed_Instance events.', defaultEndpoint: 'https://monitoring.us-east-1.amazonaws.com/ec2/status-checks' },
      { id: 'ec2_disk', name: 'EC2 Disk Metrics Where Configured', description: 'Measures completed disk read/write operation rates and burst balance.', defaultEndpoint: 'https://monitoring.us-east-1.amazonaws.com/ec2/disk-io' },
    ],
  },
  {
    category: 'AWS Platform & Health Suite',
    metrics: [
      { id: 'aws_health_dashboard', name: 'AWS Health Dashboard API', description: 'Global feed for AWS infrastructure disruptions and maintenance events.', defaultEndpoint: 'https://health.us-east-1.amazonaws.com/events' },
      { id: 'aws_cloudwatch_alarms', name: 'CloudWatch Alarms Telemetry', description: 'Polls active alarm triggers and state transition evaluations.', defaultEndpoint: 'https://monitoring.us-east-1.amazonaws.com/alarms' },
    ],
  },
];

export default function PrivateApiSetupPage() {
  const router = useRouter();
  const activeUser = getActiveAccount();

  const [suiteName, setSuiteName] = useState('');
  const [setupMode, setSetupMode] = useState<'cloud_aws' | 'upload_file' | 'custom_url'>('cloud_aws');
  const [selectedCloudCsp, setSelectedCloudCsp] = useState<'AWS' | 'GCP' | 'Azure' | 'Cloudflare'>('AWS');
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([
    'ec2_cpu',
    'ec2_network',
    'ec2_instance_state',
    'ec2_status_checks',
    'ec2_disk',
  ]);
  const [apiKey, setApiKey] = useState('');
  const [awsRegion, setAwsRegion] = useState('us-east-1');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const toggleMetric = (id: string) => {
    setSelectedMetrics((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suiteName.trim()) {
      setErrorMessage('Please enter a name for this private API suite.');
      return;
    }
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const endpoints = AWS_METRIC_TEMPLATES.flatMap((group) =>
        group.metrics.filter((m) => selectedMetrics.includes(m.id))
      ).map((m) => ({
        id: m.id,
        name: m.name,
        endpoint: m.defaultEndpoint,
        region: awsRegion,
        intervalSeconds: 15,
      }));

      const res = await fetch('/api/private-api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: activeUser.email,
          name: suiteName,
          suiteType: setupMode,
          cspProvider: selectedCloudCsp,
          serviceCategory: 'AWS Compute & Infrastructure',
          endpoints,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMessage('Private API suite successfully registered and monitoring initiated!');
        setTimeout(() => {
          router.push('/demo');
        }, 1800);
      } else {
        setErrorMessage(data.error || 'Failed to create suite.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafd] text-slate-900 font-sans antialiased flex flex-col select-none">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/demo')}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
              title="Back to Observatory"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2.5">
              <img src="/infra_trace_logo.png" alt="InfraTrace" className="w-8 h-8 object-contain" />
              <span className="text-lg font-bold text-slate-900">Add New Private API Suite</span>
            </div>
          </div>

          <button
            onClick={() => router.push('/demo')}
            className="px-4 py-2 rounded-full border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl w-full mx-auto px-4 py-8 flex-1 space-y-6">
        {successMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-3 animate-in fade-in shadow-2xs">
            <Check className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-semibold">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Suite Name & Type */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
            <div>
              <h2 className="text-base font-bold text-slate-900">1. Name Your Private API Suite</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Provide a descriptive label for this group of monitored endpoints or health checks.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Suite Name *</label>
              <input
                type="text"
                value={suiteName}
                onChange={(e) => setSuiteName(e.target.value)}
                placeholder="e.g. AWS Production EC2 & Telemetry Suite"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                required
              />
            </div>

            {/* Ingestion Mode Picker */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-semibold text-slate-700">Select Integration Method</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setSetupMode('cloud_aws')}
                  className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    setupMode === 'cloud_aws'
                      ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Cloud className="w-5 h-5 text-blue-600" />
                    {setupMode === 'cloud_aws' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                  </div>
                  <span className="text-sm font-bold">Cloud Provider APIs</span>
                  <span className="text-xs text-slate-500 mt-1">AWS EC2, status checks, and CloudWatch metrics.</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSetupMode('upload_file')}
                  className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    setupMode === 'upload_file'
                      ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Upload className="w-5 h-5 text-indigo-600" />
                    {setupMode === 'upload_file' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                  </div>
                  <span className="text-sm font-bold">Upload Health File</span>
                  <span className="text-xs text-slate-500 mt-1">Import bulk endpoints via JSON or CSV manifest.</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSetupMode('custom_url')}
                  className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    setupMode === 'custom_url'
                      ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Server className="w-5 h-5 text-emerald-600" />
                    {setupMode === 'custom_url' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                  </div>
                  <span className="text-sm font-bold">Custom Endpoint</span>
                  <span className="text-xs text-slate-500 mt-1">Directly monitor a specific URL or health path.</span>
                </button>
              </div>
            </div>
          </div>

          {/* Step 2: Cloud Provider & Service Selection */}
          {setupMode === 'cloud_aws' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <div>
                <h2 className="text-base font-bold text-slate-900">2. Select Cloud Provider (CSP)</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Currently configured for Cloud service acceptance. AWS metrics are ready for immediate monitoring.
                </p>
              </div>

              {/* CSP Tabs */}
              <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                {(['AWS', 'GCP', 'Azure', 'Cloudflare'] as const).map((csp) => (
                  <button
                    key={csp}
                    type="button"
                    onClick={() => setSelectedCloudCsp(csp)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      selectedCloudCsp === csp
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {csp}
                  </button>
                ))}
              </div>

              {/* AWS Service Acceptance Checklists */}
              {selectedCloudCsp === 'AWS' ? (
                <div className="space-y-6">
                  {AWS_METRIC_TEMPLATES.map((group) => (
                    <div key={group.category} className="space-y-3">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        {group.category}
                      </span>
                      <div className="space-y-2">
                        {group.metrics.map((metric) => {
                          const isChecked = selectedMetrics.includes(metric.id);
                          return (
                            <div
                              key={metric.id}
                              onClick={() => toggleMetric(metric.id)}
                              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                                isChecked
                                  ? 'border-blue-400 bg-blue-50/50 shadow-2xs'
                                  : 'border-slate-200 hover:border-slate-300 bg-white'
                              }`}
                            >
                              <div
                                className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 border ${
                                  isChecked
                                    ? 'bg-blue-600 border-blue-600 text-white'
                                    : 'border-slate-300 bg-white'
                                }`}
                              >
                                {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="text-sm font-semibold text-slate-900 block">
                                  {metric.name}
                                </span>
                                <span className="text-xs text-slate-500 block mt-0.5">
                                  {metric.description}
                                </span>
                                <span className="text-[11px] font-mono text-slate-400 block mt-1 truncate">
                                  Endpoint: {metric.defaultEndpoint}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                  <span className="text-sm font-bold text-slate-700">{selectedCloudCsp} Monitoring Pipeline</span>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    {selectedCloudCsp} metrics acceptance templates are being synchronized. Please select AWS for the active compute acceptance suite.
                  </p>
                </div>
              )}

              {/* AWS Config Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">AWS Region</label>
                  <select
                    value={awsRegion}
                    onChange={(e) => setAwsRegion(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="us-east-1">us-east-1 (N. Virginia)</option>
                    <option value="us-west-2">us-west-2 (Oregon)</option>
                    <option value="eu-west-1">eu-west-1 (Ireland)</option>
                    <option value="ap-south-1">ap-south-1 (Mumbai)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">API Key / Access Token (Optional)</label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="AWS Access Key or Bearer Token"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* File Upload Mode */}
          {setupMode === 'upload_file' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900">Import Health File (JSON or CSV)</h2>
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 bg-slate-50 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-100 transition-colors">
                <FileCode className="w-10 h-10 text-slate-400 mb-2" />
                <span className="text-sm font-bold text-slate-700">Click to select or drag and drop health manifest</span>
                <span className="text-xs text-slate-400 mt-1">Accepts .json with endpoints array or .csv containing name,url,interval</span>
              </div>
            </div>
          )}

          {/* Custom URL Mode */}
          {setupMode === 'custom_url' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900">Direct Health URL Configuration</h2>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Health Endpoint URL *</label>
                <input
                  type="url"
                  placeholder="https://api.yourcompany.internal/health"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.push('/demo')}
              className="px-5 py-2.5 rounded-full border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-7 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-75"
            >
              <Plus className="w-4 h-4" />
              <span>{isSubmitting ? 'Creating Suite...' : 'Create & Monitor Suite'}</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
