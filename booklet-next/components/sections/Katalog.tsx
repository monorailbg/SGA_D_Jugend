'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { exercises, exerciseByCode } from '@/lib/data/exercises';
import { categories } from '@/lib/data/categories';
import { useAppContext } from '@/lib/AppContext';
import type { Exercise } from '@/lib/data/types';
import Accordion from '../Accordion';
import ExerciseCard from '../ExerciseCard';

const grouped = categories.map((category) => ({
  category,
  items: exercises.filter((e) => e.category === category.code).sort((a, b) => a.code.localeCompare(b.code)),
}));

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ');
}

// Real content only: title, code, tags, and every authored block (Ziel/Aufbau/
// Ablauf/Coaching-Punkte/...) - no invented tag taxonomy layered on top.
const searchIndex: Record<string, string> = Object.fromEntries(
  exercises.map((e) => [
    e.code,
    [e.code, e.title, ...e.tags, ...Object.values(e.blocks).map((v) => stripHtml(v ?? ''))]
      .join(' ')
      .toLowerCase(),
  ])
);

// Quick-filter chips: each is a verified substring that actually occurs in the
// real exercise text below (checked against exercises.generated.json), not a
// fabricated tag taxonomy. "Plan B" additionally reflects a real structural
// field (exercise.blocks has a Plan B key).
const QUICK_FILTERS = ['1v1', 'Zweikampf', 'Umschalten', 'Torschuss', 'Dribbling', 'Plan B'];

function matches(exercise: Exercise, query: string): boolean {
  if (query.trim() === 'Plan B') {
    return Object.keys(exercise.blocks).some((k) => k.startsWith('Plan B'));
  }
  return searchIndex[exercise.code].includes(query.toLowerCase());
}

export default function Katalog() {
  const { exerciseTarget, clearExerciseTarget } = useAppContext();
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});
  const [highlightedCode, setHighlightedCode] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const cardRefs = useRef<Record<string, HTMLElement | null>>({});

  const trimmed = query.trim();
  const isSearching = trimmed.length > 0;

  const results = useMemo(() => {
    if (!isSearching) return grouped;
    return grouped
      .map(({ category, items }) => ({ category, items: items.filter((e) => matches(e, trimmed)) }))
      .filter(({ items }) => items.length > 0);
  }, [trimmed, isSearching]);

  const totalMatches = useMemo(() => results.reduce((sum, g) => sum + g.items.length, 0), [results]);

  // Auto-expand categories that match a new query, without permanently locking the
  // accordion open - a coach can still manually collapse a result group afterwards.
  useEffect(() => {
    if (!isSearching) return;
    setOpenMap((prev) => {
      const next = { ...prev };
      for (const { category } of results) next[category.code] = true;
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trimmed]);

  useEffect(() => {
    if (!exerciseTarget) return;
    const target = exerciseByCode[exerciseTarget];
    if (!target) {
      clearExerciseTarget();
      return;
    }
    setQuery('');
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

      <div className="sticky top-0 z-10 mb-4 rounded-2xl border border-line bg-paper p-3 shadow-sm">
        <div className="relative">
          <Search size={16} strokeWidth={2.5} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Übung, Code oder Stichwort suchen…"
            className="w-full rounded-xl border border-line bg-soft py-2.5 pl-9 pr-16 text-[14px] text-ink placeholder-muted outline-none transition-colors focus:border-green focus:bg-white"
          />
          <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1.5">
            {isSearching && (
              <span className="rounded-full bg-soft px-2 py-0.5 font-mono text-[11px] font-bold text-muted">
                {totalMatches}
              </span>
            )}
            {isSearching && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Suche zurücksetzen"
                className="rounded-full p-1 text-muted transition-colors hover:bg-line/60 hover:text-ink"
              >
                <X size={15} strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>

        <div className="mt-2.5 flex gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {QUICK_FILTERS.map((tag) => {
            const active = trimmed.toLowerCase() === tag.toLowerCase();
            return (
              <button
                key={tag}
                type="button"
                onClick={() => setQuery(active ? '' : tag)}
                className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-[12px] font-bold transition-colors ${
                  active ? 'bg-green-d text-white' : 'bg-soft text-muted hover:bg-line/60 hover:text-ink'
                }`}
              >
                #{tag}
              </button>
            );
          })}
        </div>
      </div>

      {isSearching && totalMatches === 0 && (
        <div className="rounded-xl border border-dashed border-line p-8 text-center">
          <p className="mb-3 text-[14px] font-bold text-ink">Keine Übungen für „{trimmed}“ gefunden.</p>
          <button
            type="button"
            onClick={() => setQuery('')}
            className="rounded-full bg-green-d px-4 py-2 text-[13px] font-bold text-white transition-colors hover:bg-green"
          >
            Suche zurücksetzen
          </button>
        </div>
      )}

      <AnimatePresence initial={false}>
        {results.map(({ category, items }) => (
          <motion.div
            key={category.code}
            layout
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="card mb-4 overflow-hidden">
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
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
