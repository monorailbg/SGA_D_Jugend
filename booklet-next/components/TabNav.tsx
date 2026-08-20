'use client';

import { useEffect, useRef, useState } from 'react';
import {
  LayoutGrid,
  GitBranch,
  CalendarDays,
  Search,
  Tent,
  BookOpen,
  Info,
  SlidersHorizontal,
  type LucideIcon,
} from 'lucide-react';
import { TABS, useAppContext, type TabId } from '@/lib/AppContext';
import PhaseDropdown from './PhaseDropdown';

const ICONS: Record<TabId, LucideIcon> = {
  ueberblick: LayoutGrid,
  faden: GitBranch,
  wochen: CalendarDays,
  builder: SlidersHorizontal,
  finder: Search,
  camp: Tent,
  katalog: BookOpen,
  legende: Info,
};

export default function TabNav() {
  const { activeTab, setActiveTab } = useAppContext();
  const scrollRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    function update() {
      if (!el) return;
      setShowLeftFade(el.scrollLeft > 4);
      setShowRightFade(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    }

    update();
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  // Fixed on mobile, so scrollable content below needs padding matching its real
  // rendered height (icons/labels can wrap font metrics differently per device,
  // and it carries a safe-area inset on notched phones) - never a guessed constant.
  useEffect(() => {
    const el = navRef.current;
    if (!el) return;

    function update() {
      if (!el) return;
      document.documentElement.style.setProperty('--nav-height', `${el.getBoundingClientRect().height}px`);
    }

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    window.addEventListener('resize', update);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <nav
      ref={navRef}
      className="sticky top-0 z-30 border-b border-line/70 bg-white/70 shadow-[0_1px_0_rgba(255,255,255,.6)_inset,0_4px_16px_rgba(10,25,41,.05)] backdrop-blur-xl backdrop-saturate-150 max-[600px]:fixed max-[600px]:inset-x-0 max-[600px]:bottom-0 max-[600px]:top-auto max-[600px]:w-full max-[600px]:border-b-0 max-[600px]:border-t max-[600px]:pb-[env(safe-area-inset-bottom)]"
    >
      <div className="mx-auto flex max-w-[1080px] items-center gap-2.5 px-4 py-2">
        <button
          type="button"
          onClick={() => setActiveTab('ueberblick')}
          aria-label="Zum Überblick"
          className="hidden shrink-0 min-[600px]:block"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/misc/sga_logo.svg"
            alt="SGA"
            width={28}
            height={28}
            className="rounded-full ring-2 ring-green"
          />
        </button>

        <div className="relative min-w-0 flex-1">
          <div
            ref={scrollRef}
            className="flex gap-0.5 overflow-x-auto pr-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {TABS.map((tab) => {
              const Icon = ICONS[tab.id];
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-2 text-[12.5px] font-bold uppercase tracking-wide transition-colors ${
                    isActive ? 'bg-green-d text-white' : 'text-ink hover:bg-soft hover:text-green'
                  }`}
                >
                  <Icon size={14} strokeWidth={2.5} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Scroll-position fades: left only appears once actually scrolled (so it never
              masks the first tab at rest), right always covers trailing padding, not text. */}
          <div
            aria-hidden
            className={`pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white via-white/70 to-transparent transition-opacity duration-150 ${
              showLeftFade ? 'opacity-100' : 'opacity-0'
            }`}
          />
          <div
            aria-hidden
            className={`pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white via-white/70 to-transparent transition-opacity duration-150 ${
              showRightFade ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </div>

        <PhaseDropdown />
      </div>
    </nav>
  );
}
