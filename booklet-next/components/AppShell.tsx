'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AppContext, TABS, type TabId } from '@/lib/AppContext';
import type { SlotNumber } from '@/lib/data/types';
import PasswordGate from './PasswordGate';
import HeaderBanner from './HeaderBanner';
import TabNav from './TabNav';
import Ueberblick from './sections/Ueberblick';
import RoterFaden from './sections/RoterFaden';
import Wochenplan from './sections/Wochenplan';
import SessionBuilder from './sections/SessionBuilder';
import Finder from './sections/Finder';
import Camp from './sections/Camp';
import Katalog from './sections/Katalog';
import Legende from './sections/Legende';

const SECTIONS: Record<TabId, React.ComponentType> = {
  ueberblick: Ueberblick,
  faden: RoterFaden,
  wochen: Wochenplan,
  builder: SessionBuilder,
  finder: Finder,
  camp: Camp,
  katalog: Katalog,
  legende: Legende,
};

export default function AppShell() {
  const [unlocked, setUnlocked] = useState(false);
  const [activeTab, setActiveTabState] = useState<TabId>('ueberblick');
  const [exerciseTarget, setExerciseTarget] = useState<string | null>(null);
  const [phaseTarget, setPhaseTarget] = useState<number | null>(null);
  const [hiddenSlots, setHiddenSlots] = useState<Set<SlotNumber>>(new Set());
  const contentRef = useRef<HTMLDivElement>(null);

  const toggleSlotVisibility = useCallback((slot: SlotNumber) => {
    setHiddenSlots((prev) => {
      const next = new Set(prev);
      if (next.has(slot)) next.delete(slot);
      else next.add(slot);
      return next;
    });
  }, []);

  const setActiveTab = useCallback((tab: TabId) => {
    setActiveTabState(tab);
    contentRef.current?.scrollTo({ top: 0 });
  }, []);

  const requestExercise = useCallback(
    (code: string) => {
      setActiveTab('katalog');
      setExerciseTarget(code);
    },
    [setActiveTab]
  );

  const requestPhase = useCallback(
    (id: number) => {
      setActiveTab('ueberblick');
      setPhaseTarget(id);
    },
    [setActiveTab]
  );

  // Intercept exercise-code links embedded in raw HTML content (Trainingslager, Legende)
  // so they switch tabs instead of doing a same-page anchor jump.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      const link = target.closest<HTMLAnchorElement>('a[href^="#ex-"]');
      if (!link) return;
      e.preventDefault();
      requestExercise(link.getAttribute('href')!.slice(4));
    }
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [requestExercise]);

  const ActiveSection = SECTIONS[activeTab];
  const activeLabel = TABS.find((t) => t.id === activeTab)?.label ?? '';

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        exerciseTarget,
        requestExercise,
        clearExerciseTarget: () => setExerciseTarget(null),
        phaseTarget,
        requestPhase,
        clearPhaseTarget: () => setPhaseTarget(null),
        hiddenSlots,
        toggleSlotVisibility,
      }}
    >
      {!unlocked && <PasswordGate onUnlock={() => setUnlocked(true)} />}
      {unlocked && (
        <div className="flex h-[100dvh] flex-col overflow-hidden">
          <HeaderBanner activeLabel={activeLabel} />

          <TabNav />

          <main
            ref={contentRef}
            className="flex-1 overflow-y-auto max-[600px]:pb-[var(--nav-height,4rem)] min-[600px]:pb-0"
          >
            <div className="mx-auto max-w-[1080px] px-4 py-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                >
                  <ActiveSection />
                </motion.div>
              </AnimatePresence>
            </div>
          </main>
        </div>
      )}
    </AppContext.Provider>
  );
}
