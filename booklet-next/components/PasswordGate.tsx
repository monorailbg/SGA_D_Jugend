'use client';

import { useEffect, useRef, useState } from 'react';

const HASH = '459c4e435476a777263aeb379824d52abb3d44445e34af54a9603bc3dc7aab34';
const STORAGE_KEY = 'sga_auth';

async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export default function PasswordGate({ onUnlock }: { onUnlock: () => void }) {
  const [visible, setVisible] = useState(true);
  const [error, setError] = useState(false);
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY) === HASH) {
      setVisible(false);
      onUnlock();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function check() {
    const hash = await sha256Hex(value);
    if (hash === HASH) {
      sessionStorage.setItem(STORAGE_KEY, hash);
      setVisible(false);
      onUnlock();
    } else {
      setError(true);
      setValue('');
      inputRef.current?.focus();
    }
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-gradient-to-br from-[#0d47a1] to-[#1565C0]">
      <div className="w-[90%] max-w-[360px] rounded-2xl bg-white px-9 py-10 text-center shadow-2xl">
        <h2 className="mb-1 font-ui text-[22px] font-extrabold text-[#0d47a1]">SGA D-Jugend</h2>
        <p className="mb-5 text-sm text-[#546e7a]">Trainingsbooklet · Zugang nur für Trainer &amp; Eltern</p>
        <input
          ref={inputRef}
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && check()}
          placeholder="Passwort eingeben"
          autoComplete="current-password"
          className="w-full rounded-lg border-2 border-[#c8d8f0] px-3.5 py-3 text-base outline-none transition-colors focus:border-[#1565C0]"
        />
        <button
          type="button"
          onClick={check}
          className="mt-3 w-full rounded-lg bg-[#1565C0] py-3 text-base font-bold text-white transition-colors hover:bg-[#0d47a1]"
        >
          Einloggen
        </button>
        {error && <div className="mt-2.5 text-[13px] text-[#d23b3b]">Falsches Passwort – bitte erneut versuchen.</div>}
      </div>
    </div>
  );
}
