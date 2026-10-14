/* Reiter „Essen“: Übersicht über die eigenen Lebensmittel (Vorgemerkt, Favoriten, Eigene, Rezepte, Zuletzt) mit
   Makro-Balken; „Einkauf erfassen“ öffnet das Vormerken-Blatt (Barcode/Suche), das Lebensmittel nur speichert,
   ohne sie ins Journal einzutragen. „+“ trägt ein Lebensmittel direkt ins Journal ein. */
'use strict';
var INFO = globalThis.INFO || {}; globalThis.INFO = INFO;
let pantryMode = false;      // true: Auswahl im Hinzufügen-Blatt merkt das Lebensmittel nur vor
let pantryFav = false;       // beim Vormerken zusätzlich als Favorit markieren
let pantryCount = 0;         // in diesem Durchgang vorgemerkt
let foodFilter = 'all';
let foodQuery = '';
let foodOpen = null; // Lebensmittel mit aufgeklappten Aktionen
const PANTRY_MAX = 2000;

// Vormerken; count = wie oft schon gekauft (gescannt oder ausgewählt). replaceId: diese ältere Kopie fällt weg (korrigiertes Produkt).
function pantryStore(food, replaceId) {
  const snap = foodSnap(food);
  const list = state.pantry || [];
  const old = list.find((x) => x.id === snap.id) || (replaceId && list.find((x) => x.id === replaceId));
  const count = replaceId ? ((old && old.count) || 1) : ((old && old.count) || 0) + 1;
  // Vorratskammer (../vorrat.js): neu gekauft = eine Packung mehr; korrigiert = Menge bleibt
  const pq = food.pq || (liveFood(food) || {}).pq || null;
  if (pq) snap.pq = pq;
  if (replaceId) { if (old && old.qty != null) Object.assign(snap, { qty: old.qty, qu: old.qu, ug: old.ug || (old.qu === 'pkg' ? pq : old.ug), fn: old.fn }); }
  else Vorrat.addPack(snap, old, 1, pq);
  state.pantry = [Object.assign(snap, { added: Date.now(), count })].concat(list.filter((x) => x.id !== snap.id && x.id !== replaceId)).slice(0, PANTRY_MAX);
  if (pantryFav && !isFav(snap.id)) state.favs.unshift(foodSnap(food));
  if (!replaceId) pantryCount++;
  save();
}
function pantryAdd(food) {
  if (scanEat) { scanFix = null; eatOpen(food); return; } // Scanner auf „Zum Essen“: statt vormerken ins Journal
  if (scanFix) { // aus der Scan-Liste bearbeitet oder neu angelegt: Eintrag dort ersetzen
    const item = scanSession.find((x) => x.code === scanFix.code);
    pantryStore(food, scanFix.oldId || undefined);
    if (item) { item.food = food; item.state = 'ok'; }
    else scanSession.unshift({ code: scanFix.code, n: 1, state: 'ok', food, before: null }); // ohne Barcode, vom Foto
    scanFix = null;
    toast(item ? 'Korrigiert' : `„${food.n}“ vorgemerkt`);
    openPantry('scan');
    return;
  }
  pantryStore(food);
  toast(`„${food.n}“ vorgemerkt`);
  openPantry(addTab); // im gleichen Reiter weitermachen
}

/* ---------- Der eine Scanner: Schalter „Zum Essen hinzufügen“ (Standard an) trägt ins Journal ein, Mahlzeit oben wählbar;
   aus = Einkauf scannen (vormerken, Vorrat). ---------- */
