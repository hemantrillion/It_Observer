'use client';

import React, { useState } from 'react';
import { TriggerChaosDownButtonOnPanel } from '../buttons/trigger_chaos_down_button_on_panel';
import { TriggerChaosLagButtonOnPanel } from '../buttons/trigger_chaos_lag_button_on_panel';
import { TriggerChaosRecoverButtonOnPanel } from '../buttons/trigger_chaos_recover_button_on_panel';

interface ChaosTestingControlPanelContainerProps {
  onChaosTriggered: () => void;
}

export function ChaosTestingControlPanelContainer({ onChaosTriggered }: ChaosTestingControlPanelContainerProps) {
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
        setLastActionMessage(`[ACTION DISPATCHED]: ${action.toUpperCase()} - ${data.result.message}`);
        setTimeout(() => {
          onChaosTriggered();
        }, 300);
      } else {
        setLastActionMessage(`[ERROR]: ${data.error}`);
      }
    } catch {
      setLastActionMessage('[ERROR]: Could not reach companion service on port 5001. Ensure companion server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2.5 w-full">
      {/* Centered Section Header in Arial */}
      <div className="text-center">
        <h2 className="font-sans font-bold text-sm tracking-wider uppercase text-black">
          // INTERACTIVE CHAOS INJECTION TESTING PANEL
        </h2>
        <p className="font-sans text-xs text-black opacity-60">
          Controlled Failure Injection On Local Companion Service (Port 5001)
        </p>
      </div>

      <div className="border border-black rounded-lg p-5 bg-white space-y-4">
        {lastActionMessage && (
          <div className="text-center">
            <span className="font-sans text-xs font-semibold bg-black text-white px-3 py-1 rounded inline-block">
              {lastActionMessage}
            </span>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3">
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
