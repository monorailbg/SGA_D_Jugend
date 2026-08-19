import { exercises } from './exercises';
import type { CategoryCode, Exercise } from './types';

export type PlayerTier = 'small' | 'medium' | 'full';
export type Weather = 'rain' | 'heat' | 'normal';
export type FieldSize = 'quarter' | 'half' | 'hall';

export const PLAYER_TIERS: { id: PlayerTier; label: string; hint: string }[] = [
  { id: 'small', label: '< 8 Kinder', hint: 'Funino / Kleinformen' },
  { id: 'medium', label: '8–10 Kinder', hint: 'reduzierte Formen' },
  { id: 'full', label: '12+ Kinder', hint: 'volle Kaderstärke' },
];

export const WEATHER_OPTIONS: { id: Weather; label: string; tip: string }[] = [
  { id: 'normal', label: 'Normal', tip: 'Standardumfang, keine Anpassung nötig.' },
  {
    id: 'rain',
    label: 'Regen / rutschig',
    tip: 'Wenig Stehzeiten, hohes Tempo bevorzugen – Formen mit viel Bewegung und wenig Warteschlangen zuerst.',
  },
  {
    id: 'heat',
    label: 'Große Hitze',
    tip: 'Kürzere Blöcke, mehr Trinkpausen einplanen – Belastung in den Slots bewusst dosieren.',
  },
];

export const FIELD_SIZES: { id: FieldSize; label: string }[] = [
  { id: 'quarter', label: 'Viertelfeld' },
  { id: 'half', label: 'Halbfeld' },
  { id: 'hall', label: 'Halle' },
];

/** Exercises marked as hall-only in the source booklet ("K-07 Zombieball – nur Halle!"). */
export const HALL_ONLY_CODES = ['K-07'];

/**
 * Phase-relevant categories, derived from the "Roter Faden" narrative text for each
 * phase (already-authored content) rather than invented per-exercise tags. This is a
 * soft recommendation weighting, not a hard filter — every exercise stays selectable
 * in every phase.
 */
export const PHASE_FOCUS_CATEGORIES: Record<number, CategoryCode[]> = {
  1: ['Z', 'A', 'K'],
  2: ['P', 'A', 'S'],
  3: ['T', 'Z'],
  4: ['A', 'T'],
  5: ['Z', 'F', 'P'],
};

interface Derived {
  /** Minimum player count below which the exercise needs its Plan B modification. */
  minPlayers: number;
  /** Approximate field footprint, parsed from the Aufbau text where a dimension is given. */
  fieldSize: FieldSize | 'unknown';
}

const CATEGORY_DEFAULT_MIN: Record<CategoryCode, number> = {
  K: 4,
  T: 4,
  P: 4,
  A: 6,
  F: 6,
  Z: 6,
  S: 8,
};

function parsePlanBMin(exercise: Exercise): number | null {
  const key = Object.keys(exercise.blocks).find((k) => k.startsWith('Plan B'));
  if (!key) return null;
  const m = key.match(/(\d+)/);
  return m ? Number(m[1]) : null;
}

function parseFieldSize(exercise: Exercise): FieldSize | 'unknown' {
  if (HALL_ONLY_CODES.includes(exercise.code)) return 'hall';
  const text = Object.values(exercise.blocks).join(' ');
  const m = text.match(/(\d+)\s*[×x]\s*(\d+)\s*m/);
  if (!m) return 'unknown';
  const area = Number(m[1]) * Number(m[2]);
  // Roughly: a half-pitch training area is ~30x20m (600m²), a quarter ~15x15m (225m²).
  return area <= 300 ? 'quarter' : 'half';
}

const derivedByCode: Record<string, Derived> = Object.fromEntries(
  exercises.map((e) => [
    e.code,
    {
      minPlayers: parsePlanBMin(e) ?? CATEGORY_DEFAULT_MIN[e.category],
      fieldSize: parseFieldSize(e),
    },
  ])
);

export function minPlayersFor(exercise: Exercise): number {
  return derivedByCode[exercise.code].minPlayers;
}

export function fieldSizeFor(exercise: Exercise): FieldSize | 'unknown' {
  return derivedByCode[exercise.code].fieldSize;
}

export function matchesPlayerTier(exercise: Exercise, tier: PlayerTier): boolean {
  const min = minPlayersFor(exercise);
  if (tier === 'small') return min <= 7;
  if (tier === 'medium') return min <= 10;
  return true;
}

export function matchesFieldSize(exercise: Exercise, field: FieldSize): boolean {
  if (HALL_ONLY_CODES.includes(exercise.code)) return field === 'hall';
  if (field === 'hall') return false; // only the explicitly hall-tagged drill fits a hall session
  const size = fieldSizeFor(exercise);
  if (size === 'unknown') return true; // no data either way – don't exclude on a guess
  if (field === 'quarter') return size === 'quarter';
  return true; // half-pitch fits both quarter- and half-sized setups
}

/** True if a phase actively excludes this exercise (currently only K-07, hall-only outside Halle/Winter). */
export function allowedInPhase(exercise: Exercise, phaseId: number): boolean {
  if (HALL_ONLY_CODES.includes(exercise.code)) return phaseId === 3;
  return true;
}
