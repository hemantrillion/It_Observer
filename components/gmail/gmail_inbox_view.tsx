'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  RotateCw,
  Trash2,
  Clock,
  CheckSquare,
  Square,
  Mail,
  X,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { DensityOption } from './gmail_quick_settings_panel';

interface EmailItem {
  id: string;
  sender: string;
  subject: string;
  snippet: string;
  body: string;
  date: string;
  isUnread: boolean;
  tag?: string;
}

interface PhaseEngineState {
  current_phase_number: number;
  phase_stage: 'BOOTSTRAP_WAITING_DOWN' | 'BOOTSTRAP_WAITING_UP' | 'WINDOW_RUNNING';
  active_window_started_at: string | null;
  active_window_duration_minutes: number;
  up_events_count: number;
  down_events_count: number;
  degraded_events_count: number;
  last_evaluated_at: string | null;
  last_notification_status: string | null;
  previous_notification_status: string | null;
  last_window_duration_minutes: number;
  previous_window_duration_minutes: number;
  updated_at: string;
}

interface PhaseHistoryRecord {
  id: number;
  phase_number: number;
  phase_type: string;
  window_duration_minutes: number;
  started_at: string;
  completed_at: string;
  up_count: number;
  down_count: number;
  degraded_count: number;
  outcome_status: string;
  notification_sent: number;
  notification_subject: string | null;
  recipient_email: string | null;
}

interface GmailInboxViewProps {
  density?: DensityOption;
  hasWallpaper?: boolean;
  userEmail?: string;
  activeMailFolder?: 'inbox' | 'phases';
  onSelectMailFolder?: (folder: 'inbox' | 'phases') => void;
}

