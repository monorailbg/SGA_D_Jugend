import type { SlotNumber } from './types';

/**
 * Per-phase, per-slot exercise pool for the Saison-Überblick "Übungs-Pool" column.
 * This is a planning draft supplied directly by the coach, not derived from the
 * authored booklet content - unlike lib/data/conditions.ts it isn't cross-checked
 * against real Aufbau/Plan-B text.
 */
export const phasePool: Record<number, Record<SlotNumber, string[]>> = {
  1: {
    1: ['K-01', 'K-05', 'K-08', 'K-09'],
    2: ['F-01', 'F-03', 'F-02', 'Z-01', 'Z-03'],
    3: ['A-01', 'A-02', 'F-04', 'K-04', 'P-03', 'P-04'],
    4: ['S-02', 'S-04', 'S-05'],
  },
  2: {
    1: ['K-02', 'K-03', 'K-09', 'P-01', 'T-03', 'T-04'],
    2: ['F-07', 'P-06', 'P-07', 'Z-02', 'Z-03'],
    3: ['A-01', 'F-02', 'F-05', 'F-06', 'P-05', 'P-09'],
    4: ['S-01', 'S-04', 'S-05'],
  },
  3: {
    1: ['K-06', 'K-07', 'T-02', 'T-03'],
    2: ['P-02', 'P-03', 'P-05', 'P-08', 'Z-04', 'Z-05'],
    3: ['T-01', 'K-04', 'P-06', 'Z-05'],
    4: ['S-03', 'S-01'],
  },
  4: {
    1: ['K-01', 'K-05', 'K-09', 'T-03'],
    2: ['F-01', 'Z-01', 'Z-03', 'P-04'],
    3: ['A-01', 'F-03', 'P-05', 'Z-02'],
    4: ['S-04', 'S-05', 'S-02'],
  },
  5: {
    1: ['K-03', 'K-09', 'P-01', 'T-04'],
    2: ['F-04', 'F-07', 'P-07', 'P-08', 'Z-05'],
    3: ['A-01', 'A-02', 'F-05', 'F-06', 'Z-01', 'Z-02'],
    4: ['S-02', 'S-04', 'S-05'],
  },
};
