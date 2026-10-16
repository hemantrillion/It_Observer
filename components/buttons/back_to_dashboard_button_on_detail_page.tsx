'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export function BackToDashboardButtonOnDetailPage() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2 px-4 py-2 bg-[#f0f4f9] hover:bg-[#c2e7ff] text-[#001d35] font-sans font-semibold text-xs rounded-full transition-colors border border-[#c4c7c5]/50 shadow-2xs"
    >
      <ArrowLeft className="w-4 h-4 text-[#0b57d0]" />
      <span>Return to Dashboard</span>
    </Link>
  );
}
