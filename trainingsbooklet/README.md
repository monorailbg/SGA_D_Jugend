# Trainingsbooklet D-Jugend – SGA (Astro / TypeScript / CSS)

Diese Version des Trainingsbooklets ersetzt das ursprüngliche selbstenthaltene
HTML-Dokument (eine Datei, ~3 MB, Inhalte per Copy/Paste im Markup) durch ein
Astro-Projekt: Übungen, Wochenpläne, Phasen usw. leben als typisierte Daten
und werden über wiederverwendbare Komponenten gerendert. Bilder liegen als
echte Dateien unter `public/images/` statt als Base64 im HTML.

## Sprachen

- **TypeScript** – Datenmodell (`src/data/*.ts`), Passwort-Gate-Logik (`src/scripts/`)
- **Astro** (`.astro`, HTML + TS) – Komponenten und Seiten (`src/components/`, `src/pages/`)
- **CSS** – unverändert aus dem Original übernommenes Stylesheet (`src/styles/`)

## Struktur

```
src/
  data/            Typisierte Inhalte: Übungen, Wochenplan, Phasen, Slots, Kategorien
  components/       Astro-Komponenten je Sektion (Übungsfinder, Katalog, Wochenplan, …)
  layouts/          Seiten-Grundgerüst inkl. Passwort-Gate, Header, Nav, Footer
  scripts/          Client-seitiges TypeScript (SHA-256 Passwort-Check)
  styles/           CSS, 1:1 aus dem Original übernommen
public/images/      Übungsfotos (jpg/png) und generierte Feld-Skizzen (svg)
```

## Übung hinzufügen/ändern

Übungen kommen aus `src/data/exercises.generated.json` (per Extraktions-Skript
aus dem alten HTML erzeugt) und werden in `src/data/exercises.ts` typisiert.
Für neue Übungen: JSON-Eintrag ergänzen (oder Datenstruktur direkt in
`exercises.ts` erweitern) – Code, Titel, Tags (`Slot N · ...`, `X · Kategorie`),
Bildpfad und die Inhaltsblöcke (Ziel, Material, Aufbau, Ablauf, Varianten,
Coaching-Punkte, Plan B). Die Slot-Regeln (z. B. S-01 nur Slot 2) stehen in
`src/data/slots.ts`.

## Entwicklung

```bash
npm install
npm run dev       # lokaler Dev-Server
npm run build     # statischer Build nach dist/
npm run check     # TypeScript/Astro-Typprüfung
```

## Passwortschutz

Funktioniert wie im Original: SHA-256-Hash im Client, `sessionStorage`-Flag,
kein Server nötig (`src/scripts/password-gate.ts`).

## Deployment

`astro.config.mjs` ist auf `base: '/Trainingsbooklet-SGA-D'` gesetzt (GitHub
Pages Projektseite). `npm run build` erzeugt ein deploybares `dist/`-Verzeichnis.
