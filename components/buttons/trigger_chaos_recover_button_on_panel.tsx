'use client';

import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface TriggerChaosRecoverButtonProps {
  onTrigger: () => void;
  isLoading: boolean;
}

export function TriggerChaosRecoverButtonOnPanel({
  onTrigger,
  isLoading,
}: TriggerChaosRecoverButtonProps) {
  return (
    <button
      onClick={onTrigger}
      disabled={isLoading}
      className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-800 font-sans font-semibold text-xs rounded-lg border border-slate-300 transition-all cursor-pointer disabled:opacity-50 shadow-2xs"
    >
      Recover
    </button>
  );
}
