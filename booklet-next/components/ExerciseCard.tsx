'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Trash2, Pencil } from 'lucide-react';
import type { Exercise } from '@/lib/data/types';
import { categoryByCode } from '@/lib/data/categories';
import { slots as allSlots } from '@/lib/data/slots';
import { deleteCustomExercise } from '@/lib/customExercises';
import Accordion from './Accordion';
import CreateExerciseModal from './CreateExerciseModal';

const BLOCK_ORDER = ['Ziel', 'Material', 'Aufbau', 'Ablauf', 'Varianten', 'Coaching-Punkte'] as const;

export default function ExerciseCard({
  exercise,
  highlighted = false,
  cardRef,
}: {
  exercise: Exercise;
  highlighted?: boolean;
  cardRef?: (el: HTMLElement | null) => void;
}) {
  const category = categoryByCode[exercise.category];
  const accent = exercise.color ?? category.color;
  const [imgError, setImgError] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const showImage = exercise.image && !imgError;
  const planBKey = Object.keys(exercise.blocks).find((k) => k.startsWith('Plan B'));

  async function handleDelete() {
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteCustomExercise(exercise.code);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Löschen fehlgeschlagen.');
      setDeleting(false);
      setConfirmingDelete(false);
    }
    // On success the card unmounts itself once the exercise disappears from the
    // shared list, so no need to reset deleting/confirmingDelete state here.
  }

  return (
    <motion.article
      ref={cardRef}
      id={`ex-${exercise.code}`}
      animate={highlighted ? { boxShadow: ['0 0 0 0 rgba(21,101,192,0)', '0 0 0 6px rgba(21,101,192,.35)', '0 0 0 0 rgba(21,101,192,0)'] } : {}}
      transition={{ duration: 1.4 }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
      className="card my-3.5 scroll-mt-24 overflow-hidden"
    >
      {editing && <CreateExerciseModal existing={exercise} onClose={() => setEditing(false)} />}
      <header style={{ borderLeftColor: accent }} className="border-l-[6px] bg-soft px-[18px] py-3.5">
        <div className="flex items-center gap-3">
          <span style={{ borderColor: accent }} className="ccode big">{exercise.code}</span>
          <h3 className="m-0 flex-1 text-[21px] font-extrabold">{exercise.title}</h3>
          {!confirmingDelete && (
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => setEditing(true)}
                aria-label="Übung bearbeiten"
                className="rounded-full p-2 text-muted transition-colors hover:bg-green/10 hover:text-green"
              >
                <Pencil size={16} strokeWidth={2.5} />
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                aria-label="Übung löschen"
                className="rounded-full p-2 text-muted transition-colors hover:bg-[#d23b3b]/10 hover:text-[#d23b3b]"
              >
                <Trash2 size={16} strokeWidth={2.5} />
              </button>
            </div>
          )}
          {confirmingDelete && (
            <div className="flex shrink-0 items-center gap-1.5">
              <span className="text-[12px] font-bold text-muted">Löschen?</span>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-full bg-[#d23b3b] px-2.5 py-1 text-[12px] font-bold text-white transition-colors hover:bg-[#b32e2e] disabled:opacity-60"
              >
                {deleting ? '…' : 'Ja'}
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                disabled={deleting}
                className="rounded-full border border-line px-2.5 py-1 text-[12px] font-bold text-ink hover:bg-line/40"
              >
                Nein
              </button>
            </div>
          )}
        </div>
        {deleteError && <p className="mt-1.5 text-[12px] font-bold text-[#d23b3b]">{deleteError}</p>}
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {exercise.slots.map((slotNum) => {
            const slot = allSlots.find((s) => s.number === slotNum);
            return (
              <span key={slotNum} style={{ background: slot?.color }} className="chip">
                Slot {slotNum} · {slot?.name}
              </span>
            );
          })}
          <span style={{ background: category.color }} className="chip">
            {category.code} · {category.name}
          </span>
          <span className={`chip flex items-center gap-1 ${exercise.isCustom ? 'bg-ink text-white' : 'bg-line text-ink'}`}>
            {exercise.isCustom && <Sparkles size={11} strokeWidth={2.5} />}
            {exercise.isCustom ? 'Trainer-Übung' : 'Original'}
          </span>
        </div>
      </header>
      <div className="grid gap-[18px] p-[18px] md:grid-cols-[minmax(280px,40%)_1fr]">
        <div className="aspect-[4/3] overflow-hidden rounded-xl border border-line bg-soft">
          {showImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={exercise.image!}
              alt={exercise.title}
              loading="lazy"
              onError={() => setImgError(true)}
              className="block h-full w-full object-cover"
            />
          ) : (
            <div style={{ background: category.color }} className="flex h-full items-center justify-center">
              <span className="font-mono text-3xl font-extrabold text-white/90">{category.code}</span>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2 md:gap-x-6">
          {BLOCK_ORDER.map(
            (key) =>
              exercise.blocks[key] && (
                <div key={key}>
                  <h4 className="mb-1 text-[13px] font-bold uppercase tracking-wide text-green">{key}</h4>
                  <div className="text-[13.5px]" dangerouslySetInnerHTML={{ __html: exercise.blocks[key]! }} />
                </div>
              )
          )}
          {planBKey && (
            <div className="md:col-span-2">
              <Accordion title={planBKey} accent={accent}>
                <div className="px-3 pb-0.5 pt-2 text-[13.5px]" dangerouslySetInnerHTML={{ __html: exercise.blocks[planBKey]! }} />
              </Accordion>
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
}
