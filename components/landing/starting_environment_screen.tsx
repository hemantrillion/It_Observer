'use client';

import React, { useEffect, useState } from 'react';

interface StartingEnvironmentScreenProps {
  onComplete?: () => void;
  title?: string;
  subtitle?: string;
  durationMs?: number;
}

export function StartingEnvironmentScreen({
  onComplete,
  title = 'Starting your environment',
  subtitle = "We will send you an email when it's done.",
  durationMs = 2200,
}: StartingEnvironmentScreenProps) {
  const [progress, setProgress] = useState(10);

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(Math.round((elapsed / durationMs) * 100), 100);
      setProgress(pct);

      if (elapsed >= durationMs) {
        clearInterval(interval);
        setTimeout(() => {
          onComplete?.();
        }, 150);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [durationMs, onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white text-slate-900 font-sans select-none animate-in fade-in duration-300">
      {/* Centered Graphic (Image 5 representation) */}
      <div className="flex flex-col items-center max-w-sm w-full px-6 text-center space-y-7">
        {/* Glowing Pulsing Spherical Orb with inner grid and concentric aura */}
        <div className="relative flex items-center justify-center">
          {/* Outer glow ring */}
          <div className="absolute w-40 h-40 rounded-full bg-blue-400/20 blur-xl animate-pulse pointer-events-none" />

          {/* Concentric outer glass ring */}
          <div className="relative w-32 h-32 rounded-full p-2 bg-gradient-to-tr from-blue-300/40 via-purple-300/30 to-teal-200/40 shadow-xl flex items-center justify-center animate-spin-slow">
            {/* Inner Sphere */}
            <div
              className="w-full h-full rounded-full shadow-inner relative overflow-hidden flex items-center justify-center"
              style={{
                background: 'radial-gradient(circle at 35% 35%, #4f46e5 0%, #2563eb 45%, #0891b2 85%, #0284c7 100%)',
              }}
            >
              {/* Particle matrix dots */}
              <div
                className="absolute inset-0 opacity-40 mix-blend-overlay"
                style={{
                  backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.8) 1.2px, transparent 1.2px)',
                  backgroundSize: '10px 10px',
                }}
              />

              {/* Shimmer light sweep */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/25 to-transparent animate-pulse" />
            </div>
          </div>
        </div>

        {/* Text Area */}
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] tracking-tight">
            {title}
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            {subtitle}
          </p>
        </div>

        {/* Progress Bar (Image 5 horizontal indicator) */}
        <div className="w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden relative shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-75 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
