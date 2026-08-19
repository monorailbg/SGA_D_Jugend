export type CategoryCode = 'K' | 'P' | 'T' | 'Z' | 'F' | 'A' | 'S';

export interface Category {
  code: CategoryCode;
  name: string;
  color: string;
}

/** Training slot within a 90-minute session (Di + Do). */
export type SlotNumber = 1 | 2 | 3 | 4;

export interface Slot {
  number: SlotNumber;
  color: string;
  name: string;
  /** Category codes allowed in this slot, or "*" style codes restricted to this slot only (e.g. S-01). */
  allowedCategories: CategoryCode[];
}

export interface SeasonPhase {
  id: number;
  name: string;
  zeitraum: string;
  schwerpunkt: string;
}

export interface ExerciseBlocks {
  Ziel?: string;
  Material?: string;
  Aufbau?: string;
  Ablauf?: string;
  Varianten?: string;
  'Coaching-Punkte'?: string;
  [key: string]: string | undefined;
}

export interface Exercise {
  /** Unique code, e.g. "K-01". */
  code: string;
  title: string;
  category: CategoryCode;
  /** Hex color for the category, taken from the card's accent color. */
  color: string | null;
  /** Raw tag chips as rendered in the source booklet (slot + category labels). */
  tags: string[];
  /** Slot numbers this exercise is allowed in. */
  slots: SlotNumber[];
  /** Path under /public to a photo (jpg/png) or generated SVG field diagram. */
  image: string | null;
  /** Whether this exercise is restricted to a single slot only (e.g. S-01 -> Slot 2 only). */
  slotLocked: boolean;
  /** Free-text training content blocks (Ziel, Material, Aufbau, Ablauf, Varianten, Coaching-Punkte, Plan B, ...). Values contain sanitized inline HTML (lists, bold, links). */
  blocks: ExerciseBlocks;
}

export interface WeekPlanEntry {
  code: string;
  title: string;
}

export interface WeekPlanDay {
  label: string;
  color: string | null;
  entries: WeekPlanEntry[];
}

export interface WeekPlan {
  wknr: string;
  wkdate: string;
  wkfokus: string;
  days: WeekPlanDay[];
  homeworkHtml: string | null;
  planBHtml: string | null;
}
