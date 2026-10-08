'use client';

import React from 'react';
import Link from 'next/link';

export function BackToDashboardButtonOnDetailPage() {
  return (
    <Link
      href="/"
      className="inline-block px-4 py-2 bg-white text-black font-sans font-semibold text-xs uppercase border border-black rounded-md hover:bg-black hover:text-white transition-colors"
    >
      ← RETURN TO DASHBOARD
    </Link>
  );
}
