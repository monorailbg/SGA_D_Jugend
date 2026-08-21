'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Upload, Plus } from 'lucide-react';
import { categories } from '@/lib/data/categories';
import { slots } from '@/lib/data/slots';
import type { CategoryCode, Exercise, SlotNumber } from '@/lib/data/types';
import { addCustomExercise, uploadDrillImage, useAllExercises } from '@/lib/customExercises';
import { supabaseEnabled } from '@/lib/supabaseClient';

const BLOCK_FIELDS: { key: string; label: string; placeholder: string; required?: boolean }[] = [
  { key: 'Ziel', label: 'Ziel', placeholder: 'Was soll die Übung trainieren?', required: true },
  { key: 'Aufbau', label: 'Aufbau', placeholder: 'Feldgröße, Tore, Hütchen, Startaufstellung …', required: true },
  { key: 'Material', label: 'Material', placeholder: 'Bälle, Hütchen, Leibchen, Tore …' },
  { key: 'Ablauf', label: 'Ablauf', placeholder: 'Wie läuft die Übung Schritt für Schritt ab?', required: true },
  { key: 'Varianten', label: 'Varianten', placeholder: 'Steigerungen oder Vereinfachungen' },
  { key: 'Coaching-Punkte', label: 'Coaching-Punkte', placeholder: 'Worauf als Trainer achten?' },
];

