'use client';

import React, { useState } from 'react';
import { TriggerChaosDownButtonOnPanel } from '../buttons/trigger_chaos_down_button_on_panel';
import { TriggerChaosLagButtonOnPanel } from '../buttons/trigger_chaos_lag_button_on_panel';
import { TriggerChaosRecoverButtonOnPanel } from '../buttons/trigger_chaos_recover_button_on_panel';

interface ChaosTestingControlPanelContainerProps {
  onChaosTriggered: () => void;
}

export function ChaosTestingControlPanelContainer({
  onChaosTriggered,
}: ChaosTestingControlPanelContainerProps) {
  const [isLoading, setIsLoading] = useState(false);

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
        setTimeout(() => {
          onChaosTriggered();
        }, 300);
      }
    } catch {
      // Ignored - quiet error handling
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col justify-between bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs">
      <div className="pb-2 border-b border-slate-100">
        <h3 className="font-sans font-bold text-sm text-slate-900 tracking-tight">
          Interactive Chaos Injection Panel
        </h3>
      </div>

      <div className="flex flex-col gap-2.5 pt-3 w-full">
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
