'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  Trash2,
  Save,
  Globe,
} from 'lucide-react';
import { getActiveAccount } from '@/lib/auth/accounts_manager';
import { IMPLEMENTED_METRICS, ImplementedMetricDefinition } from '@/lib/metrics/implemented_metrics_registry';

function PrivateApiSetupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const suiteIdParam = searchParams.get('suiteId');

  const [mounted, setMounted] = useState(false);
  const [activeUser, setActiveUser] = useState<any>({ email: 'jai18hemant334@gmail.com', role: 'Super Admin' });

  useEffect(() => {
    setMounted(true);
    const acc = getActiveAccount();
    if (acc) setActiveUser(acc);
  }, []);

  const [isEditMode, setIsEditMode] = useState(false);
  const [suiteName, setSuiteName] = useState('');
  const [suiteDescription, setSuiteDescription] = useState('');
  const [setupMode, setSetupMode] = useState<'cloud_aws' | 'upload_file' | 'custom_url'>('cloud_aws');
  const [selectedCloudCsp, setSelectedCloudCsp] = useState<'AWS' | 'GCP' | 'Azure' | 'Cloudflare'>('AWS');
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([
    'aws_ec2_cpu',
    'aws_ec2_network_io',
    'aws_lambda_duration',
    'container_memory_usage',
    'host_cpu_load',
  ]);
  const [apiKey, setApiKey] = useState('');
  const [awsRegion, setAwsRegion] = useState('us-east-1');
  const [customEndpointUrl, setCustomEndpointUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [disabledGraphs, setDisabledGraphs] = useState<string[]>([]);

  // Load role visibility configuration
  useEffect(() => {
    async function loadVisibility() {
      try {
        const res = await fetch('/api/visibility');
        const data = await res.json();
        if (data.success && data.configs) {
          const role = activeUser?.role || 'Normal User';
          const roleCfg = data.configs[role];
          if (roleCfg?.a2_elements?.disabled_graphs) {
            setDisabledGraphs(roleCfg.a2_elements.disabled_graphs);
          }
        }
      } catch (err) {
        console.error('Failed to load visibility in private-api setup:', err);
      }
    }
    loadVisibility();
  }, [activeUser?.role]);

  // Filter IMPLEMENTED_METRICS according to Super Admin Visibility
  const visibleMetrics = React.useMemo(() => {
    return IMPLEMENTED_METRICS.filter((m) => {
      if (disabledGraphs && disabledGraphs.length > 0) {
        if (disabledGraphs.includes(m.id) || disabledGraphs.includes(m.name)) {
          return false;
        }
      }
      return true;
    });
  }, [disabledGraphs]);

  // Group visible metrics by category
  const categories = React.useMemo(() => {
    return Array.from(new Set(visibleMetrics.map((m) => m.category)));
  }, [visibleMetrics]);

  // If suiteIdParam is present, fetch existing suite details for editing
  useEffect(() => {
    if (!suiteIdParam) return;
    setIsEditMode(true);

    async function loadSuite() {
      try {
        const res = await fetch(`/api/private-api?suiteId=${encodeURIComponent(suiteIdParam!)}`);
        const data = await res.json();
        if (data.success && data.suite) {
          const s = data.suite;
          setSuiteName(s.name);
          setSetupMode(s.suite_type || 'cloud_aws');
          setSelectedCloudCsp(s.csp_provider || 'AWS');

          try {
            const endpoints = JSON.parse(s.endpoints_json);
            if (Array.isArray(endpoints)) {
              setSelectedMetrics(endpoints.map((ep: any) => ep.id));
              if (endpoints[0]?.region) setAwsRegion(endpoints[0].region);
              if (endpoints[0]?.endpoint && s.suite_type === 'custom_url') {
                setCustomEndpointUrl(endpoints[0].endpoint);
              }
            }
          } catch {
            // ignore JSON parse error
          }
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to load existing suite.');
      }
    }

    loadSuite();
  }, [suiteIdParam]);

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
      let endpoints: any[] = [];
      if (setupMode === 'cloud_aws') {
        endpoints = IMPLEMENTED_METRICS.filter((m) => selectedMetrics.includes(m.id)).map((m) => ({
          id: m.id,
          name: m.name,
          category: m.category,
          unit: m.unit,
          endpoint: m.sampleApiUrl,
          region: awsRegion,
          intervalSeconds: m.expectedIntervalSeconds,
        }));
      } else if (setupMode === 'custom_url') {
        endpoints = [
          {
            id: `custom_${Date.now()}`,
            name: suiteName,
            category: 'Custom Microservice',
            unit: 'ms',
            endpoint: customEndpointUrl || 'https://api.internal/health',
            region: 'global',
            intervalSeconds: 15,
          },
        ];
      } else {
        endpoints = [
          {
            id: `file_${Date.now()}`,
            name: `${suiteName} (Imported Manifest)`,
            category: 'Manifest Telemetry',
            unit: 'ms',
            endpoint: 'https://manifest.internal/batch-health',
            region: 'us-east-1',
            intervalSeconds: 30,
          },
        ];
      }

      const method = isEditMode ? 'PUT' : 'POST';
      const payload: any = {
        suiteId: suiteIdParam,
        userEmail: activeUser.email,
        name: suiteName,
        suiteType: setupMode,
        cspProvider: selectedCloudCsp,
        serviceCategory: 'Cloud Compute & Infrastructure',
        endpoints,
      };

      const res = await fetch('/api/private-api', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMessage(
          isEditMode
            ? 'Private API suite updated successfully!'
            : 'Private API suite successfully registered and monitoring initiated!'
        );
        setTimeout(() => {
          router.push('/console');
        }, 1500);
      } else {
        setErrorMessage(data.error || 'Failed to save suite.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSuite = async () => {
    if (!suiteIdParam) return;
    if (!window.confirm('Are you sure you want to delete this private API suite?')) return;

    setIsDeleting(true);
    try {
      const res = await fetch(
        `/api/private-api?suiteId=${encodeURIComponent(suiteIdParam)}&email=${encodeURIComponent(
          activeUser.email
        )}`,
        { method: 'DELETE' }
      );
      const data = await res.json();
      if (data.success) {
        setSuccessMessage('Private API suite successfully removed.');
        setTimeout(() => {
          router.push('/console');
        }, 1000);
      } else {
        setErrorMessage(data.error || 'Failed to delete suite.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Delete operation failed.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f8fafd] text-slate-900 font-sans antialiased flex flex-col select-none">
      {/* Full-Width Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
        <div className="w-full px-6 sm:px-12 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/console')}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
              title="Back to Observatory"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2.5">
              <img src="/infra_trace_logo.png" alt="InfraTrace" className="w-8 h-8 object-contain" />
              <span className="text-lg font-bold text-slate-900">
                {isEditMode ? 'Edit Private API Suite' : 'Add New Private API Suite'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isEditMode && (
              <button
                type="button"
                onClick={handleDeleteSuite}
                disabled={isDeleting}
                className="px-4 py-2 rounded-full border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Deleting...' : 'Delete Suite'}</span>
              </button>
            )}
            <button
              onClick={() => router.push('/console')}
              className="px-4 py-2 rounded-full border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </header>

      {/* Full-Width Main Content */}
      <main className="w-full px-6 sm:px-12 py-8 flex-1 space-y-6 max-w-6xl mx-auto">
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

        <form onSubmit={handleSubmit}>
          {/* Single Continuous Form Card */}
          <div className="w-full bg-white rounded-2xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-8">
            {/* Section 1: Suite Identification */}
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {isEditMode ? 'Edit Suite Settings & Owner' : 'Private API Suite Identification'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Define an identifier and operational scope for this private telemetry suite owned by{' '}
                  <strong className="text-slate-700 font-mono" suppressHydrationWarning>{activeUser.email}</strong>.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Description / Environment</label>
                  <input
                    type="text"
                    value={suiteDescription}
                    onChange={(e) => setSuiteDescription(e.target.value)}
                    placeholder="e.g. Production telemetry and compute synthetic probes"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Integration Method */}
            <div className="pt-6 border-t border-slate-100 space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Integration Method</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Choose how health endpoints and telemetry feeds are ingested into InfraTrace.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <button
                  type="button"
                  onClick={() => setSetupMode('cloud_aws')}
                  className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    setupMode === 'cloud_aws'
                      ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <Cloud className="w-5 h-5 text-blue-600" />
                    {setupMode === 'cloud_aws' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                  </div>
                  <span className="text-sm font-bold">Practical Metrics Suite</span>
                  <span className="text-xs text-slate-500 mt-1">
                    Select from shared practical metrics across Cloud, Containers, DB & Host.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSetupMode('upload_file')}
                  className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    setupMode === 'upload_file'
                      ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <Upload className="w-5 h-5 text-indigo-600" />
                    {setupMode === 'upload_file' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                  </div>
                  <span className="text-sm font-bold">Upload Health File</span>
                  <span className="text-xs text-slate-500 mt-1">Import bulk endpoints via JSON or CSV manifest.</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSetupMode('custom_url')}
                  className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    setupMode === 'custom_url'
                      ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <Server className="w-5 h-5 text-emerald-600" />
                    {setupMode === 'custom_url' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                  </div>
                  <span className="text-sm font-bold">Custom Endpoint</span>
                  <span className="text-xs text-slate-500 mt-1">Directly monitor a specific URL or health path.</span>
                </button>
              </div>
            </div>

            {/* Section 3: Shared Practical Metrics (Single Source of Truth) */}
            {setupMode === 'cloud_aws' && (
              <div className="pt-6 border-t border-slate-100 space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Shared Telemetry Signals ({selectedMetrics.length} selected)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Unified metric catalogue shared with Settings & Observatory. Select the telemetry signals to monitor in this suite.
                  </p>
                </div>

                {/* CSP Tabs */}
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
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

                {/* Grouped Practical Metrics */}
                <div className="space-y-6">
                  {categories.map((category) => {
                    const metricsInCat = visibleMetrics.filter((m) => m.category === category);
                    return (
                      <div key={category} className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            {category}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {metricsInCat.length} practical metrics
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {metricsInCat.map((metric) => {
                            const isChecked = selectedMetrics.includes(metric.id);
                            return (
                              <div
                                key={metric.id}
                                onClick={() => toggleMetric(metric.id)}
                                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
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
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="text-sm font-semibold text-slate-900 truncate">
                                      {metric.name}
                                    </span>
                                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">
                                      {metric.unit}
                                    </span>
                                  </div>
                                  <span className="text-xs text-slate-500 block mt-0.5 leading-relaxed">
                                    {metric.description}
                                  </span>
                                  <span className="text-[11px] font-mono text-slate-400 block mt-1.5 truncate">
                                    Target: {metric.sampleApiUrl}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Section 3 (Alternative): Upload Health File */}
            {setupMode === 'upload_file' && (
              <div className="pt-6 border-t border-slate-100 space-y-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Upload Health File Manifest</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Import bulk endpoints via JSON array or CSV spreadsheet.
                  </p>
                </div>
                <div className="border-2 border-dashed border-slate-300 rounded-2xl p-10 bg-slate-50/70 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-100/70 transition-colors">
                  <FileCode className="w-12 h-12 text-slate-400 mb-3" />
                  <span className="text-sm font-bold text-slate-800">
                    Click to select or drag and drop health manifest
                  </span>
                  <span className="text-xs text-slate-500 mt-1 max-w-md">
                    Accepts .json files containing endpoint definitions or .csv files with columns (name, endpoint, interval_seconds).
                  </span>
                </div>
              </div>
            )}

            {/* Section 3 (Alternative): Custom Endpoint */}
            {setupMode === 'custom_url' && (
              <div className="pt-6 border-t border-slate-100 space-y-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Direct Health URL Configuration</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Enter the URL of your service health check or telemetry API.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Health Endpoint URL *</label>
                  <input
                    type="url"
                    value={customEndpointUrl}
                    onChange={(e) => setCustomEndpointUrl(e.target.value)}
                    placeholder="https://api.yourcompany.internal/health"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                    required
                  />
                </div>
              </div>
            )}

            {/* Section 4: Regional Deployment & Credentials */}
            <div className="pt-6 border-t border-slate-100 space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Regional Deployment & Credentials</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Specify deployment region and optional authentication tokens.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Cloud Region</label>
                  <select
                    value={awsRegion}
                    onChange={(e) => setAwsRegion(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="us-east-1">us-east-1 (N. Virginia)</option>
                    <option value="us-west-2">us-west-2 (Oregon)</option>
                    <option value="eu-west-1">eu-west-1 (Ireland)</option>
                    <option value="ap-south-1">ap-south-1 (Mumbai)</option>
                    <option value="ap-southeast-1">ap-southeast-1 (Singapore)</option>
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

            {/* Form Actions */}
            <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => router.push('/console')}
                className="px-5 py-2.5 rounded-full border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-7 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-75"
              >
                {isEditMode ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                <span>
                  {isSubmitting
                    ? isEditMode
                      ? 'Saving Suite Changes...'
                      : 'Creating Suite...'
                    : isEditMode
                    ? 'Save Suite Changes'
                    : 'Create & Monitor Suite'}
                </span>
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}

export default function PrivateApiSetupPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500 font-sans">Loading Suite Editor...</div>}>
      <PrivateApiSetupForm />
    </Suspense>
  );
}
