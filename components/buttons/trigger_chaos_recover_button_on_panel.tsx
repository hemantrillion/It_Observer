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
      className="px-4 py-2 bg-[#e6f4ea] hover:bg-[#ceead6] text-[#137333] font-sans font-semibold text-xs rounded-full border border-[#a8dab5] transition-all cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5 shadow-2xs"
    >
      <CheckCircle2 className="w-3.5 h-3.5" />
      <span>Recover Service</span>
    </button>
  );
}
