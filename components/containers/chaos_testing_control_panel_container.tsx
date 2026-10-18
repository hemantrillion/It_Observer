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
    <div className="h-full flex flex-col justify-between bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs">
      <div>
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="font-sans font-bold text-sm text-slate-900 tracking-tight">
            Interactive Chaos Injection Panel
          </h3>
          {lastActionMessage && (
            <span className="font-sans text-[11px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200 truncate max-w-[140px]" title={lastActionMessage}>
              {lastActionMessage}
            </span>
          )}
        </div>
        <p className="font-sans text-xs text-slate-500 mt-1.5 leading-relaxed">
          Inject real-time failure simulation on companion port 5001.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-3">
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
