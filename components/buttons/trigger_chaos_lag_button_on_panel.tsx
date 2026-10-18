'use client';

import React from 'react';
import { Clock } from 'lucide-react';

interface TriggerChaosLagButtonProps {
  onTrigger: () => void;
  isLoading: boolean;
}

export function TriggerChaosLagButtonOnPanel({
  onTrigger,
  isLoading,
}: TriggerChaosLagButtonProps) {
  return (
    <button
      onClick={onTrigger}
      disabled={isLoading}
      className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-800 font-sans font-semibold text-xs rounded-lg border border-slate-300 transition-all cursor-pointer disabled:opacity-50 shadow-2xs"
    >
      Inject Lag
    </button>
  );
}
