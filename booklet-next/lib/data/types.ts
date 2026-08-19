export type CategoryCode = 'K' | 'P' | 'T' | 'Z' | 'F' | 'A' | 'S';

export interface Category {
  code: CategoryCode;
  name: string;
  color: string;
}

export type SlotNumber = 1 | 2 | 3 | 4;

export interface Slot {
  number: SlotNumber;
  color: string;
  name: string;
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
  code: string;
  title: string;
  category: CategoryCode;
  color: string | null;
  tags: string[];
  slots: SlotNumber[];
  image: string | null;
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
