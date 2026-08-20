'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Shuffle, Sparkles, CloudRain, Sun, CloudSun, Users, Maximize, Info, Target, Zap, RotateCcw } from 'lucide-react';
import { exercisesForSlot, exerciseByCode } from '@/lib/data/exercises';
import { slots } from '@/lib/data/slots';
import { categories, categoryByCode } from '@/lib/data/categories';
import { phases } from '@/lib/data/phases';
import {
  WEATHER_OPTIONS,
  FIELD_SIZES,
  PHASE_FOCUS_CATEGORIES,
  allowedInPhase,
  matchesPlayerTier,
  matchesFieldSize,
  minPlayersFor,
  type PlayerTier,
  type Weather,
  type FieldSize,
} from '@/lib/data/conditions';
import { reinforcementWeighted, repCountInPhase, recordSessionInPhase, resetPhaseHistory, setupSynergyPairs } from '@/lib/data/harmony';
import { useAppContext } from '@/lib/AppContext';
import type { CategoryCode, Exercise, SlotNumber } from '@/lib/data/types';
import SlotVisibilityBar from '../SlotVisibilityBar';
import PlayerCountSlider, { tierForCount } from '../PlayerCountSlider';

const WEATHER_ICON = { normal: CloudSun, rain: CloudRain, heat: Sun } as const;

type CategoryFocus = CategoryCode | 'all';

function poolForSlot(
  slotNum: SlotNumber,
  tier: PlayerTier,
  field: FieldSize,
  phaseId: number,
  focusCategory: CategoryFocus
): Exercise[] {
  const base = exercisesForSlot(slotNum).filter((e) => allowedInPhase(e, phaseId));
  let pool = base.filter((e) => matchesPlayerTier(e, tier) && matchesFieldSize(e, field));
  if (pool.length === 0) pool = base.filter((e) => matchesPlayerTier(e, tier));
  if (pool.length === 0) pool = base;

  // Schwerpunkt is an explicit ask from the coach, so it filters hard - but still
  // falls back to the unfiltered pool rather than leaving a slot empty if nothing
  // in that category happens to fit this slot.
  if (focusCategory !== 'all') {
    const byCategory = pool.filter((e) => e.category === focusCategory);
    if (byCategory.length > 0) return byCategory;
  }
  return pool;
}

function pickWeighted(pool: Exercise[], phaseId: number, focusCategory: CategoryFocus, avoid: Set<string>): Exercise {
  const fresh = pool.filter((e) => !avoid.has(e.code));
  const candidates = fresh.length > 0 ? fresh : pool;

  // An explicit Schwerpunkt already narrowed the pool in poolForSlot, so no need to
  // weight further; otherwise fall back to the phase's soft category bias.
  let from: Exercise[];
  if (focusCategory !== 'all') {
    from = candidates;
  } else {
    const focusCategories = PHASE_FOCUS_CATEGORIES[phaseId] ?? [];
    const focused = candidates.filter((e) => focusCategories.includes(e.category));
    from = focused.length > 0 ? focused : candidates;
  }
  from = reinforcementWeighted(from, phaseId);
  return from[Math.floor(Math.random() * from.length)];
}

