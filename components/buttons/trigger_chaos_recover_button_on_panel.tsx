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
      className="px-4 py-2 bg-black text-white font-sans font-semibold text-xs uppercase border border-black rounded-md hover:bg-neutral-800 transition-colors cursor-pointer disabled:opacity-50"
    >
      ✓ RECOVER SERVICE
    </button>
  );
}
