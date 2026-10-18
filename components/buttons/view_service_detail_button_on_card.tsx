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
        className="w-full text-center py-1.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center border border-slate-200 shadow-2xs cursor-pointer"
      >
        <span>Inspect</span>
      </button>
    );
  }

  return (
    <Link
      href={`/services/${serviceId}`}
      className="inline-flex w-full items-center justify-center text-center py-1.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-lg transition-colors border border-slate-200 shadow-2xs cursor-pointer"
    >
      <span>Inspect</span>
    </Link>
  );
}
