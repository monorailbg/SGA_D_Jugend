'use client';

import { Users } from 'lucide-react';
import type { PlayerTier } from '@/lib/data/conditions';

/** Same thresholds as matchesPlayerTier in lib/data/conditions.ts - kept in sync
 * so the slider drives exactly the filtering the rest of Session-Builder already uses. */
export function tierForCount(count: number): PlayerTier {
  if (count <= 7) return 'small';
  if (count <= 10) return 'medium';
  return 'full';
}

const TIER_TRACK: Record<PlayerTier, string> = {
  small: '#e8821e',
  medium: '#0d47a1',
  full: '#1f9d57',
};

export default function PlayerCountSlider({
  value,
  onChange,
}: {
  value: number;
  onChange: (count: number) => void;
}) {
  const track = TIER_TRACK[tierForCount(value)];
  const percent = ((value - 4) / (12 - 4)) * 100;

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-muted">
          <Users size={13} strokeWidth={2.5} />
          Spieleranzahl
        </div>
        <span
          style={{ background: track }}
          className="rounded-full px-2.5 py-0.5 font-mono text-[12px] font-extrabold text-white"
        >
          {value}
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
          background: `linear-gradient(to right, ${track} ${percent}%, #e5edf9 ${percent}%)`,
        }}
        className="h-3 w-full cursor-pointer appearance-none rounded-full outline-none [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-green-d [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-[3px] [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-green-d [&::-moz-range-thumb]:shadow-md"
      />
    </div>
  );
}
