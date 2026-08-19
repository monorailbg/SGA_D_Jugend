import type { Category } from './types';

export const categories: Category[] = [
  { code: 'K', name: 'Koordination / Ballkontrolle', color: '#e8821e' },
  { code: 'P', name: 'Passspiel', color: '#2f6fd0' },
  { code: 'T', name: 'Technik', color: '#0f9488' },
  { code: 'Z', name: 'Zweikampf', color: '#d23b3b' },
  { code: 'F', name: 'Torschuss / Flanken', color: '#e91e63' },
  { code: 'A', name: 'Spielaufbau', color: '#3f51b5' },
  { code: 'S', name: 'Spielform', color: '#1f9d57' },
];

export const categoryByCode = Object.fromEntries(categories.map((c) => [c.code, c])) as Record<string, Category>;
