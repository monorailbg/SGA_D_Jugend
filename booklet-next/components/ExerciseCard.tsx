'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Exercise } from '@/lib/data/types';
import { categoryByCode } from '@/lib/data/categories';
import { slots as allSlots } from '@/lib/data/slots';
import Accordion from './Accordion';

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
  const showImage = exercise.image && !imgError;
  const planBKey = Object.keys(exercise.blocks).find((k) => k.startsWith('Plan B'));

  return (
    <motion.article
      ref={cardRef}
      id={`ex-${exercise.code}`}
      animate={highlighted ? { boxShadow: ['0 0 0 0 rgba(21,101,192,0)', '0 0 0 6px rgba(21,101,192,.35)', '0 0 0 0 rgba(21,101,192,0)'] } : {}}
      transition={{ duration: 1.4 }}
      whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(10,25,41,.1)' }}
      whileTap={{ scale: 0.99 }}
      className="card my-3.5 scroll-mt-24 overflow-hidden"
    >
      <header style={{ borderLeftColor: accent }} className="border-l-[6px] bg-soft px-[18px] py-3.5">
        <div className="flex items-center gap-3">
          <span style={{ borderColor: accent }} className="ccode big">{exercise.code}</span>
          <h3 className="m-0 text-[21px] font-extrabold">{exercise.title}</h3>
        </div>
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
