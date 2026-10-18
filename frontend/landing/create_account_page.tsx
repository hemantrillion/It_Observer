'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Lock,
  Mail,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  Check,
  KeyRound,
} from 'lucide-react';
import { setActiveAccount, UserAccount } from '@/lib/auth/accounts_manager';
import { GoogleAuthModal } from '@/components/auth/google_auth_modal';

interface CreateAccountViewProps {
  onBack?: () => void;
  onGoToSignIn?: (prefilledEmail?: string) => void;
  onSuccess?: () => void;
}

export function CreateAccountView({ onBack, onGoToSignIn, onSuccess }: CreateAccountViewProps) {
  const router = useRouter();

  // Multi-step states: 'step1' | 'account_exists' | 'otp' | 'step2' | 'provisioning'
  const [currentStep, setCurrentStep] = useState<'step1' | 'account_exists' | 'otp' | 'step2' | 'provisioning'>('step1');

  // Form State
  const [email, setEmail] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [otpCountdown, setOtpCountdown] = useState(60);
  const [canResendOtp, setCanResendOtp] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpPreviewCode, setOtpPreviewCode] = useState('');

  // Step 2 Form State
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [country, setCountry] = useState('India');
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [phone, setPhone] = useState('');
  const [interest, setInterest] = useState('Infrastructure Monitoring');

  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Password validation checks
  const hasMinLength = password.length >= 12;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumberOrSpecial = /[0-9!@#$%^&*(),.?":{}|<>]/.test(password);
  const isPasswordValid = hasMinLength && hasLower && hasUpper && hasNumberOrSpecial;

  // Countdown timer for OTP
  useEffect(() => {
    let timer: any;
    if (currentStep === 'otp' && otpCountdown > 0) {
      timer = setInterval(() => {
        setOtpCountdown((prev) => {
          if (prev <= 1) {
            setCanResendOtp(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [currentStep, otpCountdown]);

  // Handle Step 1 Submit
  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');
    if (!email || !email.includes('@')) {
      setGeneralError('Please enter a valid email address.');
      return;
    }
    if (!agreedToTerms) {
      setGeneralError('You must agree to the Terms of Use to proceed.');
      return;
    }

    setIsLoading(true);
    try {
      const checkRes = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });
      const checkData = await checkRes.json();

      if (checkData.exists) {
        setIsLoading(false);
        setCurrentStep('account_exists');
        return;
      }

      // Send OTP
      const otpRes = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });
      const otpData = await otpRes.json();

      if (otpData.success) {
        if (otpData.otpPreview) {
          setOtpPreviewCode(otpData.otpPreview);
        }
        setOtpCountdown(60);
        setCanResendOtp(false);
        setOtpValues(['', '', '', '', '', '']);
        setCurrentStep('otp');
      } else {
        setGeneralError(otpData.error || 'Failed to send verification code.');
      }
    } catch (err: any) {
      setGeneralError(err.message || 'Network error.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP Box Input
  const handleOtpChange = (index: number, val: string) => {
    if (val.length > 1) {
      // Pasting full 6-digit code
      const digits = val.replace(/\D/g, '').slice(0, 6).split('');
      const newOtp = [...otpValues];
      digits.forEach((d, i) => {
        if (i < 6) newOtp[i] = d;
      });
      setOtpValues(newOtp);
      const nextFocus = Math.min(digits.length, 5);
      otpInputRefs.current[nextFocus]?.focus();
      return;
    }

    const newOtp = [...otpValues];
    newOtp[index] = val;
    setOtpValues(newOtp);

    if (val && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Auto-fill OTP from preview code
  const handleAutoFillOtp = () => {
    if (otpPreviewCode && otpPreviewCode.length === 6) {
      const digits = otpPreviewCode.split('');
      setOtpValues(digits);
      otpInputRefs.current[5]?.focus();
    }
  };

  // Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');
    const fullOtp = otpValues.join('');
    if (fullOtp.length < 6) {
      setOtpError('Please enter the full 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim(), otp: fullOtp }),
      });
      const data = await res.json();

      if (data.success) {
        setCurrentStep('step2');
      } else {
        setOtpError(data.error || 'Invalid code.');
      }
    } catch (err: any) {
      setOtpError(err.message || 'Verification failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResendOtp) return;
    setIsLoading(true);
    setOtpError('');
    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.otpPreview) {
          setOtpPreviewCode(data.otpPreview);
        }
        setOtpCountdown(60);
        setCanResendOtp(false);
      } else {
        setOtpError(data.error || 'Failed to resend code.');
      }
    } catch (err: any) {
      setOtpError(err.message || 'Network error.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Step 2 Complete Registration
  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) {
      setGeneralError('Please meet all password complexity requirements.');
      return;
    }

    setIsLoading(true);
    setGeneralError('');
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          password,
          firstName,
          lastName,
          company,
          jobTitle,
          phone,
          country,
          interests: interest,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setActiveAccount(data.user);
        setCurrentStep('provisioning');
        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          } else {
            router.push('/demo');
          }
        }, 2600);
      } else {
        setGeneralError(data.error || 'Failed to complete registration.');
      }
    } catch (err: any) {
      setGeneralError(err.message || 'Registration network error.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google Auth Success from Modal
  const handleGoogleSuccess = (user: UserAccount) => {
    setCurrentStep('provisioning');
    setTimeout(() => {
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/demo');
      }
    }, 2200);
  };

  return (
    <div
      style={{
        backgroundColor: '#0047bb',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
      className="w-full text-white font-sans antialiased p-4 sm:p-6 select-none relative overflow-x-hidden"
    >
      {/* Top Bar: Brand Logo & Login Button (Exact Dynatrace Alignment) */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between pt-2">
        <div
          onClick={onBack || (() => router.push('/'))}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <img src="/infra_trace_logo.png" alt="InfraTrace" className="w-9 h-9 object-contain" />
          <span className="text-xl font-bold tracking-tight text-white">InfraTrace</span>
        </div>

        <button
          onClick={() => onGoToSignIn ? onGoToSignIn() : router.push('/signin')}
          className="px-5 py-2 rounded-lg bg-white text-slate-900 text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer shadow-xs"
        >
          Login
        </button>
      </header>

      {/* Main Centered Container */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        className="w-full max-w-xl mx-auto py-8 my-auto"
      >
        {/* Step Heading (Bold White) */}
        <div className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Try with your data
          </h1>
          <p className="text-xs text-blue-100 mt-1.5 font-medium">
            Start observing your infrastructure and APIs in minutes.
          </p>
        </div>

        {/* Global Error Banner */}
        {generalError && (
          <div className="w-full max-w-[540px] mb-4 p-3.5 rounded-2xl bg-rose-500 border border-rose-300 text-white text-xs font-semibold text-center shadow-lg">
            {generalError}
          </div>
        )}

        {/* ======================================================== */}
        {/* CARD 1: STEP 1 OF 2                                      */}
        {/* ======================================================== */}
        {currentStep === 'step1' && (
          <div className="w-full max-w-[540px] bg-white rounded-2xl p-7 sm:p-8 shadow-2xl text-slate-900 border border-slate-100 space-y-6 animate-in fade-in duration-200">
            <form onSubmit={handleStep1Submit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800">Your email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 text-sm outline-none transition-all text-slate-900"
                  required
                />
              </div>

              {/* Terms Checkbox */}
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-xs text-slate-600 leading-relaxed">
                  I have read and agree to the <strong className="text-slate-900 underline">InfraTrace Terms of Use</strong> (including any future modifications).
                </span>
              </label>

              {/* Continue with Google Option */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setIsGoogleModalOpen(true)}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2.5 transition-colors cursor-pointer shadow-2xs"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </div>

              {/* Bottom Card Controls (Exact Dynatrace Buttons) */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <span className="text-xs text-slate-400 font-semibold">Step 1 of 2</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={onBack || (() => router.push('/'))}
                    className="px-5 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    style={{ backgroundColor: '#0047bb' }}
                    className="px-6 py-2.5 rounded-lg hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-75 shadow-xs"
                  >
                    {isLoading ? 'Checking...' : 'Continue'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* ======================================================== */}
        {/* CARD 2: ACCOUNT ALREADY EXISTS                           */}
        {/* ======================================================== */}
        {currentStep === 'account_exists' && (
          <div className="w-full max-w-[540px] bg-white rounded-2xl p-8 sm:p-10 shadow-2xl text-slate-900 border border-slate-100 space-y-6 text-center animate-in fade-in duration-200">
            <h2 className="text-2xl font-bold text-slate-900">Account already exists</h2>
            <p className="text-sm text-slate-600">
              An account with email <strong className="text-slate-900">{email}</strong> already exists.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => onGoToSignIn ? onGoToSignIn(email) : router.push(`/signin?email=${encodeURIComponent(email)}`)}
                style={{ backgroundColor: '#0047bb' }}
                className="w-full sm:w-auto px-6 py-3 rounded-xl hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                Log in instead
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('');
                  setCurrentStep('step1');
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                Use a different email
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* CARD 3: OTP VERIFICATION                                  */}
        {/* ======================================================== */}
        {currentStep === 'otp' && (
          <div className="w-full max-w-[540px] bg-white rounded-2xl p-6 sm:p-8 shadow-2xl text-slate-900 border border-slate-100 space-y-6 animate-in fade-in duration-200">
            {/* Prominent Instant Code Banner */}
            {otpPreviewCode && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-bold">Verification Code:</span>
                    <span className="font-mono text-base font-extrabold tracking-widest text-blue-700 bg-white px-2 py-0.5 rounded border border-amber-300">
                      {otpPreviewCode}
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-800">
                    Also delivered to your email and platform inbox.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAutoFillOtp}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer transition-colors shrink-0 shadow-2xs"
                >
                  Auto-fill Code
                </button>
              </div>
            )}

            <div className="text-center space-y-1">
              <h2 className="text-xl font-bold text-slate-900">Verify your email address</h2>
              <p className="text-xs text-slate-500">
                Enter the 6-digit code sent to <span className="font-semibold text-slate-800">{email}</span>
              </p>
            </div>

            {otpError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold text-center">
                {otpError}
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-6">
              {/* 6 Digit Inputs */}
              <div className="flex items-center justify-center gap-2.5 sm:gap-3">
                {otpValues.map((val, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      otpInputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={val}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-slate-900 bg-slate-50/50"
                  />
                ))}
              </div>

              {/* Resend & Cooldown */}
              <div className="text-center text-xs text-slate-500">
                {canResendOtp ? (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="text-blue-600 font-bold hover:underline cursor-pointer"
                  >
                    Resend verification code
                  </button>
                ) : (
                  <span>Resend code in <strong className="text-slate-800">{otpCountdown}s</strong></span>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep('step1')}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  Edit email
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{ backgroundColor: '#0047bb' }}
                  className="px-6 py-2.5 rounded-lg hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-75 shadow-xs"
                >
                  {isLoading ? 'Verifying...' : 'Verify & Continue'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ======================================================== */}
        {/* CARD 4: STEP 2 OF 2 (User Details & Password)            */}
        {/* ======================================================== */}
        {currentStep === 'step2' && (
          <div className="w-full max-w-[540px] bg-white rounded-2xl p-6 sm:p-8 shadow-2xl text-slate-900 border border-slate-100 space-y-6 animate-in fade-in duration-200">
            <form onSubmit={handleStep2Submit} className="space-y-5">
              {/* Verified Email Banner */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="min-w-0">
                  <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">Your email</span>
                  <span className="text-sm font-semibold text-slate-800 truncate block">{email}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep('step1')}
                  className="text-xs font-bold text-blue-600 hover:underline cursor-pointer px-2"
                >
                  Edit
                </button>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create your password"
                    className="w-full px-4 py-3 pr-10 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 text-sm outline-none transition-all text-slate-900"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Criteria Checklist */}
                <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs text-slate-600">
                  <div className={`flex items-center gap-2 ${hasMinLength ? 'text-emerald-600 font-semibold' : 'text-slate-500'}`}>
                    <Check className={`w-3.5 h-3.5 ${hasMinLength ? 'opacity-100' : 'opacity-40'}`} />
                    <span>Minimum 12 characters long</span>
                  </div>
                  <div className={`flex items-center gap-2 ${hasLower ? 'text-emerald-600 font-semibold' : 'text-slate-500'}`}>
                    <Check className={`w-3.5 h-3.5 ${hasLower ? 'opacity-100' : 'opacity-40'}`} />
                    <span>1 lowercase letter</span>
                  </div>
                  <div className={`flex items-center gap-2 ${hasUpper ? 'text-emerald-600 font-semibold' : 'text-slate-500'}`}>
                    <Check className={`w-3.5 h-3.5 ${hasUpper ? 'opacity-100' : 'opacity-40'}`} />
                    <span>1 uppercase letter</span>
                  </div>
                  <div className={`flex items-center gap-2 ${hasNumberOrSpecial ? 'text-emerald-600 font-semibold' : 'text-slate-500'}`}>
                    <Check className={`w-3.5 h-3.5 ${hasNumberOrSpecial ? 'opacity-100' : 'opacity-40'}`} />
                    <span>1 number or special character</span>
                  </div>
                </div>
              </div>

              {/* Country Dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">Country *</label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-sm outline-none focus:border-blue-600 text-slate-900 cursor-pointer"
                >
                  <option value="India">India</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Germany">Germany</option>
                  <option value="Singapore">Singapore</option>
                  <option value="Japan">Japan</option>
                  <option value="Australia">Australia</option>
                </select>
              </div>

              {/* Accordion: Additional Information (Optional) */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowAdditionalInfo(!showAdditionalInfo)}
                  className="w-full p-3.5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                >
                  <span>Additional information (optional)</span>
                  {showAdditionalInfo ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showAdditionalInfo && (
                  <div className="p-4 space-y-3 bg-white border-t border-slate-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600">First name</label>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="First name"
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs outline-none text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600">Last name</label>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Last name"
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs outline-none text-slate-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-600">Company</label>
                      <input
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="Company name"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs outline-none text-slate-900"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600">Job title</label>
                        <input
                          type="text"
                          value={jobTitle}
                          onChange={(e) => setJobTitle(e.target.value)}
                          placeholder="Job title"
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs outline-none text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600">Phone number</label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Phone number"
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs outline-none text-slate-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-600">What are you interested in?</label>
                      <select
                        value={interest}
                        onChange={(e) => setInterest(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs outline-none bg-white text-slate-900 cursor-pointer"
                      >
                        <option value="Infrastructure Monitoring">Infrastructure Monitoring</option>
                        <option value="Application Performance">Application Performance</option>
                        <option value="Cloud Cost & Synthetic Checks">Cloud Cost & Synthetic Checks</option>
                        <option value="Chaos Simulation & Reliability">Chaos Simulation & Reliability</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Disclaimer text */}
              <p className="text-[11px] text-slate-500 leading-relaxed">
                By submitting this form, I agree to receive communications from InfraTrace LLC and its affiliates. Refer to our Privacy Notice for details.
              </p>

              {/* Bottom Card Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <span className="text-xs text-slate-400 font-semibold">Step 2 of 2</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentStep('step1')}
                    className="px-5 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || !isPasswordValid}
                    style={{ backgroundColor: '#0047bb' }}
                    className="px-6 py-2.5 rounded-lg hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
                  >
                    {isLoading ? 'Creating account...' : 'Start trial'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* ======================================================== */}
        {/* CARD 5: ENVIRONMENT PROVISIONING                         */}
        {/* ======================================================== */}
        {currentStep === 'provisioning' && (
          <div className="w-full max-w-[540px] bg-white rounded-2xl p-10 sm:p-14 shadow-2xl text-slate-900 border border-slate-100 text-center space-y-6 animate-in zoom-in-95 duration-300">
            {/* Animated Glowing 3D Gradient Globe */}
            <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-500 to-emerald-400 animate-spin blur-xs opacity-70" />
              <div className="relative w-32 h-32 rounded-full bg-gradient-to-tr from-[#0047bb] via-[#6366f1] to-[#10b981] shadow-2xl flex items-center justify-center overflow-hidden border-2 border-white/40">
                <div className="w-full h-full bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:12px_12px] opacity-30 animate-pulse" />
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Starting your environment</h2>
              <p className="text-xs text-slate-500 font-medium">
                We will send you an email when it's done.
              </p>
            </div>

            <div className="pt-2">
              <div className="w-48 h-1.5 bg-slate-100 rounded-full mx-auto overflow-hidden">
                <div className="w-full h-full bg-blue-600 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        )}

        {/* Bottom Helper Links (Exact Dynatrace footer) */}
        <div className="text-center pt-8 space-y-2 text-xs text-blue-100">
          <p>
            Want to try with sample data?{' '}
            <button
              onClick={() => router.push('/demo')}
              className="text-white font-bold underline hover:text-blue-200 cursor-pointer"
            >
              Try Playground.
            </button>
          </p>
          <p>
            <strong className="text-white">Request a demo</strong> to learn more about the InfraTrace platform.
          </p>
        </div>
      </main>

      {/* Google Sign-In Chooser Modal */}
      <GoogleAuthModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        onSuccess={handleGoogleSuccess}
        initialEmail={email}
      />
    </div>
  );
}
