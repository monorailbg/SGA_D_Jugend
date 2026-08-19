import type { Slot } from './types';

export const slots: Slot[] = [
  { number: 1, color: '#e8821e', name: 'Aufwärmen / Aktivierung', allowedCategories: ['K', 'T', 'P'] },
  { number: 2, color: '#2f6fd0', name: 'Schwerpunkt 1 (Technik/Taktik)', allowedCategories: ['A', 'F', 'K', 'P', 'T', 'Z', 'S'] },
  { number: 3, color: '#7a4fd0', name: 'Schwerpunkt 2', allowedCategories: ['A', 'F', 'K', 'P', 'T', 'Z'] },
  { number: 4, color: '#1f9d57', name: 'Abschlussspiel', allowedCategories: ['S'] },
];

/** Exercises restricted to exactly one slot regardless of category, per the strict slot rules. */
export const slotLockedExercises: Record<string, number> = {
  'S-01': 2, // 2v2 Shot-Clock -> nur Slot 2
  'S-02': 4, // Abschlussspiel mit Sonderregel -> nur Slot 4
};

/** K-07 (Zombieball) is hall-only and excluded from Vorbereitung phase. */
export const hallOnlyExercises = ['K-07'];
