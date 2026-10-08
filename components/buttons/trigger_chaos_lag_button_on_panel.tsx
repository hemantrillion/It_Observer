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
      className="px-4 py-2 bg-white text-black font-sans font-semibold text-xs uppercase border border-black rounded-md hover:bg-black hover:text-white transition-colors cursor-pointer disabled:opacity-50"
    >
      🐢 INJECT 2500MS LAG
    </button>
  );
}
