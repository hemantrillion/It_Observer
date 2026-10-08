'use client';

import React from 'react';

interface RefreshMetricsButtonProps {
  onRefresh: () => void;
  isLoading: boolean;
}

export function RefreshMetricsButtonOnHeader({ onRefresh, isLoading }: RefreshMetricsButtonProps) {
  return (
    <button
      onClick={onRefresh}
      disabled={isLoading}
      className="px-4 py-2 bg-white text-black font-mono font-bold text-xs uppercase border-2 border-black shadow-brutal hover:bg-black hover:text-white active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-none cursor-pointer disabled:opacity-50"
    >
      {isLoading ? '[ POLLING... ]' : '[ ⟳ POLL NOW ]'}
    </button>
  );
}