let scanEat = true;     // an: Gescanntes kommt ins Journal
let scanMeal = 'breakfast';
let eatBusy = false;    // gerade wird ein Barcode nachgeschlagen
let eatBefore = null;   // Journal-Einträge von heute beim Öffnen; was dazukommt, steht als Liste im Scanner
function eatOpen(food) {
  const tab = addTab === 'search' ? 'search' : 'scan'; // danach im gleichen Reiter weiter
  pantryMode = false; addMeal = scanMeal;
  openAmount(food, { direct: true, after: () => openPantry(tab) });
}
function renderEatScan() {
  $('#addBody').innerHTML = `
    <div class="scanner"><video id="video" playsinline muted></video><div class="frame"></div>${TORCH_BTN}</div>
    <p class="small muted" style="margin-top:8px">Scannen, Menge wählen, fertig. Nur der Barcode wird an Open Food Facts gesendet.</p>
    <div class="row"><input id="code" type="text" inputmode="numeric" placeholder="Barcode eintippen" aria-label="Barcode eintippen"><button class="btn" id="lookup" style="flex:0 0 auto">Suchen</button></div>
    <div id="scanResult"></div>
    <button type="button" class="btn secondary block" id="ocrNew" style="margin-top:8px">Ohne Barcode: Nährwerttabelle fotografieren</button>
    <div class="scan-list" id="eatList" style="margin-top:12px"></div>
    <button class="btn block" id="scanDone" style="margin-top:12px">Fertig</button>`;
  $('#lookup').onclick = () => { const c = ($('#code').value || '').replace(/\D/g, ''); if (c) { $('#code').value = ''; eatHit(c); } };
  $('#scanDone').onclick = () => $('#closeSheet').click();
  $('#ocrNew').onclick = () => { scanFix = { code: 'foto-' + Date.now(), oldId: null }; photoNutrition({}); };
  const added = (state.days[currentDate] || []).filter((e) => eatBefore && !eatBefore.has(e.id));
  $('#eatList').innerHTML = added.length ? `<div class="scan-head"><strong>Eingetragen</strong></div>` + added.slice().reverse().map((e) =>
    `<div class="scan-item ok"><div class="si-main"><div class="si-n">${esc(e.n)}</div><div class="si-m">${r1(e.grams)} ${e.liq ? 'ml' : 'g'} · ${esc(MEALS.find((m) => m.id === e.meal).label)} · ${fmt(e.k * e.grams / 100)} kcal</div></div></div>`).join('') : '';
  eatBusy = false;
  startScanner(eatHit);
}
async function eatHit(code) {
  if (eatBusy) return;
  eatBusy = true;
  const out = $('#scanResult');
  if (out && !state.custom.some((x) => x.barcode === code) && !state.offCache[code]) out.innerHTML = '<p class="muted">Suche bei Open Food Facts …</p>';
  const r = await fetchProduct(code);
  if (!$('#eatList')) { eatBusy = false; return; } // Scanner inzwischen zu
  if (r.food) { eatOpen(r.food); return; }
  eatBusy = false;
  const box = $('#scanResult'); if (!box) return;
  if (r.missing) {
    box.innerHTML = `<div class="scan-item missing"><div class="si-main"><div class="si-n">Barcode ${esc(code)}</div><div class="si-w">Nicht gefunden oder ohne Nährwerte</div></div>
      <div class="si-acts"><button type="button" class="chip" id="eatPhoto">Foto der Nährwerte</button><button type="button" class="chip" id="eatNew">Selbst anlegen</button></div></div>`;
    $('#eatPhoto').onclick = () => { stopScanner(); scanFix = { code, oldId: null }; photoNutrition({ barcode: code }); };
    $('#eatNew').onclick = () => { stopScanner(); scanFix = { code, oldId: null }; openFoodForm({ barcode: code }); };
  } else {
    box.innerHTML = `<div class="scan-item offline"><div class="si-main"><div class="si-n">Barcode ${esc(code)}</div><div class="si-w">Keine Verbindung zu Open Food Facts</div></div>
      <div class="si-acts"><button type="button" class="chip" id="eatRetry">Nochmal</button></div></div>`;
    $('#eatRetry').onclick = () => eatHit(code);
  }
}

