/* Vorratskammer: Mengen zu den vorgemerkten Lebensmitteln im Tracker (ct.v1 → pantry).
   Ein Eintrag kann haben: qty (Menge), qu (Einheit: g, ml, stk, pkg), ug (Gramm je Einheit, bei g/ml 1),
   fn (welche Rezept-Zutat es ist, '' = keine). Ohne qty ist die Menge offen (alte Einträge).
   Wird von Rezeptbuch (app.js) und Tracker (tracker/js) benutzt, deshalb ein einfaches Skript ohne import. */
'use strict';
(function () {
  const UNIT = { g: 'g', ml: 'ml', stk: 'Stück', pkg: 'Pkg.' };
  const r2 = (x) => Math.round(x * 100) / 100;
  const num = (x) => String(Math.round(x * 10) / 10).replace('.', ',');

  // Vorhandene Menge in Gramm (ml zählen wie g); null, wenn unbekannt
  function grams(x) {
    return x && x.qty != null && x.ug ? x.qty * x.ug : null;
  }
  function label(x) {
    if (!x || x.qty == null) return 'Menge offen';
    const q = `${num(x.qty)} ${UNIT[x.qu] || x.qu || ''}`.trim();
    if ((x.qu === 'stk' || x.qu === 'pkg') && x.ug) return `${q} (≈ ${Math.round(x.qty * x.ug)} ${x.liq ? 'ml' : 'g'})`;
    return q;
  }
  // Schritt für die Plus/Minus-Knöpfe
  function step(x) {
    return x.qu === 'g' || x.qu === 'ml' ? (x.qty >= 500 ? 100 : 50) : 1;
  }

  // Eine Packung dazu (Scan). pq = Packungsgröße in g/ml von Open Food Facts, falls bekannt.
  // Alte Einträge ohne Menge fangen bei dieser Packung an zu zählen.
  function addPack(item, old, n, pq) {
    const base = old && old.qty != null ? old : null;
    item.qu = base ? base.qu : 'pkg';
    item.ug = base ? base.ug : (pq || null);
    if (!item.ug && item.qu === 'pkg' && pq) item.ug = pq;
    if (base && base.fn !== undefined) item.fn = base.fn;
    const add = item.qu === 'pkg' ? n : item.ug && pq ? (n * pq) / item.ug : 0;
    item.qty = Math.max(0, r2((base ? base.qty : 0) + add));
    return item;
  }

  // g Gramm abziehen, älteste Einträge zuerst. match(x) wählt die passenden Einträge.
  // Gibt [[id, abgezogene Menge in dessen Einheit], …] zurück (für Rückgängig) und den Rest, der fehlte.
  function take(pantry, match, g) {
    const out = [];
    let rest = g;
    const items = (pantry || []).filter((x) => match(x) && x.qty > 0 && x.ug).sort((a, b) => (a.added || 0) - (b.added || 0));
    for (const x of items) {
      if (rest <= 0.5) break;
      const use = Math.min(x.qty * x.ug, rest);
      const dq = Math.min(x.qty, r2(use / x.ug));
      x.qty = r2(x.qty - dq);
      rest -= use;
      if (dq > 0) out.push([x.id, dq]);
    }
    return { used: out, missing: Math.max(0, rest) };
  }
  function giveBack(pantry, used) {
    for (const [id, dq] of used || []) {
      const x = (pantry || []).find((y) => y.id === id);
      if (x && x.qty != null) x.qty = r2(x.qty + dq);
    }
  }

  globalThis.Vorrat = { UNIT, grams, label, step, addPack, take, giveBack };
})();
