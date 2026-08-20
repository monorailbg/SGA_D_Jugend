'use client';

import { useState } from 'react';
import { slots } from '@/lib/data/slots';
import { categoryByCode } from '@/lib/data/categories';
import { useAppContext } from '@/lib/AppContext';
import { useExercisesForSlot } from '@/lib/customExercises';
import SlotVisibilityBar from '../SlotVisibilityBar';
import Accordion from '../Accordion';
import type { SlotNumber } from '@/lib/data/types';

const SLOT_EMOJI: Record<number, string> = { 1: '🔥', 2: '🎯', 3: '🎯', 4: '⚽' };

function SlotTiles({ exercises, onPick }: { exercises: ReturnType<typeof useExercisesForSlot>; onPick: (code: string) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3 p-3.5 pt-1 sm:grid-cols-3">
      {exercises.map((ex) => {
        const category = categoryByCode[ex.category];
        return (
          <button
            key={ex.code}
            type="button"
            onClick={() => onPick(ex.code)}
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
  );
}

function FinderSlotSection({
  slot,
  open,
  onOpenChange,
  onPick,
}: {
  slot: (typeof slots)[number];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPick: (code: string) => void;
}) {
  const exercises = useExercisesForSlot(slot.number);
  return (
    <div className="card mb-4 overflow-hidden">
      <Accordion
        title={`${SLOT_EMOJI[slot.number]} Slot ${slot.number} · ${slot.name}`}
        badge={`${exercises.length} · 20–25 min`}
        accent={slot.color}
        open={open}
        onOpenChange={onOpenChange}
      >
        <SlotTiles exercises={exercises} onPick={onPick} />
      </Accordion>
    </div>
  );
}

export default function Finder() {
  const { requestExercise, hiddenSlots } = useAppContext();
  // Finder is a quick-scan tool, so slots start expanded (unlike Katalog's
  // collapsed-by-default categories) - collapsing is an option, not the default.
  const [openMap, setOpenMap] = useState<Record<number, boolean>>({ 1: true, 2: true, 3: true, 4: true });

  return (
    <div>
      <h2 className="mb-1 text-[30px] font-extrabold tracking-tight">Übungs-Finder nach Slot</h2>
      <p className="lead mb-4">
        Alle Übungen sortiert nach Trainingsslot – zum schnellen Finden einer Alternative. Kachel antippen springt
        direkt in den Katalog.
      </p>
      <SlotVisibilityBar />
      {slots
        .filter((slot) => !hiddenSlots.has(slot.number))
        .map((slot) => (
          <FinderSlotSection
            key={slot.number}
            slot={slot}
            open={openMap[slot.number] ?? true}
            onOpenChange={(open) => setOpenMap((prev) => ({ ...prev, [slot.number]: open }))}
            onPick={requestExercise}
          />
        ))}
      {hiddenSlots.size === 4 && (
        <p className="rounded-xl border border-dashed border-line p-6 text-center text-sm text-muted">
          Alle Slots ausgeblendet – oben wieder einblenden.
        </p>
      )}
    </div>
  );
}
