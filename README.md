# Rezeptbuch

Eine Handy-Webapp für einfache Rezepte mit Katze Ginger.

Das Rezeptbuch kümmert sich ums Kochen. Alles rund ums Mitzählen macht der eingebaute Kalorien-Tracker von ST0PTV (`tracker/`): Journal, Analytics mit Monatskalender, Kalorien- und Makroziele, Ernährungsform und Allergien, Gewicht, Barcode-Scanner. Das Rezeptbuch liest diese Einstellungen von dort und hat keine eigenen Kopien davon.

- Fragt am Anfang Lieblings- und No-go-Lebensmittel sowie die Kochzeit pro Mahlzeit ab. Ernährungsform, Allergien und Kalorienziel stellt man im Tracker ein (Knöpfe führen direkt dorthin).
- Schlägt für Frühstück, Mittag- und Abendessen passende Rezepte vor (alle unter 30 Minuten, ohne ausgefallene Zutaten), passend zum Kalorienziel und den Makrozielen aus dem Tracker.
- Ist für eine Mahlzeit wenig Zeit, schlägt Ginger Vorbereitung vor: Overnight Oats am Vorabend oder abends doppelt kochen.
- Kochschritte lassen sich abhaken. „Fertig gekocht“ trägt eine Portion ins Tracker-Journal ein und gibt einen Stempel und XP, ab 10 Stempeln bekommt Ginger eine Kochmütze.
- „Heute“ zeigt, was im Tracker-Journal steht (Kalorien und Einträge pro Mahlzeit) und daneben Gingers Vorschläge.
- Nährwerte pro Rezept: Eiweiß, Kohlenhydrate, Zucker, freier Zucker, Fett und Ballaststoffe aus dem Bundeslebensmittelschlüssel (dieselbe Datei wie im Tracker), gemessen an den Tageszielen im Tracker.
- Portionen: In jedem Rezept lässt sich die Portionenzahl ändern, die Zutatenmengen passen sich an.
- Einkauf: Gescannt wird im Tracker („Einkauf scannen“ springt hin). Vorgemerkte Lebensmittel rutschen in den Vorschlägen nach oben, gelten auf der Einkaufsliste als vorhanden und lassen sich als Snack vorschlagen.
- Vorschläge ablehnen: „Mag ich nicht“ blendet ein Rezept aus oder merkt sich eine Zutat als No-go. Unter „Ich“ lassen sich abgelehnte Rezepte zurückholen.
- Wochenplan: Ginger plant die nächsten 7 Tage in einer Tabelle (Tage × Mahlzeiten). Jedes Gericht wird auf den Kalorienrahmen seines Platzes umgerechnet (0,6× bis 1,6× Menge), sodass jeder Tag höchstens 5 % vom Kalorienziel abweicht. Gerichte übernehmen, tauschen, Portionen einstellen. Aus den übernommenen Gerichten entsteht eine Einkaufsliste zum Abhaken und Kopieren.
- „Ich habe …“: Lebensmittel eingeben und passende Rezepte finden.
- 2 oder 3 Mahlzeiten: Wer nur zweimal am Tag isst, bekommt normale Portionen und dazu zwei kleine Snacks.
- Favoriten: kommen öfter in den Wochenplan und lassen sich auf einen Tag einplanen.
- Eigene Rezepte eintragen: Ginger rechnet die Kalorien pro Portion, vergleicht sie mit dem Rahmen für die Mahlzeit und macht Vorschläge.

Alle Daten bleiben im Browser auf dem Handy (localStorage), es gibt keine Anmeldung und keinen Server.

## Starten

Es gibt keinen Build-Schritt. Lokal reicht ein einfacher Webserver:

```sh
python3 -m http.server 8000
```

Dann `http://localhost:8000` öffnen. Auf dem Handy lässt sich die Seite über „Zum Home-Bildschirm“ wie eine App installieren.

## Dateien

- `index.html`, `styles.css`: Seite und Aussehen
- `app.js`: Ablauf, Vorschläge, Stempelheft
- `recipes.js`: Rezeptliste und Lebensmittel für die Geschmacksabfrage
- `nutrition.js`: Zutaten, Einheiten und ihre BLS-Codes; die Werte kommen aus `tracker/data/bls.json`
- `tracker/`: Kalorien-Tracker von ST0PTV (MIT-Lizenz, `tracker/LICENSE`), ins Rezeptbuch-Design gebracht. Speichert unter `ct.v1`; das Rezeptbuch liest dort Ziele, Ernährung, Journal und Einkauf und trägt Gekochtes ein
- `sw.js`, `manifest.webmanifest`, `icon*`: Installation und Offline-Nutzung

## Quellen und Lizenzen

In der App unter „Ich“ → „Quellen und Lizenzen“ (`#/quellen`) ausführlich aufgelistet. Kurz:

- Schrift Nunito (The Nunito Project Authors), über Google Fonts: SIL Open Font License 1.1
- Produktdaten von Open Food Facts: Datenbank ODbL 1.0, Einträge DbCL 1.0
- Kalorien- und Makroziele mit ihren Quellen: im Tracker
- Nährwerte: Max Rubner-Institut (2025), Bundeslebensmittelschlüssel (BLS) 4.0, DOI 10.25826/Data20251217-134202-0
- Kalorien-Tracker (`tracker/`): Copyright (c) 2026 ST0PTV, MIT-Lizenz; enthält ZXing (Apache-2.0, `tracker/vendor/ZXING-LICENSE`)
- Rezepte, Ginger, Icons und Design: für diese App selbst gemacht
- Für den eigenen Programmcode ist noch keine Lizenz festgelegt (damit gilt: alle Rechte vorbehalten)
