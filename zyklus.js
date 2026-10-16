// Zyklus: Karte auf „Heute“, Kalender, Eintragen, Verlauf, Wissen und Einstellungen (Ich → Zyklus).
// Alles liegt in state.cycle im normalen Rezeptbuch-Speicher und ist damit Teil des Backups. Nichts verlässt das Handy.
// Vorhersagen sind Rechnungen aus den eigenen Zykluslängen und keine Verhütung.

const RED = '#D92D20';
const TEAL = '#2A8C8C';
const TEAL_SOFT = '#8CC7C7';
const DEFAULT_LEN = 29;      // Mittel 29,3 Tage in über 600.000 Zyklen (Bull 2019, Quelle 4), solange eigene Daten fehlen
const DEFAULT_BLEED = 5;
const LUTEAL = 13;           // Eisprung etwa 13 Tage vor der nächsten Periode (Lutealphase im Mittel 12,4 Tage, Quelle 4)
const FERTILE_DAYS = 6;      // 5 Tage davor bis Eisprungtag (Wilcox 1995, Quelle 6)

export const TRACK = [['temp', 'Basaltemperatur'], ['cm', 'Zervixschleim'], ['cervix', 'Muttermund'], ['sex', 'Sex'], ['pill', 'Verhütung'], ['tests', 'Tests'], ['body', 'Körper'], ['pain', 'Schmerzstärke'], ['mood', 'Stimmung'], ['note', 'Notiz']];
const TRACK_DEFAULT = { temp: true, cm: true, cervix: true, sex: true, pill: true, tests: true, body: true, pain: false, mood: false, note: false };
const BLEED = [[1, 'Schmier'], [2, 'Leicht'], [3, 'Mittel'], [4, 'Stark']];
const METHODS = [['none', 'Keine oder Kondom'], ['pille', 'Pille'], ['hormon', 'Andere hormonelle (Ring, Pflaster, Spritze, Implantat, Hormonspirale)'], ['kupfer', 'Kupferspirale oder -kette']];
const PHASES = [['normal', 'Normaler Zyklus'], ['schwanger', 'Schwanger'], ['stillen', 'Stillzeit'], ['wechsel', 'Wechseljahre']];
const BODY = ['Brustspannen', 'Unterleibskrämpfe', 'Rückenschmerzen', 'Kopfweh', 'Migräne', 'Ziehen beim Eisprung', 'Blähbauch', 'Übelkeit', 'Durchfall', 'Verstopfung', 'Wassereinlagerungen', 'Unreine Haut', 'Heißhunger', 'Schlecht geschlafen', 'Schwindel', 'Hitzewallungen'];
const MOOD = ['Gut drauf', 'Ruhig', 'Gereizt', 'Traurig', 'Ängstlich', 'Stimmungsschwankungen', 'Müde', 'Viel Energie', 'Wenig Lust', 'Viel Lust'];
// Auswahlfelder: [Schlüssel, Überschrift, Optionen, Spalten]
const PICKS = {
  pain: [['pain', '', ['Leicht', 'Mittel', 'Stark'], 3]],
  cm: [['cm', '', ['Trocken', 'Nichts', 'Feucht', 'Cremig', 'Glasig, spinnbar'], 3]],
  cervix: [['cxPos', 'Lage', ['Tief', 'Mittel', 'Hoch'], 3], ['cxFirm', 'Festigkeit', ['Fest', 'Weich'], 2], ['cxOpen', 'Öffnung', ['Geschlossen', 'Etwas offen', 'Offen'], 3]],
  sex: [['sex', '', ['Solo', 'Mit Kondom', 'Ohne Kondom'], 3]],
  pill: [['pill', 'Pille heute', ['Genommen', 'Vergessen', 'Pillenpause'], 3]],
  tests: [['lh', 'Eisprungtest (LH)', ['Negativ', 'Positiv'], 2], ['preg', 'Schwangerschaftstest', ['Negativ', 'Positiv'], 2]]
};
const GROUP_TITLE = { pain: 'Schmerzstärke', cm: 'Zervixschleim', cervix: 'Muttermund', sex: 'Sex', pill: 'Verhütung', tests: 'Tests' };
const GROUP_HINT = { cervix: 'Am besten immer zur gleichen Tageszeit tasten.', tests: 'Nur antippen, wenn du einen Test gemacht hast.' };

export function defaultCycle() {
  return { on: true, fert: true, todayLine: true, method: 'none', phase: 'normal', track: { ...TRACK_DEFAULT }, days: {} };
}

