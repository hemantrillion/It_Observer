'use client';

import React from 'react';

interface TriggerChaosDownButtonProps {
  onTrigger: () => void;
  isLoading: boolean;
}

export function TriggerChaosDownButtonOnPanel({
  onTrigger,
  isLoading,
}: TriggerChaosDownButtonProps) {
  return (
    <button
      onClick={onTrigger}
      disabled={isLoading}
      className="w-full py-2 px-3 bg-white hover:bg-slate-100 text-slate-800 font-sans font-semibold text-xs rounded-lg border border-slate-300 transition-all cursor-pointer disabled:opacity-50 shadow-2xs text-center"
    >
      Crash Service
    </button>
  );
}
