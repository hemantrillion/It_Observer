'use client';

import React, { useState, useEffect } from 'react';

export function DeliveryView() {
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isExecutingChaos, setIsExecutingChaos] = useState(false);

  const handleSendTestEmail = async () => {
    setIsSendingTest(true);
    setFeedbackMessage(null);
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          state: 'DOWN',
          serviceName: 'Local Controlled Node Service',
          serviceId: 'local_controlled_service',
          targetUrl: 'http://localhost:5001/metrics',
          recipient: 'jai18hemant334@gmail.com',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMessage(`Test notification successfully dispatched to ${data.recipient} via ${data.provider}.`);
      } else {
        setFeedbackMessage(`Delivery error: ${data.error || 'Failed to dispatch'}`);
      }
    } catch (err: any) {
      setFeedbackMessage(`Dispatch exception: ${err.message}`);
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleTriggerChaos = async (action: 'down' | 'recover' | 'lag') => {
    setIsExecutingChaos(true);
    setFeedbackMessage(null);
    try {
      const res = await fetch('/api/chaos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, runPoller: true, port: 5001 }),
      });
      const data = await res.json();
      if (data.success) {
        if (action === 'down') {
          setFeedbackMessage('Local service crash injected (HTTP 503). Two poll cycles executed: state confirmed DOWN.');
        } else if (action === 'recover') {
          setFeedbackMessage('Local service restored to healthy (HTTP 200). Two poll cycles executed: state confirmed UP.');
        } else if (action === 'lag') {
          setFeedbackMessage('Artificial 2500ms lag injected. Poll cycle executed: state confirmed DEGRADED.');
        }
      } else {
        setFeedbackMessage(`Action failed: ${data.error}`);
      }
    } catch (err: any) {
      setFeedbackMessage(`Request failed: ${err.message}`);
    } finally {
      setIsExecutingChaos(false);
    }
  };

  return (
    <div
      className="flex-1 w-full h-full overflow-y-auto bg-neutral-100 p-6 md:p-10 text-neutral-900"
      style={{ fontFamily: "Calibri, 'Segoe UI', Candara, Arial, sans-serif" }}
    >
      {/* Full A4 Box Container: Monochrome, No Color, Larger Calibri Typography */}
      <div className="max-w-4xl mx-auto w-full bg-white border border-neutral-300 p-10 md:p-14 shadow-sm">

        {/* Document Title Header */}
        <div className="border-b border-neutral-300 pb-6 mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-black mb-2">
            Notification Pipeline
          </h1>
          <p className="text-lg text-neutral-600 leading-normal">
            Operational alerting architecture, delivery routing, and state transition suppression controls.
          </p>
        </div>

        {/* Section 1: Active Configuration */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-black border-b border-neutral-200 pb-2 mb-4 uppercase tracking-wider">
            1. Pipeline Routing &amp; Credentials
          </h2>

          <div className="space-y-3 text-base leading-relaxed">
            <div className="flex justify-between py-1 border-b border-neutral-100">
              <span className="font-semibold text-neutral-700">Delivery Channel:</span>
              <span className="font-mono text-neutral-900">Resend Outbound REST API</span>
            </div>

            <div className="flex justify-between py-1 border-b border-neutral-100">
              <span className="font-semibold text-neutral-700">API Key:</span>
              <span className="font-mono text-neutral-900">re_WGLqb••••••••9DM2</span>
            </div>

            <div className="flex justify-between py-1 border-b border-neutral-100">
              <span className="font-semibold text-neutral-700">Sender Identity:</span>
              <span className="text-neutral-900">InfraTrace Alerts &lt;onboarding@resend.dev&gt;</span>
            </div>

            <div className="flex justify-between py-1 border-b border-neutral-100">
              <span className="font-semibold text-neutral-700">Destination Recipient:</span>
              <span className="font-mono font-bold text-neutral-900">jai18hemant334@gmail.com</span>
            </div>

            <div className="flex justify-between py-1 border-b border-neutral-100">
              <span className="font-semibold text-neutral-700">Target Monitored Endpoint:</span>
              <span className="font-mono text-neutral-900">http://localhost:5001/metrics</span>
            </div>

            <div className="flex justify-between py-1">
              <span className="font-semibold text-neutral-700">Pipeline Status:</span>
              <span className="font-bold text-black">[ Active ]</span>
            </div>
          </div>
        </div>

        {/* Section 2: Policy & Suppression Rules */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-black border-b border-neutral-200 pb-2 mb-4 uppercase tracking-wider">
            2. Alert Triggering &amp; Suppression Policy
          </h2>

          <div className="space-y-4 text-base leading-relaxed text-neutral-800">
            <div>
              <span className="font-bold text-black">Phase 1 (Bootstrap Cycle):</span> Initial DOWN or DEGRADED event dispatches an alert email immediately. Subsequent recovery to UP dispatches a recovery email immediately. Upon completing this bootstrap cycle, the system transitions to Phase 2 observation windows.
            </div>

            <div>
              <span className="font-bold text-black">Phase 2+ (Observation Windows):</span> Subsequent state changes enter silent observation windows (20m, 40m, 60m...). Zero emails are dispatched during the window. All probe transitions are logged silently.
            </div>

            <div>
              <span className="font-bold text-black">Unstable Evaluation at Window Expiration:</span> At the conclusion of duration D = n × 20 minutes, Unstable is declared if (UP ≥ 2n and DOWN/DEGRADED ≥ 1n) OR (DOWN/DEGRADED ≥ 2n and UP ≥ 1n). When satisfied, an UNSTABLE notification email is dispatched to jai18hemant334@gmail.com. If not satisfied, a notification is dispatched for the exact state at the final moment of the window.
            </div>

            <div>
              <span className="font-bold text-black">Dynamic Window Scaling:</span> If the last two completed notification outcomes match (e.g. both UNSTABLE or both UP), the window duration expands additively (20m + 20m = 40m, then 40m + 20m = 60m). If outcomes differ, the window resets to the base 20 minutes.
            </div>

            <div>
              <span className="font-bold text-black">Outage Banner Separation:</span> UNSTABLE is strictly an observational email event and is never displayed on the ongoing Outage Notifications banner.
            </div>
          </div>
        </div>

        {/* Section 3: Verification & Operational Controls */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-black border-b border-neutral-200 pb-2 mb-4 uppercase tracking-wider">
            3. Pipeline Verification Controls
          </h2>

          <p className="text-base text-neutral-600 mb-4 leading-normal">
            Execute manual test dispatch or trigger controlled chaos against the local Node service to verify end-to-end delivery to jai18hemant334@gmail.com.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <button
              type="button"
              onClick={handleSendTestEmail}
              disabled={isSendingTest}
              className="py-3 px-5 border border-black bg-white hover:bg-neutral-100 text-black font-semibold text-base transition-colors cursor-pointer text-center disabled:opacity-50"
            >
              {isSendingTest ? 'Dispatching Test Email...' : '[ Send Test Notification ]'}
            </button>

            <button
              type="button"
              onClick={() => handleTriggerChaos('down')}
              disabled={isExecutingChaos}
              className="py-3 px-5 border border-black bg-white hover:bg-neutral-100 text-black font-semibold text-base transition-colors cursor-pointer text-center disabled:opacity-50"
            >
              {isExecutingChaos ? 'Executing...' : '[ Simulate Outage (Down) ]'}
            </button>

            <button
              type="button"
              onClick={() => handleTriggerChaos('recover')}
              disabled={isExecutingChaos}
              className="py-3 px-5 border border-black bg-white hover:bg-neutral-100 text-black font-semibold text-base transition-colors cursor-pointer text-center disabled:opacity-50"
            >
              {isExecutingChaos ? 'Executing...' : '[ Simulate Recovery (Up) ]'}
            </button>

            <button
              type="button"
              onClick={() => handleTriggerChaos('lag')}
              disabled={isExecutingChaos}
              className="py-3 px-5 border border-black bg-white hover:bg-neutral-100 text-black font-semibold text-base transition-colors cursor-pointer text-center disabled:opacity-50"
            >
              {isExecutingChaos ? 'Executing...' : '[ Simulate Latency (Degraded) ]'}
            </button>
          </div>

          {/* Feedback Area */}
          {feedbackMessage && (
            <div className="p-4 border border-neutral-400 bg-neutral-50 text-base font-semibold text-black mt-4">
              Status: {feedbackMessage}
            </div>
          )}
        </div>

        {/* Document Footer */}
        <div className="border-t border-neutral-300 pt-4 text-sm text-neutral-500 text-center">
          InfraTrace Observability Platform &mdash; Pipeline Specification Version 1.0
        </div>

      </div>
    </div>
  );
}
