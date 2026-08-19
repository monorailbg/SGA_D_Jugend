# Hosting-Anleitung: Trainingsbooklet auf GitHub Pages mit Passwortschutz

## Voraussetzungen
- Node.js installiert (https://nodejs.org – LTS-Version)
- Git für Windows / GitHub Desktop installiert
- GitHub-Account: sgechert

---

## Schritt 1: Repo auf GitHub veröffentlichen

1. GitHub Desktop öffnen
2. Repository `Trainingsbooklet-SGA-D` auswählen
3. Oben rechts „Publish repository" klicken
4. **„Keep this code private" NICHT ankreuzen** (muss public sein für kostenloses GitHub Pages)
5. „Publish Repository" bestätigen

---

## Schritt 2: Passwortschutz mit staticrypt einrichten

Git Bash öffnen (Rechtsklick auf den Repo-Ordner → „Open Git Bash here"):

```bash
# Ins Repo-Verzeichnis wechseln
cd "C:/software/Dropbox (Privat)/SGA/Trainingsinhalte/Trainingsbooklet-SGA-D"

# staticrypt einmalig installieren
npm install -g @staticrypt/staticrypt

# HTML-Datei mit Passwort verschlüsseln (DEIN-PASSWORT ersetzen)
staticrypt index.html --password DEIN-PASSWORT --short
```

→ Es wird eine neue `index.html` erstellt, die beim Öffnen zuerst ein Passwort-Formular zeigt.

**Passwort-Tipps:**
- Mindestens 12 Zeichen
- Mit Trainerkollegen und Eltern teilen (z.B. per WhatsApp-Gruppe)
- Nicht dasselbe wie dein GitHub-Passwort

---

## Schritt 3: Verschlüsselte Datei pushen

In GitHub Desktop:
1. Du siehst die geänderte `index.html` als „Changes"
2. Commit-Nachricht eingeben: z.B. „Passwortschutz aktiviert"
3. „Commit to main" → „Push origin"

---

## Schritt 4: GitHub Pages aktivieren

1. Auf github.com → Repository `sgechert/Trainingsbooklet-SGA-D`
2. „Settings" → linke Seitenleiste „Pages"
3. Source: „Deploy from a branch"
4. Branch: `main` / Ordner: `/ (root)`
5. „Save"

Nach ca. 1–2 Minuten ist das Booklet erreichbar unter:
**https://sgechert.github.io/Trainingsbooklet-SGA-D/**

---

## Booklet aktualisieren (wiederkehrender Ablauf)

Wenn Claude das Booklet ändert, läuft das so:

1. Claude aktualisiert `01_Booklet/Trainingsbooklet_D-Jugend_Muster_v2.html`
2. Claude kopiert die neue Version als `index.html` ins Repo
3. Du öffnest Git Bash im Repo-Ordner und verschlüsselst neu:
   ```bash
   staticrypt index.html --password DEIN-PASSWORT --short
   ```
4. In GitHub Desktop: Commit + Push
5. Fertig – nach 1 Minute ist die neue Version live

---

## Alternative: Netlify (privates Repo + einfacherer Passwortschutz)

Falls du das Repo lieber **privat** halten willst:

1. Kostenloses Konto auf netlify.com erstellen
2. „Add new site" → „Import an existing project" → GitHub-Repo verbinden
3. Site-Einstellungen → „Site protection" → Passwort setzen
4. Netlify kümmert sich automatisch um Updates bei jedem Push

URL wäre dann z.B.: `https://sga-d-jugend.netlify.app`

---

*Erstellt mit Claude Cowork · © 2026 SGA*
