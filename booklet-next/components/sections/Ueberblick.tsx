'use client';

import { useEffect, useRef, useState } from 'react';
import { phases, phaseColors } from '@/lib/data/phases';
import { phasePool } from '@/lib/data/phasePool';
import { slots } from '@/lib/data/slots';
import { useAppContext } from '@/lib/AppContext';

export default function Ueberblick() {
  const { phaseTarget, clearPhaseTarget, requestExercise } = useAppContext();
  const [highlighted, setHighlighted] = useState<number | null>(null);
  const rowRefs = useRef<Record<number, HTMLTableRowElement | null>>({});

  useEffect(() => {
    if (phaseTarget == null) return;
    const row = rowRefs.current[phaseTarget];
    row?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setHighlighted(phaseTarget);
    clearPhaseTarget();
    const t = setTimeout(() => setHighlighted(null), 1800);
    return () => clearTimeout(t);
  }, [phaseTarget, clearPhaseTarget]);

  return (
    <div>
      <h2 className="mb-1 text-[30px] font-extrabold tracking-tight">Saison-Überblick</h2>
      <p className="lead mb-4">
        Fünf Phasen über die Saison 2026/27. Phase&nbsp;1 ist im Muster komplett ausgearbeitet, die übrigen Phasen
        sind als Rahmen skizziert und folgen nach deiner Freigabe.
      </p>
      <div className="overflow-x-auto rounded-2xl border border-line bg-paper">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="bg-green-d px-3.5 py-3 text-left text-[13px] font-bold uppercase tracking-wide text-white">Phase</th>
              <th className="bg-green-d px-3.5 py-3 text-left text-[13px] font-bold uppercase tracking-wide text-white">Zeitraum</th>
              <th className="bg-green-d px-3.5 py-3 text-left text-[13px] font-bold uppercase tracking-wide text-white">Schwerpunkt</th>
              <th className="bg-green-d px-3.5 py-3 text-left text-[13px] font-bold uppercase tracking-wide text-white">Übungs-Pool</th>
            </tr>
          </thead>
          <tbody>
            {phases.map((p) => (
              <tr
                key={p.id}
                ref={(el) => {
                  rowRefs.current[p.id] = el;
                }}
                className="border-t border-line transition-colors duration-700"
                style={{ background: highlighted === p.id ? '#fff4cf' : 'transparent' }}
              >
                <td className="px-3.5 py-3.5 align-top">
                  <span
                    style={{ background: phaseColors[p.id] }}
                    className="inline-flex h-6 w-6 items-center justify-center rounded-md font-mono text-[15px] font-extrabold text-white"
                  >
                    {p.id}
                  </span>
                  <b className="mt-1 block">{p.name}</b>
                </td>
                <td className="px-3.5 py-3.5 align-top text-sm">{p.zeitraum}</td>
                <td className="px-3.5 py-3.5 align-top text-sm">{p.schwerpunkt}</td>
                <td className="px-3.5 py-3.5 align-top">
                  <div className="flex min-w-[220px] flex-col gap-1.5">
                    {slots.map((slot) => {
                      const codes = phasePool[p.id]?.[slot.number] ?? [];
                      if (codes.length === 0) return null;
                      return (
                        <div key={slot.number} className="flex flex-wrap items-center gap-1.5">
                          <span
                            style={{ background: slot.color }}
                            className="shrink-0 rounded-md px-1.5 py-0.5 font-mono text-[10.5px] font-extrabold text-white"
                          >
                            S{slot.number}
                          </span>
                          {codes.map((code) => (
                            <button
                              key={code}
                              type="button"
                              onClick={() => requestExercise(code)}
                              className="ccode"
                            >
                              {code}
                            </button>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[12px] text-muted">
        Hinweis: Der Übungs-Pool je Phase ist ein Planungsentwurf und kein festgeschriebener Trainingsplan – Codes
        antippen springt in den Katalog.
      </p>
    </div>
  );
}
