'use client';

import React from 'react';
import Link from 'next/link';

interface ViewServiceDetailButtonProps {
  serviceId: string;
  onClick?: () => void;
}

export function ViewServiceDetailButtonOnCard({
  serviceId,
  onClick,
}: ViewServiceDetailButtonProps) {
  if (onClick) {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClick();
        }}
        className="w-full text-center px-4 py-2 bg-[#f0f4f9] hover:bg-[#c2e7ff] text-[#001d35] font-semibold text-xs rounded-full transition-colors flex items-center justify-center border border-[#c4c7c5]/50 shadow-2xs cursor-pointer"
      >
        <span>Inspect</span>
      </button>
    );
  }

  return (
    <Link
      href={`/services/${serviceId}`}
      className="inline-flex w-full items-center justify-center text-center px-4 py-2 bg-[#f0f4f9] hover:bg-[#c2e7ff] text-[#001d35] font-semibold text-xs rounded-full transition-colors border border-[#c4c7c5]/50 shadow-2xs cursor-pointer"
    >
      <span>Inspect</span>
    </Link>
  );
}
