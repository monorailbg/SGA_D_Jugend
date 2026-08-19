import { fieldSizeFor } from './conditions';
import type { Exercise, SlotNumber } from './types';

const STORAGE_KEY = 'sga-phase-history-v1';

type PhaseHistory = Record<number, Record<string, number>>;

function loadHistory(): PhaseHistory {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}') as PhaseHistory;
  } catch {
    return {};
  }
}

function saveHistory(history: PhaseHistory): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

/** How many times this exercise has already been picked by the generator within this phase. */
export function repCountInPhase(phaseId: number, code: string): number {
  return loadHistory()[phaseId]?.[code] ?? 0;
}

/** Records a freshly generated session's picks against the phase's rep history. */
export function recordSessionInPhase(phaseId: number, codes: string[]): void {
  const history = loadHistory();
  const phaseCounts = { ...(history[phaseId] ?? {}) };
  for (const code of codes) phaseCounts[code] = (phaseCounts[code] ?? 0) + 1;
  saveHistory({ ...history, [phaseId]: phaseCounts });
}

export function resetPhaseHistory(phaseId: number): void {
  const history = loadHistory();
  const next = { ...history };
  delete next[phaseId];
  saveHistory(next);
}

/**
 * Prefers exercises already reinforced 1-2x this phase (motor-memory repetition before
 * rotating in something new) over brand-new ones, without ever hard-excluding either -
 * this is a scheduling bias, not a claim about any specific exercise's difficulty.
 */
export function reinforcementWeighted(candidates: Exercise[], phaseId: number): Exercise[] {
  const reinforcing = candidates.filter((e) => {
    const n = repCountInPhase(phaseId, e.code);
    return n >= 1 && n < 3;
  });
  if (reinforcing.length > 0 && Math.random() < 0.65) return reinforcing;
  const fresh = candidates.filter((e) => repCountInPhase(phaseId, e.code) === 0);
  return fresh.length > 0 ? fresh : candidates;
}

/**
 * Adjacent-slot pairs (1-2, 2-3, 3-4) whose picks share the same approximate field
 * footprint (see fieldSizeFor's dimension-parsing heuristic) - a real, if approximate,
 * proxy for "less cone/goal reconstruction between slots."
 */
export function setupSynergyPairs(
  session: Partial<Record<SlotNumber, Exercise>>
): { from: SlotNumber; to: SlotNumber; shared: boolean }[] {
  const pairs: [SlotNumber, SlotNumber][] = [
    [1, 2],
    [2, 3],
    [3, 4],
  ];
  return pairs.map(([from, to]) => {
    const a = session[from];
    const b = session[to];
    const shared = !!a && !!b && fieldSizeFor(a) !== 'unknown' && fieldSizeFor(a) === fieldSizeFor(b);
    return { from, to, shared };
  });
}
