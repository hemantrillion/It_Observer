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
      className="px-4 py-2 bg-[#fef7e0] hover:bg-[#feefc3] text-[#b06000] font-sans font-semibold text-xs rounded-full border border-[#fde293] transition-all cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5 shadow-2xs"
    >
      <Clock className="w-3.5 h-3.5" />
      <span>Inject 2500ms Lag</span>
    </button>
  );
}
