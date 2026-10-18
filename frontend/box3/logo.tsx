'use client';

import React from 'react';

interface InfraTraceLogoProps {
  onNavigateLanding?: () => void;
  showFlexboxBorders?: boolean;
  hasWallpaper?: boolean;
}

export function InfraTraceLogo({
  onNavigateLanding,
  showFlexboxBorders = false,
  hasWallpaper = false,
}: InfraTraceLogoProps) {
  return (
    <div
      onClick={onNavigateLanding}
      title="InfraTrace - Click to view Landing Page"
      className={`${
        showFlexboxBorders ? 'w-[262px]' : 'w-64'
      } flex items-center gap-3 cursor-pointer shrink-0 pl-3 pr-2 transition-all duration-200 group`}
    >
      <img
        src="/infra_trace_logo.png"
        alt="InfraTrace Logo"
        className="w-9 h-9 object-contain drop-shadow-sm transition-transform hover:scale-105"
      />
      <span
        className={`text-[22px] font-semibold tracking-tight font-sans ${
          hasWallpaper
            ? 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.75)]'
            : 'text-[#1f1f1f]'
        }`}
      >
        InfraTrace
      </span>
    </div>
  );
}
