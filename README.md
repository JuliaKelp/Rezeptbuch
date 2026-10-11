# Rezeptbuch

Eine Handy-Webapp für einfache Rezepte mit Katze Ginger.

- Fragt am Anfang Ernährungsform, Allergien, Kalorienziel, Lieblings- und No-go-Lebensmittel sowie die Kochzeit pro Mahlzeit ab.
- Schlägt für Frühstück, Mittag- und Abendessen passende Rezepte vor (alle unter 30 Minuten, ohne ausgefallene Zutaten).
- Ist für eine Mahlzeit wenig Zeit, schlägt Ginger Vorbereitung vor: Overnight Oats am Vorabend oder abends doppelt kochen.
- Kochschritte lassen sich abhaken. Jedes gekochte Rezept gibt einen Stempel und XP, ab 10 Stempeln bekommt Ginger eine Kochmütze.
- Nährwerte: Für jedes Rezept und den Tag zeigt die App Eiweiß, Kohlenhydrate, Zucker, zugesetzten Zucker, Fruktose, Fett und Ballaststoffe. Die Tagesziele richten sich nach Geschlecht und Ziel (DGE- und WHO-Richtwerte). Alles sind Schätzungen aus Durchschnittswerten.
- Portionen: In jedem Rezept lässt sich die Portionenzahl ändern, die Zutatenmengen passen sich an.
- Einkauf scannen: Barcode mit der Handykamera scannen oder eintippen. Die Kamera nutzt Dauer-Autofokus und etwas Zoom, schaltet bei Dunkelheit das Licht ein (wo das Handy es erlaubt) und geht nach dem Scan aus. Die Produktdaten kommen von Open Food Facts. Eingekaufte Lebensmittel rutschen in den Vorschlägen nach oben, was dreimal gekauft wurde, zählt als Lieblingsessen.
- Vorschläge ablehnen: „Mag ich nicht“ blendet ein Rezept aus oder merkt sich eine Zutat als No-go. Unter „Ich“ lassen sich abgelehnte Rezepte zurückholen.
- Wochenplan: Ginger plant die nächsten 7 Tage in einer Tabelle (Tage × Mahlzeiten). Jedes Gericht wird auf den Kalorienrahmen seines Platzes umgerechnet (0,6× bis 1,6× Menge), sodass jeder Tag höchstens 5 % vom Kalorienziel abweicht. Die Tabelle zeigt die Tagessumme. Gerichte übernehmen, gegen andere tauschen oder zwischen Tagen tauschen, Portionen pro Gericht einstellen. Aus den übernommenen Gerichten entsteht eine Einkaufsliste zum Abhaken und Kopieren.
- Ampel je nach Ziel: Beim Abnehmen wird der Kalorienring rot, sobald das Ziel überschritten ist, sonst grün. Beim Zunehmen wird er grün, wenn das Ziel erreicht ist, und rot, wenn es nach dem Abendessen noch fehlt. Beim Halten zählt ±5 %.
- Monatskalender: zeigt für jeden Tag, ob das Ziel erreicht wurde, mit Details zu Kalorien und Makros pro Tag. Gemessen wird am Ziel, das an dem Tag galt.
- Makros: Eiweiß, Kohlenhydrate und Fett stehen bei jedem Rezept, unter dem Kalorienring, im Wochenplan pro Tag und auf der Einkaufsliste. Vorschläge und Wochenplan bevorzugen Gerichte, deren Eiweiß- und Fettanteil zum Ziel passt.
- Gewicht und Größe (freiwillig): Mit Gewicht rechnet die App Eiweiß in g pro kg nach den Studien unter „Quellen“ (1,4 / 1,2 / 1,6 g/kg je Ziel, mindestens 0,83 g/kg). Mit Größe zeigt sie den BMI, rechnet ab BMI 25 mit dem Gewicht bei BMI 25 und rät bei Untergewicht vom Abnehmen ab.
- Info-Knöpfe: Zu jeder abgefragten Angabe erklärt ein „i“, wofür Ginger sie braucht.
- „Ich habe …“: Lebensmittel eingeben und passende Rezepte finden.
- 2 oder 3 Mahlzeiten: Wer nur zweimal am Tag isst, bekommt normale Portionen und dazu zwei kleine Snacks statt größerer Mahlzeiten. Gescannte Snack-Produkte wie Riegel werden mit vorgeschlagen.
- Favoriten: kommen öfter in den Wochenplan und lassen sich auf einen Tag einplanen.
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

## Quellen und Lizenzen

In der App unter „Ich“ → „Quellen und Lizenzen“ (`#/quellen`) ausführlich aufgelistet. Kurz:

- html5-qrcode 2.3.8 (Minhaz/mebjas) mit eingebautem ZXing für JavaScript: Apache-2.0, Lizenztext in `vendor/html5-qrcode-LICENSE`
- Schrift Nunito (The Nunito Project Authors), über Google Fonts: SIL Open Font License 1.1
- Produktdaten von Open Food Facts: Datenbank ODbL 1.0, Einträge DbCL 1.0
- Richtwerte: DGE-Referenzwerte, WHO-Leitlinie zu Zucker (2015)
- Rezepte, Nährwert-Schätzungen, Ginger, Icons und Design: für diese App selbst gemacht
- Für den eigenen Programmcode ist noch keine Lizenz festgelegt (damit gilt: alle Rechte vorbehalten)
