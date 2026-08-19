'use client';

import {
  LayoutGrid,
  GitBranch,
  CalendarDays,
  Search,
  Tent,
  BookOpen,
  Info,
  type LucideIcon,
} from 'lucide-react';
import { TABS, useAppContext, type TabId } from '@/lib/AppContext';
import { phases } from '@/lib/data/phases';

const ICONS: Record<TabId, LucideIcon> = {
  ueberblick: LayoutGrid,
  faden: GitBranch,
  wochen: CalendarDays,
  finder: Search,
  camp: Tent,
  katalog: BookOpen,
  legende: Info,
};

export default function TabNav() {
  const { activeTab, setActiveTab, requestPhase } = useAppContext();

  return (
    <nav className="sticky top-0 z-30 border-b border-line/70 bg-white/70 shadow-[0_1px_0_rgba(255,255,255,.6)_inset,0_4px_16px_rgba(10,25,41,.05)] backdrop-blur-xl backdrop-saturate-150 max-[600px]:fixed max-[600px]:bottom-0 max-[600px]:top-auto max-[600px]:border-b-0 max-[600px]:border-t">
      <div className="mx-auto flex max-w-[1080px] items-center gap-2.5 px-4 py-2">
        <button
          type="button"
          onClick={() => setActiveTab('ueberblick')}
          aria-label="Zum Überblick"
          className="hidden shrink-0 min-[600px]:block"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/misc/logo.png"
            alt="SGA"
            width={28}
            height={28}
            className="rounded-full ring-2 ring-green"
          />
        </button>

        <div className="flex min-w-0 flex-1 gap-0.5 overflow-x-auto [mask-image:linear-gradient(90deg,#000_92%,transparent)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TABS.map((tab) => {
            const Icon = ICONS[tab.id];
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 text-[12.5px] font-bold uppercase tracking-wide transition-colors ${
                  isActive ? 'bg-green-d text-white' : 'text-ink hover:bg-soft hover:text-green'
                }`}
              >
                <Icon size={14} strokeWidth={2.5} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <label className="hidden shrink-0 items-center gap-1.5 text-xs font-bold text-muted min-[600px]:flex">
          Phase
          <select
            aria-label="Zu Saisonphase springen"
            className="cursor-pointer rounded-full border border-line bg-soft px-2.5 py-1.5 font-ui text-[12.5px] font-bold text-ink"
            value=""
            onChange={(e) => {
              if (e.target.value) requestPhase(Number(e.target.value));
              e.target.value = '';
            }}
          >
            <option value="">–</option>
            {phases.map((p) => (
              <option key={p.id} value={p.id}>
                {p.id} · {p.name}
              </option>
            ))}
          </select>
        </label>
      </div>
    </nav>
  );
}
