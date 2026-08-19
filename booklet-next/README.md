# Trainingsbooklet D-Jugend – Next.js

Successor to the Astro version in `../trainingsbooklet/` (kept in the repo for
reference, no longer deployed). This app is a strict tab-isolated single-page
application: selecting a nav tab renders **only** that section — the others
are unmounted, not just scrolled past.

## Stack

- **Next.js** (App Router) + TypeScript
- **Tailwind CSS** for styling
- **Framer Motion** for tab transitions and accordion open/close animations
- **Lucide React** for nav icons

## How the isolation works

`components/AppShell.tsx` owns `activeTab` state and renders exactly one
section component at a time, wrapped in `AnimatePresence mode="wait"` for a
fade/slide transition. Section components (`components/sections/*.tsx`) each
render their own scrollable content — there's no shared page scroll between
tabs.

Cross-references (an exercise code shown in the Wochenplan, Finder, or
Trainingslager tabs) don't do an in-page anchor jump anymore, since the
target section isn't mounted. Instead they call `requestExercise(code)` from
`lib/AppContext.tsx`, which switches to the Katalog tab, opens the exercise's
category accordion, then scrolls to and briefly highlights the card once it's
mounted. Raw-HTML content (Trainingslager, Legende — ported as static HTML
fragments with `dangerouslySetInnerHTML`) gets the same behavior via a
delegated click listener on `a[href^="#ex-"]` in `AppShell`.

## Data

`lib/data/*.generated.json` were extracted from the original HTML booklet and
are shared with the Astro version; `lib/data/*.ts` type and load them. Images
live in `public/images/`.

## Development

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
npm start
```

## Password

Same SHA-256 + `sessionStorage` gate as the Astro version — see
`components/PasswordGate.tsx`.
