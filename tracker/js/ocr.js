/* Nährwerttabelle vom Foto lesen (Tesseract, läuft auf dem Gerät, ../vendor/tesseract/).
   Liest nur, was auf der Packung steht; nichts wird geschätzt. Das Ergebnis landet im Formular „Eigenes Lebensmittel“,
   wo man jede Zahl mit der Packung vergleicht, bevor man speichert. */
'use strict';
let ocrLib = null;
function loadOcr() {
  if (ocrLib) return ocrLib;
  ocrLib = new Promise((ok, fail) => {
    const s = document.createElement('script');
    s.src = 'vendor/tesseract/tesseract.min.js';
    s.onload = () => ok(globalThis.Tesseract);
    s.onerror = () => { ocrLib = null; fail(new Error('OCR nicht geladen')); };
    document.head.appendChild(s);
  });
  return ocrLib;
}
// Foto für die Erkennung vorbereiten: auf eine gute Größe bringen und in Graustufen mit mehr Kontrast
async function prepImage(file) {
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(3, 1600 / Math.max(bmp.width, bmp.height));
    const c = document.createElement('canvas');
    c.width = Math.round(bmp.width * scale); c.height = Math.round(bmp.height * scale);
    const g = c.getContext('2d');
    g.filter = 'grayscale(1)';
    g.drawImage(bmp, 0, 0, c.width, c.height);
    return c;
  } catch (e) { return file; }
}
async function ocrImage(file, onProgress) {
  const T = await loadOcr();
  const img = await prepImage(file);
  const base = new URL('vendor/tesseract/', location.href).href;
  const worker = await T.createWorker('deu', 1, {
    workerPath: base + 'worker.min.js', corePath: base + 'core', langPath: base + 'lang', gzip: true,
    logger: (m) => { if (onProgress && m.status === 'recognizing text') onProgress(m.progress); },
  });
  try {
    await worker.setParameters({ tessedit_pageseg_mode: '4', preserve_interword_spaces: '1' }); // Spalten mit Zeilen, wie in einer Tabelle
    return (await worker.recognize(img)).data.text || '';
  } finally { worker.terminate(); }
}

