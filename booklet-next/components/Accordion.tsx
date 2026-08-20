'use client';

import { useId, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface AccordionProps {
  title: string;
  subtitle?: string;
  badge?: string;
  accent?: string;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}

export default function Accordion({
  title,
  subtitle,
  badge,
  accent = '#1565C0',
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
  children,
}: AccordionProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const panelId = useId();

  function toggle() {
    const next = !open;
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  }

  return (
    <div>
      <h3 className="m-0">
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-controls={panelId}
          style={{ borderLeftColor: accent }}
          className="flex w-full items-center gap-3 rounded-t-2xl border-l-[6px] bg-transparent px-[18px] py-4 text-left transition-colors hover:bg-soft"
        >
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="font-ui text-[16px] font-extrabold text-ink">{title}</span>
            {subtitle && (
              <span className="line-clamp-2 min-h-[2.6em] text-[13px] italic leading-[1.3] text-muted">
                {subtitle}
              </span>
            )}
          </span>
          {badge && (
            <span
              style={{ background: accent }}
              className="shrink-0 rounded-full px-2.5 py-0.5 font-mono text-xs font-bold text-white"
            >
              {badge}
            </span>
          )}
          <motion.span
            animate={{ rotate: open ? 180 : 0, color: open ? accent : '#546e7a' }}
            transition={{ duration: 0.25 }}
            className="shrink-0"
          >
            <ChevronDown size={18} strokeWidth={2.5} />
          </motion.span>
        </button>
      </h3>
      <motion.div
        id={panelId}
        initial={false}
        animate={{ height: open ? 'auto' : 0 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        style={{ overflow: 'hidden' }}
      >
        {children}
      </motion.div>
    </div>
  );
}