export default function SessionBuilder() {
  const { requestExercise, hiddenSlots } = useAppContext();
  const [playerCount, setPlayerCount] = useState(12);
  const tier: PlayerTier = tierForCount(playerCount);
  const [weather, setWeather] = useState<Weather>('normal');
  const [field, setField] = useState<FieldSize>('half');
  const [phaseId, setPhaseId] = useState(1);
  const [focusCategory, setFocusCategory] = useState<CategoryFocus>('all');
  const [session, setSession] = useState<Partial<Record<SlotNumber, string>>>({});
  const [previousSession, setPreviousSession] = useState<Partial<Record<SlotNumber, string>>>({});
  const [planBOpen, setPlanBOpen] = useState<Record<string, boolean>>({});
  const [historyVersion, setHistoryVersion] = useState(0); // bumps to re-read localStorage-backed rep counts

  const pools = useMemo(
    () =>
      Object.fromEntries(
        slots.map((s) => [s.number, poolForSlot(s.number, tier, field, phaseId, focusCategory)])
      ) as Record<SlotNumber, Exercise[]>,
    [tier, field, phaseId, focusCategory]
  );

  function generateSession() {
    // Intraweek variety: avoid repeating anything from the session currently on
    // screen (stands in for "not the same drill Tuesday and Thursday") - it's about
    // to become "previousSession" below, so this reads the pre-update value.
    const used = new Set(Object.values(session).filter((c): c is string => !!c));
    const next: Partial<Record<SlotNumber, string>> = {};
    for (const s of slots) {
      const pick = pickWeighted(pools[s.number], phaseId, focusCategory, used);
      next[s.number] = pick.code;
      used.add(pick.code);
    }
    setPreviousSession(session);
    setSession(next);
    recordSessionInPhase(phaseId, Object.values(next).filter((c): c is string => !!c));
    setHistoryVersion((v) => v + 1);
  }

  function swapSlot(slotNum: SlotNumber) {
    const current = session[slotNum];
    const avoid = new Set([current, previousSession[slotNum]].filter((c): c is string => !!c));
    const pick = pickWeighted(pools[slotNum], phaseId, focusCategory, avoid);
    setSession((prev) => ({ ...prev, [slotNum]: pick.code }));
  }

  function resetPhase() {
    resetPhaseHistory(phaseId);
    setHistoryVersion((v) => v + 1);
  }

  // Auto-surface Plan B once the slider drops below an exercise's own real
  // derived minPlayers threshold - not a flat "<8" rule, each exercise's own
  // number (from its authored Plan B text or category default).
  useEffect(() => {
    setPlanBOpen((prev) => {
      const next = { ...prev };
      for (const s of slots) {
        const code = session[s.number];
        const exercise = code ? exerciseByCode[code] : null;
        if (!exercise) continue;
        const planBKey = Object.keys(exercise.blocks).find((k) => k.startsWith('Plan B'));
        if (planBKey && playerCount < minPlayersFor(exercise)) next[exercise.code] = true;
      }
      return next;
    });
  }, [playerCount, session]);

  const weatherTip = WEATHER_OPTIONS.find((w) => w.id === weather)?.tip;

  const sessionExercises = useMemo(
    () =>
      Object.fromEntries(
        slots.map((s) => [s.number, session[s.number] ? exerciseByCode[session[s.number]!] : undefined])
      ) as Partial<Record<SlotNumber, Exercise>>,
    [session]
  );
  const synergy = useMemo(() => setupSynergyPairs(sessionExercises), [sessionExercises]);
  const sharedSetupCount = synergy.filter((p) => p.shared).length;
  const hasSession = Object.keys(session).length > 0;
  const repeatedCodes = Object.values(session).filter(
    (c): c is string => !!c && Object.values(previousSession).includes(c)
  );
  const repCounts = useMemo(() => {
    const map: Partial<Record<SlotNumber, number>> = {};
    for (const s of slots) {
      const ex = sessionExercises[s.number];
      if (ex) map[s.number] = repCountInPhase(phaseId, ex.code);
    }
    return map;
    // historyVersion forces a re-read after generate/reset even though it's not referenced directly
  }, [sessionExercises, phaseId, historyVersion]);

  return (
    <div>
      <h2 className="mb-1 text-[30px] font-extrabold tracking-tight">Training-Matrix &amp; Slot-Pool</h2>
      <p className="lead mb-4">
        Dynamische Session-Zusammenstellung statt starrem Wochenplan: Bedingungen wählen, Session generieren, pro
        Slot einzeln austauschen.
      </p>

      {/* Feldbedingungen control bar */}
      <div className="sticky top-0 z-10 mb-5 rounded-2xl border border-line bg-white/85 p-4 shadow-sm backdrop-blur-md">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <PlayerCountSlider value={playerCount} onChange={setPlayerCount} />

          <ControlGroup icon={CloudSun} label="Wetter / Platz">
            {WEATHER_OPTIONS.map((w) => {
              const Icon = WEATHER_ICON[w.id];
              return (
                <SegButton key={w.id} active={weather === w.id} onClick={() => setWeather(w.id)}>
                  <Icon size={13} strokeWidth={2.5} className="mr-1 inline" />
                  {w.label}
                </SegButton>
              );
            })}
          </ControlGroup>

          <ControlGroup icon={Maximize} label="Platzgröße">
            {FIELD_SIZES.map((f) => (
              <SegButton key={f.id} active={field === f.id} onClick={() => setField(f.id)}>
                {f.label}
              </SegButton>
            ))}
          </ControlGroup>

          <ControlGroup icon={Sparkles} label="Saisonphase">
            {phases.map((p) => (
              <SegButton key={p.id} active={phaseId === p.id} onClick={() => setPhaseId(p.id)}>
                {p.id}
              </SegButton>
            ))}
          </ControlGroup>

          <ControlGroup icon={Target} label="Schwerpunkt">
            <SegButton active={focusCategory === 'all'} onClick={() => setFocusCategory('all')}>
              Alle
            </SegButton>
            {categories.map((c) => (
              <SegButton
                key={c.code}
                active={focusCategory === c.code}
                onClick={() => setFocusCategory(c.code)}
                accent={focusCategory === c.code ? c.color : undefined}
              >
                {c.code}
              </SegButton>
            ))}
          </ControlGroup>
        </div>

        {focusCategory !== 'all' && (
          <div className="mt-3 text-[12px] text-muted">
            Schwerpunkt: <span className="font-bold text-ink">{categoryByCode[focusCategory].name}</span> – Pools
            werden pro Slot auf diese Kategorie eingeschränkt (mit Rückfalloption, falls ein Slot dafür keine
            Übung hat).
          </div>
        )}

        <AnimatePresence>
          {weather !== 'normal' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-3 flex items-start gap-2 rounded-lg bg-soft px-3 py-2 text-[12.5px] text-ink">
                <Info size={14} className="mt-0.5 shrink-0 text-green" />
                {weatherTip}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="button"
          onClick={generateSession}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-green-d py-3 font-ui text-[14px] font-extrabold text-white transition-transform hover:bg-green active:scale-[0.99]"
        >
          <Shuffle size={17} strokeWidth={2.5} />
          Session generieren
        </button>
      </div>

      <p className="mb-3 text-[12px] text-muted">
        Hinweis: Spieleranzahl- und Platzgröße-Filter sind Richtwerte, abgeleitet aus den „Plan B“-Angaben und den im
        Aufbau genannten Feldmaßen – keine geprüfte Freigabe pro Übung. Wetter beeinflusst aktuell nur den Hinweistext,
        nicht die Auswahl.
      </p>

      {/* Session-Analyse: transparent, real-signal summary - no invented confidence score */}
      {hasSession && (
        <div className="mb-5 rounded-2xl border border-line bg-white p-4">
          <div className="mb-2.5 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-muted">
              <Zap size={13} strokeWidth={2.5} />
              Session-Analyse
            </div>
            <button
              type="button"
              onClick={resetPhase}
              className="flex items-center gap-1 text-[11px] font-bold text-muted transition-colors hover:text-green"
            >
              <RotateCcw size={11} strokeWidth={2.5} />
              Phase-Verlauf zurücksetzen
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[12.5px] text-ink">
            <span className="rounded-full bg-soft px-2.5 py-1">
              ⚡ {sharedSetupCount} von 3 Übergängen mit gleicher Feldgröße
            </span>
            <span className={`rounded-full px-2.5 py-1 ${repeatedCodes.length > 0 ? 'bg-[#fff4cf] text-[#8a6d00]' : 'bg-soft text-ink'}`}>
              {repeatedCodes.length > 0
                ? `${repeatedCodes.join(', ')} wiederholt sich zur letzten Session (kein anderer Kandidat im Pool)`
                : 'Keine Wiederholung zur letzten Session'}
            </span>
          </div>
          <p className="mt-2 text-[11.5px] text-muted">
            Feldgröße ist die gleiche Richtwert-Schätzung wie oben; „geteilter Aufbau" heißt nur: ähnliche
            Platzmaße, kein geprüfter Abgleich von Hütchen-/Torstellung. Phase-Zähler zeigt, wie oft eine Übung in
            dieser Saisonphase bereits generiert wurde (gespeichert in diesem Browser).
          </p>
        </div>
      )}

      {/* Slot grid */}
      <SlotVisibilityBar />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {slots
          .filter((slot) => !hiddenSlots.has(slot.number))
          .map((slot) => {
          const code = session[slot.number];
          const exercise = code ? exerciseByCode[code] : null;
          const poolCount = pools[slot.number].length;
          const planBKey = exercise ? Object.keys(exercise.blocks).find((k) => k.startsWith('Plan B')) : undefined;

          return (
            <div key={slot.number} className="card overflow-hidden">
              <div style={{ borderColor: slot.color, color: slot.color }} className="flex items-center gap-1.5 whitespace-nowrap border-b-[3px] px-3.5 py-2.5">
                <span className="shrink-0 font-ui text-[13px] font-extrabold uppercase tracking-wide">Slot {slot.number}</span>
                <span className="truncate font-ui text-[13px] font-extrabold uppercase tracking-wide">· {slot.name}</span>
                <span className="ml-auto shrink-0 font-mono text-[11px] text-muted">{poolCount} passend</span>
              </div>

              <div className="p-3.5">
                <AnimatePresence mode="wait">
                  {exercise ? (
                    <motion.div
                      key={exercise.code}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                    >
                      <button
                        type="button"
                        onClick={() => requestExercise(exercise.code)}
                        className="block w-full overflow-hidden rounded-lg border border-line bg-soft text-left transition-transform hover:scale-[1.01] active:scale-[0.99]"
                      >
                        {exercise.image && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={exercise.image} alt={exercise.title} className="h-28 w-full object-cover" loading="lazy" />
                        )}
                        <div className="p-2.5">
                          <div className="mb-1 flex items-center gap-1.5">
                            <span
                              style={{ background: categoryByCode[exercise.category].color }}
                              className="inline-block rounded px-1.5 py-0.5 font-mono text-[11px] font-extrabold text-white"
                            >
                              {exercise.code}
                            </span>
                            {!!repCounts[slot.number] && (
                              <span className="rounded px-1.5 py-0.5 font-mono text-[10.5px] font-bold text-muted">
                                {repCounts[slot.number]}. Mal in Phase {phaseId}
                              </span>
                            )}
                          </div>
                          <div className="text-[13px] font-bold leading-snug text-ink">{exercise.title}</div>
                        </div>
                      </button>

                      <div className="mt-2 flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => swapSlot(slot.number)}
                          className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-line bg-white py-1.5 text-[12px] font-bold text-ink transition-colors hover:border-green hover:text-green"
                        >
                          <Shuffle size={12} strokeWidth={2.5} />
                          Swap
                        </button>
                        {planBKey && (
                          <button
                            type="button"
                            onClick={() => setPlanBOpen((prev) => ({ ...prev, [exercise.code]: !prev[exercise.code] }))}
                            className={`flex flex-1 items-center justify-center gap-1 rounded-lg border py-1.5 text-[12px] font-bold transition-colors ${
                              playerCount < minPlayersFor(exercise)
                                ? 'border-[#d99a00] bg-[#fff7e8] text-[#8a6d00]'
                                : 'border-line bg-white text-ink hover:border-green hover:text-green'
                            }`}
                          >
                            Plan B
                            {playerCount < minPlayersFor(exercise) && (
                              <span className="rounded-full bg-[#d99a00] px-1.5 py-0.5 text-[9.5px] font-extrabold uppercase text-white">
                                Empfohlen
                              </span>
                            )}
                          </button>
                        )}
                      </div>

                      {planBKey && (
                        <motion.div
                          initial={false}
                          animate={{ height: planBOpen[exercise.code] ? 'auto' : 0 }}
                          transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                          style={{ overflow: 'hidden' }}
                        >
                          <div
                            className="mt-1.5 rounded-lg bg-soft p-2.5 text-[12.5px]"
                            dangerouslySetInnerHTML={{ __html: exercise.blocks[planBKey]! }}
                          />
                        </motion.div>
                      )}
                    </motion.div>
                  ) : (
                    <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-line text-center text-[12.5px] text-muted">
                      Noch keine Übung gewählt
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>
      {hiddenSlots.size === 4 && (
        <p className="mt-4 rounded-xl border border-dashed border-line p-6 text-center text-sm text-muted">
          Alle Slots ausgeblendet – oben wieder einblenden.
        </p>
      )}
    </div>
  );
}

function ControlGroup({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Users;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-muted">
        <Icon size={13} strokeWidth={2.5} />
        {label}
      </div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function SegButton({
  active,
  onClick,
  accent,
  children,
}: {
  active: boolean;
  onClick: () => void;
  accent?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={active && accent ? { background: accent } : undefined}
      className={`rounded-full px-2.5 py-1.5 text-[12px] font-bold transition-colors ${
        active ? (accent ? 'text-white' : 'bg-green-d text-white') : 'bg-soft text-ink hover:bg-line/60'
      }`}
    >
      {children}
    </button>
  );
}
