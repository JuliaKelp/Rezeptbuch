"""Mineralstoffe und Vitamine aus dem BLS 4.0 in tracker/data/bls.json übernehmen.

Quelle: Max Rubner-Institut (2025). Bundeslebensmittelschlüssel (BLS), Version 4.0, CC BY 4.0,
DOI 10.25826/Data20251217-134202-0, Datei BLS_4_0_Daten_2025_DE.xlsx (Download: blsdb.de).
Aufruf: python3 tools/bls_micros.py <Pfad zu BLS_4_0_Daten_2025_DE.xlsx>

Felder je 100 g: fe Eisen (mg), mg Magnesium (mg), b12 Vitamin B12 (µg), zn Zink (mg), ca Calcium (mg),
fol Folat-Äquivalent (µg), vd Vitamin D (µg), jod Iodid (µg).
„-“ (kein Wert) bleibt weg. „<LOD“, „<LOQ“ und „TR“ (unter der Nachweis-/Bestimmungsgrenze, Spuren) werden 0.
"""
import json
import sys

import openpyxl

FIELDS = {'fe': 'FE', 'mg': 'MG', 'b12': 'VITB12', 'zn': 'ZN', 'ca': 'CA', 'fol': 'FOL', 'vd': 'VITD', 'jod': 'ID'}
BELOW = ('<LOD', '<LOQ', '<LOD or <LOQ', 'TR')


def main(xlsx, out='tracker/data/bls.json'):
    ws = openpyxl.load_workbook(xlsx, read_only=True).worksheets[0]
    rows = ws.iter_rows(values_only=True)
    head = next(rows)
    col = {k: next(i for i, h in enumerate(head) if h and str(h).startswith(code + ' ')) for k, code in FIELDS.items()}
    values = {}
    for r in rows:
        v = {}
        for k, i in col.items():
            x = r[i]
            if isinstance(x, (int, float)):
                y = round(float(x), 3 if abs(x) < 1 else 1)
                v[k] = int(y) if y == int(y) else y
            elif isinstance(x, str) and x.strip() in BELOW:
                v[k] = 0
        values[r[0]] = v
    data = json.load(open(out, encoding='utf-8'))
    n = 0
    for f in data['foods']:
        for k in FIELDS:
            f.pop(k, None)
        f.update(values.get(f['id'], {}))
        n += bool(values.get(f['id']))
    data['meta']['micros'] = ('Mineralstoffe und Vitamine je 100 g (fe, mg, b12, zn, ca, fol, vd, jod) aus BLS 4.0, '
                              'Werte unter der Nachweisgrenze als 0, fehlende Werte weggelassen (tools/bls_micros.py).')
    with open(out, 'w', encoding='utf-8') as fh:
        json.dump(data, fh, ensure_ascii=False, separators=(',', ':'))
    print(f'{n} von {len(data["foods"])} Lebensmitteln mit Mikronährstoffen')


if __name__ == '__main__':
    main(sys.argv[1])