/* ---------- Einkauf scannen: Kamera bleibt an, jedes Produkt wird sofort vorgemerkt und erscheint oben in der Liste ---------- */
let scanSession = []; // [{ code, state: 'load' | 'ok' | 'missing' | 'offline', food, n }] dieses Durchgangs, neueste oben
let scanFix = null;   // { code, oldId } während Bearbeiten/Anlegen aus der Liste
function renderPantryScan() {
  $('#addBody').innerHTML = `
    <div class="scanner"><video id="video" playsinline muted></video><div class="frame"></div>${TORCH_BTN}</div>
    <p class="small muted" style="margin-top:8px">Einfach nacheinander scannen. Jedes Produkt wird sofort vorgemerkt und erscheint unten. Prüf kurz, ob es stimmt. Nur der Barcode wird an Open Food Facts gesendet.</p>
    <div class="row"><input id="code" type="text" inputmode="numeric" placeholder="Barcode eintippen" aria-label="Barcode eintippen"><button class="btn" id="lookup" style="flex:0 0 auto">Dazu</button></div>
    <button type="button" class="btn secondary block" id="ocrNew" style="margin-top:8px">Ohne Barcode: Nährwerttabelle fotografieren</button>
    <div class="scan-head"><strong id="scanN"></strong><span class="small muted">neueste oben</span></div>
    <div class="scan-list" id="scanList"></div>
    <button class="btn block" id="scanDone" style="margin-top:12px">Fertig</button>`;
  $('#lookup').onclick = () => { const c = ($('#code').value || '').replace(/\D/g, ''); if (c) { $('#code').value = ''; scanHit(c); } };
  $('#scanDone').onclick = () => $('#closeSheet').click();
  $('#ocrNew').onclick = () => { scanFix = { code: 'foto-' + Date.now(), oldId: null }; photoNutrition({}); };
  drawScanList();
  startScanner(scanHit);
}
async function scanHit(code) {
  let item = scanSession.find((x) => x.code === code);
  if (item && item.state === 'load') return;
  if (item && item.state === 'ok') { // nochmal gekauft
    item.n++; pantryStore(liveFood(item.food));
    scanSession = [item].concat(scanSession.filter((x) => x !== item));
    drawScanList(code); return;
  }
  if (!item) { item = { code, n: 1 }; scanSession.unshift(item); }
  item.state = 'load'; drawScanList(code);
  const r = await fetchProduct(code);
  if (r.food) {
    item.food = r.food; item.state = 'ok';
    const before = (state.pantry || []).find((y) => y.id === (r.food.ref || r.food.id));
    item.before = before ? Object.assign({}, before) : null;
    pantryStore(r.food);
  }
  else item.state = r.missing ? 'missing' : 'offline';
  drawScanList(code);
}
// Hinweise wie im alten Rezeptbuch-Scanner: passt nicht zur Ernährungsform, Allergene, Süßstoffe
function scanWarnings(f) {
  const out = [];
  if (state.diet.type === 'veg' && f.d === 0) out.push('nicht vegetarisch');
  else if (state.diet.type === 'vegan' && f.d != null && f.d < 2) out.push('nicht vegan');
  const bad = (f.a || []).filter((x) => state.diet.allergens.includes(x)).map((k) => (ALLERGENS.find((x) => x[0] === k) || [0, k])[1]);
  if (bad.length) out.push('enthält ' + bad.join(', '));
  if (f.sw && f.sw.length) out.push('Süßstoff: ' + f.sw.join(', '));
  return out;
}
function drawScanList(fresh) {
  const box = $('#scanList'); if (!box) return;
  const ok = scanSession.filter((x) => x.state === 'ok').length;
  $('#scanN').textContent = scanSession.length ? `${ok} vorgemerkt${scanSession.length > ok ? ` · ${scanSession.length - ok} offen` : ''}` : 'Noch nichts gescannt';
  const bar = document.querySelector('.pantry-bar .small'); if (bar) bar.textContent = 'nur speichern, nicht ins Journal';
  box.innerHTML = scanSession.map((x, i) => {
    const f = x.food && liveFood(x.food);
    const p = f && (state.pantry || []).find((y) => y.id === (f.ref || f.id));
    let main, acts;
    if (x.state === 'load') { main = `<div class="si-n">Barcode ${esc(x.code)}</div><div class="si-m">Suche bei Open Food Facts …</div>`; acts = ''; }
    else if (x.state === 'ok') {
      const warn = scanWarnings(f);
      const meta = [f.brand, `${fmt(f.k)} kcal/100 ${unitOf(f)}`, p ? `im Vorrat: ${Vorrat.label(p)}` : ''].filter(Boolean).map(esc).join(' · ');
      main = `<div class="si-n">${esc(f.n)}</div><div class="si-m">${meta}</div>${warn.length ? `<div class="si-w">${esc(warn.join(' · '))}</div>` : ''}`;
      // Anzahl gekaufter Packungen dieses Einkaufs
      acts = `<span class="si-count" role="group" aria-label="Anzahl"><button type="button" class="chip" data-a="minus" data-i="${i}" aria-label="Eins weniger" ${x.n <= 1 ? 'disabled' : ''}>−</button><b>${x.n}×</b><button type="button" class="chip" data-a="plus" data-i="${i}" aria-label="Eins mehr">+</button></span>
        <button type="button" class="chip" data-a="edit" data-i="${i}">Bearbeiten</button><button type="button" class="chip" data-a="eat" data-i="${i}">Gegessen</button>`;
    } else if (x.state === 'missing') {
      main = `<div class="si-n">Barcode ${esc(x.code)}</div><div class="si-w">Nicht gefunden oder ohne Nährwerte</div>`;
      acts = `<button type="button" class="chip" data-a="photo" data-i="${i}">Foto der Nährwerte</button><button type="button" class="chip" data-a="new" data-i="${i}">Selbst anlegen</button>`;
    } else {
      main = `<div class="si-n">Barcode ${esc(x.code)}</div><div class="si-w">Keine Verbindung zu Open Food Facts</div>`;
      acts = `<button type="button" class="chip" data-a="retry" data-i="${i}">Nochmal</button>`;
    }
    return `<div class="scan-item ${x.state}${x.code === fresh ? ' fresh' : ''}"><div class="si-main">${main}</div>
      <div class="si-acts">${acts}${x.state === 'load' ? '' : `<button type="button" class="chip" data-a="del" data-i="${i}" aria-label="Entfernen">✕</button>`}</div></div>`;
  }).join('');
  box.querySelectorAll('[data-a]').forEach((b) => b.onclick = () => {
    const x = scanSession[+b.dataset.i]; if (!x) return;
    const a = b.dataset.a;
    if (a === 'retry') { scanHit(x.code); return; }
    if (a === 'plus') { scanHit(x.code); return; }
    if (a === 'minus') {
      if (x.n <= 1 || !x.food) return;
      const id = x.food.ref || x.food.id;
      const p = (state.pantry || []).find((y) => y.id === id);
      if (p) {
        p.count = Math.max(1, (p.count || 1) - 1);
        if (p.qty != null) p.qty = Math.max(0, Math.round((p.qty - (p.qu === 'pkg' ? 1 : p.pq && p.ug ? p.pq / p.ug : 0)) * 100) / 100);
      }
      x.n--; pantryCount = Math.max(0, pantryCount - 1); save(); drawScanList(x.code); return;
    }
    if (a === 'del') {
      if (x.food) {
        const id = x.food.ref || x.food.id;
        // Gab es das Produkt schon vorher im Vorrat, bleibt es mit der alten Menge; sonst fällt es raus
        state.pantry = (state.pantry || []).filter((y) => y.id !== id);
        if (x.before) state.pantry.unshift(x.before);
        pantryCount = Math.max(0, pantryCount - x.n); save();
      }
      scanSession = scanSession.filter((y) => y !== x); toast(x.food ? 'Nicht mehr vorgemerkt' : 'Entfernt'); drawScanList(); return;
    }
    stopScanner();
    if (a === 'new') { scanFix = { code: x.code, oldId: null }; openFoodForm({ barcode: x.code }); return; }
    if (a === 'photo') { scanFix = { code: x.code, oldId: null }; photoNutrition({ barcode: x.code }); return; }
    const f = liveFood(x.food);
    if (a === 'edit') {
      scanFix = { code: x.code, oldId: f.ref || f.id };
      const own = state.custom.find((y) => y.id === (f.ref || f.id));
      // Produkt aus Open Food Facts: als eigenes Lebensmittel mit gleichem Barcode speichern, das gilt dann beim nächsten Scan
      openFoodForm(own || Object.assign({}, f, { id: null, src: 'custom', barcode: x.code, ns: 'off-edit' }));
      return;
    }
    if (a === 'eat') { pantryMode = false; addMeal = mealByTime(); openAmount(f, { direct: true, after: () => openPantry('scan') }); }
  });
}
// mode: { eat, meal } beim Öffnen; ohne = Rückkehr in den offenen Scanner, Schalter bleibt, wie er war
function openPantry(tab, mode) {
  if (mode) {
    scanEat = mode.eat !== false;
    scanMeal = mode.meal || mealByTime();
    eatBefore = new Set((state.days[currentDate] || []).map((e) => e.id));
  }
  if (!eatBefore) eatBefore = new Set((state.days[currentDate] || []).map((e) => e.id));
  pantryMode = true;
  scanFix = null;
  addTab = tab || 'scan';
  sheetMode = 'add';
  const short = { breakfast: 'Frühstück', lunch: 'Mittag', dinner: 'Abend', snack: 'Snack' };
  openSheet(`
    <div class="sheet-head"><h1 class="sh-t">${scanEat ? 'Essen scannen' : 'Einkauf scannen'}</h1><button class="btn ghost" id="closeSheet">Schließen</button></div>
    <label class="toggle"><input type="checkbox" role="switch" id="eatMode" ${scanEat ? 'checked' : ''}><span class="tg-track" aria-hidden="true"></span>
      <span><b>Zum Essen hinzufügen</b><span class="small muted">${scanEat ? 'Kommt in dein Journal. Für den Einkauf ausschalten.' : 'Aus: Einkauf, kommt in den Vorrat.'}</span></span></label>
    ${scanEat ? `<div class="seg" id="mealSeg" aria-label="Mahlzeit">${MEALS.map((m) => `<button data-m="${m.id}" class="${m.id === scanMeal ? 'active' : ''}">${short[m.id]}</button>`).join('')}</div>` : ''}
    <div class="seg two" id="addSeg"><button data-t="scan">Barcode</button><button data-t="search">Suche</button></div>
    ${scanEat ? '' : `<div class="pantry-bar"><label class="switch" style="margin:0"><input type="checkbox" id="pFav" ${pantryFav ? 'checked' : ''}> als Favorit</label><span class="small muted">${pantryCount ? `${pantryCount} vorgemerkt` : 'nur speichern, nicht ins Journal'}</span></div>`}
    <div id="addBody"></div>`);
  $('#eatMode').onchange = (ev) => { stopScanner(); scanEat = ev.target.checked; openPantry(addTab); };
  if ($('#mealSeg')) $('#mealSeg').querySelectorAll('button').forEach((b) => b.onclick = () => {
    scanMeal = b.dataset.m; addMeal = scanMeal;
    $('#mealSeg').querySelectorAll('button').forEach((x) => x.classList.toggle('active', x === b));
  });
  $('#closeSheet').onclick = () => { pantryMode = false; pantryCount = 0; scanSession = []; scanFix = null; eatBefore = null; closeSheet(); if (globalThis.rbPantryReturn) { RBBackup.markNav(); location.assign(globalThis.rbPantryReturn); } }; // aus dem Rezeptbuch geöffnet: dorthin zurück
  if ($('#pFav')) $('#pFav').onchange = (ev) => { pantryFav = ev.target.checked; };
  $('#addSeg').querySelectorAll('button').forEach((b) => b.onclick = () => { addTab = b.dataset.t; renderAddTab(); });
  renderAddTab();
}

