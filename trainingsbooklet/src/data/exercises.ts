import raw from './exercises.generated.json';
import type { CategoryCode, Exercise, SlotNumber } from './types';
import { slotLockedExercises } from './slots';

interface RawExercise {
  code: string;
  title: string;
  color: string | null;
  tags: string[];
  image: string | null;
  blocks: Record<string, string>;
}

function parseSlots(tags: string[]): SlotNumber[] {
  const result: SlotNumber[] = [];
  for (const tag of tags) {
    const m = tag.match(/^Slot (\d)/);
    if (m) result.push(Number(m[1]) as SlotNumber);
  }
  return result;
}

function parseCategory(code: string, tags: string[]): CategoryCode {
  for (const tag of tags) {
    const m = tag.match(/^([A-Z])\s*·/);
    if (m) return m[1] as CategoryCode;
  }
  // fallback: derive from the code prefix, e.g. "K-01" -> "K"
  return code.split('-')[0] as CategoryCode;
}

export const exercises: Exercise[] = (raw as RawExercise[]).map((e) => ({
  code: e.code,
  title: e.title,
  category: parseCategory(e.code, e.tags),
  color: e.color,
  tags: e.tags,
  slots: parseSlots(e.tags),
  image: e.image,
  slotLocked: e.code in slotLockedExercises,
  blocks: e.blocks,
}));

export const exerciseByCode: Record<string, Exercise> = Object.fromEntries(
  exercises.map((e) => [e.code, e])
);

export function exercisesForSlot(slot: SlotNumber): Exercise[] {
  return exercises.filter((e) => e.slots.includes(slot));
}
