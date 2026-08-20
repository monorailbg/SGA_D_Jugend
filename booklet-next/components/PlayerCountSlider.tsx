'use client';

import { Users } from 'lucide-react';
import type { PlayerTier } from '@/lib/data/conditions';

const PRESETS = [4, 6, 8, 10, 12];

/** Same thresholds as matchesPlayerTier in lib/data/conditions.ts - kept in sync
 * so the slider drives exactly the filtering the rest of Session-Builder already uses. */
export function tierForCount(count: number): PlayerTier {
  if (count <= 7) return 'small';
  if (count <= 10) return 'medium';
  return 'full';
}

const TIER_STYLE: Record<PlayerTier, { label: string; badge: string; track: string }> = {
  small: { label: 'Kleingruppe', badge: 'bg-[#e8821e] text-white', track: '#e8821e' },
  medium: { label: 'Mittelgruppe', badge: 'bg-green-d text-white', track: '#0d47a1' },
  full: { label: 'Volle Kaderstärke', badge: 'bg-[#1f9d57] text-white', track: '#1f9d57' },
};

export default function PlayerCountSlider({
  value,
  onChange,
}: {
  value: number;
  onChange: (count: number) => void;
}) {
  const tier = tierForCount(value);
  const style = TIER_STYLE[tier];
  const percent = ((value - 4) / (12 - 4)) * 100;

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-muted">
          <Users size={13} strokeWidth={2.5} />
          Spieleranzahl
        </div>
        <span className={`rounded-full px-2.5 py-0.5 font-mono text-[12px] font-extrabold ${style.badge}`}>
          {value} · {style.label}
        </span>
      </div>

      <input
        type="range"
        min={4}
        max={12}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          background: `linear-gradient(to right, ${style.track} ${percent}%, #e5edf9 ${percent}%)`,
        }}
        className="h-3 w-full cursor-pointer appearance-none rounded-full outline-none [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-green-d [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-[3px] [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-green-d [&::-moz-range-thumb]:shadow-md"
      />

      <div className="mt-1.5 flex gap-1.5">
        {PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            className={`flex-1 rounded-lg py-1 text-[12px] font-bold transition-colors ${
              value === p ? 'bg-green-d text-white' : 'bg-soft text-ink hover:bg-line/60'
            }`}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}
