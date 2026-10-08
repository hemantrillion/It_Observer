'use client';

import React from 'react';
import Link from 'next/link';

export function BackToDashboardButtonOnDetailPage() {
  return (
    <Link
      href="/"
      className="inline-block px-4 py-2 bg-white text-black font-mono font-bold text-xs uppercase border-2 border-black shadow-brutal hover:bg-black hover:text-white transition-none"
    >
      ← RETURN TO DASHBOARD
    </Link>
  );
}
