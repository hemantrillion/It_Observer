'use client';

import React from 'react';

interface TriggerChaosRecoverButtonProps {
  onTrigger: () => void;
  isLoading: boolean;
}

export function TriggerChaosRecoverButtonOnPanel({ onTrigger, isLoading }: TriggerChaosRecoverButtonProps) {
  return (
    <button
      onClick={onTrigger}
      disabled={isLoading}
      className="px-3 py-2 bg-black text-white font-mono font-bold text-xs uppercase border-2 border-black shadow-brutal hover:bg-white hover:text-black active:translate-x-0.5 active:translate-y-0.5 transition-none cursor-pointer disabled:opacity-50"
    >
      [✓ RECOVER SERVICE]
    </button>
  );
}
