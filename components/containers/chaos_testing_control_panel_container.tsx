'use client';

import React, { useState } from 'react';
import { TriggerChaosDownButtonOnPanel } from '../buttons/trigger_chaos_down_button_on_panel';
import { TriggerChaosLagButtonOnPanel } from '../buttons/trigger_chaos_lag_button_on_panel';
import { TriggerChaosRecoverButtonOnPanel } from '../buttons/trigger_chaos_recover_button_on_panel';
import { ShieldAlert } from 'lucide-react';

interface ChaosTestingControlPanelContainerProps {
  onChaosTriggered: () => void;
}

export function ChaosTestingControlPanelContainer({
  onChaosTriggered,
}: ChaosTestingControlPanelContainerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [lastActionMessage, setLastActionMessage] = useState<string | null>(null);

  const handleAction = async (action: 'down' | 'lag' | 'recover') => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/chaos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (data.success) {
        setLastActionMessage(`${action.toUpperCase()}: ${data.result.message}`);
        setTimeout(() => {
          onChaosTriggered();
        }, 300);
      } else {
        setLastActionMessage(`ERROR: ${data.error}`);
      }
    } catch {
      setLastActionMessage('ERROR: Could not reach companion service on port 5001. Ensure companion server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3 w-full">
      <div className="border border-[#e0e2ec] rounded-2xl p-5 bg-[#f8fafd] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e0e2ec]/80 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#eaf1fb] text-[#0b57d0] flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-sans font-semibold text-sm text-[#1f1f1f]">
                Interactive Chaos Injection Testing Panel
              </h3>
              <p className="font-sans text-xs text-[#5e5e5e]">
                Simulate outage and latency degradation on Local Companion Service (Port 5001)
              </p>
            </div>
          </div>

          {lastActionMessage && (
            <span className="font-sans text-xs font-semibold bg-[#e8f0fe] text-[#0b57d0] px-3 py-1 rounded-full inline-block border border-[#d3e3fd]">
              {lastActionMessage}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <TriggerChaosDownButtonOnPanel
            onTrigger={() => handleAction('down')}
            isLoading={isLoading}
          />
          <TriggerChaosLagButtonOnPanel
            onTrigger={() => handleAction('lag')}
            isLoading={isLoading}
          />
          <TriggerChaosRecoverButtonOnPanel
            onTrigger={() => handleAction('recover')}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
