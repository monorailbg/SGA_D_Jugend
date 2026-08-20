'use client';

import { useEffect, useMemo, useState } from 'react';
import { exercises as baseExercises, exercisesForSlot as baseExercisesForSlot } from './data/exercises';
import type { Exercise, SlotNumber } from './data/types';

const STORAGE_KEY = 'sga-custom-exercises-v1';

let cache: Exercise[] | null = null;
const listeners = new Set<() => void>();

function load(): Exercise[] {
  if (cache) return cache;
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    cache = raw ? (JSON.parse(raw) as Exercise[]) : [];
  } catch {
    cache = [];
  }
  return cache;
}

function persist(list: Exercise[]) {
  cache = list;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    // Most likely quota exceeded (large embedded images) - drop the write rather
    // than crash; the in-memory cache still reflects it for this session.
    console.warn('Could not persist custom exercises to localStorage', err);
  }
  listeners.forEach((l) => l());
}

/** Adds a coach-created drill, or overwrites one with the same code (edit). */
export function addCustomExercise(exercise: Exercise) {
  const rest = load().filter((e) => e.code !== exercise.code);
  persist([...rest, exercise]);
}

export function removeCustomExercise(code: string) {
  persist(load().filter((e) => e.code !== code));
}

/** All custom exercise codes currently saved, for uniqueness checks in the create form. */
export function customExerciseCodes(): Set<string> {
  return new Set(load().map((e) => e.code));
}

export function useCustomExercises(): Exercise[] {
  const [list, setList] = useState<Exercise[]>([]);
  useEffect(() => {
    setList(load()); // hydrate client-side after mount (localStorage isn't available during SSR)
    const onChange = () => setList([...load()]);
    listeners.add(onChange);
    return () => {
      listeners.delete(onChange);
    };
  }, []);
  return list;
}

/** Base booklet exercises plus this coach's locally-saved custom drills. */
export function useAllExercises(): Exercise[] {
  const custom = useCustomExercises();
  return useMemo(() => [...baseExercises, ...custom], [custom]);
}

export function useExerciseByCode(): Record<string, Exercise> {
  const all = useAllExercises();
  return useMemo(() => Object.fromEntries(all.map((e) => [e.code, e])), [all]);
}

export function useExercisesForSlot(slot: SlotNumber): Exercise[] {
  const custom = useCustomExercises();
  return useMemo(() => {
    if (custom.length === 0) return baseExercisesForSlot(slot);
    return [...baseExercisesForSlot(slot), ...custom.filter((e) => e.slots.includes(slot))];
  }, [custom, slot]);
}
