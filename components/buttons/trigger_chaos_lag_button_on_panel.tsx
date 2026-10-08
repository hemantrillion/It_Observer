'use client';

import React from 'react';

interface TriggerChaosLagButtonProps {
  onTrigger: () => void;
  isLoading: boolean;
}

export function TriggerChaosLagButtonOnPanel({ onTrigger, isLoading }: TriggerChaosLagButtonProps) {
  return (
    <button
      onClick={onTrigger}
      disabled={isLoading}
      className="px-3 py-2 bg-white text-black font-mono font-bold text-xs uppercase border-2 border-black shadow-brutal hover:bg-black hover:text-white active:translate-x-0.5 active:translate-y-0.5 transition-none cursor-pointer disabled:opacity-50"
    >
      🐢 INJECT 2500MS LAG
    </button>
  );
}
