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
      className="px-6 py-2.5 bg-black text-white font-sans font-semibold text-xs uppercase border border-black rounded-md hover:bg-neutral-800 transition-colors cursor-pointer"
    >
      {isSaved ? 'CREDENTIALS SAVED ✓' : 'SAVE CONFIGURATION'}
    </button>
  );
}
