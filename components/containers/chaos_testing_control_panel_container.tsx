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
        // Trigger immediate poll so UI updates immediately
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
    <div className="border-3 border-black p-4 bg-white shadow-brutal space-y-3">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b-2 border-black pb-2 gap-2">
        <div>
          <span className="font-mono text-xs font-black uppercase tracking-wider">
            // INTERACTIVE CHAOS INJECTION TESTING PANEL
          </span>
          <p className="font-mono text-[11px] opacity-70">
            CONTROLLED FAILURE INJECTION ON LOCAL COMPANION SERVICE (PORT 5001)
          </p>
        </div>
        {lastActionMessage && (
          <span className="font-mono text-[10px] font-bold bg-black text-white px-2 py-0.5 border border-black truncate">
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
  );
}
