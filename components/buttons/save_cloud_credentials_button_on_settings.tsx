'use client';

import React from 'react';

interface SaveCloudCredentialsButtonProps {
  onSave: () => void;
  isSaved: boolean;
}

export function SaveCloudCredentialsButtonOnSettings({ onSave, isSaved }: SaveCloudCredentialsButtonProps) {
  return (
    <button
      onClick={onSave}
      type="button"
      className="px-6 py-2.5 bg-black text-white font-mono font-bold text-xs uppercase border-2 border-black shadow-brutal hover:bg-white hover:text-black active:translate-x-0.5 active:translate-y-0.5 transition-none cursor-pointer"
    >
      {isSaved ? '[ CREDENTIALS SAVED ✓ ]' : '[ SAVE CONFIGURATION ]'}
    </button>
  );
}
