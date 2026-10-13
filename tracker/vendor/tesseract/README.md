# Texterkennung (OCR) für das Foto der Nährwerttabelle

Wird nur geladen, wenn man im Scanner „Nährwerttabelle fotografieren“ tippt. Die Erkennung läuft komplett auf dem Handy, das Foto verlässt das Gerät nicht.

- `tesseract.min.js`, `worker.min.js`: tesseract.js 5.1.1 (https://github.com/naptha/tesseract.js), Apache-2.0
- `core/`: tesseract.js-core 5.1.1 (Tesseract OCR als WebAssembly), Apache-2.0, siehe `LICENSE`
- `lang/deu.traineddata.gz`: deutsches Sprachmodell (tessdata 4.0.0_best_int) aus dem npm-Paket @tesseract.js-data/deu 1.0.0 (MIT); die Tesseract-Sprachdaten selbst stehen unter Apache-2.0