function vorratTag(id) {
  const p = (state.pantry || []).find((y) => y.id === id);
  return p && p.qty != null ? 'Vorrat: ' + Vorrat.label(p) : 'vorgemerkt';
}
function foodItems() {
  const map = new Map();
  const put = (f, flag) => { const id = f.ref || f.id; const cur = map.get(id) || Object.assign({}, liveFood(f), { id, flags: {} }); cur.flags[flag] = true; map.set(id, cur); };
  (state.pantry || []).forEach((f) => put(f, 'pantry'));
  state.favs.forEach((f) => put(f, 'fav'));
  state.custom.forEach((f) => put(f, f.src === 'recipe' ? 'recipe' : 'own'));
  state.recent.slice(0, 40).forEach((f) => put(f, 'recent'));
  return [...map.values()];
}
const FOOD_FILTERS = [['all', 'Alle'], ['fav', '★ Favoriten'], ['pantry', 'Vorgemerkt'], ['own', 'Eigene'], ['recent', 'Zuletzt']];
function mealByTime() { const h = new Date().getHours(); return h < 10 ? 'breakfast' : h < 15 ? 'lunch' : h < 18 ? 'snack' : 'dinner'; }

INFO.foodList = { body: '<p>Der Balken zeigt den Energieanteil von <span style="color:var(--p)">Eiweiß</span>, <span style="color:var(--c)">Kohlenhydraten</span> und <span style="color:var(--f)">Fett</span>; „E“ ist das Eiweiß pro 100 g.</p><p>„+“ trägt das Lebensmittel direkt ins Journal ein (Mahlzeit nach Uhrzeit). Ein Tipp auf die Zeile zeigt weitere Aktionen: Favorit an/aus, aus „Vorgemerkt“ oder „Zuletzt“ entfernen, eigene Lebensmittel bearbeiten oder löschen.</p>' };
function renderFood() {
  const all = foodItems();
  const pantry = (state.pantry || []).slice(0, 3);
  $('#view').innerHTML = `
    <div class="topbar"><div><div class="sub">Deine Lebensmittel</div><div class="day">Essen</div></div>
</div>
    <div class="card fd-shop">
      <div class="fd-shop-h"><div class="fd-ico">▥</div><div class="fd-t">Einkauf erfassen</div></div>
      <div class="fd-btns"><button class="btn" id="fdScan">Scannen</button><button class="btn secondary" id="fdSearch">Suchen</button></div>
      ${pantry.length ? `<div class="small muted">Zuletzt vorgemerkt: <span style="color:var(--ink)">${pantry.map((x) => esc(x.n)).join(' · ')}</span></div>` : ''}
    </div>
    <input id="fdQ" type="search" placeholder="In deinen Lebensmitteln suchen" autocomplete="off" value="${esc(foodQuery)}">
    <div class="chips fd-chips" id="fdF">${FOOD_FILTERS.map(([k, l]) => { const n = k === 'all' ? all.length : all.filter((x) => x.flags[k]).length; return `<button type="button" class="chip ${foodFilter === k ? 'on' : ''}" data-f="${k}">${l}${n ? ` <span class="muted">${n}</span>` : ''}</button>`; }).join('')}</div>
    <div class="fd-info">${infoBtn('foodList')}</div>
    <div class="card fd-list" id="fdList"></div>
`;
  const draw = () => {
    const terms = norm(foodQuery).split(/\s+/).filter(Boolean);
    const list = all.filter((x) => (foodFilter === 'all' || x.flags[foodFilter]) && (!terms.length || terms.every((t) => norm(x.n + ' ' + (x.brand || '')).includes(t))));
    const tagOf = (x) => x.flags.recipe ? 'Rezept' : x.flags.own ? 'Eigenes' : x.src === 'off' ? 'Barcode' : '';
    $('#fdList').innerHTML = list.length ? list.map((x, i) => {
      const e = (x.p || 0) * 4 + (x.c || 0) * 4 + (x.f || 0) * 9 || 1;
      return `<div class="fd-row" data-i="${i}"><div class="fd-main"><div class="fd-n">${x.flags.fav ? '<span class="star">★</span>' : ''}${esc(x.n)}${tagOf(x) ? `<span class="tag">${tagOf(x)}</span>` : ''}${x.flags.pantry ? `<span class="tag fd-p">${esc(vorratTag(x.id))}</span>` : ''}</div>
        <div class="fd-m"><span>${fmt(x.k)} kcal/100 ${unitOf(x)}</span><span class="fd-bar"><i style="flex:${((x.p || 0) * 4 / e).toFixed(3)};background:var(--p)"></i><i style="flex:${((x.c || 0) * 4 / e).toFixed(3)};background:var(--c)"></i><i style="flex:${((x.f || 0) * 9 / e).toFixed(3)};background:var(--f)"></i></span><span class="fd-e">E ${r1(x.p || 0)}</span></div></div>
        <button type="button" class="fd-plus" data-plus="${i}" aria-label="${esc(x.n)} ins Journal eintragen">+</button></div>
        ${foodOpen === x.id ? `<div class="fd-acts">
          <button type="button" class="chip" data-act="add" data-i="${i}">Ins Journal</button>
          <button type="button" class="chip" data-act="fav" data-i="${i}">${x.flags.fav ? '☆ Kein Favorit' : '★ Favorit'}</button>
          ${x.flags.pantry ? `<button type="button" class="chip" data-act="pantry" data-i="${i}">Aus Vorgemerkt entfernen</button>` : ''}
          ${x.flags.recent ? `<button type="button" class="chip" data-act="recent" data-i="${i}">Aus Zuletzt entfernen</button>` : ''}
          ${x.flags.own || x.flags.recipe ? `<button type="button" class="chip" data-act="edit" data-i="${i}">Bearbeiten</button><button type="button" class="chip warn" data-act="del" data-i="${i}">Löschen</button>` : ''}
        </div>` : ''}`;
    }).join('') : `<div class="empty">${all.length ? 'Nichts gefunden.' : 'Noch keine Lebensmittel. Nach dem Einkauf einfach „Scannen“ tippen.'}</div>`;
    const pick = (i) => { const f = list[+i]; if (!f) return; addMeal = mealByTime(); openAmount(f, { direct: true }); };
    document.querySelectorAll('#fdList [data-plus]').forEach((b) => b.onclick = (ev) => { ev.stopPropagation(); pick(b.dataset.plus); });
    document.querySelectorAll('#fdList .fd-row').forEach((r) => r.onclick = () => { const f = list[+r.dataset.i]; foodOpen = f && foodOpen !== f.id ? f.id : null; draw(); });
    document.querySelectorAll('#fdList [data-act]').forEach((b) => b.onclick = (ev) => {
      ev.stopPropagation(); const f = list[+b.dataset.i]; if (!f) return;
      const act = b.dataset.act;
      if (act === 'add') { pick(b.dataset.i); return; }
      if (act === 'edit') { const own = state.custom.find((c) => c.id === f.id); if (own) { if (own.src === 'recipe') openRecipe(own); else openFoodForm(own); } return; }
      if (act === 'fav') {
        if (isFav(f.id)) state.favs = state.favs.filter((y) => y.id !== f.id); else state.favs.unshift(foodSnap(f));
        save(); toast(isFav(f.id) ? 'Als Favorit markiert' : 'Kein Favorit mehr');
      } else if (act === 'pantry') {
        if (!confirm(`„${f.n}“ aus „Vorgemerkt“ entfernen?`)) return;
        state.pantry = state.pantry.filter((y) => y.id !== f.id); save(); toast('Aus „Vorgemerkt“ entfernt');
      } else if (act === 'recent') {
        if (!confirm(`„${f.n}“ aus „Zuletzt verwendet“ entfernen?`)) return;
        state.recent = state.recent.filter((y) => y.id !== f.id); save(); toast('Aus „Zuletzt verwendet“ entfernt');
      } else if (act === 'del') {
        if (!confirm(`„${f.n}“ löschen? Bereits eingetragene Mahlzeiten bleiben erhalten.`)) return;
        removeOwnFood(f.id); toast('Gelöscht');
      }
      foodOpen = null; renderFood();
    });
  };
  $('#fdQ').oninput = (ev) => { foodQuery = ev.target.value; draw(); };
  document.querySelectorAll('#fdF [data-f]').forEach((b) => b.onclick = () => { foodFilter = b.dataset.f; document.querySelectorAll('#fdF [data-f]').forEach((x) => x.classList.toggle('on', x === b)); draw(); });
  $('#fdScan').onclick = () => openPantry('scan', { eat: false });
  $('#fdSearch').onclick = () => openPantry('search');
  draw();
}
