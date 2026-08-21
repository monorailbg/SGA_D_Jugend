'use client';

import { useEffect, useMemo, useState } from 'react';
import { exercises as bundledExercises } from './data/exercises';
import { supabase, supabaseEnabled } from './supabaseClient';
import type { Exercise, SlotNumber } from './data/types';

const LOCAL_STORAGE_KEY = 'sga-custom-exercises-v1'; // fallback store when Supabase isn't configured
const LOCAL_DELETED_KEY = 'sga-deleted-exercise-codes-v1'; // tombstones for deleted bundled exercises

interface DrillRow {
  code: string;
  title: string;
  category: Exercise['category'];
  slots: number[];
  image_url: string | null;
  blocks: Record<string, string>;
  source: 'booklet' | 'coach';
}

function rowToExercise(row: DrillRow): Exercise {
  return {
    code: row.code,
    title: row.title,
    category: row.category,
    color: null,
    tags: [...row.slots.map((s) => `Slot ${s}`), row.category, row.source === 'booklet' ? 'Original' : 'Trainer-Übung'],
    slots: row.slots as SlotNumber[],
    image: row.image_url,
    blocks: row.blocks,
    isCustom: row.source === 'coach',
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

let deletedCache: Set<string> | null = null;

function loadDeleted(): Set<string> {
  if (deletedCache) return deletedCache;
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = window.localStorage.getItem(LOCAL_DELETED_KEY);
    deletedCache = new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    deletedCache = new Set();
  }
  return deletedCache;
}

function persistDeleted(codes: Set<string>) {
  deletedCache = codes;
  try {
    window.localStorage.setItem(LOCAL_DELETED_KEY, JSON.stringify([...codes]));
  } catch (err) {
    console.warn('Could not persist deleted exercise codes to localStorage', err);
  }
  localListeners.forEach((l) => l());
}

/** Bundled booklet data with local edits/deletions applied on top - used only when Supabase isn't configured. */
function mergeLocal(): Exercise[] {
  const overridesByCode = Object.fromEntries(loadLocal().map((e) => [e.code, e]));
  const deleted = loadDeleted();
  const merged = bundledExercises.filter((e) => !deleted.has(e.code)).map((e) => overridesByCode[e.code] ?? e);
  const newOnes = loadLocal().filter((e) => !bundledExercises.some((b) => b.code === e.code));
  return [...merged, ...newOnes];
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

export interface DrillInput {
  code: string;
  title: string;
  category: Exercise['category'];
  slots: SlotNumber[];
  image: string | null;
  blocks: Record<string, string>;
}

/** Throws on failure (e.g. duplicate code, network error) so the form can show the message. */
export async function addCustomExercise(drill: DrillInput): Promise<void> {
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
        slots: drill.slots,
        image_url: drill.image,
        blocks: drill.blocks,
        source: 'coach',
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
    slots: drill.slots,
    image_url: drill.image,
    blocks: drill.blocks,
    source: 'coach',
  });
  const rest = loadLocal().filter((e) => e.code !== exercise.code);
  persistLocal([...rest, exercise]);
}

/** Edits an existing exercise (booklet-original or coach-created alike). Code itself is immutable. */
export async function updateExercise(code: string, drill: Omit<DrillInput, 'code'>): Promise<void> {
  if (supabase) {
    const { error, data } = await supabase
      .from('custom_drills')
      .update({
        title: drill.title,
        category: drill.category,
        slots: drill.slots,
        image_url: drill.image,
        blocks: drill.blocks,
      })
      .eq('code', code)
      .select();
    if (error) throw new Error(error.message);
    if (!data || data.length === 0) {
      throw new Error('Speichern fehlgeschlagen – keine Bestätigung vom Server erhalten.');
    }
    await loadRemote();
    return;
  }
  const isBundled = bundledExercises.some((e) => e.code === code);
  const exercise = rowToExercise({
    code,
    title: drill.title,
    category: drill.category,
    slots: drill.slots,
    image_url: drill.image,
    blocks: drill.blocks,
    source: isBundled ? 'booklet' : 'coach',
  });
  persistLocal([...loadLocal().filter((e) => e.code !== code), exercise]);
}

/** Throws on failure so the caller can show an error instead of silently doing nothing. */
export async function deleteCustomExercise(code: string): Promise<void> {
  if (supabase) {
    const { error } = await supabase.from('custom_drills').delete().eq('code', code);
    if (error) throw new Error(error.message);
    await loadRemote();
    return;
  }
  persistLocal(loadLocal().filter((e) => e.code !== code));
  // Also tombstone in case this code belongs to a bundled booklet exercise, not a
  // locally-created override - otherwise it would keep reappearing from the bundle.
  persistDeleted(new Set([...loadDeleted(), code]));
}

// Shared across every component using the hook - Supabase's client reuses channels by
// name, so a second independent `.channel('x').on(...).subscribe()` call for a channel
// that's already subscribed throws. One module-level subscription notifies everyone.
// Once the very first fetch resolves, Supabase becomes the sole source of truth (full
// edit/delete parity requires that - a row deleted there must not reappear from the
// bundled fallback). The bundled data only covers the gap before that first load
// completes, or if Supabase is unreachable.
let remoteExercises: Exercise[] | null = null;
let remoteLoading = supabaseEnabled;
let remoteError: string | null = null;
const remoteListeners = new Set<() => void>();
let remoteInitialized = false;

function notifyRemote() {
  remoteListeners.forEach((l) => l());
}

async function loadRemote() {
  const { data, error } = await supabase!.from('custom_drills').select('*').order('code');
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

export function useAllExercises(): { exercises: Exercise[]; loading: boolean; error: string | null } {
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
    // No Supabase configured at all: bundled booklet data with this browser's local
    // edits/deletions applied, plus any locally-created drills.
    return { exercises: mergeLocal(), loading: false, error: null };
  }
  if (remoteExercises === null) {
    // Still loading (or failed) the first fetch: show the bundled booklet data so the
    // catalog isn't empty, rather than nothing.
    return { exercises: bundledExercises, loading: remoteLoading, error: remoteError };
  }
  return { exercises: remoteExercises, loading: false, error: remoteError };
}

export function useExerciseByCode(): Record<string, Exercise> {
  const { exercises: all } = useAllExercises();
  return useMemo(() => Object.fromEntries(all.map((e) => [e.code, e])), [all]);
}

export function useExercisesForSlot(slot: SlotNumber): Exercise[] {
  const { exercises: all } = useAllExercises();
  return useMemo(() => all.filter((e) => e.slots.includes(slot)), [all, slot]);
}
