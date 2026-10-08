'use client';

import React from 'react';
import Link from 'next/link';

interface ViewServiceDetailButtonProps {
  serviceId: string;
}

export function ViewServiceDetailButtonOnCard({ serviceId }: ViewServiceDetailButtonProps) {
  return (
    <Link
      href={`/services/${serviceId}`}
      className="inline-block w-full text-center px-3 py-2 bg-white text-black font-sans font-semibold text-xs uppercase border border-black rounded-md hover:bg-black hover:text-white transition-colors"
    >
      INSPECT SERVICE →
    </Link>
  );
}
