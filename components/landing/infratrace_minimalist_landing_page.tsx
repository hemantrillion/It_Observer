'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  CheckCircle2,
  User,
  ArrowRight,
} from 'lucide-react';
import {
  getActiveAccount,
  UserAccount,
  GUEST_DEMO_USER,
  setActiveAccount,
  DEFAULT_ADMIN_EMAIL,
  syncSessionFromServer,
  isUserAuthenticated,
  signOutActiveAccount,
} from '@/lib/auth/accounts_manager';
import { GoogleAuthButton } from '@/components/auth/google_auth_button';
import { StartingEnvironmentScreen } from './starting_environment_screen';

interface InfratraceMinimalistLandingPageProps {
  onStartDemo?: () => void;
}

export function InfratraceMinimalistLandingPage({
  onStartDemo,
}: InfratraceMinimalistLandingPageProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'developers' | 'sre' | 'enterprise'>('developers');
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isStartingEnv, setIsStartingEnv] = useState(false);
  const [pendingRoute, setPendingRoute] = useState<string>('/console');

  const GOOGLE_CLIENT_ID =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    '1002309612117-pk9vf42asi782km54k6kagmmrc3h931s.apps.googleusercontent.com';

  // Check login state on mount & synchronize with server cookie session + browser Google identity
  useEffect(() => {
    setMounted(true);

    if (!isUserAuthenticated()) {
      setCurrentUser(null);
    } else {
      const acc = getActiveAccount();
      if (acc && acc.email && acc.role !== 'Demo' && acc.email !== GUEST_DEMO_USER.email) {
        setCurrentUser(acc);
      } else {
        setCurrentUser(null);
      }
    }

    syncSessionFromServer().then((user) => {
      if (user && user.email && user.role !== 'Demo' && user.email !== GUEST_DEMO_USER.email) {
        setCurrentUser(user);
      }
    });

    // Check if user explicitly clicked Sign out; if not, initialize GIS for auto-detection
    const isLoggedOut = typeof window !== 'undefined' && localStorage.getItem('infratrace_logged_out') === 'true';
    if (!isLoggedOut && !isUserAuthenticated()) {
      const initGsi = () => {
        const google = (window as any).google;
        if (!google?.accounts?.id) return;
        try {
          google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: async (res: any) => {
              if (res?.credential) {
                const r = await fetch('/api/auth/google', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ credential: res.credential }),
                });
                const d = await r.json();
                if (d.success && d.user) {
                  try {
                    localStorage.removeItem('infratrace_logged_out');
                  } catch {}
                  setActiveAccount(d.user);
                  setCurrentUser(d.user);
                  router.push('/console');
                }
              }
            },
            auto_select: true,
            cancel_on_tap_outside: false,
          });
          google.accounts.id.prompt();
        } catch (e) {}
      };

      const scriptId = 'google-gsi-client-script';
      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = initGsi;
        document.head.appendChild(script);
      } else {
        initGsi();
      }
    }
  }, []);

  const handleLaunchEnvironment = (targetUrl: string = '/console') => {
    setPendingRoute(targetUrl);
    setIsStartingEnv(true);
  };

  const handleStartDemoGuest = () => {
    setActiveAccount(GUEST_DEMO_USER);
    handleLaunchEnvironment('/demo?tab=demo');
  };

  const handleDirectGoogleLogin = () => {
    try {
      localStorage.removeItem('infratrace_logged_out');
    } catch {}
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const redirectUri = `${origin}/api/auth/google/callback`;
    const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
      GOOGLE_CLIENT_ID
    )}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=code&scope=openid%20email%20profile&access_type=offline`;
    window.location.href = oauthUrl;
  };

  const handleEnvironmentReady = () => {
    setIsStartingEnv(false);
    router.push(pendingRoute);
  };

  const isLoggedIn = mounted && Boolean(currentUser && currentUser.email);

  return (
    <div className="min-h-screen w-full bg-white text-[#1f1f1f] font-sans antialiased flex flex-col select-none">
      {/* Starting Environment Animation Modal (Image 5) */}
      {isStartingEnv && (
        <StartingEnvironmentScreen
          onComplete={handleEnvironmentReady}
          title="Starting your environment"
          subtitle="We will send you an email when it's done."
          durationMs={2200}
        />
      )}

      {/* ======================================================== */}
      {/* 1. TOP NAVBAR (Full Width, No Box, Spacing Above)        */}
      {/* ======================================================== */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#e0e2ec] pt-2 pb-2 px-6 sm:px-10 lg:px-14 w-full">
        <div className="w-full flex items-center justify-between gap-6">
          {/* Left: Brand Logo & Name */}
          <div
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-3 cursor-pointer shrink-0 group"
          >
            <img
              src="/infra_trace_logo.png"
              alt="InfraTrace Logo"
              className="w-9 h-9 object-contain transition-transform group-hover:scale-105"
            />
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-[#1f1f1f]">
              InfraTrace
            </span>
          </div>

          {/* Navigation Links directly in top bar */}
          <nav className="hidden md:flex items-center gap-7 lg:gap-9 text-sm sm:text-base font-semibold text-[#444746]">
            <a href="#overview" className="hover:text-[#0b57d0] transition-colors">
              Overview
            </a>
            <a href="#features" className="hover:text-[#0b57d0] transition-colors">
              Products
            </a>
            <a href="#solutions" className="hover:text-[#0b57d0] transition-colors">
              Solutions
            </a>
            <a href="#pricing" className="hover:text-[#0b57d0] transition-colors">
              Pricing
            </a>
            <a href="#resources" className="hover:text-[#0b57d0] transition-colors">
              Resources
            </a>
            <a
              href="/metrics"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#0b57d0] transition-colors"
            >
              Docs
            </a>
          </nav>

          {/* Right: Search Docs Bar & Profile Logo (if logged in) */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative flex items-center w-52 sm:w-72">
              <Search className="w-4 h-4 text-[#747775] absolute left-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Search docs, APIs & telemetry..."
                className="w-full pl-9 pr-3 py-1.5 rounded-full bg-[#f0f4f9] text-xs sm:text-sm text-[#1f1f1f] placeholder-[#747775] border border-transparent focus:border-[#0b57d0] focus:bg-white focus:outline-none transition-all"
              />
            </div>

            {isLoggedIn && (
              <button
                onClick={() => handleLaunchEnvironment(isLoggedIn ? '/console' : '/demo')}
                title={`${currentUser?.name || 'Account'} (${currentUser?.email})`}
                className="w-9 h-9 rounded-full border-2 border-blue-500 p-0.5 hover:ring-2 hover:ring-blue-400 transition-all cursor-pointer overflow-hidden bg-slate-100 shrink-0"
              >
                <img
                  src={currentUser?.profilePicture || currentUser?.avatarUrl || '/avatars/hemant_kumar.jpg'}
                  alt={currentUser?.name || 'User Avatar'}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-full"
                />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ======================================================== */}
      {/* 2. HERO SECTION (Full Width, Left 40% / Right 60% Card)  */}
      {/* ======================================================== */}
      <section id="overview" className="relative pt-10 pb-16 sm:pt-14 sm:pb-24 px-6 sm:px-10 lg:px-14 w-full overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-[#d3e3fd]/25 to-[#e8f0fe]/15 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-14">
          {/* ---------------------------------------------------- */}
          {/* LEFT COLUMN: 40% Width                               */}
          {/* NO square logo at top. Simply:                       */}
          {/* - "Get started with InfraTrace"                      */}
          {/* - Subtitle text                                      */}
          {/* - 3 Checkmarks                                       */}
          {/* - The Box with [Get started with account], [Demo],   */}
          {/*   and circular profile empty logo.                   */}
          {/* ---------------------------------------------------- */}
          <div className="w-full lg:w-[40%] flex flex-col items-start text-left shrink-0 space-y-6">
            {/* Big Headline (NO square logo above) */}
            <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-black text-[#1f1f1f] tracking-tight leading-[1.12]">
              Get started with InfraTrace
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-[#444746] font-normal leading-relaxed">
              Real-time infrastructure observability, automated service health monitoring, and intelligent incident detection for mission-critical cloud systems.
            </p>

            {/* Feature Checkmarks */}
            <div className="space-y-2.5 text-xs sm:text-sm text-[#444746] font-medium">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#188038] shrink-0" />
                <span>Zero-config SQLite engine</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#188038] shrink-0" />
                <span>Sub-second Prometheus scraper</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#188038] shrink-0" />
                <span>No credit card required</span>
              </div>
            </div>

            {/* -------------------------------------------------- */}
            {/* THE BOX (Card below the text)                       */}
            {/* Inside the box:                                    */}
            {/* - Bar with: [Get started with account] [Demo]      */}
            {/*   and circular empty profile logo                  */}
            {/* - When [Get started with account] clicked:         */}
            {/*   ONLY 2 rectangular boxes pop up:                 */}
            {/*   1) Sign in with Google                           */}
            {/*   2) Sign up with Google                           */}
            {/* -------------------------------------------------- */}
            <div className="w-full bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5">
              {/* Action Bar */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
                  {/* Button 1: Continue with Google / Get started */}
                  <button
                    type="button"
                    onClick={() => {
                      if (isLoggedIn) {
                        handleLaunchEnvironment('/console');
                      } else {
                        handleDirectGoogleLogin();
                      }
                    }}
                    className="px-5 py-2.5 rounded-full bg-[#0b57d0] hover:bg-[#0842a0] text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center gap-2 select-none"
                  >
                    {!isLoggedIn && (
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                      </svg>
                    )}
                    <span>{isLoggedIn ? 'Get started' : 'Continue with Google'}</span>
                    {isLoggedIn && <ArrowRight className="w-4 h-4" />}
                  </button>

                  {/* Button 2: Demo */}
                  <button
                    type="button"
                    onClick={handleStartDemoGuest}
                    className="px-4 sm:px-5 py-2.5 rounded-full bg-[#e0e2ec] hover:bg-[#d0d3de] text-[#1f1f1f] text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
                  >
                    Demo
                  </button>
                </div>

                {/* Profile Avatar & Sign Out */}
                <div className="shrink-0 flex items-center gap-2.5">
                  {isLoggedIn ? (
                    <button
                      type="button"
                      onClick={() => handleLaunchEnvironment('/console')}
                      title={`Signed in as ${currentUser?.name || 'User'} (${currentUser?.email}) - Click to enter Console`}
                      className="w-10 h-10 rounded-full border-2 border-blue-500 overflow-hidden bg-white shrink-0 p-0.5 cursor-pointer shadow-xs hover:ring-2 hover:ring-blue-300 transition-all flex items-center justify-center group"
                    >
                      <img
                        src={currentUser?.profilePicture || currentUser?.avatarUrl || '/avatars/hemant_kumar.jpg'}
                        alt={currentUser?.name || 'User Profile'}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform"
                      />
                    </button>
                  ) : (
                    <div
                      title="Sign in with your browser Google account"
                      onClick={handleDirectGoogleLogin}
                      className="w-10 h-10 rounded-full border-2 border-dashed border-slate-300 hover:border-blue-400 bg-slate-50 flex items-center justify-center text-slate-400 hover:text-blue-600 shrink-0 cursor-pointer transition-colors"
                    >
                      <User className="w-5 h-5 stroke-[1.8]" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ---------------------------------------------------- */}
          {/* RIGHT COLUMN: 60% Width                              */}
          {/* Clean Card utilizing full width, ready for the user   */}
          {/* to add their looping video (no cluttered overlays).  */}
          {/* ---------------------------------------------------- */}
          <div className="w-full lg:w-[60%] flex flex-col items-center justify-center" suppressHydrationWarning>
            <div className="w-full rounded-3xl border border-slate-200/90 bg-slate-950 p-2 sm:p-3 shadow-xl overflow-hidden aspect-[16/10] sm:aspect-video flex items-center justify-center relative" suppressHydrationWarning>
              {/* Looping video container card */}
              <video
                autoPlay
                loop
                muted
                playsInline
                poster="/infra_trace_logo.png"
                className="w-full h-full object-cover rounded-2xl"
                suppressHydrationWarning
              >
                <source src="/demo_loop.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. SHOWCASE CAPABILITIES CARDS (Full Width)              */}
      {/* ======================================================== */}
      <section id="features" className="py-16 px-6 sm:px-10 lg:px-14 w-full bg-[#f8fafd] border-y border-[#e0e2ec]">
        <div className="w-full">
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
            {/* Card 1 */}
            <div
              onClick={() => handleLaunchEnvironment('/console')}
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
              <div className="text-sm font-bold text-[#a8c7fa] pt-4 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Explore telemetry</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            {/* Card 2 */}
            <div
              onClick={() => handleLaunchEnvironment('/console')}
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
              <div className="text-sm font-bold text-[#f28b82] pt-4 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Test resilience</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            {/* Card 3 */}
            <div
              onClick={() => handleLaunchEnvironment('/console')}
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
              <div className="text-sm font-bold text-[#81c995] pt-4 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Inspect database</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            {/* Card 4 */}
            <div
              onClick={() => handleLaunchEnvironment('/console')}
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
              <div className="text-sm font-bold text-[#fdd663] pt-4 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Launch workspace</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. AUDIENCE & CODE HIGHLIGHT TABS (Full Width)           */}
      {/* ======================================================== */}
      <section id="solutions" className="py-16 px-6 sm:px-10 lg:px-14 w-full">
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
                onClick={() => handleLaunchEnvironment('/console')}
                className="px-7 py-3.5 rounded-full bg-[#0b57d0] hover:bg-[#0842a0] text-white text-sm sm:text-base font-bold shadow-xs transition-colors cursor-pointer"
              >
                Launch Demo Cockpit
              </button>
            </div>
          </div>

          {/* Interactive Code Visualizer */}
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
      {/* 5. MINIMALIST FOOTER (Full Width)                        */}
      {/* ======================================================== */}
      <footer id="resources" className="mt-auto bg-[#f8fafd] border-t border-[#e0e2ec] py-12 px-6 sm:px-10 lg:px-14 w-full">
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-6 text-sm text-[#5e5e5e]">
          <div className="flex items-center gap-3">
            <img src="/infra_trace_logo.png" alt="Logo" className="w-6 h-6 object-contain" />
            <span className="font-bold text-[#1f1f1f]">InfraTrace</span>
            <span>•</span>
            <span>Infrastructure Observability & Telemetry Platform</span>
          </div>

          <div className="flex items-center gap-8 font-medium">
            <button
              onClick={handleStartDemoGuest}
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
    </div>
  );
}
