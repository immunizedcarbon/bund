# Bundestag DIP Explorer

Dieses Projekt ist eine kleine Web-Oberfläche, um in den Dokumenten des Deutschen Bundestages zu suchen. Die Anwendung nutzt die öffentliche DIP-API und kann optional mit Gemini (Google AI) natürliche Sprachabfragen in Filter umwandeln.

## Voraussetzungen

* **Linux** (getestet unter Ubuntu)
* **Node.js ab Version 18**

## Schritt für Schritt

1. Repository klonen (falls noch nicht geschehen):
   ```bash
   git clone <REPO_URL>
   cd bund
   ```
2. Abhängigkeiten installieren:
   ```bash
   npm install
   ```
3. Entwicklungserver starten:
   ```bash
   npm run dev
   ```
   Danach erscheint eine lokale URL (z.B. `http://localhost:5173/`). Diese im Browser öffnen.

4. Beim ersten Start befindet sich bereits ein öffentlicher API‑Key für die Bundestags‑API in [`constants.tsx`](./constants.tsx), sodass keine weitere Konfiguration nötig ist.

5. Im Web‑Interface kann ein eigener Gemini‑API‑Key eingetragen werden. Einfach den Schlüssel im Feld "Gemini API Key" eingeben und **Enter** drücken oder auf **Speichern** klicken. Anschließend kann die intelligente Suche genutzt werden.

## Hinweise

* Für die Nutzung ohne Gemini kann das Feld leer bleiben. Die manuellen Filter funktionieren dann weiterhin.
* Zum Erstellen einer Produktionsversion kann `npm run build` verwendet werden (benötigt eine vollständige Node‑Installation).
