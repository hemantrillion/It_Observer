'use client';

import React from 'react';

interface TriggerChaosDownButtonProps {
  onTrigger: () => void;
  isLoading: boolean;
}

export function TriggerChaosDownButtonOnPanel({ onTrigger, isLoading }: TriggerChaosDownButtonProps) {
  return (
    <button
      onClick={onTrigger}
      disabled={isLoading}
      className="px-3 py-2 bg-white text-black font-mono font-bold text-xs uppercase border-2 border-black shadow-brutal hover:bg-black hover:text-white active:translate-x-0.5 active:translate-y-0.5 transition-none cursor-pointer disabled:opacity-50"
    >
      💥 CRASH SERVICE (503)
    </button>
  );
}