export function initZyklus(api) {
  const { esc, ui, todayKey, addDays, dateOf, keyOf } = api;
  const ICONS = new Proxy({}, { get: (_, k) => api.ICONS[k] });
  const st = () => api.getState();
  function cy() {
    const s = st();
    if (!s.cycle || typeof s.cycle !== 'object') s.cycle = defaultCycle();
    const c = s.cycle;
    const base = defaultCycle();
    for (const k of Object.keys(base)) if (c[k] === undefined) c[k] = base[k];
    c.track = { ...TRACK_DEFAULT, ...c.track };
    return c;
  }
  const diff = (a, b) => Math.round((dateOf(b) - dateOf(a)) / 86400000);
  const isBleed = (e) => !!e && e.bleed >= 2;
  const hasEntry = (e) => !!e && Object.keys(e).some((k) => k !== 'imp');
  const hormonal = () => ['pille', 'hormon'].includes(cy().method);
  const paused = () => cy().phase !== 'normal';
  const deDate = (key, opts = { day: 'numeric', month: 'long' }) => dateOf(key).toLocaleDateString('de-DE', opts);

  // Sichtbar, wenn unter „Name und Alter“ Regel = Ja steht und der Zyklus nicht ausgeschaltet ist
  function available() { const p = st().profile || {}; return p.cycle === 'yes' && !api.isMale(); }
  function active() { return available() && cy().on !== false; }

  // ---------- Rechnen ----------
  function analysis(today = todayKey()) {
    const days = cy().days;
    const keys = Object.keys(days).filter((k) => k <= today).sort();
    // Periodenbeginn: Blutung ab „Leicht“, und die zwei Tage davor ohne Blutung
    const starts = keys.filter((k) => isBleed(days[k]) && !isBleed(days[addDays(k, -1)]) && !isBleed(days[addDays(k, -2)]));
    const lengths = [];
    for (let i = 1; i < starts.length; i++) lengths.push(diff(starts[i - 1], starts[i]));
    const usable = lengths.filter((n) => n >= 15 && n <= 60).slice(-6); // Lücken in alten Daten nicht mitrechnen
    const own = usable.length > 0;
    const avg = own ? Math.round(usable.reduce((s, n) => s + n, 0) / usable.length) : DEFAULT_LEN;
    const min = own ? Math.min(...usable) : avg;
    const max = own ? Math.max(...usable) : avg;
    const bleedLens = starts.map((s) => { let n = 0; while (isBleed(days[addDays(s, n)])) n++; return { n, imp: !!days[s].imp }; })
      .filter((b) => !(b.imp && b.n === 1)).map((b) => b.n);
    const bleedAvg = bleedLens.length ? Math.round(bleedLens.slice(-6).reduce((s, n) => s + n, 0) / Math.min(6, bleedLens.length)) : DEFAULT_BLEED;
    const last = starts[starts.length - 1] || null;
    const dayNo = last ? diff(last, today) + 1 : null;
    // Eisprung: positiver LH-Test im laufenden Zyklus → am Tag danach (Eisprung etwa 38 Stunden nach Beginn des LH-Anstiegs, Quelle 1)
    let ovu = null, ovuSure = false;
    if (last) {
      const lh = keys.filter((k) => k >= last && days[k].lh === 'Positiv')[0];
      if (lh) { ovu = diff(last, lh) + 2; ovuSure = true; } else ovu = Math.max(FERTILE_DAYS, avg - LUTEAL);
    }
    return { starts, lengths, usable, own, avg, min, max, bleedAvg, last, dayNo, ovu, ovuSure };
  }
  function showFertile() { return cy().fert && !hormonal() && !paused(); }
  // Fruchtbare Tage (Zyklustage) im laufenden Zyklus
  function fertileDays(a) {
    if (!showFertile() || !a.ovu) return [];
    return Array.from({ length: FERTILE_DAYS }, (_, i) => a.ovu - FERTILE_DAYS + 1 + i).filter((d) => d >= 1);
  }
  function nextText(a, today = todayKey()) {
    if (paused()) return 'Vorhersagen pausiert';
    if (!a.last) return '';
    const lo = a.min - a.dayNo + 1, hi = a.max - a.dayNo + 1;
    if (hi < 0) return `Periode wäre seit ${-hi} ${-hi === 1 ? 'Tag' : 'Tagen'} fällig`;
    if (lo <= 0) return hi === 0 ? 'Periode heute erwartet' : `Periode ab heute bis in ${hi} ${hi === 1 ? 'Tag' : 'Tagen'}`;
    if (lo === hi) return `Periode in ${lo} ${lo === 1 ? 'Tag' : 'Tagen'}`;
    return `Periode in ${lo} bis ${hi} Tagen`;
  }

  // ---------- Kreis auf „Heute“ ----------
  function ringSvg(a, today = todayKey()) {
    const days = cy().days;
    const len = Math.max(a.avg, a.dayNo);
    const cx = 95, cyy = 95, r = 66, dotR = 85;
    const ang = (d, f) => ((d - 1 + f) / len) * 2 * Math.PI - Math.PI / 2;
    const pt = (an, rr) => [cx + rr * Math.cos(an), cyy + rr * Math.sin(an)];
    const fert = fertileDays(a);
    const big = 0.06;
    let segs = '', dots = '', n = 0;
    for (let d = 1; d <= len; d++) {
      const key = addDays(a.last, d - 1);
      const p0 = pt(ang(d, big), r), p1 = pt(ang(d, 1 - big), r);
      let color = d < a.dayNo ? '#E2CFBF' : '#F1E3D6';
      const e = days[key];
      if (key <= today && isBleed(e)) color = RED;
      else if (key <= today && e && e.bleed === 1) color = '#EFA59E';
      else if (fert.includes(d)) color = d <= a.dayNo ? TEAL : TEAL_SOFT;
      segs += `<path d="M${p0[0].toFixed(1)},${p0[1].toFixed(1)} A${r},${r} 0 0,1 ${p1[0].toFixed(1)},${p1[1].toFixed(1)}" fill="none" stroke="${color}" stroke-width="16"/>`;
      if (key <= today && hasEntry(e)) { n++; const p = pt(ang(d, 0.5), dotR); dots += `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="3" fill="#3B2A20"/>`; }
    }
    const t = pt(ang(a.dayNo, 0.5), r);
    const label = `Zykluskreis: Tag ${a.dayNo} von etwa ${len}.${fert.length ? ` Fruchtbare Tage geschätzt Tag ${fert[0]} bis ${fert[fert.length - 1]}.` : ''} Einträge an ${n} Tagen.`;
    return `<svg class="cy-ring" width="104" height="104" viewBox="0 0 190 190" role="img" aria-label="${label}">${segs}${dots}
      <circle cx="${t[0].toFixed(1)}" cy="${t[1].toFixed(1)}" r="11" fill="#FFFFFF" stroke="#3B2A20" stroke-width="3"/>
      <text x="95" y="82" text-anchor="middle" font-size="15" font-weight="800" fill="#6B5444">TAG</text>
      <text x="95" y="122" text-anchor="middle" font-size="44" font-weight="900" fill="#3B2A20">${a.dayNo}</text></svg>`;
  }
  // Kompakt (Wunsch 16.10.): kleiner Kreis, Legende hinter dem Info-Knopf
  function homeCard() {
    if (!active()) return '';
    const a = analysis();
    const today = todayKey();
    if (!a.last) {
      return `<section class="card cy-card">
        <div class="cy-head"><h2>Dein Zyklus</h2><a class="cy-link" href="#/zyklus">Kalender ›</a></div>
        <p class="small muted">Trag den ersten Tag deiner letzten Periode ein, dann zeige ich dir hier, wo im Zyklus du gerade bist. Alte Daten übernimmst du unter Ich → Zyklus.</p>
        <a class="btn secondary cy-add" href="#/zyklus/tag/${today}">+ Zyklus eintragen</a>
      </section>`;
    }
    const fert = fertileDays(a);
    const open = !!ui.info.cyLegend;
    return `<section class="card cy-card">
      <div class="cy-body">
        <a href="#/zyklus" class="cy-ring-link" aria-label="Zum Zykluskalender">${ringSvg(a, today)}</a>
        <div class="cy-side">
          <div class="cy-head"><h2>Dein Zyklus</h2><button class="info-btn" data-action="info" data-key="cyLegend" aria-expanded="${open}" aria-label="Was die Farben bedeuten">i</button></div>
          <div class="cy-next">${esc(nextText(a, today))}</div>
          <div class="cy-actions"><a class="cy-plus" href="#/zyklus/tag/${today}">+ Eintragen</a><a class="cy-link" href="#/zyklus">Kalender ›</a></div>
        </div>
      </div>
      ${open ? `<div class="info-text cy-legend">
        <span><i class="sw" style="background:${RED}"></i>Blutung</span>
        ${fert.length ? `<span><i class="sw" style="background:${TEAL}"></i>fruchtbar (${a.ovuSure ? 'nach LH-Test' : 'geschätzt, nicht zur Verhütung'})</span>` : ''}
        <span><i class="dot"></i>Tag mit Eintrag</span>
        <span><i class="knob"></i>heute</span>
        ${a.own ? '' : '<span>Noch geschätzt mit 29 Tagen. Ab der zweiten Periode rechne ich mit deinen eigenen Zyklen.</span>'}
        <a href="#/zyklus/wissen">Wissen über Hormone, Schleim, Muttermund ›</a>
      </div>` : ''}
    </section>`;
  }

  // ---------- Kalender und Verlauf ----------
  // Status eines Kalendertags: echte Blutung, vorhergesagte Periode, fruchtbar (laufender und die nächsten zwei Zyklen)
  function dayInfo(a, key, today) {
    const e = cy().days[key];
    const out = { bleed: key <= today && e ? e.bleed || 0 : 0, entry: key <= today && hasEntry(e), pred: false, fert: false };
    if (!a.last || paused()) return out;
    const fertOn = showFertile();
    for (let k = 0; k <= 2; k++) {
      const start = addDays(a.last, k * a.avg);
      const n = diff(start, key) + 1;
      if (k === 0 && fertOn) { if (fertileDays(a).includes(n)) out.fert = true; }
      if (k > 0) {
        if (key > today && n >= 1 && n <= a.bleedAvg) out.pred = true;
        if (fertOn && key > today && n >= a.avg - LUTEAL - FERTILE_DAYS + 1 && n <= a.avg - LUTEAL) out.fert = true;
      }
    }
    if (key <= today && !(key >= a.last)) out.fert = false; // vergangene Zyklen: keine nachträgliche Schätzung
    return out;
  }
  function calendar(a) {
    const today = todayKey();
    const month = ui.cyMonth || today.slice(0, 7);
    const [y, m] = month.split('-').map(Number);
    const first = new Date(y, m - 1, 1);
    const pad = (first.getDay() + 6) % 7;
    const dim = new Date(y, m, 0).getDate();
    const cells = [];
    for (let i = 0; i < pad; i++) cells.push('<span></span>');
    for (let d = 1; d <= dim; d++) {
      const key = keyOf(new Date(y, m - 1, d));
      const s = dayInfo(a, key, today);
      const cls = ['cy-day', s.bleed >= 2 ? 'bleed' : s.bleed === 1 ? 'spot' : '', s.pred ? 'pred' : '', s.fert ? 'fert' : '', key === today ? 'today' : ''].filter(Boolean).join(' ');
      const label = `${deDate(key)}${s.bleed >= 2 ? ', Blutung' : s.bleed === 1 ? ', Schmierblutung' : ''}${s.pred ? ', Periode erwartet' : ''}${s.fert ? ', fruchtbar geschätzt' : ''}${s.entry ? ', Eintrag' : ''}${key === today ? ', heute' : ''}`;
      cells.push(key > today
        ? `<span class="${cls} future" aria-label="${label}">${d}</span>`
        : `<a class="${cls}" href="#/zyklus/tag/${key}" aria-label="${label}">${d}${s.entry ? '<i></i>' : ''}</a>`);
    }
    const title = first.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
    return `<section class="card cy-cal">
      <div class="cy-month"><button class="icon-btn" data-action="cy-month" data-d="-1" aria-label="Vormonat">${ICONS.back}</button><h2>${title}</h2><button class="icon-btn flip" data-action="cy-month" data-d="1" aria-label="Nächster Monat">${ICONS.back}</button></div>
      <div class="cy-grid cy-wd">${['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((w) => `<span>${w}</span>`).join('')}</div>
      <div class="cy-grid">${cells.join('')}</div>
      <div class="cy-keys small muted"><span><i class="k bleed"></i>Blutung</span><span><i class="k pred"></i>erwartet</span>${showFertile() ? '<span><i class="k fert"></i>fruchtbar (geschätzt)</span>' : ''}<span><i class="k dot"></i>Eintrag</span></div>
    </section>`;
  }
  function lengthChart(a) {
    const ls = a.lengths.slice(-6);
    if (!ls.length) return '';
    const W = 320, H = 150, top = 14, base = 120, maxV = Math.max(45, ...ls);
    const Y = (v) => base - (v / maxV) * (base - top);
    const bw = 30, gap = (W - 30 - ls.length * bw) / (ls.length + 1);
    const bars = ls.map((n, i) => {
      const x = 30 + gap + i * (bw + gap);
      const ok = n >= 24 && n <= 38;
      return `<rect x="${x.toFixed(1)}" y="${Y(n).toFixed(1)}" width="${bw}" height="${(base - Y(n)).toFixed(1)}" rx="6" fill="${ok ? '#C2551F' : '#8A7666'}"/><text x="${(x + bw / 2).toFixed(1)}" y="${(Y(n) - 4).toFixed(1)}" text-anchor="middle" font-size="12" font-weight="800" fill="#3B2A20">${n}</text>`;
    }).join('');
    return `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Länge der letzten ${ls.length} Zyklen: ${ls.join(', ')} Tage">
      <rect x="30" y="${Y(38).toFixed(1)}" width="${W - 30}" height="${(Y(24) - Y(38)).toFixed(1)}" fill="#E3F0E6"/>
      <text x="26" y="${(Y(38) + 4).toFixed(1)}" text-anchor="end" font-size="11" font-weight="700" fill="#6B5444">38</text>
      <text x="26" y="${(Y(24) + 4).toFixed(1)}" text-anchor="end" font-size="11" font-weight="700" fill="#6B5444">24</text>
      <line x1="30" y1="${base}" x2="${W}" y2="${base}" stroke="#E2CFBF" stroke-width="1.5"/>${bars}
      <text x="30" y="${base + 20}" font-size="11" font-weight="700" fill="#6B5444">grün: normaler Bereich 24 bis 38 Tage [12]</text></svg>`;
  }
  function tempChart(a) {
    if (!a.last) return '';
    const days = cy().days;
    const today = todayKey();
    const pts = [];
    for (let d = 1; d <= a.dayNo; d++) { const e = days[addDays(a.last, d - 1)]; if (e && e.temp) pts.push({ d, t: e.temp, off: !!e.tempOff }); }
    if (!pts.length) return '';
    const len = Math.max(a.avg, a.dayNo);
    const ts = pts.map((p) => p.t);
    const lo = Math.floor((Math.min(...ts) - 0.1) * 10) / 10, hi = Math.ceil((Math.max(...ts) + 0.1) * 10) / 10;
    const W = 320, H = 170, L = 36, R = 312, T = 12, B = 140;
    const X = (d) => L + ((d - 1) / Math.max(1, len - 1)) * (R - L);
    const Y = (t) => B - ((t - lo) / (hi - lo)) * (B - T);
    const good = pts.filter((p) => !p.off);
    const line = good.length > 1 ? `<polyline points="${good.map((p) => `${X(p.d).toFixed(1)},${Y(p.t).toFixed(1)}`).join(' ')}" fill="none" stroke="#C2551F" stroke-width="2.5" stroke-linejoin="round"/>` : '';
    const dots = pts.map((p) => `<circle cx="${X(p.d).toFixed(1)}" cy="${Y(p.t).toFixed(1)}" r="${p.off ? 4 : 3.5}" fill="${p.off ? '#FFFFFF' : '#C2551F'}" stroke="#C2551F" stroke-width="2"/>`).join('');
    let per = '';
    for (let d = 1; d <= a.dayNo; d++) if (isBleed(days[addDays(a.last, d - 1)])) per += `<rect x="${(X(d) - (R - L) / len / 2).toFixed(1)}" y="${T}" width="${((R - L) / len).toFixed(1)}" height="${B - T}" fill="#FBE0DD"/>`;
    const grid = [lo, (lo + hi) / 2, hi].map((v) => `<line x1="${L}" y1="${Y(v).toFixed(1)}" x2="${R}" y2="${Y(v).toFixed(1)}" stroke="#F1E3D6"/><text x="${L - 4}" y="${(Y(v) + 4).toFixed(1)}" text-anchor="end" font-size="10" font-weight="700" fill="#6B5444">${v.toFixed(1).replace('.', ',')}</text>`).join('');
    const tl = cy().todayLine ? `<line x1="${X(a.dayNo).toFixed(1)}" y1="${T}" x2="${X(a.dayNo).toFixed(1)}" y2="${B + 4}" stroke="${RED}" stroke-width="2.5"/><text x="${X(a.dayNo).toFixed(1)}" y="${B + 18}" text-anchor="middle" font-size="11" font-weight="900" fill="${RED}">heute</text>` : '';
    return `<section class="card"><h3>Basaltemperatur</h3>
      <svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Basaltemperatur in diesem Zyklus, ${pts.length} Messungen">${per}${grid}${line}${dots}${tl}
        <text x="${L}" y="${B + 18}" font-size="11" font-weight="700" fill="#6B5444">Tag 1</text></svg>
      <div class="small muted">Leere Punkte: Messung mit Störung, nicht verbunden. Nach dem Eisprung liegt die Temperatur 0,3 bis 0,7 °C höher [5]. Das zeigt einen Eisprung im Nachhinein, nicht vorher.</div></section>`;
  }
  function viewKalender() {
    const a = analysis();
    const ls = a.usable;
    const stats = a.own ? `<div class="cy-stats">
        <div><b>${a.avg}</b><span>Tage im Mittel</span></div>
        <div><b>${a.min === a.max ? a.min : `${a.min}–${a.max}`}</b><span>Spanne</span></div>
        <div><b>${a.bleedAvg}</b><span>Tage Blutung</span></div>
        <div><b>${ls.length}</b><span>${ls.length === 1 ? 'Zyklus' : 'Zyklen'}</span></div></div>` : '';
    const figo = a.own ? `<div class="small muted">Als normal gelten 24 bis 38 Tage, Schwankungen zwischen den Zyklen bis 7 bis 9 Tage und bis zu 8 Tage Blutung [12]. ${a.max - a.min > 9 ? 'Deine Zyklen schwanken stärker. Sprich das gern bei deiner Ärztin an.' : ''}</div>` : '';
    return `<main class="screen with-nav">
      <a class="back" href="#/heute">${ICONS.back}Heute</a>
      <div class="info-head"><h1>Zyklus</h1><a class="info-btn" href="#/zyklus/wissen" aria-label="Wissen über den Zyklus">i</a></div>
      ${a.last ? `<p class="cy-sub">Zyklustag ${a.dayNo} · ${esc(nextText(a))}</p>` : '<p class="small muted">Tipp auf den ersten Tag deiner letzten Periode und trag die Blutung ein.</p>'}
      ${hormonal() && cy().fert ? '<div class="hint small">Mit hormoneller Verhütung sagen die Kalendertage nichts über einen Eisprung aus, deshalb blende ich die fruchtbaren Tage aus.</div>' : ''}
      ${calendar(a)}
      <a class="btn" href="#/zyklus/tag/${todayKey()}">+ Heute eintragen</a>
      ${a.lengths.length ? `<section class="card"><h3>Deine Zyklen</h3>${stats}${lengthChart(a)}${figo}</section>` : ''}
      ${cy().track.temp ? tempChart(a) : ''}
      <section class="card set-list"><a href="#/zyklus/wissen"><span>Wissen: Hormone, Schleim, Muttermund<span class="small muted">mit Diagrammen und Quellen</span></span><span aria-hidden="true">›</span></a>
        <a href="#/zyklus/einstellungen"><span>Einstellungen</span><span aria-hidden="true">›</span></a></section>
      <p class="small muted">Die Vorhersage rechnet mit deinen letzten ${a.own ? Math.min(6, ls.length) : 0} Zyklen. Sie ist keine Verhütung.</p>
    </main>${api.nav('heute')}`;
  }

  // ---------- Eintragen ----------
  function viewTag(key) {
    const today = todayKey();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(key || '') || key > today) key = today;
    const c = cy();
    const e = c.days[key] || {};
    const tr = c.track;
    const chip = (act, attrs, label) => `<button class="chip" ${attrs} aria-pressed="${!!act}">${esc(label)}</button>`;
    const group = (g) => {
      if (!tr[g]) return '';
      if (g === 'pill' && c.method !== 'pille') return '';
      return `<section class="card cy-group"><h3>${GROUP_TITLE[g]}</h3>${GROUP_HINT[g] ? `<div class="small muted">${GROUP_HINT[g]}</div>` : ''}
        ${PICKS[g].map(([f, label, opts, cols]) => `${label ? `<div class="cy-lab">${label}</div>` : ''}<div class="cy-opts" style="grid-template-columns:repeat(${cols},minmax(0,1fr))">${opts.map((o) => chip(e[f] === o, `data-action="cy-pick" data-f="${f}" data-v="${esc(o)}"`, o)).join('')}</div>`).join('')}</section>`;
    };
    const multi = (f, title, list) => `<section class="card cy-group"><h3>${title}</h3><div class="chips">${list.map((o) => chip((e[f] || []).includes(o), `data-action="cy-multi" data-f="${f}" data-v="${esc(o)}"`, o)).join('')}</div></section>`;
    const prev = addDays(key, -1), next = addDays(key, 1);
    return `<main class="screen with-nav cy-entry">
      <a class="back" href="#/zyklus">${ICONS.back}Kalender</a>
      <div class="cy-month"><a class="icon-btn" href="#/zyklus/tag/${prev}" aria-label="Tag davor">${ICONS.back}</a>
        <h1>${key === today ? 'Heute' : esc(deDate(key, { weekday: 'short', day: 'numeric', month: 'long' }))}</h1>
        ${next <= today ? `<a class="icon-btn flip" href="#/zyklus/tag/${next}" aria-label="Tag danach">${ICONS.back}</a>` : '<span class="icon-btn" aria-hidden="true"></span>'}</div>
      <section class="card cy-group"><h3>Blutung</h3><div class="cy-opts cy-bleed" style="grid-template-columns:repeat(4,minmax(0,1fr))">${BLEED.map(([v, label]) => chip(e.bleed === v, `data-action="cy-bleed" data-v="${v}"`, label)).join('')}</div></section>
      ${tr.temp ? `<section class="card cy-group"><h3>Basaltemperatur</h3>
        <div class="input-row"><input class="input" type="text" inputmode="decimal" placeholder="z. B. 36,45" data-cy="temp" value="${e.temp ? e.temp.toFixed(2).replace('.', ',') : ''}" aria-label="Temperatur in Grad Celsius"><span class="cy-unit">°C</span></div>
        <label class="fit-row cy-off"><input type="checkbox" data-cy="tempOff" ${e.tempOff ? 'checked' : ''}><span class="small">Störung (schlecht geschlafen, krank, Alkohol, andere Uhrzeit)</span></label></section>` : ''}
      ${['pain', 'cm', 'cervix', 'sex', 'pill', 'tests'].map(group).join('')}
      ${tr.body ? multi('body', 'Körper', BODY) : ''}
      ${tr.mood ? multi('mood', 'Stimmung', MOOD) : ''}
      ${tr.note ? `<section class="card cy-group"><h3>Notiz</h3><textarea class="input" rows="3" maxlength="1000" data-cy="note" aria-label="Notiz">${esc(e.note || '')}</textarea></section>` : ''}
      <a class="btn" href="#/${ui.cyBack || 'heute'}">Fertig</a>
      <a class="link-btn" href="#/zyklus/einstellungen">Was ich tracke ändern</a>
    </main>${api.nav('heute')}`;
  }
  function setField(key, f, v) {
    const c = cy();
    const e = { ...(c.days[key] || {}) };
    if (v === undefined || v === null || v === '' || (Array.isArray(v) && !v.length)) delete e[f]; else e[f] = v;
    delete e.imp;
    if (Object.keys(e).length) c.days[key] = e; else delete c.days[key];
  }
  const entryKey = () => { const p = location.hash.split('/'); return p[1] === 'zyklus' && p[2] === 'tag' && p[3] ? p[3] : todayKey(); };

  // ---------- Wissen ----------
  const REFS = [
    ['Mihm M, Gangooly S, Muttukrishna S. The normal menstrual cycle in women. Animal Reproduction Science 124 (2011) 229–236.', '10.1016/j.anireprosci.2010.08.030'],
    ['Stricker R et al. Establishment of detailed reference values for LH, FSH, estradiol, and progesterone during different phases of the menstrual cycle. Clin Chem Lab Med 44 (2006) 883–887.', '10.1515/CCLM.2006.160'],
    ['Anckaert E et al. Extensive monitoring of the natural menstrual cycle using the serum biomarkers estradiol, luteinizing hormone and progesterone. Practical Laboratory Medicine 25 (2021) e00211.', '10.1016/j.plabm.2021.e00211'],
    ['Bull JR et al. Real-world menstrual cycle characteristics of more than 600,000 menstrual cycles. npj Digital Medicine 2 (2019) 83.', '10.1038/s41746-019-0152-7'],
    ['Baker FC, Siboza F, Fuller A. Temperature regulation in women: Effects of the menstrual cycle. Temperature 7 (2020) 226–262.', '10.1080/23328940.2020.1735927'],
    ['Wilcox AJ, Weinberg CR, Baird DD. Timing of sexual intercourse in relation to ovulation. N Engl J Med 333 (1995) 1517–1521.', '10.1056/NEJM199512073332301'],
    ['Najmabadi S et al. Cervical mucus patterns and the fertile window in women without known subfertility: a pooled analysis of three cohorts. Human Reproduction 36 (2021) 1784–1795.', '10.1093/humrep/deab049'],
    ['Ecochard R et al. Self-identification of the clinical fertile window and the ovulation period. Fertility and Sterility 103 (2015) 1319–1325.', '10.1016/j.fertnstert.2015.01.031'],
    ['Fehring RJ. Methods used to self-predict ovulation. A comparative study. JOGNN 19 (1990) 233–237.', '10.1111/j.1552-6909.1990.tb01642.x'],
    ['Bigelow JL et al. Mucus observations in the fertile window: a better predictor of conception than timing of intercourse. Human Reproduction 19 (2004) 889–892.', '10.1093/humrep/deh173'],
    ['Parenteau-Carreau S, Infante-Rivard C. Self-palpation to assess cervical changes in relation to mucus and temperature. International Journal of Fertility 33 Suppl (1988) 10–16.', 'pubmed:2902020'],
    ['Munro MG, Critchley HOD, Fraser IS; FIGO Menstrual Disorders Committee. The two FIGO systems for normal and abnormal uterine bleeding symptoms and classification of causes of abnormal uterine bleeding in the reproductive years: 2018 revisions. Int J Gynaecol Obstet 143 (2018) 393–408.', '10.1002/ijgo.12666']
  ];
  const TEXTS = {
    hormone: ['Was in den Phasen passiert', [
      ['Periode und frühe Follikelphase', 'Schon gegen Ende des vorigen Zyklus steigt FSH an, etwa 4 Tage vor der Blutung. FSH weckt eine Gruppe von Eibläschen (Follikeln) im Eierstock [1].'],
      ['Ein Follikel setzt sich durch', 'Etwa eine Woche vor dem Eisprung wird ein Follikel zum führenden. Er bildet immer mehr Östradiol, FSH sinkt dabei langsam ab [1].'],
      ['LH-Gipfel und Eisprung', 'Der steile Östradiol-Anstieg löst den LH-Anstieg aus. Der dauert 48 bis 54 Stunden, der Eisprung folgt etwa 38 Stunden nach seinem Beginn [1]. Ein Eisprungtest misst dieses LH im Urin.'],
      ['Lutealphase', 'Aus dem Follikel wird der Gelbkörper. Er bildet Progesteron (Gipfel etwa 6 Tage nach dem Eisprung) und wieder etwas Östradiol [1][3]. Ohne Schwangerschaft bildet er sich zurück, die Hormone fallen und die nächste Periode beginnt.'],
      ['Wie lang die Phasen sind', 'In über 600.000 Zyklen dauerte die Follikelphase im Mittel 16,9 Tage, stark schwankend (95 % zwischen 10 und 30). Die Lutealphase war mit 12,4 Tagen (7 bis 17) beständiger [4].'],
      ['Basaltemperatur', 'Nach dem Eisprung liegt die Ruhetemperatur 0,3 bis 0,7 °C höher, solange Progesteron hoch ist. Damit lässt sich ein Eisprung im Nachhinein erkennen, nicht vorhersagen [5].']]],
    mucus: ['So verändert sich der Zervixschleim', [
      ['Vor dem Eisprung: mehr und flüssiger', 'Steigendes Östrogen lässt mehr Schleim entstehen und verbessert seine Qualität: von trocken über feucht und cremig bis glasig und dehnbar [7].'],
      ['Höhepunkt', 'Der letzte Tag mit dieser besten Qualität heißt Höhepunkt (Peak-Tag). In einer Studie lag der LH-Anstieg in 28 von 29 Zyklen 0 bis 3 Tage vor diesem Tag [9].'],
      ['Nach dem Eisprung: abrupter Wechsel', 'Wenn Progesteron steigt, geht die Schleimbildung abrupt zurück [7].'],
      ['Wie lange und wie verlässlich', 'In 2.488 Zyklen gab es im Mittel 6,4 Tage mit Schleim bester Qualität (Median 6). Bei 72 % der Frauen schwankte das zwischen ihren Zyklen um mehr als 3 Tage [7]. Die Tage mit bestem Schleim trafen in 96 % der Zyklen mindestens einen der 6 fruchtbaren Tage, deckten aber nur in 6 % alle 6 ab [8].'],
      ['Schleim und Empfängnis', 'Je besser die Schleimqualität an einem Tag, desto höher war die Chance auf eine Schwangerschaft an diesem Tag [10].']]],
    cervix: ['So verändert sich der Muttermund', [
      ['Unter Östrogen', 'Vor dem Eisprung wird der Muttermund hoch, offen, weich und gerade [11].'],
      ['Unter Progesteron', 'Danach wird er schnell wieder tief, geschlossen und fest und liegt an der Scheidenwand an [11].'],
      ['Zeitlicher Ablauf', 'In 215 Zyklusblättern lag der fruchtbarste Muttermund im Mittel 0,48 Tage nach dem Schleim-Höhepunkt (Spanne 3 Tage davor bis 6 Tage danach). Die Rückkehr zu „unfruchtbar“ kam im Mittel 0,69 Tage vor der ersten hohen Temperatur und dauerte 1 bis 7 Tage (Mittel 2,65) [11].'],
      ['Wie gut belegt', 'Zum Muttermund gibt es viel weniger Forschung als zu Schleim und Temperatur. Die Studie ist von 1988, und die Autorinnen nennen unerfahrene Anwenderinnen als Fehlerquelle [11].']]]
  };
  const NOTES = {
    hormone: 'Schematisch für einen 28-Tage-Zyklus. Jede Kurve ist auf ihren eigenen Höchstwert skaliert, die Höhen sind nicht vergleichbar. Form nach [1], [2] und [3].',
    mucus: 'Schematisch für einen 28-Tage-Zyklus nach [7], [8] und [9]. Bei dir können Länge und Reihenfolge abweichen.',
    cervix: 'Schematisch für einen 28-Tage-Zyklus nach [11]. Die drei Merkmale Lage, Festigkeit und Öffnung sind zu einer Kurve zusammengefasst.'
  };
  const HORMONES = [
    { key: 'fsh', short: 'FSH', color: '#6B5444', w: 2.5, dash: '2 4', pts: [[-14, .62], [-11, .55], [-7, .42], [-3, .3], [-1, .45], [0, .7], [1, .45], [3, .28], [8, .22], [12, .32], [14, .6]] },
    { key: 'lh', short: 'LH', color: '#C2551F', w: 2.5, dash: '7 4', pts: [[-14, .26], [-8, .28], [-3, .32], [-1, .5], [0, 1], [1, .45], [3, .32], [8, .24], [14, .22]] },
    { key: 'e2', short: 'Östradiol', color: '#A33A55', w: 3, dash: '', pts: [[-14, .14], [-9, .17], [-5, .35], [-2, .75], [-1, 1], [0, .8], [2, .4], [6, .58], [9, .62], [12, .45], [14, .18]] },
    { key: 'p4', short: 'Progesteron', color: '#2F5D8A', w: 3, dash: '', pts: [[-14, .02], [-3, .02], [0, .06], [2, .3], [4, .68], [7, 1], [10, .72], [12, .45], [14, .08]] }
  ];
  function schemaChart(tab, todaySchema) {
    // x: LH-Gipfel = Tag 0; Periodenbeginn = -14, nächste Periode = +14
    const X = (d) => 8 + (d + 14) / 28 * 302;
    const Y = (v) => 186 - v * 156;
    const curve = (pts) => {
      const p = pts.map((q) => [X(q[0]), Y(q[1])]);
      let d = `M${p[0][0].toFixed(1)},${p[0][1].toFixed(1)}`;
      for (let i = 0; i < p.length - 1; i++) {
        const p0 = p[i - 1] || p[i], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2] || p2;
        const c1 = [p1[0] + (p2[0] - p0[0]) / 6, Math.min(186, p1[1] + (p2[1] - p0[1]) / 6)];
        const c2 = [p2[0] - (p3[0] - p1[0]) / 6, Math.min(186, p2[1] - (p3[1] - p1[1]) / 6)];
        d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
      }
      return d;
    };
    let body = '';
    if (tab === 'hormone') {
      const vis = ui.cyHorm || {};
      body = HORMONES.filter((h) => vis[h.key] !== false).map((h) => `<path d="${curve(h.pts)}" fill="none" stroke="${h.color}" stroke-width="${h.w}" stroke-dasharray="${h.dash || 'none'}" stroke-linecap="round"/>`).join('');
    } else if (tab === 'mucus') {
      const levels = { '-9': 0, '-8': 0, '-7': 0, '-6': 0, '-5': 1, '-4': 1, '-3': 2, '-2': 2, '-1': 3, 0: 3, 1: 3 };
      const yl = [178, 147, 104, 61];
      let bars = '';
      for (let d = -9; d <= 14; d++) {
        const y0 = yl[levels[d] ?? 0], x0 = X(d - 0.5) + 1, x1 = X(d + 0.5) - 1;
        bars += `M${x0.toFixed(1)},186 L${x0.toFixed(1)},${y0} L${x1.toFixed(1)},${y0} L${x1.toFixed(1)},186 Z `;
      }
      body = `${[61, 104, 147].map((y) => `<line x1="8" y1="${y}" x2="310" y2="${y}" stroke="#F1E3D6"/>`).join('')}<path d="${bars}" fill="#2F5D8A" opacity="0.85"/>
        <text x="10" y="56" font-size="11" font-weight="800" fill="#2F5D8A">glasig, spinnbar</text><text x="10" y="99" font-size="11" font-weight="800" fill="#2F5D8A">cremig</text>
        <text x="10" y="142" font-size="11" font-weight="800" fill="#2F5D8A">feucht</text><text x="10" y="186" font-size="11" font-weight="800" fill="#6B5444">trocken, nichts</text>`;
    } else {
      const d = curve([[-14, .05], [-6, .05], [-4, .22], [-2, .58], [0, .88], [1.5, 1], [3, .45], [4.5, .08], [8, .05], [14, .05]]);
      body = `<path d="${d} L${X(14).toFixed(1)},186 L${X(-14).toFixed(1)},186 Z" fill="#DCE8C8"/><path d="${d}" fill="none" stroke="#3E6B3A" stroke-width="3" stroke-linecap="round"/>
        <text x="10" y="38" font-size="11" font-weight="800" fill="#3E6B3A">hoch, weich, offen</text><text x="10" y="186" font-size="11" font-weight="800" fill="#6B5444">tief, fest, geschlossen</text>`;
    }
    const tl = todaySchema === null ? '' : `<line x1="${X(todaySchema).toFixed(1)}" y1="22" x2="${X(todaySchema).toFixed(1)}" y2="198" stroke="${RED}" stroke-width="2.5"/>
      <rect x="${(X(todaySchema) - 22).toFixed(1)}" y="196" width="44" height="18" rx="9" fill="${RED}"/><text x="${X(todaySchema).toFixed(1)}" y="209" text-anchor="middle" font-size="11" font-weight="900" fill="#FFFFFF">heute</text>`;
    return `<svg viewBox="0 0 318 250" width="100%" role="img" aria-label="Schematischer Verlauf im Zyklus${todaySchema === null ? '' : ', rote Linie bei heute'}">
      <rect x="${X(-14).toFixed(1)}" y="22" width="${(X(-9) - X(-14)).toFixed(1)}" height="170" fill="#FBE0DD"/>
      <rect x="${X(-4.5).toFixed(1)}" y="22" width="${(X(1.5) - X(-4.5)).toFixed(1)}" height="170" fill="#E2F1F1"/>
      <line x1="${X(1).toFixed(1)}" y1="22" x2="${X(1).toFixed(1)}" y2="192" stroke="#3B2A20" stroke-width="1.5" stroke-dasharray="3 3"/>
      <text x="${((X(-14) + X(-9)) / 2).toFixed(1)}" y="16" text-anchor="middle" font-size="11" font-weight="800" fill="${RED}">Periode</text>
      <text x="${X(1).toFixed(1)}" y="16" text-anchor="middle" font-size="11" font-weight="800" fill="#3B2A20">Eisprung</text>
      ${body}${tl}
      <line x1="8" y1="192" x2="310" y2="192" stroke="#E2CFBF" stroke-width="1.5"/>
      <text x="8" y="208" font-size="11" font-weight="700" fill="#6B5444">Tag 1</text><text x="310" y="208" text-anchor="end" font-size="11" font-weight="700" fill="#6B5444">nächste Periode</text>
      <text x="${((X(-14) + X(0.5)) / 2).toFixed(1)}" y="236" text-anchor="middle" font-size="12" font-weight="900" fill="#3B2A20">Follikelphase</text>
      <text x="${((X(1) + X(14)) / 2).toFixed(1)}" y="236" text-anchor="middle" font-size="12" font-weight="900" fill="#3B2A20">Lutealphase</text></svg>`;
  }
  function viewWissen() {
    const tab = ['hormone', 'mucus', 'cervix'].includes(ui.cyTab) ? ui.cyTab : 'hormone';
    const a = active() ? analysis() : { last: null };
    // Heute auf das 28-Tage-Schema legen: mit positivem LH-Test daran ausgerichtet, sonst nach Anteil am eigenen Zyklus
    let pos = null;
    if (a.last && cy().todayLine && !paused()) {
      pos = a.ovuSure ? (a.dayNo - a.ovu) + 1 : -14 + (a.dayNo - 1) / Math.max(a.avg, a.dayNo) * 28;
      pos = Math.max(-14, Math.min(14, pos));
    }
    const [title, texts] = TEXTS[tab];
    const vis = ui.cyHorm || {};
    return `<main class="screen with-nav">
      <a class="back" href="#/${active() ? 'zyklus' : 'ich'}">${ICONS.back}Zurück</a>
      <h1>Dein Zyklus</h1>
      <div class="cy-tabs" role="tablist" aria-label="Thema">${[['hormone', 'Hormone'], ['mucus', 'Schleim'], ['cervix', 'Muttermund']].map(([k, l]) => `<button role="tab" class="chip" data-action="cy-tab" data-k="${k}" aria-selected="${tab === k}" aria-pressed="${tab === k}">${l}</button>`).join('')}</div>
      <section class="card cy-chart">
        ${tab === 'hormone' ? `<div class="chips" role="group" aria-label="Kurven ein- und ausblenden">${HORMONES.map((h) => `<button class="chip cy-hchip" data-action="cy-horm" data-k="${h.key}" aria-pressed="${vis[h.key] !== false}"><i style="border-top:3px ${h.dash ? (h.key === 'fsh' ? 'dotted' : 'dashed') : 'solid'} ${h.color}"></i>${h.short}</button>`).join('')}</div>` : ''}
        ${schemaChart(tab, pos)}
        <div class="cy-keys small muted"><span><i class="k fert"></i>fruchtbare Tage [6]</span>${pos === null ? '' : `<span><i class="k line"></i>heute, Zyklustag ${a.dayNo}</span>`}</div>
        <div class="small muted">${NOTES[tab]}</div>
      </section>
      <section class="card cy-texts"><h2>${title}</h2>${texts.map(([h, t]) => `<div><h3>${h}</h3><p>${t}</p></div>`).join('')}</section>
      <div class="hint small">Die rote Linie legt deinen heutigen Tag auf das Lehrbuch-Schema. Sobald du einen positiven Eisprungtest einträgst, richte ich sie danach aus. Das ist Wissen, keine Diagnose und keine Verhütung.</div>
      <section class="card"><h2>Quellen (alle peer-reviewed)</h2><ol class="src-list cy-refs">${REFS.map(([t, id]) => `<li>${esc(t)} <a href="${id.startsWith('pubmed:') ? `https://pubmed.ncbi.nlm.nih.gov/${id.slice(7)}/` : `https://doi.org/${id}`}" target="_blank" rel="noopener">${id.startsWith('pubmed:') ? `PubMed ${id.slice(7)}` : `doi:${id}`}</a></li>`).join('')}</ol></section>
    </main>${api.nav('heute')}`;
  }

  // ---------- Einstellungen (Ich → Zyklus) ----------
  function ichRow() {
    if (!available()) return '';
    const c = cy();
    const n = TRACK.filter(([k]) => c.track[k]).length;
    return `<a href="#/zyklus/einstellungen"><span>Zyklus<span class="small muted">${c.on ? `Karte auf Heute · ${n} von ${TRACK.length} getrackt` : 'aus'}</span></span><span aria-hidden="true">›</span></a>`;
  }
  function viewEinstellungen() {
    const c = cy();
    const tg = (k, label, hint) => `<label class="fit-row cy-tg"><span>${label}${hint ? `<span class="small muted">${hint}</span>` : ''}</span><input type="checkbox" role="switch" data-cy-set="${k}" ${c[k] ? 'checked' : ''}></label>`;
    const days = Object.keys(c.days).length;
    return `<main class="screen with-nav">
      <a class="back" href="#/ich">${ICONS.back}Ich</a>
      <h1>Zyklus</h1>
      ${available() ? '' : '<div class="hint small">Der Zyklus erscheint, wenn du unter „Name und Alter“ bei „Hast du deine Regel?“ Ja wählst.</div>'}
      <h2>Allgemein</h2>
      <section class="card toggles">
        ${tg('on', 'Zyklus im Rezeptbuch', 'Karte auf Heute mit Kreis und Kalender')}
        ${tg('fert', 'Fruchtbare Tage zeigen', 'Geschätzt aus deinen Zykluslängen, nicht zur Verhütung')}
        ${tg('todayLine', 'Rote Linie „heute“ in Diagrammen')}
        <div class="small muted">Die Vorhersage rechnet mit deinen letzten 6 Zyklen.</div>
      </section>
      <h2>Verhütung</h2>
      <section class="card"><div class="chips">${METHODS.map(([k, l]) => `<button class="chip" data-action="cy-method" data-k="${k}" aria-pressed="${c.method === k}">${esc(l)}</button>`).join('')}</div>
        <div class="small muted">Bei Pille fragt „Eintragen“ nach der Pille. Mit hormoneller Verhütung blende ich die fruchtbaren Tage aus.</div></section>
      <h2>Lebensphase</h2>
      <section class="card"><div class="chips">${PHASES.map(([k, l]) => `<button class="chip" data-action="cy-phase" data-k="${k}" aria-pressed="${c.phase === k}">${l}</button>`).join('')}</div>
        <div class="small muted">Schwangerschaft, Stillzeit und Wechseljahre pausieren die Vorhersagen.</div></section>
      <h2>Was ich tracke</h2>
      <section class="card"><div class="chips">${TRACK.map(([k, l]) => `<button class="chip" data-action="cy-track" data-k="${k}" aria-pressed="${!!c.track[k]}">${l}</button>`).join('')}</div>
        <div class="small muted">Ausgeschaltetes erscheint beim Eintragen gar nicht. Die Blutung ist immer da.</div></section>
      <h2>Daten</h2>
      <section class="card cy-data">
        <p class="small muted">Alles bleibt auf dem Handy. Die Zyklusdaten sind Teil deines normalen Backups (Ich → Backup).</p>
        <h3>Alte Daten übernehmen</h3>
        <div class="small muted">Kalenderdatei (.ics) oder Tabelle (.csv, .txt) mit einem Datum pro Zeile, z. B. 03.09.2026 oder 2026-09-03. Bei Kalendereinträgen über mehrere Tage zählt jeder Tag als Blutung.</div>
        <label class="btn secondary small-btn">Datei wählen<input type="file" id="cy-file" accept=".ics,.csv,.txt,text/calendar,text/csv,text/plain" hidden></label>
        <div class="small muted">Oder von Hand: erster Tag einer Periode</div>
        <div class="input-row"><input class="input" type="date" max="${todayKey()}" data-cy="startDate" aria-label="Erster Tag der Periode"><button class="btn small-btn" data-action="cy-add-start">Hinzufügen</button></div>
        ${ui.cyMsg ? `<div class="small" style="color:var(--accent-text)" role="status">${esc(ui.cyMsg)}</div>` : ''}
        <div class="small muted">${days ? `${days} Tage mit Einträgen gespeichert.` : 'Noch keine Einträge.'}</div>
      </section>
      <section class="card set-list"><a href="#/zyklus/wissen"><span>Wissen und Quellen</span><span aria-hidden="true">›</span></a></section>
      <div class="danger-zone">${ui.cyConfirm
        ? `<p class="small" style="text-align:center">Wirklich alle Zyklusdaten löschen? Das geht nicht rückgängig, außer mit einem Backup.</p>
           <div class="input-row"><button class="btn secondary" data-action="cy-del-no">Abbrechen</button><button class="btn dark" data-action="cy-del-yes">Ja, löschen</button></div>`
        : (days ? '<button class="link-btn danger" data-action="cy-del-ask">Zyklusdaten löschen …</button>' : '')}</div>
    </main>${api.nav('ich')}`;
  }

  // ---------- Import ----------
  function parseDates(text) {
    const out = new Set();
    const ymd = (y, m, d) => { const dt = new Date(+y, +m - 1, +d); return dt.getFullYear() === +y && dt.getMonth() === +m - 1 ? keyOf(dt) : null; };
    if (/BEGIN:VEVENT/.test(text)) {
      const unfolded = text.replace(/\r?\n[ \t]/g, '');
      for (const ev of unfolded.split('BEGIN:VEVENT').slice(1)) {
        const s = /DTSTART[^:\n]*:(\d{4})(\d{2})(\d{2})/.exec(ev);
        if (!s) continue;
        const start = ymd(s[1], s[2], s[3]);
        if (!start) continue;
        const e = /DTEND[^:\n]*:(\d{4})(\d{2})(\d{2})/.exec(ev);
        const dateOnly = /DTSTART[^:\n]*VALUE=DATE[:;]/.test(ev) || /DTSTART[^:\n]*:\d{8}\s*$/m.test(ev);
        let end = e ? ymd(e[1], e[2], e[3]) : start;
        if (end && dateOnly && end > start) end = addDays(end, -1); // Ganztägig: Ende ist der Tag danach
        let n = 0;
        for (let k = start; k <= (end || start) && n < 14; k = addDays(k, 1), n++) out.add(k);
      }
      return [...out];
    }
    for (const line of text.split(/\r?\n/)) {
      const found = [];
      line.replace(/(\d{4})-(\d{1,2})-(\d{1,2})|(\d{1,2})\.(\d{1,2})\.(\d{2,4})|(\d{1,2})\/(\d{1,2})\/(\d{4})/g, (m0, y1, m1, d1, d2, m2, y2, d3, m3, y3) => {
        const k = y1 ? ymd(y1, m1, d1) : d2 ? ymd(y2.length === 2 ? '20' + y2 : y2, m2, d2) : ymd(y3, m3, d3);
        if (k) found.push(k);
        return m0;
      });
      if (found.length >= 2 && found[1] > found[0] && diff(found[0], found[1]) < 14) { for (let k = found[0]; k <= found[1]; k = addDays(k, 1)) out.add(k); }
      else if (found.length) out.add(found[0]);
    }
    return [...out];
  }
  function importDates(keys) {
    const c = cy();
    const today = todayKey();
    let n = 0;
    for (const k of keys) {
      if (k > today) continue;
      if (c.days[k] && c.days[k].bleed >= 2) continue;
      c.days[k] = { ...(c.days[k] || {}), bleed: 3, imp: 1 };
      n++;
    }
    return n;
  }

  // ---------- Aktionen ----------
  const actions = {
    'cy-month'(el) {
      const [y, m] = (ui.cyMonth || todayKey().slice(0, 7)).split('-').map(Number);
      const d = new Date(y, m - 1 + Number(el.dataset.d), 1);
      ui.cyMonth = keyOf(d).slice(0, 7);
    },
    'cy-bleed'(el) { const k = entryKey(); const v = Number(el.dataset.v); setField(k, 'bleed', (cy().days[k] || {}).bleed === v ? null : v); },
    'cy-pick'(el) { const k = entryKey(); const f = el.dataset.f; setField(k, f, (cy().days[k] || {})[f] === el.dataset.v ? null : el.dataset.v); },
    'cy-multi'(el) {
      const k = entryKey(); const f = el.dataset.f; const list = [...((cy().days[k] || {})[f] || [])];
      const i = list.indexOf(el.dataset.v); if (i >= 0) list.splice(i, 1); else list.push(el.dataset.v);
      setField(k, f, list);
    },
    'cy-tab'(el) { ui.cyTab = el.dataset.k; },
    'cy-horm'(el) { ui.cyHorm = { ...(ui.cyHorm || {}) }; ui.cyHorm[el.dataset.k] = ui.cyHorm[el.dataset.k] === false; },
    'cy-method'(el) { cy().method = el.dataset.k; },
    'cy-phase'(el) { cy().phase = el.dataset.k; },
    'cy-track'(el) { const c = cy(); c.track[el.dataset.k] = !c.track[el.dataset.k]; },
    'cy-add-start'() {
      const inp = document.querySelector('[data-cy="startDate"]');
      const v = inp && inp.value;
      if (!v || v > todayKey()) { ui.cyMsg = 'Bitte ein Datum bis heute wählen.'; return; }
      importDates([v]);
      ui.cyMsg = `Periodenbeginn am ${deDate(v, { day: 'numeric', month: 'long', year: 'numeric' })} eingetragen.`;
    },
    'cy-del-ask'() { ui.cyConfirm = true; },
    'cy-del-no'() { ui.cyConfirm = false; },
    'cy-del-yes'() { ui.cyConfirm = false; cy().days = {}; ui.cyMsg = 'Zyklusdaten gelöscht.'; }
  };

  // Felder ohne Knopf: Temperatur, Störung, Notiz, Einstellungs-Schalter, Datei
  function onChange(e) {
    const t = e.target;
    if (api.isRendering()) return false;
    if (t.dataset.cySet) { cy()[t.dataset.cySet] = t.checked; api.save(); api.render(); return true; }
    if (t.dataset.cy === 'temp') {
      const v = Number(String(t.value).replace(',', '.'));
      setField(entryKey(), 'temp', v >= 34 && v <= 42 ? Math.round(v * 100) / 100 : null);
      api.save(); return true;
    }
    if (t.dataset.cy === 'tempOff') { setField(entryKey(), 'tempOff', t.checked || null); api.save(); return true; }
    if (t.id === 'cy-file') {
      const f = t.files && t.files[0];
      if (!f) return true;
      const r = new FileReader();
      r.onload = () => {
        const keys = parseDates(String(r.result || ''));
        const n = importDates(keys);
        ui.cyMsg = keys.length ? `${n} Tage mit Blutung übernommen${keys.length > n ? `, ${keys.length - n} waren schon da oder liegen in der Zukunft` : ''}.` : 'In der Datei habe ich keine Daten gefunden.';
        api.save(); api.render();
      };
      r.readAsText(f);
      return true;
    }
    return false;
  }
  function onInput(e) {
    const t = e.target;
    if (t.dataset.cy !== 'note') return false;
    setField(entryKey(), 'note', t.value.trim() ? t.value.slice(0, 1000) : null);
    clearTimeout(onInput.t); onInput.t = setTimeout(api.save, 400);
    return true;
  }

  function view(a, b) {
    if (a === 'tag') return viewTag(b);
    if (a === 'wissen') return viewWissen();
    if (a === 'einstellungen') return viewEinstellungen();
    return viewKalender();
  }

  return { view, homeCard, ichRow, actions, onChange, onInput, available, active, analysis, parseDates, cy };
}
