'use client';

import { useEffect, useRef, useState } from 'react';
import { exercises, exerciseByCode } from '@/lib/data/exercises';
import { categories } from '@/lib/data/categories';
import { useAppContext } from '@/lib/AppContext';
import Accordion from '../Accordion';
import ExerciseCard from '../ExerciseCard';

const grouped = categories.map((category) => ({
  category,
  items: exercises.filter((e) => e.category === category.code).sort((a, b) => a.code.localeCompare(b.code)),
}));

export default function Katalog() {
  const { exerciseTarget, clearExerciseTarget } = useAppContext();
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({ K: true });
  const [highlightedCode, setHighlightedCode] = useState<string | null>(null);
  const cardRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    if (!exerciseTarget) return;
    const target = exerciseByCode[exerciseTarget];
    if (!target) {
      clearExerciseTarget();
      return;
    }
    setOpenMap((prev) => ({ ...prev, [target.category]: true }));

    const t = setTimeout(() => {
      cardRefs.current[exerciseTarget]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setHighlightedCode(exerciseTarget);
      clearExerciseTarget();
    }, 320);
    return () => clearTimeout(t);
  }, [exerciseTarget, clearExerciseTarget]);

  useEffect(() => {
    if (!highlightedCode) return;
    const t = setTimeout(() => setHighlightedCode(null), 1500);
    return () => clearTimeout(t);
  }, [highlightedCode]);

  return (
    <div>
      <h2 className="mb-1 text-[30px] font-extrabold tracking-tight">Übungskatalog</h2>
      <p className="lead mb-4">Alle {exercises.length} Übungen, gruppiert nach Kategorie. Kategorie antippen zum Auf-/Zuklappen.</p>
      {grouped.map(({ category, items }) => (
        <div key={category.code} className="card mb-4 overflow-hidden">
          <Accordion
            title={`${category.code} · ${category.name}`}
            badge={String(items.length)}
            accent={category.color}
            open={openMap[category.code] ?? false}
            onOpenChange={(open) => setOpenMap((prev) => ({ ...prev, [category.code]: open }))}
          >
            <div className="px-[18px] pb-1">
              {items.map((exercise) => (
                <ExerciseCard
                  key={exercise.code}
                  exercise={exercise}
                  highlighted={highlightedCode === exercise.code}
                  cardRef={(el) => {
                    cardRefs.current[exercise.code] = el;
                  }}
                />
              ))}
            </div>
          </Accordion>
        </div>
      ))}
    </div>
  );
}
