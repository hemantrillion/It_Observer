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
      className="px-4 py-2 bg-white text-black font-sans font-semibold text-xs uppercase border border-black rounded-md hover:bg-black hover:text-white transition-colors cursor-pointer disabled:opacity-50"
    >
      {isLoading ? 'POLLING...' : '⟳ POLL NOW'}
    </button>
  );
}
