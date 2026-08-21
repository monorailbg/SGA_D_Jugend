'use client';

import { useEffect, useMemo, useState } from 'react';
import { exercises as baseExercises, exercisesForSlot as baseExercisesForSlot } from './data/exercises';
import { supabase, supabaseEnabled } from './supabaseClient';
import type { Exercise, SlotNumber } from './data/types';

const LOCAL_STORAGE_KEY = 'sga-custom-exercises-v1'; // fallback store when Supabase isn't configured

interface DrillRow {
  code: string;
  title: string;
  category: Exercise['category'];
  slot: number;
  image_url: string | null;
  blocks: Record<string, string>;
}

function rowToExercise(row: DrillRow): Exercise {
  return {
    code: row.code,
    title: row.title,
    category: row.category,
    color: null,
    tags: [`Slot ${row.slot}`, row.category, 'Trainer-Übung'],
    slots: [row.slot as SlotNumber],
    image: row.image_url,
    blocks: row.blocks,
    isCustom: true,
  };
}

// --- localStorage fallback (used only if Supabase env vars aren't configured) ---
let localCache: Exercise[] | null = null;
const localListeners = new Set<() => void>();

function loadLocal(): Exercise[] {
  if (localCache) return localCache;
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    localCache = raw ? (JSON.parse(raw) as Exercise[]) : [];
  } catch {
    localCache = [];
  }
  return localCache;
}

function persistLocal(list: Exercise[]) {
  localCache = list;
  try {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.warn('Could not persist custom exercises to localStorage', err);
  }
  localListeners.forEach((l) => l());
}

/** Uploads a compressed image to Supabase Storage and returns its public URL, or null if unconfigured/failed. */
export async function uploadDrillImage(dataUrl: string, code: string): Promise<string | null> {
  if (!supabase) return dataUrl; // localStorage fallback: keep the embedded data URL
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const path = `${code}-${Date.now()}.jpg`;
  const { error } = await supabase.storage.from('exercise-images').upload(path, blob, { contentType: 'image/jpeg' });
  if (error) {
    console.error('Image upload failed', error);
    return null;
  }
  const { data } = supabase.storage.from('exercise-images').getPublicUrl(path);
  return data.publicUrl;
}

export interface NewDrill {
  code: string;
  title: string;
  category: Exercise['category'];
  slot: SlotNumber;
  image: string | null;
  blocks: Record<string, string>;
}

/** Throws on failure (e.g. duplicate code, network error) so the form can show the message. */
export async function addCustomExercise(drill: NewDrill): Promise<void> {
  if (supabase) {
    // .select() forces the insert to hand back the row it actually wrote, so a
    // network intermediary silently returning an empty "success" (no error, no row)
    // is caught here instead of being reported as saved.
    const { error, data } = await supabase
      .from('custom_drills')
      .insert({
        code: drill.code,
        title: drill.title,
        category: drill.category,
        slot: drill.slot,
        image_url: drill.image,
        blocks: drill.blocks,
      })
      .select();
    if (error) throw new Error(error.message);
    if (!data || data.length === 0) {
      throw new Error('Speichern fehlgeschlagen – keine Bestätigung vom Server erhalten.');
    }
    // Refetch immediately for this tab rather than waiting on the realtime broadcast -
    // other open tabs still pick it up live once the channel event arrives.
    await loadRemote();
    return;
  }
  // Fallback: local-only, this browser only.
  const exercise = rowToExercise({
    code: drill.code,
    title: drill.title,
    category: drill.category,
    slot: drill.slot,
    image_url: drill.image,
    blocks: drill.blocks,
  });
  const rest = loadLocal().filter((e) => e.code !== exercise.code);
  persistLocal([...rest, exercise]);
}

// Shared across every component using the hook - Supabase's client reuses channels by
// name, so a second independent `.channel('x').on(...).subscribe()` call for a channel
// that's already subscribed throws. One module-level subscription notifies everyone.
let remoteExercises: Exercise[] = [];
let remoteLoading = supabaseEnabled;
let remoteError: string | null = null;
const remoteListeners = new Set<() => void>();
let remoteInitialized = false;

function notifyRemote() {
  remoteListeners.forEach((l) => l());
}

async function loadRemote() {
  const { data, error } = await supabase!.from('custom_drills').select('*').order('created_at');
  if (error) {
    remoteError = error.message;
  } else {
    remoteExercises = (data as DrillRow[]).map(rowToExercise);
  }
  remoteLoading = false;
  notifyRemote();
}

function ensureRemoteSubscription() {
  if (remoteInitialized || !supabase) return;
  remoteInitialized = true;
  loadRemote();
  supabase
    .channel('custom_drills_changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'custom_drills' }, () => {
      loadRemote();
    })
    .subscribe();
}

export function useCustomExercises(): { exercises: Exercise[]; loading: boolean; error: string | null } {
  const [, forceRender] = useState(0);

  useEffect(() => {
    if (!supabase) {
      const onChange = () => forceRender((n) => n + 1);
      localListeners.add(onChange);
      return () => {
        localListeners.delete(onChange);
      };
    }
    ensureRemoteSubscription();
    const onChange = () => forceRender((n) => n + 1);
    remoteListeners.add(onChange);
    return () => {
      remoteListeners.delete(onChange);
    };
  }, []);

  if (!supabase) {
    return { exercises: loadLocal(), loading: false, error: null };
  }
  return { exercises: remoteExercises, loading: remoteLoading, error: remoteError };
}

/** Base booklet exercises plus every coach's shared custom drills (from Supabase, or this browser only as fallback). */
export function useAllExercises(): Exercise[] {
  const { exercises: custom } = useCustomExercises();
  return useMemo(() => [...baseExercises, ...custom], [custom]);
}

export function useExerciseByCode(): Record<string, Exercise> {
  const all = useAllExercises();
  return useMemo(() => Object.fromEntries(all.map((e) => [e.code, e])), [all]);
}

export function useExercisesForSlot(slot: SlotNumber): Exercise[] {
  const { exercises: custom } = useCustomExercises();
  return useMemo(() => {
    if (custom.length === 0) return baseExercisesForSlot(slot);
    return [...baseExercisesForSlot(slot), ...custom.filter((e) => e.slots.includes(slot))];
  }, [custom, slot]);
}
