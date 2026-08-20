'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { weekPlans } from '@/lib/data/weekplan';
import { exerciseByCode } from '@/lib/data/exercises';
import { categoryByCode } from '@/lib/data/categories';
import { useAppContext } from '@/lib/AppContext';
import Accordion from '../Accordion';
import SlotVisibilityBar from '../SlotVisibilityBar';
import type { SlotNumber } from '@/lib/data/types';

export default function Wochenplan() {
  const { requestExercise, hiddenSlots } = useAppContext();

  return (
    <div>
      <h2 className="mb-1 text-[30px] font-extrabold tracking-tight">Wochenplan – Phase 1 &amp; Phase 2</h2>
      <p className="lead mb-4">
        6 Wochen im Detail: Vorbereitung Hinrunde (VB) und die ersten Wochen der Hinrunde (HR). Woche antippen zum
        Auf-/Zuklappen.
      </p>
      <SlotVisibilityBar />
      <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2 xl:grid-cols-3">
        {weekPlans.map((week, i) => (
          <div key={week.wknr} className="card overflow-hidden">
            <Accordion title={`${week.wknr} · ${week.wkdate}`} subtitle={week.wkfokus} defaultOpen={i === 0}>
              <div className="grid grid-cols-1 gap-2.5 px-[18px] pb-[18px] sm:grid-cols-2">
                {week.days.map((day) => (
                  <div key={day.label}>
                    <span
                      style={day.color ? { background: day.color, color: '#fff' } : undefined}
                      className="mb-1.5 inline-block rounded-md px-2.5 py-0.5 font-ui text-[13px] font-bold"
                    >
                      {day.label}
                    </span>
                    <motion.div layout className="mt-1.5 flex flex-col gap-1.5">
                      <AnimatePresence initial={false}>
                        {day.entries.map((entry, j) => {
                          // Entries are ordered Slot 1 -> 4 within each day (see PROJEKTKONTEXT).
                          const slotNum = (j + 1) as SlotNumber;
                          if (hiddenSlots.has(slotNum)) return null;
                          const exercise = exerciseByCode[entry.code];
                          const accent = exercise ? categoryByCode[exercise.category].color : '#1565C0';
                          return (
                            <motion.button
                              key={entry.code}
                              layout
                              type="button"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                              onClick={() => requestExercise(entry.code)}
                              style={{ borderLeftColor: accent }}
                              className="flex items-center gap-2 overflow-hidden rounded-lg border-l-[3px] bg-soft px-2 py-1.5 text-left transition-colors hover:bg-line/50"
                            >
                              <span
                                style={{ background: accent }}
                                className="shrink-0 rounded px-1.5 py-0.5 font-mono text-[11px] font-extrabold text-white"
                              >
                                {entry.code}
                              </span>
                              <span className="text-[13px] leading-tight text-ink">{entry.title}</span>
                            </motion.button>
                          );
                        })}
                      </AnimatePresence>
                    </motion.div>
                  </div>
                ))}
              </div>
              <div className="px-[18px] pb-[18px]">
                {week.homeworkHtml && <div dangerouslySetInnerHTML={{ __html: week.homeworkHtml }} />}
                {week.planBHtml && <div dangerouslySetInnerHTML={{ __html: week.planBHtml }} />}
              </div>
            </Accordion>
          </div>
        ))}
      </div>
    </div>
  );
}
