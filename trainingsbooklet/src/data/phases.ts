import type { SeasonPhase } from './types';

export const phases: SeasonPhase[] = [
  {
    id: 1,
    name: 'Vorbereitung Hinrunde',
    zeitraum: '10.08.–28.08.2026 (3 Wo. + Trainingslager)',
    schwerpunkt: 'Wiedereinstieg, 1v1, Spielaufbau',
  },
  {
    id: 2,
    name: 'Hinrunde',
    zeitraum: '29.08.–06.12.2026 (~14 Wo.)',
    schwerpunkt: 'Pässe, Freilaufen, 2-1-2-1 festigen',
  },
  {
    id: 3,
    name: 'Halle / Winter',
    zeitraum: '07.12.2026–13.03.2027',
    schwerpunkt: 'Technik, 1v1/2v2, schwacher Fuß',
  },
  {
    id: 4,
    name: 'Vorbereitung Rückrunde',
    zeitraum: '09.03.–20.03.2027',
    schwerpunkt: 'Übergang Halle → Platz',
  },
  {
    id: 5,
    name: 'Rückrunde',
    zeitraum: '21.03.–20.06.2027',
    schwerpunkt: 'Tempo, Zweikampf, Torabschluss',
  },
];

/** Phase accent colors as used in the season overview table. */
export const phaseColors: Record<number, string> = {
  1: '#1f9d57',
  2: '#2f6fd0',
  3: '#4a90c2',
  4: '#e8821e',
  5: '#d23b3b',
};
