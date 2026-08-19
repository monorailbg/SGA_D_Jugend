'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, CalendarRange } from 'lucide-react';
import { phases, phaseColors } from '@/lib/data/phases';
import { useAppContext } from '@/lib/AppContext';

export default function PhaseDropdown() {
  const { requestPhase } = useAppContext();
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, phases.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter' && activeIndex >= 0) {
        e.preventDefault();
        select(phases[activeIndex].id);
      }
    }
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, activeIndex]);

  function select(id: number) {
    requestPhase(id);
    setOpen(false);
    buttonRef.current?.focus();
  }

  return (
    <div ref={rootRef} className="relative hidden shrink-0 min-[600px]:block">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          setActiveIndex(-1);
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-ui text-[12.5px] font-bold transition-colors ${
          open
            ? 'border-green bg-green-d text-white'
            : 'border-line bg-soft text-ink hover:border-green hover:text-green'
        }`}
      >
        <CalendarRange size={14} strokeWidth={2.5} />
        Phase
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="flex">
          <ChevronDown size={13} strokeWidth={2.5} />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-[calc(100%+8px)] z-40 w-72 overflow-hidden rounded-2xl border border-line/70 bg-white/90 p-1.5 shadow-[0_16px_40px_rgba(10,25,41,.18)] backdrop-blur-xl"
          >
            {phases.map((p, i) => (
              <button
                key={p.id}
                role="option"
                aria-selected={activeIndex === i}
                onClick={() => select(p.id)}
                onMouseEnter={() => setActiveIndex(i)}
                className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors ${
                  activeIndex === i ? 'bg-soft' : 'bg-transparent'
                }`}
              >
                <span
                  style={{ background: phaseColors[p.id] }}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-mono text-[13px] font-extrabold text-white"
                >
                  {p.id}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-ui text-[13.5px] font-bold text-ink">{p.name}</span>
                  <span className="block truncate text-[11.5px] text-muted">{p.zeitraum}</span>
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
