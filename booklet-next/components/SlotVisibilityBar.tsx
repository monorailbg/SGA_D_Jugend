'use client';

import { Eye, EyeOff } from 'lucide-react';
import { slots } from '@/lib/data/slots';
import { useAppContext } from '@/lib/AppContext';

export default function SlotVisibilityBar() {
  const { hiddenSlots, toggleSlotVisibility } = useAppContext();

  return (
    <div className="mb-4 flex flex-wrap items-center gap-1.5 rounded-xl border border-line bg-paper p-2.5">
      <span className="mr-1 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-muted">
        <Eye size={13} strokeWidth={2.5} />
        Slots
      </span>
      {slots.map((slot) => {
        const visible = !hiddenSlots.has(slot.number);
        return (
          <button
            key={slot.number}
            type="button"
            onClick={() => toggleSlotVisibility(slot.number)}
            aria-pressed={visible}
            style={visible ? { background: slot.color } : undefined}
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-bold transition-colors ${
              visible ? 'text-white' : 'bg-soft text-muted line-through decoration-2'
            }`}
          >
            {visible ? <Eye size={12} strokeWidth={2.5} /> : <EyeOff size={12} strokeWidth={2.5} />}
            Slot {slot.number}
          </button>
        );
      })}
    </div>
  );
}
