/* Backup für Rezeptbuch und Tracker zusammen. Alle Daten liegen nur im Browser-Speicher dieses Geräts
   (localStorage), es gibt keinen Server. Deshalb: Export als Datei, Import aus der Datei, und eine Erinnerung,
   wenn sich seit dem letzten Export etwas geändert hat.
   Beim Schließen: Browser erlauben nur ihren eigenen, allgemeinen Dialog („Seite verlassen?“), und auf dem iPhone
   gar keinen. Deshalb fragt die App zusätzlich beim nächsten Öffnen bzw. Zurückkommen nach.
   Wird von index.html und tracker/index.html geladen, deshalb ein einfaches Skript ohne import. */
'use strict';
(function () {
  const KEYS = { rezeptbuch: 'rezeptbuch-v1', tracker: 'ct.v1' };
  const META = 'rezeptbuch-backup'; // { at, hash, remind }
  const FORMAT = 'rezeptbuch-backup';
  const AWAY_MS = 60 * 1000;   // so lange weg = App war zu
  const LATER_MS = 10 * 60 * 1000;

  const read = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const parse = (s) => { try { return JSON.parse(s); } catch (e) { return null; } };
  function meta() { return Object.assign({ at: null, hash: null, remind: true }, parse(read(META)) || {}); }
  function setMeta(m) { try { localStorage.setItem(META, JSON.stringify(Object.assign(meta(), m))); } catch (e) { /* voll */ } }

  // Fingerabdruck der Daten; Dinge, die sich ohne Zutun ändern (Datum des letzten Exports, angezeigte Idee), zählen nicht
  function fingerprint() {
    const rb = parse(read(KEYS.rezeptbuch)) || {};
    const ct = parse(read(KEYS.tracker)) || {};
    delete rb.pick; delete ct.lastBackup;
    const s = JSON.stringify(rb) + '|' + JSON.stringify(ct);
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0).toString(36) + ':' + s.length;
  }
  function hasData() {
    const rb = parse(read(KEYS.rezeptbuch)) || {};
    const ct = parse(read(KEYS.tracker)) || {};
    return !!(rb.onboarded || Object.keys(ct.days || {}).length || (ct.pantry || []).length);
  }
  function dirty() { return hasData() && meta().hash !== fingerprint(); }
  // Erinnern erst, wenn eingerichtet ist und es echte Einträge gibt (nicht schon beim allerersten Öffnen)
  function worthAsking() {
    const rb = parse(read(KEYS.rezeptbuch)) || {};
    const ct = parse(read(KEYS.tracker)) || {};
    const days = Object.values(ct.days || {}).some((d) => Array.isArray(d) && d.length);
    return !!(rb.onboarded && (days || (ct.pantry || []).length || Object.keys(rb.stamps || {}).length || (rb.ownRecipes || []).length));
  }

  function stamp() { return new Date().toISOString().slice(0, 10); }
  function payload() {
    return { format: FORMAT, v: 1, exported: new Date().toISOString(), rezeptbuch: parse(read(KEYS.rezeptbuch)), tracker: parse(read(KEYS.tracker)) };
  }
  // Datei über das Teilen-Menü (iPhone: „In Dateien sichern“) oder als Download. true = erledigt, false = abgebrochen.
  async function shareFile(obj, name) {
    const blob = new Blob([JSON.stringify(obj)], { type: 'application/json' });
    try {
      const file = new File([blob], name, { type: 'application/json' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: name }); return true; }
    } catch (e) { if (e && e.name === 'AbortError') return false; }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    return true;
  }
  async function exportAll() {
    const ok = await shareFile(payload(), `rezeptbuch-backup-${stamp()}.json`);
    if (!ok) return false;
    // Der Tracker hat eine eigene Erinnerung; die soll nach diesem Export auch Ruhe geben
    const ct = parse(read(KEYS.tracker));
    if (ct) { ct.lastBackup = Date.now(); try { localStorage.setItem(KEYS.tracker, JSON.stringify(ct)); } catch (e) { /* voll */ } }
    setMeta({ at: Date.now(), hash: fingerprint() });
    return true;
  }
  // Prüft eine Backup-Datei. Gibt { rezeptbuch, tracker } zurück (fehlende Teile null) oder null.
  function check(data) {
    if (!data || typeof data !== 'object') return null;
    if (data.format === FORMAT) {
      const rb = data.rezeptbuch && typeof data.rezeptbuch === 'object' ? data.rezeptbuch : null;
      const ct = data.tracker && typeof data.tracker === 'object' ? data.tracker : null;
      return rb || ct ? { rezeptbuch: rb, tracker: ct } : null;
    }
    if (data.days && typeof data.days === 'object') return { rezeptbuch: null, tracker: data }; // altes Tracker-Backup
    return null;
  }
  // Ersetzt die Daten auf diesem Gerät durch die aus der Datei
  function restore(parts) {
    if (parts.rezeptbuch) localStorage.setItem(KEYS.rezeptbuch, JSON.stringify(parts.rezeptbuch));
    if (parts.tracker) localStorage.setItem(KEYS.tracker, JSON.stringify(parts.tracker));
    setMeta({ at: Date.now(), hash: fingerprint() }); // gerade eingelesen = gesichert
  }
  function lastText() {
    const at = meta().at;
    if (!at) return 'Noch nie exportiert.';
    const d = Math.floor((Date.now() - at) / 864e5);
    return `Zuletzt exportiert ${d === 0 ? 'heute' : d === 1 ? 'gestern' : `vor ${d} Tagen`}.`;
  }

  /* ---------- Nachfragen ---------- */
  // Wechsel zwischen Rezeptbuch und Tracker (Links, Neuladen nach Update) sind kein Schließen
  const NAV = 'rbInternalNav';
  function markNav() { try { sessionStorage.setItem(NAV, String(Date.now())); } catch (e) { /* egal */ } }
  function recentNav() { try { return Date.now() - Number(sessionStorage.getItem(NAV) || 0) < 10000; } catch (e) { return false; } }
  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    const u = new URL(a.href, location.href);
    if (u.origin === location.origin && u.pathname !== location.pathname) markNav();
  }, true);

  window.addEventListener('beforeunload', (e) => {
    if (recentNav() || !meta().remind || !worthAsking() || !dirty()) return;
    e.preventDefault();
    e.returnValue = ''; // Text bestimmt der Browser selbst
  });

  function laterOk() { try { return Date.now() - Number(sessionStorage.getItem('rbAskLater') || 0) > LATER_MS; } catch (e) { return true; } }
  function ask() {
    if (document.getElementById('rb-backup-ask') || !meta().remind || !laterOk() || /^#\/start/.test(location.hash) || !worthAsking() || !dirty()) return;
    style();
    const box = document.createElement('div');
    box.id = 'rb-backup-ask';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-labelledby', 'rb-backup-t');
    box.innerHTML = `<div class="rbb-card">
      <h2 id="rb-backup-t">Daten gesichert?</h2>
      <p>Seit dem letzten Export hat sich etwas geändert. Hast du deine Daten exportiert und gespeichert? Sie liegen nur auf diesem Handy.</p>
      <p class="rbb-small">${lastText()}</p>
      <button type="button" class="rbb-btn" id="rbb-now">Jetzt exportieren</button>
      <button type="button" class="rbb-btn rbb-sec" id="rbb-later">Später</button>
    </div>`;
    document.body.appendChild(box);
    const close = () => box.remove();
    box.querySelector('#rbb-later').onclick = () => { try { sessionStorage.setItem('rbAskLater', String(Date.now())); } catch (e) { /* egal */ } close(); };
    box.querySelector('#rbb-now').onclick = async () => { if (await exportAll()) { close(); window.dispatchEvent(new Event('rb-backup')); } };
    box.querySelector('#rbb-now').focus();
  }
  function style() {
    if (document.getElementById('rb-backup-style')) return;
    const s = document.createElement('style');
    s.id = 'rb-backup-style';
    s.textContent = `#rb-backup-ask{position:fixed;inset:0;z-index:1000;background:rgba(59,42,32,.45);display:flex;align-items:flex-end;justify-content:center;padding:16px;padding-bottom:calc(env(safe-area-inset-bottom) + 16px);font-family:'Nunito',system-ui,sans-serif}
      #rb-backup-ask .rbb-card{background:#FFF8F1;color:#3B2A20;border-radius:20px;padding:20px;max-width:448px;width:100%;display:flex;flex-direction:column;gap:10px}
      #rb-backup-ask h2{margin:0;font-size:20px;font-weight:900}#rb-backup-ask p{margin:0;font-size:15px;line-height:1.45}
      #rb-backup-ask .rbb-small{font-size:13px;font-weight:700;color:#6B5444}
      #rb-backup-ask .rbb-btn{min-height:48px;border:0;border-radius:16px;background:#C2551F;color:#fff;font:inherit;font-size:16px;font-weight:800}
      #rb-backup-ask .rbb-sec{background:#fff;color:#3B2A20;border:2px solid #E2CFBF}`;
    document.head.appendChild(s);
  }
  let hiddenAt = 0;
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') hiddenAt = Date.now();
    else if (hiddenAt && Date.now() - hiddenAt >= AWAY_MS) setTimeout(ask, 600);
  });
  if (!recentNav()) setTimeout(ask, 1200);

  globalThis.RBBackup = { exportAll, check, restore, dirty, meta, setMeta, lastText, markNav, ask };
})();
