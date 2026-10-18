'use client';

import React from 'react';

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
      className="w-full py-2 px-3 bg-white hover:bg-slate-100 text-slate-800 font-sans font-semibold text-xs rounded-lg border border-slate-300 transition-all cursor-pointer disabled:opacity-50 shadow-2xs text-center"
    >
      Recover
    </button>
  );
}
