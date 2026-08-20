'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const BADGES = [
  'Muster – Phase 1 (Vorbereitung Hinrunde) + Trainingslager',
  'Kader: 12 Kinder (1–2 TW), überwiegend jüngerer Jahrgang, deutliche Leistungsunterschiede',
  '2 Einheiten/Woche (Di + Do) · je 90 min · 4 Slots à 20–25 min',
];

export default function HeaderBanner({ activeLabel }: { activeLabel: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <header className="relative shrink-0 overflow-hidden bg-gradient-to-br from-[#0d47a1] to-[#1565C0] text-white">
      {/* subtle vertical pitch-marking pattern, matching the original hero background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.16]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, transparent 0 78px, rgba(255,255,255,.5) 78px 80px), radial-gradient(circle at 50% 120%, rgba(255,255,255,.5) 0 2px, transparent 3px)',
        }}
      />

      <div className="relative mx-auto max-w-[1080px] px-4 py-3">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white p-1 shadow-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/misc/sga_logo.svg" alt="SGA Logo" width={40} height={40} className="object-contain" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[11px] uppercase tracking-widest opacity-90">
              SG Kleinolbersdorf-Altenhain e.V. · D-Jugend
            </div>
            <div className="truncate font-ui text-xl font-extrabold leading-tight">{activeLabel}</div>
          </div>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            aria-controls="hero-details"
            className="flex shrink-0 items-center gap-1 rounded-full border border-white/30 bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            {expanded ? 'Weniger' : 'Details'}
            <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }} className="flex">
              <ChevronDown size={13} strokeWidth={2.5} />
            </motion.span>
          </button>
        </div>

        <motion.div
          id="hero-details"
          initial={false}
          animate={{ height: expanded ? 'auto' : 0 }}
          transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
          style={{ overflow: 'hidden' }}
        >
          <div className="pb-4 pt-4">
            <div className="text-[13px] uppercase tracking-widest opacity-90">
              SG Kleinolbersdorf-Altenhain e.V. · D-Jugend · Kreis Chemnitz
            </div>
            <h1 className="mt-1 font-ui text-[32px] font-extrabold leading-tight tracking-tight sm:text-[40px]">
              Saison-Trainingsbooklet D-Jugend
            </h1>
            <p className="mt-1 max-w-[640px] text-[15px] opacity-95 sm:text-base">
              Spielformat 6+1, Halbfeld · Formation 2-1-2-1 · Saison 2026/27
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {BADGES.map((badge) => (
                <span
                  key={badge}
                  className="rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-xs text-white backdrop-blur-sm"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </header>
  );
}
