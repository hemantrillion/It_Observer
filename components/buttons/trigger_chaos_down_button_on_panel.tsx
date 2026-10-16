'use client';

import React from 'react';
import { AlertOctagon } from 'lucide-react';

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
      className="px-4 py-2 bg-[#fce8e6] hover:bg-[#fad2cf] text-[#c5221f] font-sans font-semibold text-xs rounded-full border border-[#f5c2c7] transition-all cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5 shadow-2xs"
    >
      <AlertOctagon className="w-3.5 h-3.5" />
      <span>Crash Service (503)</span>
    </button>
  );
}
