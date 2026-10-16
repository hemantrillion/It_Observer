'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  CheckCircle2,
  X,
  Lock,
} from 'lucide-react';

interface InfratraceMinimalistLandingPageProps {
  onStartDemo?: () => void;
}

export function InfratraceMinimalistLandingPage({
  onStartDemo,
}: InfratraceMinimalistLandingPageProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'developers' | 'sre' | 'enterprise'>('developers');
  const [authModalType, setAuthModalType] = useState<'signin' | 'signup' | null>(null);

  const handleStartDemo = () => {
    if (onStartDemo) {
      onStartDemo();
    } else {
      router.push('/demo');
    }
  };

  return (
    <div className="min-h-screen w-full bg-white text-[#1f1f1f] font-sans antialiased flex flex-col select-none">
      {/* ======================================================== */}
      {/* 1. TOP UTILITY & MAIN NAVBAR                             */}
      {/* ======================================================== */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#e0e2ec]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
          {/* Left: Brand Logo & Navigation */}
          <div className="flex items-center gap-10">
            <div
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-3 cursor-pointer shrink-0 group"
            >
              <img
                src="/infra_trace_logo.png"
                alt="InfraTrace Logo"
                className="w-10 h-10 object-contain transition-transform group-hover:scale-105"
              />
              <span className="text-2xl font-bold tracking-tight text-[#1f1f1f]">
                InfraTrace
              </span>
            </div>

            {/* Nav links with increased font size */}
            <nav className="hidden md:flex items-center gap-8 text-base font-semibold text-[#444746]">
              <a href="#overview" className="hover:text-[#0b57d0] transition-colors">
                Overview
              </a>
              <a href="#solutions" className="hover:text-[#0b57d0] transition-colors">
                Solutions
              </a>
              <a href="#features" className="hover:text-[#0b57d0] transition-colors">
                Products
              </a>
              <a href="#pricing" className="hover:text-[#0b57d0] transition-colors">
                Pricing
              </a>
              <a href="#docs" className="hover:text-[#0b57d0] transition-colors">
                Resources
              </a>
            </nav>
          </div>

          {/* Right: Search, Docs, Sign In, Sign Up, Start Demo */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* Search Icon */}
            <button
              title="Search documentation"
              className="p-2.5 rounded-full hover:bg-black/5 text-[#444746] transition-colors cursor-pointer"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Docs */}
            <a
              href="/metrics"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex text-sm font-semibold text-[#444746] hover:text-[#1f1f1f] px-3 py-1.5"
            >
              Docs
            </a>

            {/* Sign in Button */}
            <button
              onClick={() => setAuthModalType('signin')}
              className="text-sm sm:text-base font-semibold text-[#1f1f1f] hover:text-[#0b57d0] px-3.5 py-2 rounded-full hover:bg-black/5 transition-colors cursor-pointer"
            >
              Sign in
            </button>

            {/* Sign up Button */}
            <button
              onClick={() => setAuthModalType('signup')}
              className="hidden sm:inline-flex text-sm sm:text-base font-semibold text-[#444746] hover:text-[#1f1f1f] px-4 py-2 rounded-full border border-[#c4c7c5] hover:bg-black/5 transition-colors cursor-pointer"
            >
              Create account
            </button>

            {/* Start Demo Button (Clean, NO arrow) */}
            <button
              onClick={handleStartDemo}
              className="px-5 sm:px-6 py-2.5 rounded-full bg-[#0b57d0] hover:bg-[#0842a0] text-white text-sm sm:text-base font-bold transition-all shadow-xs hover:shadow-md cursor-pointer"
            >
              Start demo
            </button>
          </div>
        </div>
      </header>

      {/* ======================================================== */}
      {/* 2. HERO SECTION (Minimalist, High Impact, Large Fonts)   */}
      {/* ======================================================== */}
      <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 px-4 sm:px-6 overflow-hidden flex flex-col items-center text-center">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-[#d3e3fd]/40 to-[#e8f0fe]/25 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto flex flex-col items-center">
          {/* Centered Cloud/Telemetry Logo Mark */}
          <div className="mb-8 w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-white shadow-lg border border-[#e0e2ec] flex items-center justify-center p-4 hover:scale-105 transition-transform duration-300">
            <img
              src="/infra_trace_logo.png"
              alt="InfraTrace Emblem"
              className="w-full h-full object-contain"
            />
          </div>

          {/* Minimalist Headline with increased, prominent font size */}
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-[#1f1f1f] tracking-tight leading-[1.12] max-w-4xl">
            Get started with InfraTrace
          </h1>

          {/* Subheading with increased font size */}
          <p className="mt-6 sm:mt-8 text-xl sm:text-2xl text-[#444746] max-w-3xl font-normal leading-relaxed">
            Real-time infrastructure observability, automated service health monitoring, and intelligent incident detection for mission-critical cloud systems.
          </p>

          {/* Call to Actions - Start with demo has NO arrow */}
          <div className="mt-10 sm:mt-12 flex flex-wrap items-center justify-center gap-4 sm:gap-5">
            {/* Primary Action: Start with demo (No arrow, bold and prominent) */}
            <button
              onClick={handleStartDemo}
              className="px-8 sm:px-10 py-4 sm:py-4.5 rounded-full bg-[#0b57d0] hover:bg-[#0842a0] text-white text-base sm:text-xl font-bold transition-all shadow-md hover:shadow-xl cursor-pointer"
            >
              Start with demo
            </button>

            {/* Sign in Button */}
            <button
              onClick={() => setAuthModalType('signin')}
              className="px-7 sm:px-9 py-4 sm:py-4.5 rounded-full border border-[#747775]/40 hover:bg-black/5 text-[#1f1f1f] text-base sm:text-xl font-semibold transition-colors cursor-pointer"
            >
              Sign in
            </button>
          </div>

          {/* Quick trust metrics with increased font size */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm sm:text-base text-[#444746] font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#188038]" />
              <span>Zero-config SQLite engine</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#188038]" />
              <span>Sub-second Prometheus scraper</span>
            </div>
            <div className="flex items-center gap-2 hidden sm:flex">
              <CheckCircle2 className="w-5 h-5 text-[#188038]" />
              <span>No credit card required</span>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. SHOWCASE CARDS (Large, High Contrast Cards)           */}
      {/* ======================================================== */}
      <section id="features" className="py-16 px-4 sm:px-6 bg-[#f8fafd] border-y border-[#e0e2ec]">
        <div className="max-w-7xl mx-auto">
          {/* Section header */}
          <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-sm font-bold text-[#0b57d0] uppercase tracking-wider">
                Capabilities
              </span>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-[#1f1f1f] tracking-tight mt-1.5">
                What’s new in InfraTrace Observability
              </h3>
            </div>
            <p className="text-sm sm:text-base text-[#5e5e5e] max-w-lg leading-relaxed">
              Explore how our automated telemetry, database audit trails, and chaos test suites streamline SRE operations.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1: Sub-Second Telemetry */}
            <div
              onClick={handleStartDemo}
              className="bg-[#111214] text-white p-7 rounded-3xl flex flex-col justify-between min-h-[300px] shadow-sm hover:shadow-2xl transition-all duration-300 group cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-36 h-36 bg-[#4285F4]/15 rounded-full blur-2xl group-hover:bg-[#4285F4]/30 transition-all" />
              <div>
                <span className="text-xs font-bold text-[#a8c7fa] uppercase tracking-wider">
                  TELEMETRY
                </span>
                <h4 className="text-xl font-bold text-white mt-3 group-hover:text-[#a8c7fa] transition-colors leading-snug">
                  High-Precision Metrics & Prometheus Exporter
                </h4>
                <p className="text-sm text-gray-400 mt-2.5 leading-relaxed">
                  Live latency metrics, HTTP status codes, and scrape frequency tracking across your distributed cloud targets.
                </p>
              </div>
              <div className="text-sm font-bold text-[#a8c7fa] pt-4">
                Explore telemetry
              </div>
            </div>

            {/* Card 2: Chaos & Resilience */}
            <div
              onClick={handleStartDemo}
              className="bg-[#1e1f20] text-white p-7 rounded-3xl flex flex-col justify-between min-h-[300px] shadow-sm hover:shadow-2xl transition-all duration-300 group cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-36 h-36 bg-[#EA4335]/15 rounded-full blur-2xl group-hover:bg-[#EA4335]/30 transition-all" />
              <div>
                <span className="text-xs font-bold text-[#f28b82] uppercase tracking-wider">
                  CHAOS RESILIENCE
                </span>
                <h4 className="text-xl font-bold text-white mt-3 group-hover:text-[#f28b82] transition-colors leading-snug">
                  Automated Incident Injection & Detection
                </h4>
                <p className="text-sm text-gray-400 mt-2.5 leading-relaxed">
                  Inject network latency, forced 500 errors, and trigger auto-remediation policies with instant timeline tracking.
                </p>
              </div>
              <div className="text-sm font-bold text-[#f28b82] pt-4">
                Test resilience
              </div>
            </div>

            {/* Card 3: Database & User Logs */}
            <div
              onClick={handleStartDemo}
              className="bg-[#111214] text-white p-7 rounded-3xl flex flex-col justify-between min-h-[300px] shadow-sm hover:shadow-2xl transition-all duration-300 group cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-36 h-36 bg-[#34A853]/15 rounded-full blur-2xl group-hover:bg-[#34A853]/30 transition-all" />
              <div>
                <span className="text-xs font-bold text-[#81c995] uppercase tracking-wider">
                  DATABASE ENGINE
                </span>
                <h4 className="text-xl font-bold text-white mt-3 group-hover:text-[#81c995] transition-colors leading-snug">
                  Transparent SQLite Query & User Inspection
                </h4>
                <p className="text-sm text-gray-400 mt-2.5 leading-relaxed">
                  Open database audit trails, direct user table verification, and real-time execution duration metrics.
                </p>
              </div>
              <div className="text-sm font-bold text-[#81c995] pt-4">
                Inspect database
              </div>
            </div>

            {/* Card 4: Gmail-Style Workspace */}
            <div
              onClick={handleStartDemo}
              className="bg-[#1e1f20] text-white p-7 rounded-3xl flex flex-col justify-between min-h-[300px] shadow-sm hover:shadow-2xl transition-all duration-300 group cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-36 h-36 bg-[#FBBC05]/15 rounded-full blur-2xl group-hover:bg-[#FBBC05]/30 transition-all" />
              <div>
                <span className="text-xs font-bold text-[#fdd663] uppercase tracking-wider">
                  WORKSPACE UI
                </span>
                <h4 className="text-xl font-bold text-white mt-3 group-hover:text-[#fdd663] transition-colors leading-snug">
                  Gmail-Grade Observability Cockpit
                </h4>
                <p className="text-sm text-gray-400 mt-2.5 leading-relaxed">
                  Familiar, high-productivity layout with custom wallpapers, quick settings drawer, and 5 responsive flexbox tiers.
                </p>
              </div>
              <div className="text-sm font-bold text-[#fdd663] pt-4">
                Launch workspace
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. AUDIENCE & CODE HIGHLIGHT TABS                        */}
      {/* ======================================================== */}
      <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-center gap-3 border-b border-[#e0e2ec] mb-10">
          <button
            onClick={() => setActiveTab('developers')}
            className={`pb-4 px-6 text-base sm:text-lg font-bold transition-colors relative cursor-pointer ${
              activeTab === 'developers'
                ? 'text-[#0b57d0]'
                : 'text-[#5e5e5e] hover:text-[#1f1f1f]'
            }`}
          >
            <span>Developers</span>
            {activeTab === 'developers' && (
              <span className="absolute bottom-0 inset-x-0 h-0.5 bg-[#0b57d0] rounded-t-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('sre')}
            className={`pb-4 px-6 text-base sm:text-lg font-bold transition-colors relative cursor-pointer ${
              activeTab === 'sre'
                ? 'text-[#0b57d0]'
                : 'text-[#5e5e5e] hover:text-[#1f1f1f]'
            }`}
          >
            <span>SRE & DevOps</span>
            {activeTab === 'sre' && (
              <span className="absolute bottom-0 inset-x-0 h-0.5 bg-[#0b57d0] rounded-t-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('enterprise')}
            className={`pb-4 px-6 text-base sm:text-lg font-bold transition-colors relative cursor-pointer ${
              activeTab === 'enterprise'
                ? 'text-[#0b57d0]'
                : 'text-[#5e5e5e] hover:text-[#1f1f1f]'
            }`}
          >
            <span>Platform Leaders</span>
            {activeTab === 'enterprise' && (
              <span className="absolute bottom-0 inset-x-0 h-0.5 bg-[#0b57d0] rounded-t-full" />
            )}
          </button>
        </div>

        {/* Tab Content Box */}
        <div className="bg-[#f0f4f9] rounded-3xl p-8 sm:p-12 border border-[#e0e2ec] flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="max-w-xl">
            <span className="text-sm font-bold text-[#0b57d0] uppercase tracking-wider">
              {activeTab === 'developers'
                ? 'API-FIRST ARCHITECTURE'
                : activeTab === 'sre'
                ? 'HIGH-AVAILABILITY MONITORING'
                : 'ENTERPRISE GOVERNANCE'}
            </span>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-[#1f1f1f] mt-3 tracking-tight leading-tight">
              {activeTab === 'developers'
                ? 'Inspect telemetry via standard REST & Prometheus endpoints'
                : activeTab === 'sre'
                ? 'Automated background polling with sub-second incident alerts'
                : 'Zero-overhead embedded SQLite with persistent audit trails'}
            </h3>
            <p className="mt-4 text-base sm:text-lg text-[#444746] leading-relaxed">
              {activeTab === 'developers'
                ? 'Query service records, metric timeseries, and incident timelines programmatically using Next.js route handlers.'
                : activeTab === 'sre'
                ? 'Background workers continuously poll endpoints like GitHub REST API, HackerNews, and AWS CloudWatch, auto-triaging degradation.'
                : 'All system metrics, user sessions, and database query durations are logged to local SQLite WAL files for instant verification.'}
            </p>
            <div className="mt-8">
              <button
                onClick={handleStartDemo}
                className="px-7 py-3.5 rounded-full bg-[#0b57d0] hover:bg-[#0842a0] text-white text-sm sm:text-base font-bold shadow-xs transition-colors cursor-pointer"
              >
                Launch Demo Cockpit
              </button>
            </div>
          </div>

          {/* Interactive Code / Metric Visualizer with enlarged font */}
          <div className="w-full md:w-[460px] bg-[#111214] text-white rounded-2xl p-6 shadow-xl border border-white/10 font-mono text-sm">
            <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-white/10 text-gray-400">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                <span className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="w-3 h-3 rounded-full bg-green-500" />
              </span>
              <span className="text-xs uppercase tracking-wider">infratrace-cli</span>
            </div>
            {activeTab === 'developers' ? (
              <pre className="text-green-400 leading-relaxed overflow-x-auto text-sm">
{`$ curl -s http://localhost:3000/api/services
{
  "total": 6,
  "healthy": 5,
  "degraded": 1,
  "down": 0,
  "activeAlerts": 1
}`}
              </pre>
            ) : activeTab === 'sre' ? (
              <pre className="text-cyan-300 leading-relaxed overflow-x-auto text-sm">
{`$ infratrace chaos --target local_service
[CHAOS] Injecting 500ms latency...
[DETECT] Degraded response detected!
[ALERT] Incident INC-8821 active
[RECOVERY] Auto-triage resolved in 4.2s`}
              </pre>
            ) : (
              <pre className="text-amber-300 leading-relaxed overflow-x-auto text-sm">
{`$ sqlite3 database.sqlite
PRAGMA journal_mode = WAL;
SELECT * FROM database_query_logs 
ORDER BY timestamp DESC LIMIT 3;
-- 0.42ms execution time (OK)`}
              </pre>
            )}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. MINIMALIST FOOTER                                     */}
      {/* ======================================================== */}
      <footer className="mt-auto bg-[#f8fafd] border-t border-[#e0e2ec] py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-sm text-[#5e5e5e]">
          <div className="flex items-center gap-3">
            <img src="/infra_trace_logo.png" alt="Logo" className="w-6 h-6 object-contain" />
            <span className="font-bold text-[#1f1f1f]">InfraTrace</span>
            <span>•</span>
            <span>Infrastructure Observability & Telemetry Platform</span>
          </div>

          <div className="flex items-center gap-8 font-medium">
            <button
              onClick={handleStartDemo}
              className="text-[#0b57d0] hover:underline cursor-pointer font-semibold"
            >
              Start Demo
            </button>
            <a href="/metrics" target="_blank" rel="noopener noreferrer" className="hover:underline">
              Prometheus Metrics
            </a>
            <a href="#" className="hover:underline">
              Privacy Policy
            </a>
            <a href="#" className="hover:underline">
              Terms of Service
            </a>
          </div>
        </div>
      </footer>

      {/* ======================================================== */}
      {/* 6. SIGN IN / SIGN UP MODAL                               */}
      {/* ======================================================== */}
      {authModalType && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-[#c4c7c5] p-7 space-y-5 font-sans animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#e8f0fe] text-[#0b57d0] flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-[#1f1f1f]">
                  {authModalType === 'signin' ? 'Sign in to InfraTrace' : 'Create an Account'}
                </h3>
              </div>
              <button
                onClick={() => setAuthModalType(null)}
                className="p-1.5 rounded-full hover:bg-black/5 text-[#444746]"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-[#f0f4f9] border border-[#e0e2ec] text-sm text-[#444746] space-y-2.5">
              <p className="font-semibold text-[#1f1f1f]">
                {authModalType === 'signin'
                  ? 'Sign in authentication will be enabled in the upcoming release.'
                  : 'Account registration on our platform is currently in database-open verification mode.'}
              </p>
              <p>
                To explore the live telemetry cockpit, Prometheus graphs, and database tables right now, please use the <strong>Start Demo</strong> option.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                onClick={() => setAuthModalType(null)}
                className="px-5 py-2.5 rounded-full border border-[#c4c7c5] text-sm font-semibold text-[#444746] hover:bg-black/5"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setAuthModalType(null);
                  handleStartDemo();
                }}
                className="px-6 py-2.5 rounded-full bg-[#0b57d0] hover:bg-[#0842a0] text-white text-sm font-semibold shadow-xs"
              >
                Launch Start Demo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
