# Rezeptbuch

Eine Handy-Webapp für einfache Rezepte mit Katze Ginger.

- Fragt am Anfang Ernährungsform, Allergien, Kalorienziel, Lieblings- und No-go-Lebensmittel sowie die Kochzeit pro Mahlzeit ab.
- Schlägt für Frühstück, Mittag- und Abendessen passende Rezepte vor (alle unter 30 Minuten, ohne ausgefallene Zutaten).
- Ist für eine Mahlzeit wenig Zeit, schlägt Ginger Vorbereitung vor: Overnight Oats am Vorabend oder abends doppelt kochen.
- Kochschritte lassen sich abhaken. Jedes gekochte Rezept gibt einen Stempel und XP, ab 10 Stempeln bekommt Ginger eine Kochmütze.
- Einkauf scannen: Barcode mit der Handykamera scannen oder eintippen. Die Produktdaten kommen von Open Food Facts. Eingekaufte Lebensmittel rutschen in den Vorschlägen nach oben, was dreimal gekauft wurde, zählt als Lieblingsessen.
- Eigene Rezepte eintragen: Ginger schätzt die Kalorien pro Portion, vergleicht sie mit dem Rahmen für die Mahlzeit und macht Vorschläge (Mengen anpassen, Tauschideen wie Milch statt Sahne).

Alle Daten bleiben im Browser auf dem Handy (localStorage), es gibt keine Anmeldung und keinen Server.
Die Kalorienangaben der Rezepte sind grobe Schätzwerte. Ein Kalorientracker soll später angebunden werden.

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
- `vendor/html5-qrcode.min.js`: Barcode-Scanner (html5-qrcode 2.3.8, Apache-2.0)
- `nutrition.js`: Kalorien-Durchschnittswerte für eigene Rezepte
- `sw.js`, `manifest.webmanifest`, `icon*`: Installation und Offline-Nutzung