// Text der Nährwerttabelle → Werte pro 100 g. Nimmt je Zeile die erste Zahl (erste Spalte = 100 g / 100 ml).
// Typischer Lesefehler: „24 g“ wird zu „249g“ (das g als 9). Deshalb hat jede Zahl ggf. eine zweite Lesart ohne die letzte 9;
// gewählt wird, was physikalisch geht (≤ 100 g, Zucker ≤ Kohlenhydrate, gesättigte ≤ Fett) und am besten zum Brennwert
// auf derselben Packung passt (9 kcal je g Fett, 4 je g Kohlenhydrate und Eiweiß, 2 je g Ballaststoffe).
// Gibt { k, p, c, f, sf, su, fi, sa, kjOnly, fit, found: [...] } zurück; nicht gefundene Werte fehlen.
function parseNutritionText(text) {
  const out = { found: [] };
  const toNum = (t) => Number(t.replace(',', '.'));
  const lines = String(text).split(/\n+/).map((l) => l.toLowerCase().replace(/[|]/g, ' ').replace(/(\d)\s+,(\d)/g, '$1,$2').trim()).filter(Boolean);
  const all = lines.join(' ');
  const kcal = all.match(/(\d+(?:[.,]\d+)?)\s*k?\s*kcal/);
  if (kcal) out.k = toNum(kcal[1]);
  else {
    const kj = all.match(/(\d+(?:[.,]\d+)?)\s*kj/);
    if (kj) { out.k = Math.round(toNum(kj[1]) / 4.184); out.kjOnly = true; } // gesetzliche Umrechnung 1 kcal = 4,184 kJ
  }
  const raw = {};
  const grab = (key, line, label) => {
    if (raw[key]) return;
    const m = line.slice(line.search(label)).replace(label, ' ').match(/(\d+(?:[.,]\d+)?)/);
    if (m) raw[key] = m[1];
  };
  for (const l of lines) {
    if (/ges[äa]tt|saturat/.test(l)) grab('sf', l, /ges[äa]ttigte?\s*fetts[äa]uren|ges[äa]ttigte?|saturates|saturated/);
    else if (/\bfett|\bfat/.test(l)) grab('f', l, /fett|fat/);
    if (/zucker|sugar/.test(l)) grab('su', l, /zucker|sugars?/);
    else if (/kohlenhydr|carbohydr/.test(l)) grab('c', l, /kohlenhydrate?|carbohydrates?/);
    if (/ballast|fibre|fiber/.test(l)) grab('fi', l, /ballaststoffe?|fibre|fiber/);
    if (/eiwei|protein/.test(l)) grab('p', l, /eiwei(ß|ss|b)|protein/);
    if (/\bsalz|\bsalt/.test(l)) grab('sa', l, /salz|salt/);
  }
  // Lesarten je Wert; unmögliche (> 100 g) fallen weg
  const opts = {};
  for (const [key, t] of Object.entries(raw)) {
    const list = [];
    const dec = (t.split(/[.,]/)[1] || '').length;
    const alt = t.length > 1 && t.endsWith('9') ? t.slice(0, -1).replace(/[.,]$/, '') : null;
    const tooManyDec = dec >= (key === 'sa' ? 3 : 2);
    if (alt && tooManyDec) list.push(toNum(alt));
    if (!tooManyDec || !alt) list.push(toNum(t));
    if (alt && !tooManyDec) list.push(toNum(alt));
    opts[key] = [...new Set(list.filter((v) => v >= 0 && v <= 100))];
    if (!opts[key].length) delete opts[key];
  }
  // Beste Kombination: erlaubt und nah am Brennwert
  const keys = Object.keys(opts);
  let best = null;
  const walk = (i, cur) => {
    if (i === keys.length) {
      if (cur.su != null && cur.c != null && cur.su > cur.c + 0.05) return;
      if (cur.sf != null && cur.f != null && cur.sf > cur.f + 0.05) return;
      let err = 0;
      if (out.k != null && ['f', 'c', 'p'].every((k) => cur[k] != null)) err = Math.abs(out.k - (9 * cur.f + 4 * cur.c + 4 * cur.p + 2 * (cur.fi || 0))) / Math.max(out.k, 1);
      const order = keys.reduce((n, k) => n + opts[k].indexOf(cur[k]), 0); // bei Gleichstand die erste Lesart
      if (!best || err < best.err - 1e-9 || (Math.abs(err - best.err) < 1e-9 && order < best.order)) best = { cur: { ...cur }, err, order };
      return;
    }
    for (const v of opts[keys[i]]) walk(i + 1, { ...cur, [keys[i]]: v });
  };
  walk(0, {});
  if (best) Object.assign(out, best.cur);
  if (best && out.k != null && ['f', 'c', 'p'].every((k) => out[k] != null)) out.fit = best.err <= 0.15;
  out.found = ['k', 'f', 'sf', 'c', 'su', 'fi', 'p', 'sa'].filter((k) => out[k] != null);
  return out;
}
const OCR_NAMES = { k: 'kcal', f: 'Fett', sf: 'gesättigte Fettsäuren', c: 'Kohlenhydrate', su: 'Zucker', fi: 'Ballaststoffe', p: 'Eiweiß', sa: 'Salz' };

// Kamera öffnen (Datei-Auswahl mit Kamera), Foto lesen, Formular „Eigenes Lebensmittel“ damit füllen.
// base: was schon bekannt ist (z. B. Barcode, Name)
function photoNutrition(base) {
  const inp = document.createElement('input');
  inp.type = 'file'; inp.accept = 'image/*'; inp.setAttribute('capture', 'environment');
  inp.onchange = async () => {
    const file = inp.files && inp.files[0]; if (!file) return;
    stopScanner();
    openFoodForm(Object.assign({}, base || {}), { ocrBusy: true });
    let text = '';
    try { text = await ocrImage(file, (p) => { const el = $('#ocrNote'); if (el) el.textContent = `Lese die Nährwerttabelle … ${Math.round(p * 100)} %`; }); }
    catch (e) { const el = $('#ocrNote'); if (el) el.textContent = 'Das Lesen hat nicht geklappt (beim ersten Mal braucht es Internet). Bitte die Werte von der Packung abtippen.'; return; }
    const r = parseNutritionText(text);
    openFoodForm(Object.assign({}, base || {}, ...r.found.map((k) => ({ [k]: r[k] }))), { ocr: r });
  };
  inp.click();
}