// Downscale + re-encode so a phone photo doesn't blow past localStorage's ~5MB quota.
function compressImage(file: File, maxWidth = 900, quality = 0.75): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('no canvas context'));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export default function CreateExerciseModal({ onClose }: { onClose: () => void }) {
  const allExercises = useAllExercises();
  const existingCodes = useMemo(() => new Set(allExercises.map((e) => e.code)), [allExercises]);

  const [category, setCategory] = useState<CategoryCode>('K');
  const [code, setCode] = useState(() => nextCode('K', allExercises));
  const [title, setTitle] = useState('');
  const [slotNumber, setSlotNumber] = useState<SlotNumber>(1);
  const [image, setImage] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [blocks, setBlocks] = useState<Record<string, string>>({});
  const [planB, setPlanB] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  function nextCode(cat: CategoryCode, all: Exercise[]): string {
    const nums = all
      .map((e) => e.code.match(new RegExp(`^${cat}-(\\d+)$`)))
      .filter((m): m is RegExpMatchArray => !!m)
      .map((m) => Number(m[1]));
    const next = (nums.length ? Math.max(...nums) : 0) + 1;
    return `${cat}-${String(next).padStart(2, '0')}`;
  }

  function handleCategoryChange(cat: CategoryCode) {
    setCategory(cat);
    setCode(nextCode(cat, allExercises));
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageError(null);
    try {
      const dataUrl = await compressImage(file);
      setImage(dataUrl);
    } catch {
      setImageError('Bild konnte nicht geladen werden.');
    }
  }

  async function handleSave() {
    setError(null);
    if (!title.trim()) return setError('Titel fehlt.');
    if (!code.trim()) return setError('Code fehlt.');
    if (!BLOCK_FIELDS.filter((f) => f.required).every((f) => (blocks[f.key] ?? '').trim())) {
      return setError('Ziel, Aufbau und Ablauf sind Pflichtfelder.');
    }
    if (existingCodes.has(code.trim())) {
      return setError(`Code „${code.trim()}“ ist schon vergeben – bitte einen anderen wählen.`);
    }

    const finalBlocks: Record<string, string> = {};
    for (const f of BLOCK_FIELDS) {
      if (blocks[f.key]?.trim()) finalBlocks[f.key] = blocks[f.key].trim();
    }
    if (planB.trim()) finalBlocks['Plan B'] = planB.trim();

    setSaving(true);
    try {
      const hostedImage = image ? await uploadDrillImage(image, code.trim()) : null;
      await addCustomExercise({
        code: code.trim(),
        title: title.trim(),
        category,
        slot: slotNumber,
        image: hostedImage,
        blocks: finalBlocks,
      });
      setSaved(true);
      setTimeout(onClose, 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Speichern fehlgeschlagen. Bitte erneut versuchen.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
          className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl border border-line bg-paper p-5 shadow-2xl sm:rounded-2xl sm:p-6"
        >
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h3 className="text-[20px] font-extrabold text-ink">Eigene Übung erstellen</h3>
              <p className="text-[13px] text-muted">
                {supabaseEnabled
                  ? 'Wird für alle Trainer sichtbar gespeichert und erscheint sofort im Katalog.'
                  : 'Wird lokal in diesem Browser gespeichert und erscheint sofort im Katalog.'}
              </p>
            </div>
            <button type="button" onClick={onClose} aria-label="Schließen" className="rounded-full p-1.5 text-muted hover:bg-soft hover:text-ink">
              <X size={18} strokeWidth={2.5} />
            </button>
          </div>

          {saved ? (
            <div className="rounded-xl border border-[#1f9d57]/30 bg-[#1f9d57]/10 p-6 text-center text-[14px] font-bold text-[#1f9d57]">
              „{title}“ gespeichert{supabaseEnabled ? ' – für alle Trainer sichtbar!' : '!'}
            </div>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Titel *">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="z. B. Doppelpass-Karussell"
                    className="input"
                  />
                </Field>

                <Field label="Code *">
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="input font-mono"
                  />
                </Field>

                <Field label="Kategorie *">
                  <select
                    value={category}
                    onChange={(e) => handleCategoryChange(e.target.value as CategoryCode)}
                    className="input"
                  >
                    {categories.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code} · {c.name}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Slot *">
                  <select
                    value={slotNumber}
                    onChange={(e) => setSlotNumber(Number(e.target.value) as SlotNumber)}
                    className="input"
                  >
                    {slots.map((s) => (
                      <option key={s.number} value={s.number}>
                        Slot {s.number} · {s.name}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="mt-3">
                <Field label="Bild (optional)">
                  <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-line bg-soft px-3 py-3 text-[13px] text-muted transition-colors hover:border-green hover:text-green">
                    <Upload size={16} strokeWidth={2.5} />
                    Bild oder Feldskizze auswählen
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                  {imageError && <p className="mt-1 text-[12px] text-[#d23b3b]">{imageError}</p>}
                  {image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={image} alt="Vorschau" className="mt-2 h-32 w-full rounded-lg object-cover" />
                  )}
                </Field>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {BLOCK_FIELDS.map((f) => (
                  <Field key={f.key} label={f.required ? `${f.label} *` : f.label}>
                    <textarea
                      value={blocks[f.key] ?? ''}
                      onChange={(e) => setBlocks((prev) => ({ ...prev, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      rows={3}
                      className="input resize-y"
                    />
                  </Field>
                ))}
                <Field label="Plan B (Wetter / wenig Spieler)">
                  <textarea
                    value={planB}
                    onChange={(e) => setPlanB(e.target.value)}
                    placeholder="z. B. Bei Regen: kleineres Feld, weniger Gruppen"
                    rows={3}
                    className="input resize-y"
                  />
                </Field>
              </div>

              {error && <p className="mt-3 text-[13px] font-bold text-[#d23b3b]">{error}</p>}

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-green-d py-3 font-ui text-[14px] font-extrabold text-white transition-transform hover:bg-green active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Wird gespeichert…
                  </>
                ) : (
                  <>
                    <Plus size={17} strokeWidth={2.5} />
                    Übung speichern
                  </>
                )}
              </button>
            </>
          )}
        </motion.div>
      </motion.div>

      <style jsx global>{`
        .input {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid var(--line);
          background: #fff;
          padding: 0.5rem 0.65rem;
          font-size: 13px;
          color: var(--ink);
          outline: none;
        }
        .input:focus {
          border-color: var(--green);
        }
      `}</style>
    </AnimatePresence>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-muted">{label}</span>
      {children}
    </label>
  );
}
