'use client';

import React from 'react';
import Link from 'next/link';

interface NavigationTabButtonProps {
  label: string;
  href: string;
  isActive: boolean;
}

export function NavigationTabButtonOnNavBar({ label, href, isActive }: NavigationTabButtonProps) {
  return (
    <Link
      href={href}
      className={`px-3.5 py-1.5 border border-black rounded-md font-sans font-semibold text-xs uppercase tracking-wider transition-colors ${
        isActive
          ? 'bg-black text-white'
          : 'bg-white text-black hover:bg-neutral-100'
      }`}
    >
      {label}
    </Link>
  );
}
