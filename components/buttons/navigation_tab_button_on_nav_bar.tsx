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
      className={`px-4 py-2 border-2 border-black font-mono font-bold text-xs uppercase tracking-wider transition-none ${
        isActive
          ? 'bg-black text-white shadow-brutal-sm'
          : 'bg-white text-black hover:bg-black hover:text-white'
      }`}
    >
      {label}
    </Link>
  );
}
