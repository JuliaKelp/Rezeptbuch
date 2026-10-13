# Texterkennung (OCR) für das Foto der Nährwerttabelle

Wird nur geladen, wenn man im Scanner „Nährwerttabelle fotografieren“ tippt. Die Erkennung läuft komplett auf dem Handy, das Foto verlässt das Gerät nicht.

- `tesseract.min.js`, `worker.min.js`: tesseract.js 5.1.1 (https://github.com/naptha/tesseract.js), Apache-2.0
- `tesseract.min.js.LICENSE.txt`, `worker.min.js.LICENSE.txt`: unveränderte Lizenzhinweise aus dem npm-Paket tesseract.js 5.1.1 für die mitgebündelten Bibliotheken (regenerator-runtime MIT, buffer MIT, ieee754 BSD-3-Clause, zlib.js MIT)
- `core/`: tesseract.js-core 5.1.1 (Tesseract OCR als WebAssembly), Apache-2.0, siehe `LICENSE`
- `lang/deu.traineddata.gz`: deutsches Sprachmodell (tessdata 4.0.0_best_int) aus dem npm-Paket @tesseract.js-data/deu 1.0.0 (MIT, Autoren Balearica und jeromewu, https://github.com/naptha/tessdata); die Tesseract-Sprachdaten selbst stehen unter Apache-2.0
