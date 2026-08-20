'use client';

import { createContext, useContext } from 'react';
import type { SlotNumber } from './data/types';

export const TABS = [
  { id: 'ueberblick', label: 'Überblick' },
  { id: 'faden', label: 'Roter Faden' },
  { id: 'wochen', label: 'Wochenplan' },
  { id: 'builder', label: 'Session-Builder' },
  { id: 'finder', label: 'Finder' },
  { id: 'camp', label: 'Trainingslager' },
  { id: 'katalog', label: 'Katalog' },
  { id: 'legende', label: 'Legende' },
] as const;

export type TabId = (typeof TABS)[number]['id'];

export interface AppContextValue {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  /** Exercise code the Katalog tab should scroll to + highlight after switching tabs. */
  exerciseTarget: string | null;
  /** Switches to the Katalog tab and requests it scroll to/highlight the given exercise code. */
  requestExercise: (code: string) => void;
  clearExerciseTarget: () => void;
  /** Phase id the Überblick tab should scroll to + highlight after switching tabs. */
  phaseTarget: number | null;
  requestPhase: (id: number) => void;
  clearPhaseTarget: () => void;
  /** Slots currently hidden via the global Slot-Sichtbarkeit control, shared across Finder/Session-Builder/Wochenplan. */
  hiddenSlots: Set<SlotNumber>;
  toggleSlotVisibility: (slot: SlotNumber) => void;
}

export const AppContext = createContext<AppContextValue | null>(null);

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppShell');
  return ctx;
}
