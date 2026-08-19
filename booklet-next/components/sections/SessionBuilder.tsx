'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Shuffle, Sparkles, CloudRain, Sun, CloudSun, Users, Maximize, Info, Target } from 'lucide-react';
import { exercisesForSlot, exerciseByCode } from '@/lib/data/exercises';
import { slots } from '@/lib/data/slots';
import { categories, categoryByCode } from '@/lib/data/categories';
import { phases } from '@/lib/data/phases';
import {
  PLAYER_TIERS,
  WEATHER_OPTIONS,
  FIELD_SIZES,
  PHASE_FOCUS_CATEGORIES,
  allowedInPhase,
  matchesPlayerTier,
  matchesFieldSize,
  type PlayerTier,
  type Weather,
  type FieldSize,
} from '@/lib/data/conditions';
import { useAppContext } from '@/lib/AppContext';
import type { CategoryCode, Exercise, SlotNumber } from '@/lib/data/types';

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
  if (focusCategory !== 'all') {
    return candidates[Math.floor(Math.random() * candidates.length)];
  }
  const focusCategories = PHASE_FOCUS_CATEGORIES[phaseId] ?? [];
  const focused = candidates.filter((e) => focusCategories.includes(e.category));
  const from = focused.length > 0 ? focused : candidates;
  return from[Math.floor(Math.random() * from.length)];
}

export default function SessionBuilder() {
  const { requestExercise } = useAppContext();
  const [tier, setTier] = useState<PlayerTier>('full');
  const [weather, setWeather] = useState<Weather>('normal');
  const [field, setField] = useState<FieldSize>('half');
  const [phaseId, setPhaseId] = useState(1);
  const [focusCategory, setFocusCategory] = useState<CategoryFocus>('all');
  const [session, setSession] = useState<Partial<Record<SlotNumber, string>>>({});
  const [planBOpen, setPlanBOpen] = useState<Record<string, boolean>>({});

  const pools = useMemo(
    () =>
      Object.fromEntries(
        slots.map((s) => [s.number, poolForSlot(s.number, tier, field, phaseId, focusCategory)])
      ) as Record<SlotNumber, Exercise[]>,
    [tier, field, phaseId, focusCategory]
  );

  function generateSession() {
    const used = new Set<string>();
    const next: Partial<Record<SlotNumber, string>> = {};
    for (const s of slots) {
      const pick = pickWeighted(pools[s.number], phaseId, focusCategory, used);
      next[s.number] = pick.code;
      used.add(pick.code);
    }
    setSession(next);
  }

  function swapSlot(slotNum: SlotNumber) {
    const current = session[slotNum];
    const avoid = new Set(current ? [current] : []);
    const pick = pickWeighted(pools[slotNum], phaseId, focusCategory, avoid);
    setSession((prev) => ({ ...prev, [slotNum]: pick.code }));
  }

  const weatherTip = WEATHER_OPTIONS.find((w) => w.id === weather)?.tip;

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
          <ControlGroup icon={Users} label="Spieleranzahl">
            {PLAYER_TIERS.map((t) => (
              <SegButton key={t.id} active={tier === t.id} onClick={() => setTier(t.id)}>
                {t.label}
              </SegButton>
            ))}
          </ControlGroup>

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

      {/* Slot grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {slots.map((slot) => {
          const code = session[slot.number];
          const exercise = code ? exerciseByCode[code] : null;
          const poolCount = pools[slot.number].length;
          const planBKey = exercise ? Object.keys(exercise.blocks).find((k) => k.startsWith('Plan B')) : undefined;

          return (
            <div key={slot.number} className="card overflow-hidden">
              <div style={{ borderColor: slot.color, color: slot.color }} className="flex items-center justify-between border-b-[3px] px-3.5 py-2.5">
                <span className="font-ui text-[13px] font-extrabold uppercase tracking-wide">
                  Slot {slot.number} · {slot.name}
                </span>
                <span className="font-mono text-[11px] text-muted">{poolCount} passend</span>
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
                          <span
                            style={{ background: categoryByCode[exercise.category].color }}
                            className="mb-1 inline-block rounded px-1.5 py-0.5 font-mono text-[11px] font-extrabold text-white"
                          >
                            {exercise.code}
                          </span>
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
                            className="flex flex-1 items-center justify-center rounded-lg border border-line bg-white py-1.5 text-[12px] font-bold text-ink transition-colors hover:border-green hover:text-green"
                          >
                            Plan B
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
