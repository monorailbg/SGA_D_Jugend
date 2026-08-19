'use client';

import { slots } from '@/lib/data/slots';
import { exercisesForSlot } from '@/lib/data/exercises';
import { categoryByCode } from '@/lib/data/categories';
import { useAppContext } from '@/lib/AppContext';

const SLOT_EMOJI: Record<number, string> = { 1: '🔥', 2: '🎯', 3: '🎯', 4: '⚽' };

export default function Finder() {
  const { requestExercise } = useAppContext();

  return (
    <div>
      <h2 className="mb-1 text-[30px] font-extrabold tracking-tight">Übungs-Finder nach Slot</h2>
      <p className="lead mb-4">
        Alle Übungen sortiert nach Trainingsslot – zum schnellen Finden einer Alternative. Kachel antippen springt
        direkt in den Katalog.
      </p>
      {slots.map((slot) => (
        <div key={slot.number} className="mb-7">
          <div
            style={{ borderColor: slot.color, color: slot.color }}
            className="mb-3 rounded border-l-[5px] bg-soft px-3 py-1.5 font-ui text-lg font-extrabold"
          >
            {SLOT_EMOJI[slot.number]} Slot {slot.number} · {slot.name}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {exercisesForSlot(slot.number).map((ex) => {
              const category = categoryByCode[ex.category];
              return (
                <button
                  key={ex.code}
                  type="button"
                  onClick={() => requestExercise(ex.code)}
                  className="flex flex-col overflow-hidden rounded-xl border border-line bg-paper text-left text-ink transition-transform hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="h-[100px] shrink-0 overflow-hidden bg-soft">
                    {ex.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={ex.image} alt={ex.title} className="h-full w-full object-cover" loading="lazy" />
                    )}
                  </div>
                  <div className="flex flex-col gap-0.5 p-2.5">
                    <span
                      style={{ background: category.color }}
                      className="w-fit rounded px-1.5 py-0.5 font-mono text-[11px] font-extrabold text-white"
                    >
                      {ex.code}
                    </span>
                    <span className="text-[12px] leading-snug text-muted">{ex.title}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
