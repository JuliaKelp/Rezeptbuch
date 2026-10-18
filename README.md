# Rezeptbuch

Eine Handy-Webapp für einfache Rezepte mit Katze Ginger. Alle Daten bleiben im Browser (localStorage), es gibt keine Anmeldung und keinen Server.

## Starten

Kein Build-Schritt. Lokal reicht ein einfacher Webserver:

```sh
python3 -m http.server 8000
```

## Quellen und Lizenzen

Ausführlich in der App unter „Ich“ → „Quellen und Lizenzen“. Kurz:

- Kalorien-Tracker (`tracker/`): Copyright (c) 2026 ST0PTV, MIT-Lizenz (`tracker/LICENSE`); enthält ZXing (Apache-2.0, `tracker/vendor/ZXING-LICENSE`) und tesseract.js mit Tesseract OCR (Apache-2.0, `tracker/vendor/tesseract/`)
- Nährwerte: Max Rubner-Institut (2025), Bundeslebensmittelschlüssel (BLS) 4.0 – Deutsche Nährstoffdatenbank, CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/), DOI 10.25826/Data20251217-134202-0; verändert (Auszug, freier Zucker, Ernährungsform und Allergene abgeleitet)
- Produktdaten: Open Food Facts (ODbL 1.0 / DbCL 1.0)
- Schrift Nunito: SIL Open Font License 1.1
- Eigener Programmcode und Inhalte der App: MIT-Lizenz, Copyright (c) 2026 JuliaKelp (`LICENSE`)

Die MIT-Lizenz gilt nur für die eigenen Teile. Die oben genannten Fremdinhalte behalten ihre eigenen Lizenzen.