export function GmailInboxView({
  density = 'compact',
  hasWallpaper = false,
  userEmail = 'jai18hemant334@gmail.com',
  activeMailFolder = 'inbox',
  onSelectMailFolder,
}: GmailInboxViewProps) {
  // Inbox State
  const [emails, setEmails] = useState<EmailItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeEmail, setActiveEmail] = useState<EmailItem | null>(null);
  const [isLoadingEmails, setIsLoadingEmails] = useState(false);

  // Phases State
  const [phaseState, setPhaseState] = useState<PhaseEngineState | null>(null);
  const [phaseHistory, setPhaseHistory] = useState<PhaseHistoryRecord[]>([]);
  const [isLoadingPhases, setIsLoadingPhases] = useState(false);
  const [isResettingPhases, setIsResettingPhases] = useState(false);
  const [resetFeedback, setResetFeedback] = useState<string | null>(null);

  // Fetch emails from platform_mailbox (reflection of external emails)
  const fetchEmails = useCallback(async () => {
    setIsLoadingEmails(true);
    try {
      const res = await fetch(`/api/mail?email=${encodeURIComponent(userEmail)}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.mails)) {
        const formattedMails: EmailItem[] = data.mails.map((m: any) => ({
          id: m.id,
          sender: m.sender.split('<')[0].trim() || m.sender,
          subject: m.subject,
          snippet: m.snippet,
          body: m.body,
          date: new Date(m.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isUnread: !m.is_read,
          tag: m.tag,
        }));
        setEmails(formattedMails);
      }
    } catch (err) {
      console.error('Failed to fetch mailbox:', err);
    } finally {
      setIsLoadingEmails(false);
    }
  }, [userEmail]);

  // Fetch phase tracker state and history
  const fetchPhases = useCallback(async () => {
    setIsLoadingPhases(true);
    try {
      const res = await fetch('/api/notifications/phases', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setPhaseState(data.state);
        setPhaseHistory(data.history || []);
      }
    } catch (err) {
      console.error('Failed to fetch phases:', err);
    } finally {
      setIsLoadingPhases(false);
    }
  }, []);

  useEffect(() => {
    fetchEmails();
    fetchPhases();
    const interval = setInterval(() => {
      fetchEmails();
      fetchPhases();
    }, 6000);
    return () => clearInterval(interval);
  }, [fetchEmails, fetchPhases]);

  // Clear mailbox handler
  const handleClearMailbox = async () => {
    try {
      await fetch('/api/mail', { method: 'DELETE' });
      setEmails([]);
      setActiveEmail(null);
      setSelectedIds(new Set());
    } catch (err) {
      console.error('Failed to clear mailbox:', err);
    }
  };

  // Reset phases handler
  const handleResetPhases = async () => {
    setIsResettingPhases(true);
    setResetFeedback(null);
    try {
      const res = await fetch('/api/notifications/phases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' }),
      });
      const data = await res.json();
      if (data.success) {
        setPhaseState(data.state);
        setPhaseHistory([]);
        setResetFeedback('Phases reset to Phase 1 (Initial Bootstrap). Next DOWN & UP events will alert immediately.');
        await fetchPhases();
      }
    } catch (err: any) {
      setResetFeedback(`Reset failed: ${err.message}`);
    } finally {
      setIsResettingPhases(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === emails.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(emails.map((e) => e.id)));
    }
  };

  // =========================================================================
  // VIEW 1: PHASES / ROUNDS HISTORY VIEW
  // =========================================================================
  if (activeMailFolder === 'phases') {
    const stageLabel =
      phaseState?.phase_stage === 'BOOTSTRAP_WAITING_DOWN'
        ? 'Phase 1: Initial Bootstrap (Awaiting first incident)'
        : phaseState?.phase_stage === 'BOOTSTRAP_WAITING_UP'
        ? 'Phase 1: Awaiting Initial Recovery (UP)'
        : `Phase ${phaseState?.current_phase_number}: Observation Window in Progress`;

    const windowMinutes = phaseState?.active_window_duration_minutes || 20;
    const n = Math.max(1, Math.round(windowMinutes / 20));
    const upCount = phaseState?.up_events_count || 0;
    const downCount = (phaseState?.down_events_count || 0) + (phaseState?.degraded_events_count || 0);

    return (
      <div className={`flex-1 flex flex-col h-full ${hasWallpaper ? 'bg-transparent' : 'bg-slate-50/70'} overflow-y-auto p-6 font-sans`}>
        <div className="max-w-5xl mx-auto w-full space-y-6">

          {/* Top Control Bar */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                  <h1 className="text-xl font-black text-slate-900 tracking-tight">
                    Phases &amp; Rounds Management
                  </h1>
                </div>
                <p className="text-xs text-slate-500">
                  Adaptive multi-phase observation engine. Multiples of 20 minutes with Fibonacci backoff to prevent email quota fatigue.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={fetchPhases}
                  disabled={isLoadingPhases}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isLoadingPhases ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetPhases}
                  disabled={isResettingPhases}
                  className="px-4 py-2 rounded-xl bg-black hover:bg-slate-800 text-xs font-bold text-white transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <span>{isResettingPhases ? 'Resetting...' : 'Reset All Phases to Phase 1'}</span>
                </button>
              </div>
            </div>

            {/* Reset Feedback Notification */}
            {resetFeedback && (
              <div className="mt-4 p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-900 flex items-center justify-between">
                <span>{resetFeedback}</span>
                <button onClick={() => setResetFeedback(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer text-xs">
                  Dismiss
                </button>
              </div>
            )}

            {/* Current Phase Status Block */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-5">
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/60">
                <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Current Phase</div>
                <div className="text-base font-black text-slate-900 mt-1">
                  Phase {phaseState?.current_phase_number || 1}
                </div>
                <div className="text-[11px] font-medium text-slate-500 mt-0.5 truncate">{stageLabel}</div>
              </div>

              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/60">
                <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Window Duration</div>
                <div className="text-base font-black text-slate-900 mt-1">
                  {phaseState?.phase_stage === 'WINDOW_RUNNING' ? `${windowMinutes} minutes` : 'Immediate (Phase 1)'}
                </div>
                <div className="text-[11px] font-medium text-slate-500 mt-0.5">Scale multiplier n = {n}</div>
              </div>

              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/60">
                <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Observed Probes in Window</div>
                <div className="text-base font-black text-slate-900 mt-1">
                  {upCount} UP &bull; {downCount} DOWN
                </div>
                <div className="text-[11px] font-medium text-slate-500 mt-0.5">Silently recording without notifications</div>
              </div>

              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/60">
                <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Unstable Threshold (n = {n})</div>
                <div className="text-xs font-bold text-slate-800 mt-1">
                  {2 * n} UP + {1 * n} DOWN or {2 * n} DOWN + {1 * n} UP
                </div>
                <div className="text-[11px] font-medium text-purple-700 mt-0.5">Dispatches single Unstable digest</div>
              </div>
            </div>
          </div>

          {/* Completed Phases History Log */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-xs">
                Completed Phases &amp; Rounds History
              </h2>
              <span className="text-xs font-semibold text-slate-400">
                {phaseHistory.length} recorded rounds
              </span>
            </div>

            {phaseHistory.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl space-y-2">
                <Clock className="w-8 h-8 mx-auto text-slate-300" />
                <p>No completed phases yet.</p>
                <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                  Trigger an outage and recovery in Phase 1 to advance to Phase 2 observation windows.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200/80 rounded-xl">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Phase #</th>
                      <th className="p-3">Type / Duration</th>
                      <th className="p-3">Transitions</th>
                      <th className="p-3">Outcome</th>
                      <th className="p-3">Notification Subject</th>
                      <th className="p-3">Dispatched At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {phaseHistory.map((phase) => {
                      const isUnstable = phase.outcome_status === 'UNSTABLE';
                      const isDown = phase.outcome_status === 'DOWN';
                      const isUp = phase.outcome_status === 'UP';

                      return (
                        <tr key={phase.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="p-3 font-bold text-slate-900">
                            Round {phase.phase_number}
                          </td>
                          <td className="p-3 text-slate-600">
                            {phase.window_duration_minutes > 0 ? `${phase.window_duration_minutes}m Window` : 'Immediate (Phase 1)'}
                          </td>
                          <td className="p-3 font-mono text-[11px] text-slate-600">
                            {phase.up_count} UP &bull; {phase.down_count + phase.degraded_count} DOWN
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                isUnstable
                                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                                  : isDown
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }`}
                            >
                              {phase.outcome_status}
                            </span>
                          </td>
                          <td className="p-3 text-slate-700 max-w-sm truncate" title={phase.notification_subject || ''}>
                            {phase.notification_subject || 'Notification dispatched'}
                          </td>
                          <td className="p-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                            {new Date(phase.completed_at).toLocaleTimeString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: LIVE MAIL INBOX (REAL EMAILS REFLECTING RESEND DISPATCHES)
  // =========================================================================
  return (
    <div className={`flex-1 flex flex-col h-full ${hasWallpaper ? 'bg-transparent' : 'bg-white'} select-none overflow-hidden font-sans`}>
      {/* Top Toolbar */}
      <div className={`h-12 border-b border-[#e0e2ec]/70 px-4 flex items-center justify-between shrink-0 ${hasWallpaper ? 'bg-white/70 backdrop-blur-sm' : 'bg-white'}`}>
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={toggleSelectAll}
            className="p-2 rounded hover:bg-black/5 text-[#444746]"
            title="Select all"
          >
            {selectedIds.size > 0 ? <CheckSquare className="w-4 h-4 text-[#0b57d0]" /> : <Square className="w-4 h-4 text-[#747775]" />}
          </button>

          <button
            type="button"
            onClick={fetchEmails}
            title="Refresh Mailbox"
            className="p-2 rounded-full hover:bg-black/5 text-[#444746] transition-colors cursor-pointer"
          >
            <RotateCw className={`w-4 h-4 ${isLoadingEmails ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleClearMailbox}
            title="Clear Mailbox"
            className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 hover:text-rose-700 text-[#444746] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ml-2"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Mailbox</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#444746] font-medium">
            {emails.length} operational {emails.length === 1 ? 'alert' : 'alerts'}
          </span>
        </div>
      </div>

      {/* Main Mailbox Content */}
      <div className="flex-1 overflow-y-auto">
        {emails.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center text-slate-400 p-6 space-y-2">
            <Mail className="w-10 h-10 text-slate-300" />
            <div className="text-sm font-semibold text-slate-600">Your Mailbox is Empty</div>
            <p className="text-xs text-slate-400 max-w-sm">
              Live alert emails sent to <strong>{userEmail}</strong> via Resend will automatically appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {emails.map((email) => {
              const isSelected = selectedIds.has(email.id);
              const isDown = email.subject.includes('DOWN') || email.subject.includes('Alert');
              const isUnstable = email.subject.includes('UNSTABLE');

              return (
                <div
                  key={email.id}
                  onClick={() => setActiveEmail(email)}
                  className={`flex items-center gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors ${
                    email.isUnread ? 'bg-[#f2f6fc]/50 font-bold' : 'bg-white'
                  }`}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const next = new Set(selectedIds);
                      if (next.has(email.id)) next.delete(email.id);
                      else next.add(email.id);
                      setSelectedIds(next);
                    }}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    {isSelected ? <CheckSquare className="w-4 h-4 text-blue-600" /> : <Square className="w-4 h-4" />}
                  </button>

                  <span className="w-48 truncate text-xs font-bold text-slate-900 shrink-0">
                    {email.sender}
                  </span>

                  <div className="flex-1 min-w-0 flex items-center gap-2">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                        isUnstable
                          ? 'bg-purple-100 text-purple-800'
                          : isDown
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {isUnstable ? 'UNSTABLE' : isDown ? 'INCIDENT' : 'RECOVERY'}
                    </span>
                    <span className="text-xs text-slate-900 font-semibold truncate">
                      {email.subject}
                    </span>
                    <span className="text-xs text-slate-400 truncate font-normal">
                      &mdash; {email.snippet}
                    </span>
                  </div>

                  <span className="text-xs text-slate-500 font-mono shrink-0 whitespace-nowrap">
                    {email.date}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Email Reader Modal */}
      {activeEmail && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden font-sans">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div>
                <h3 className="font-bold text-base text-slate-900">{activeEmail.subject}</h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">From: {activeEmail.sender} &bull; {activeEmail.date}</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveEmail(null)}
                className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-200 transition-colors cursor-pointer text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs font-mono whitespace-pre-wrap leading-relaxed text-slate-800">
              {activeEmail.body}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveEmail(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
