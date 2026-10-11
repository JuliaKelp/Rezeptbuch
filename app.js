import { RECIPES, TASTE_FOODS } from './recipes.js';
import { FOODS, UNITS, findFood, gramsOf, kcalOf } from './nutrition.js';

// ---------- Grunddaten ----------

const STORAGE_KEY = 'rezeptbuch-v1';

const MEALS = [
  { id: 'fruehstueck', name: 'Frühstück', share: 0.25 },
  { id: 'mittag', name: 'Mittagessen', share: 0.35 },
  { id: 'abend', name: 'Abendessen', share: 0.4 }
];

const DIETS = [
  { id: 'vegan', name: 'Vegan', allows: ['vegan'] },
  { id: 'vegetarisch', name: 'Vegetarisch', allows: ['vegan', 'vegetarisch'] },
  { id: 'pescetarisch', name: 'Pescetarisch', allows: ['vegan', 'vegetarisch', 'fisch'] },
  { id: 'alles', name: 'Ich esse alles', allows: ['vegan', 'vegetarisch', 'fisch', 'fleisch'] }
];

const ALLERGIES = [
  { id: 'nuesse', name: 'Nüsse' },
  { id: 'gluten', name: 'Gluten' },
  { id: 'laktose', name: 'Laktose' },
  { id: 'ei', name: 'Ei' },
  { id: 'soja', name: 'Soja' },
  { id: 'fisch', name: 'Fisch' }
];

const GOALS = [
  { id: 'abnehmen', name: 'Abnehmen', kcal: 1700 },
  { id: 'halten', name: 'Gewicht halten', kcal: 2000 },
  { id: 'zunehmen', name: 'Zunehmen', kcal: 2400 }
];

const TIME_OPTIONS = [5, 10, 15, 30, 45];
const SHORT_TIME = 10;
const XP_PER_RECIPE = 40;
const STAMPS_FOR_HAT = 10;
const LEVEL_NAMES = ['Küchenkätzchen', 'Schnurr-Köchin', 'Küchenkatze', 'Pfannen-Profi', 'Meisterkatze'];

// Lebensmittel, die bei einer Ernährungsform oder Allergie gar nicht erst abgefragt werden
const HIDE_FOR_DIET = {
  vegan: ['Eier', 'Käse', 'Feta', 'Joghurt', 'Quark', 'Hähnchen', 'Lachs', 'Thunfisch'],
  vegetarisch: ['Hähnchen', 'Lachs', 'Thunfisch'],
  pescetarisch: ['Hähnchen'],
  alles: []
};
const HIDE_FOR_ALLERGY = {
  ei: ['Eier'],
  laktose: ['Käse', 'Feta', 'Joghurt', 'Quark'],
  fisch: ['Lachs', 'Thunfisch'],
  soja: ['Tofu'],
  gluten: [],
  nuesse: []
};

function defaultState() {
  return {
    onboarded: false,
    profile: {
      diet: 'vegetarisch',
      allergies: [],
      goal: 'halten',
      kcal: 2000,
      taste: {},
      times: { fruehstueck: 5, mittag: 15, abend: 30 }
    },
    log: {},       // { 'JJJJ-MM-TT': [{ recipeId, meal, kcal, name }] }
    stamps: {},    // { recipeId: Anzahl gekocht }
    xp: 0,
    cooking: {},   // { recipeId: [erledigte Schritt-Indizes] }
    pick: {},      // { meal: Index der aktuellen Idee }
    ownRecipes: [], // selbst eingetragene Rezepte
    pantry: {}     // { barcode: { name, brand, food, kcal100, allergens, diet, count, last } }
  };
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const saved = JSON.parse(raw);
    const base = defaultState();
    return { ...base, ...saved, profile: { ...base.profile, ...saved.profile, times: { ...base.profile.times, ...(saved.profile || {}).times } } };
  } catch (e) {
    return defaultState();
  }
}

let state = load();

function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* Speicher voll oder gesperrt */ }
}

function allRecipes() { return [...state.ownRecipes, ...RECIPES]; }

// Eingaben, die nicht sofort neu gezeichnet werden (sonst springt die Tastatur weg)
const ui = { scanning: false, scanMsg: '', lastCode: null, unknownCode: null, codeDraft: '', productDraft: '', form: null, formError: '', confirmDelete: false, confirmReset: false, draft: '', recipeFilter: 'alle', showManual: false, manualKcal: '', toast: '', justStamped: null };

// ---------- Hilfsfunktionen ----------

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function fmt(n) { return Math.round(n).toLocaleString('de-DE'); }

function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function mealName(id) { return (MEALS.find((m) => m.id === id) || {}).name || ''; }
function dietName(id) { return { vegan: 'vegan', vegetarisch: 'vegetarisch', fisch: 'mit Fisch', fleisch: 'mit Fleisch' }[id]; }

function todayLog() { return state.log[todayKey()] || []; }
function eatenToday() { return todayLog().reduce((s, e) => s + e.kcal, 0); }
function stampCount() { return Object.keys(state.stamps).length; }
function level() { return Math.floor(state.xp / 100) + 1; }
function levelName() { return LEVEL_NAMES[Math.min(level(), LEVEL_NAMES.length) - 1]; }

// ---------- Rezeptauswahl ----------

function textOf(recipe) {
  return (recipe.foods.join(' ') + ' ' + recipe.ingredients.join(' ') + ' ' + recipe.name).toLowerCase();
}

function suitable(recipe) {
  const p = state.profile;
  const diet = DIETS.find((d) => d.id === p.diet) || DIETS[3];
  if (!diet.allows.includes(recipe.diet)) return false;
  if (recipe.allergens.some((a) => p.allergies.includes(a))) return false;
  const text = textOf(recipe);
  for (const [food, v] of Object.entries(p.taste)) {
    if (v === 'no' && text.includes(food.toLowerCase())) return false;
  }
  return true;
}

function likeScore(recipe) {
  const text = textOf(recipe);
  const taste = state.profile.taste;
  const liked = Object.entries(taste).filter(([, v]) => v === 'like').map(([food]) => food);
  // Was oft gekauft wird, zählt auch als Lieblingsessen
  for (const p of Object.values(state.pantry || {})) {
    const key = tasteKey(p.food);
    if (key && p.count >= 3 && !taste[key] && !liked.includes(key)) liked.push(key);
  }
  return liked.filter((food) => text.includes(food.toLowerCase())).length;
}

// Wie passt ein Rezept in die verfügbare Zeit? 'fits', 'prep' (am Vorabend), 'vorkochen' (doppelt kochen) oder null
function timeMode(recipe, meal) {
  const t = state.profile.times[meal];
  if (recipe.prep) return recipe.serve <= t ? 'prep' : null;
  if (recipe.time <= t) return 'fits';
  if (recipe.mealprep) return 'vorkochen';
  return null;
}

function ideasFor(meal) {
  const budget = state.profile.kcal * MEALS.find((m) => m.id === meal).share;
  const day = todayKey();
  const cookedToday = new Set(todayLog().map((e) => e.recipeId));
  const tipRecipe = meal === 'mittag' ? (prepTips().find((t) => t.recipe && t.recipe.mealprep) || {}).recipe?.id : null;
  return allRecipes()
    .filter((r) => r.meals.includes(meal) && suitable(r))
    .map((r) => ({ recipe: r, mode: timeMode(r, meal) }))
    .filter((x) => x.mode)
    .map((x) => {
      const r = x.recipe;
      let score = likeScore(r) * 3 - Math.abs(r.kcal - budget) / 80;
      if (x.mode === 'vorkochen') score -= 2;
      if (x.mode === 'vorkochen' && r.id === tipRecipe) score += 4; // passt zum Vorkoch-Tipp
      score += pantryScore(r) * 1.5; // Zutaten schon eingekauft
      if (cookedToday.has(r.id)) score -= 10;
      score += (hashStr(day + r.id) % 100) / 60; // jeden Tag etwas Abwechslung
      return { ...x, score };
    })
    .sort((a, b) => b.score - a.score);
}

function prepTips() {
  const times = state.profile.times;
  const tips = [];
  if (times.fruehstueck <= SHORT_TIME) {
    const oats = allRecipes().filter((r) => r.prep && r.meals.includes('fruehstueck') && suitable(r))
      .sort((a, b) => likeScore(b) - likeScore(a))[0];
    if (oats) tips.push({ recipe: oats, text: `Setz heute Abend nebenbei ${oats.name} für morgen früh an. Dauert nur ${oats.time} Min.` });
  }
  const dinnerDone = todayLog().some((e) => e.meal === 'abend');
  if (times.mittag <= SHORT_TIME && !dinnerDone) {
    const mp = allRecipes().filter((r) => r.mealprep && r.meals.includes('abend') && suitable(r))
      .sort((a, b) => likeScore(b) - likeScore(a) || (hashStr(todayKey() + a.id) % 7) - (hashStr(todayKey() + b.id) % 7))[0];
    if (mp) tips.push({ recipe: mp, text: `Koch heute Abend ${mp.name} doppelt und nimm eine Portion morgen zum Mittagessen mit.` });
  }
  if (times.abend <= SHORT_TIME) {
    tips.push({ recipe: null, text: 'Abends ist wenig Zeit: Koch am Wochenende ein Gericht mit Vorkoch-Tipp in doppelter Menge und friere Portionen ein.' });
  }
  return tips;
}

// ---------- Ginger ----------

// Ginger sieht aus wie die echte Ginger: weiß, Kopf und Rücken braun getigert, weiße Blesse, rosa Nase
const G = { fur: '#8B6B4F', stripe: '#5C4535', white: '#FFFFFF', line: '#E3D3C4', ear: '#F3C1B8', nose: '#EFA3A6', eye: '#2E2018', iris: '#9C9452' };
let gingerId = 0;

function gingerHead({ happy = false, hat = false } = {}) {
  const id = `gh${++gingerId}`;
  const eye = (x) => `<circle cx="${x}" cy="54" r="6" fill="${G.iris}"/><circle cx="${x}" cy="54" r="4.8" fill="${G.eye}"/><circle cx="${x + 2}" cy="52" r="1.7" fill="#FFF"/>`;
  const eyes = happy
    ? `<path d="M31 55 Q37 49 43 55 M57 55 Q63 49 69 55" stroke="${G.eye}" stroke-width="3" fill="none" stroke-linecap="round"/>`
    : eye(37) + eye(63);
  const mouth = happy
    ? `<path d="M43 70 Q50 76 57 70" stroke="${G.stripe}" stroke-width="2" fill="none" stroke-linecap="round"/>`
    : `<path d="M50 67 Q46 72 42 69 M50 67 Q54 72 58 69" stroke="${G.stripe}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
  const hatSvg = hat
    ? '<path d="M30 30 Q26 14 38 14 Q40 4 50 6 Q60 4 62 14 Q74 14 70 30 Z" fill="#FFFFFF" stroke="#E2CFBF" stroke-width="1.5"/><rect x="30" y="26" width="40" height="8" rx="3" fill="#FFFFFF" stroke="#E2CFBF" stroke-width="1.5"/>'
    : '';
  return `<defs><clipPath id="${id}"><ellipse cx="50" cy="57" rx="37" ry="33"/></clipPath></defs>
    <path d="M16 46 L20 8 L46 30 Z" fill="${G.fur}"/>
    <path d="M84 46 L80 8 L54 30 Z" fill="${G.fur}"/>
    <path d="M23 34 L25 18 L37 29 Z" fill="${G.ear}"/>
    <path d="M77 34 L75 18 L63 29 Z" fill="${G.ear}"/>
    <ellipse cx="50" cy="57" rx="37" ry="33" fill="${G.white}" stroke="${G.line}" stroke-width="1.5"/>
    <g clip-path="url(#${id})">
      <path d="M0 0 L100 0 L100 67 Q80 64 70 62 Q61 60 57.5 47 Q54.5 38 51.5 34 Q50 32.5 48.5 34 Q45.5 38 42.5 47 Q39 60 30 62 Q20 64 0 67 Z" fill="${G.fur}"/>
      <path d="M43 25 Q45 29 44 33 M50 23 L50 29 M57 25 Q55 29 56 33 M34 31 Q37 35 36 39 M66 31 Q63 35 64 39 M17 47 Q24 47 28 43 M83 47 Q76 47 72 43" stroke="${G.stripe}" stroke-width="2" fill="none" stroke-linecap="round"/>
    </g>
    <ellipse cx="29" cy="67" rx="6" ry="3.5" fill="#F7C9C0"/>
    <ellipse cx="71" cy="67" rx="6" ry="3.5" fill="#F7C9C0"/>
    ${eyes}
    <path d="M46 62 L54 62 L50 66.5 Z" fill="${G.nose}"/>
    ${mouth}
    <path d="M14 60 L28 62 M14 67 L28 66 M86 60 L72 62 M86 67 L72 66" stroke="#B9A797" stroke-width="1.3" stroke-linecap="round"/>
    ${hatSvg}`;
}

function ginger(size, opts = {}) {
  const happy = opts.mood === 'happy';
  const hat = opts.hat ?? stampCount() >= STAMPS_FOR_HAT;
  return `<svg viewBox="0 0 100 100" width="${size}" height="${size}" aria-hidden="true">${gingerHead({ happy, hat })}</svg>`;
}

function gingerPeek(width) {
  return `<svg viewBox="0 0 100 60" width="${width}" height="${Math.round(width * 0.6)}" aria-hidden="true">
    <g transform="translate(0 -6)">${gingerHead()}</g>
  </svg>`;
}

// Ganze Ginger von der Seite, für die Warte-Animation
function gingerBody(mode) {
  const id = `gb${++gingerId}`;
  const paw = `<rect class="leg leg-b paw" x="78" y="60" width="9" height="24" rx="4.5" fill="${G.white}" stroke="${G.line}" stroke-width="1.2"/>`;
  return `<svg viewBox="0 0 120 90" width="110" height="83" aria-hidden="true">
    <defs><clipPath id="${id}"><ellipse cx="56" cy="55" rx="34" ry="18"/></clipPath></defs>
    <g class="tail"><path d="M24 52 Q8 46 10 26 Q11 18 16 14" stroke="${G.fur}" stroke-width="7" fill="none" stroke-linecap="round"/>
      <path d="M12 34 L19 35 M11 26 L18 28" stroke="${G.stripe}" stroke-width="2" stroke-linecap="round"/></g>
    <rect class="leg leg-b" x="30" y="60" width="9" height="24" rx="4.5" fill="${G.white}" stroke="${G.line}" stroke-width="1.2"/>
    <rect class="leg leg-a" x="40" y="60" width="9" height="24" rx="4.5" fill="${G.white}" stroke="${G.line}" stroke-width="1.2"/>
    <rect class="leg leg-a" x="68" y="60" width="9" height="24" rx="4.5" fill="${G.white}" stroke="${G.line}" stroke-width="1.2"/>
    ${mode === 'putzen' ? '' : paw}
    <ellipse cx="56" cy="55" rx="34" ry="18" fill="${G.white}" stroke="${G.line}" stroke-width="1.2"/>
    <g clip-path="url(#${id})">
      <path d="M18 30 L96 30 L96 50 Q82 57 68 50 Q54 58 40 50 Q28 56 18 50 Z" fill="${G.fur}"/>
      <path d="M38 40 Q40 45 38 49 M50 39 Q52 45 50 50 M62 40 Q64 45 62 49 M74 39 Q76 44 74 48" stroke="${G.stripe}" stroke-width="2" fill="none" stroke-linecap="round"/>
    </g>
    <g class="head"><g transform="translate(66 2) scale(0.52)">${gingerHead({ happy: mode === 'putzen' })}</g></g>
    ${mode === 'putzen' ? paw : ''}
  </svg>`;
}

const WAIT_MODES = ['laufen', 'huepfen', 'jagen', 'springen', 'putzen'];
let waitCount = 0;

// Zeigt Ginger, solange auf etwas gewartet wird. Liegt außerhalb von #app, damit Neuzeichnen die Animation nicht unterbricht.
function showWait(text) {
  waitCount++;
  let box = document.getElementById('wait');
  if (!box) {
    box = document.createElement('div');
    box.id = 'wait';
    box.setAttribute('role', 'status');
    document.body.appendChild(box);
  }
  const mode = WAIT_MODES[Math.floor(Math.random() * WAIT_MODES.length)];
  box.className = `wait ${mode}`;
  box.innerHTML = `<div class="wait-label">${esc(text)}</div>
    ${mode === 'jagen' ? '<div class="ball"><svg viewBox="0 0 20 20" width="22" height="22" aria-hidden="true"><circle cx="10" cy="10" r="9" fill="#C2551F"/><path d="M3 7 Q10 11 17 6 M3 13 Q10 9 17 14 M8 2 Q12 10 9 18" stroke="#F3B48C" stroke-width="1.5" fill="none"/></svg></div>' : ''}
    <div class="cat">${gingerBody(mode)}</div>`;
}

function hideWait() {
  waitCount = Math.max(0, waitCount - 1);
  if (waitCount) return;
  document.getElementById('wait')?.remove();
}

const ICONS = {
  cart: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6h2v12M9 6v12M12 6v12M15 6h1v12M19 6h1v12"/></svg>',
  heart: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M12 20 C5 15 3 12 3 8.5 A4.5 4.5 0 0 1 12 6.5 A4.5 4.5 0 0 1 21 8.5 C21 12 19 15 12 20 Z"/></svg>',
  cross: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M6 6 L18 18 M18 6 L6 18"/></svg>',
  check: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12 L10 17 L19 7"/></svg>',
  paw: '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><ellipse cx="12" cy="15" rx="5" ry="4" fill="#B4481A"/><circle cx="6" cy="9" r="2.2" fill="#B4481A"/><circle cx="10" cy="6" r="2.2" fill="#B4481A"/><circle cx="14" cy="6" r="2.2" fill="#B4481A"/><circle cx="18" cy="9" r="2.2" fill="#B4481A"/></svg>',
  clock: '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="13" r="8"/><path d="M12 9 V13 L15 15"/><path d="M9 2 H15"/></svg>',
  back: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5 L8 12 L15 19"/></svg>',
  home: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11 L12 4 L21 11"/><path d="M5 10 V20 H19 V10"/></svg>',
  book: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5 H10 A2 2 0 0 1 12 7 V20 A2 2 0 0 0 10 18 H4 Z"/><path d="M20 5 H14 A2 2 0 0 0 12 7 V20 A2 2 0 0 1 14 18 H20 Z"/></svg>',
  stamp: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M8.5 12 L11 14.5 L15.5 9.5"/></svg>',
  me: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 20 A8 8 0 0 1 20 20"/></svg>'
};

// ---------- Bausteine ----------

function nav(active) {
  const item = (id, label, icon) =>
    `<a href="#/${id}" ${active === id ? 'aria-current="page"' : ''}>${ICONS[icon]}${label}</a>`;
  return `<nav class="nav" aria-label="Hauptmenü"><div class="nav-inner">
    ${item('heute', 'Heute', 'home')}
    ${item('rezepte', 'Rezepte', 'book')}
    ${item('einkauf', 'Einkauf', 'cart')}
    ${item('stempel', 'Stempel', 'stamp')}
    ${item('ich', 'Ich', 'me')}
  </div></nav>`;
}

function stepsBar(n) {
  return `<div class="steps-bar" aria-label="Schritt ${n} von 3">
    <span class="${n >= 1 ? 'on' : ''}"></span><span class="${n >= 2 ? 'on' : ''}"></span><span class="${n >= 3 ? 'on' : ''}"></span>
    <b>${n} von 3</b></div>`;
}

function recipeCard(recipe, { meal, mode } = {}) {
  const cooked = !!state.stamps[recipe.id];
  let badge = cooked
    ? `<div class="stamp-mini" title="Schon gekocht">${ICONS.check}<span class="sr-only">Schon gekocht</span></div>`
    : '<div class="badge new">Neu</div>';
  let meta = `${recipe.time} Min · ca. ${recipe.kcal} kcal`;
  if (mode === 'prep') { badge = '<div class="badge prep">Vorbereiten</div>'; meta = `Am Vorabend ${recipe.time} Min · ca. ${recipe.kcal} kcal`; }
  if (mode === 'vorkochen') { badge = '<div class="badge prep">Vorkochen</div>'; meta = `Vorher doppelt kochen · ca. ${recipe.kcal} kcal`; }
  const href = `#/rezept/${recipe.id}${meal ? '/' + meal : ''}`;
  return `<a class="recipe-card" href="${href}">
    <div class="thumb" style="background:${recipe.tint}">${gingerPeek(44)}</div>
    <div class="info"><div class="title">${esc(recipe.name)}</div><div class="meta">${meta}</div></div>
    ${badge}
  </a>`;
}

// ---------- Start-Ablauf ----------

function viewStart1(edit) {
  const p = state.profile;
  return `<main class="screen">
    ${edit ? '' : stepsBar(1)}
    <div class="ginger-says">${ginger(78)}<div class="bubble">Hallo, ich bin Ginger! Wie isst du, und was verträgst du nicht?</div></div>
    <section class="field"><h2>Ich ernähre mich</h2>
      <div class="chips">${DIETS.map((d) => `<button class="chip" data-action="diet" data-id="${d.id}" aria-pressed="${p.diet === d.id}">${d.name}</button>`).join('')}</div>
    </section>
    <section class="field"><h2>Allergien und Unverträglichkeiten</h2>
      <div class="chips">${ALLERGIES.map((a) => `<button class="chip danger" data-action="allergy" data-id="${a.id}" aria-pressed="${p.allergies.includes(a.id)}">${a.name}</button>`).join('')}</div>
    </section>
    <section class="field"><h2>Mein Ziel</h2>
      <div class="chips">${GOALS.map((g) => `<button class="chip" data-action="goal" data-id="${g.id}" aria-pressed="${p.goal === g.id}">${g.name}</button>`).join('')}</div>
      <div class="row" style="margin-top:6px">
        <label for="kcal" class="small muted">Kalorien pro Tag</label>
        <input id="kcal" class="input number-input" type="number" inputmode="numeric" min="1000" max="5000" step="50" value="${p.kcal}" data-input="kcal">
      </div>
      <p class="small muted">Ein grober Startwert. Später kommt er aus deinem Kalorientracker.</p>
    </section>
    <div class="bottom"><a class="btn" href="${edit ? '#/ich' : '#/start/2'}">${edit ? 'Speichern' : 'Weiter'}</a></div>
  </main>`;
}

function tasteFoods() {
  const p = state.profile;
  const hidden = new Set([...(HIDE_FOR_DIET[p.diet] || []), ...p.allergies.flatMap((a) => HIDE_FOR_ALLERGY[a] || [])]);
  const custom = Object.keys(p.taste).filter((f) => !TASTE_FOODS.includes(f));
  return [...TASTE_FOODS.filter((f) => !hidden.has(f)), ...custom];
}

function viewStart2(edit) {
  const p = state.profile;
  const rows = tasteFoods().map((f) => {
    const v = p.taste[f];
    return `<div class="taste-row"><div class="name">${esc(f)}</div>
      <button class="round like" data-action="taste" data-food="${esc(f)}" data-value="like" aria-pressed="${v === 'like'}" aria-label="${esc(f)} mag ich sehr">${ICONS.heart}</button>
      <button class="round no" data-action="taste" data-food="${esc(f)}" data-value="no" aria-pressed="${v === 'no'}" aria-label="${esc(f)} mag ich nicht">${ICONS.cross}</button>
    </div>`;
  }).join('');
  const dietTag = DIETS.find((d) => d.id === p.diet).name;
  const allergyTags = p.allergies.map((a) => `<span class="tag red">Allergie: ${ALLERGIES.find((x) => x.id === a).name}</span>`).join('');
  return `<main class="screen">
    ${edit ? '' : stepsBar(2)}
    <div class="ginger-says">${ginger(70)}<div class="bubble">Herz für Lieblingsessen, Kreuz für alles, was nie auf den Teller soll.</div></div>
    <div class="chips"><span class="tag green">${dietTag}</span>${allergyTags}</div>
    <div class="taste-list">${rows}</div>
    <div class="field">
      <label for="eigenes">Fehlt was? Selbst eintragen</label>
      <div class="input-row">
        <input id="eigenes" class="input" placeholder="z. B. Kürbis" value="${esc(ui.draft)}" data-input="draft" autocomplete="off">
        <button class="btn dark small-btn" data-action="add-food">Dazu</button>
      </div>
    </div>
    <div class="bottom"><a class="btn" href="${edit ? '#/ich' : '#/start/3'}">${edit ? 'Speichern' : 'Weiter'}</a></div>
  </main>`;
}

const TIME_TIPS = {
  fruehstueck: 'Nur so kurz? Ginger schlägt Overnight Oats vor, die du am Vorabend ansetzt.',
  mittag: 'Knapp! Ginger plant, dass du abends doppelt kochst und eine Portion mitnimmst.',
  abend: 'Wenig Zeit am Abend: Ginger schlägt Gerichte zum Vorkochen am Wochenende vor.'
};

function viewStart3(edit) {
  const t = state.profile.times;
  const blocks = MEALS.map((m) => `<div class="card" style="display:flex;flex-direction:column;gap:10px">
      <div class="meal-head"><h3>${m.name}</h3><span class="small" style="color:var(--accent-text)">${t[m.id]} Min</span></div>
      <div class="seg" role="group" aria-label="Zeit für ${m.name}">
        ${TIME_OPTIONS.map((n) => `<button data-action="time" data-meal="${m.id}" data-min="${n}" aria-pressed="${t[m.id] === n}">${n}</button>`).join('')}
      </div>
      ${t[m.id] <= SHORT_TIME ? `<div class="hint">${ICONS.paw}<span>${TIME_TIPS[m.id]}</span></div>` : ''}
    </div>`).join('');
  return `<main class="screen">
    ${edit ? '' : stepsBar(3)}
    <h1>Wie viel Zeit hast du zum Kochen?</h1>
    <p class="lead">Pro Mahlzeit, in Minuten. Wenn es knapp wird, plant Ginger Vorbereitung an Zeiten mit mehr Luft ein.</p>
    ${blocks}
    <div class="bottom"><button class="btn" data-action="${edit ? 'go-ich' : 'finish-start'}">${edit ? 'Speichern' : 'Fertig'}</button></div>
  </main>`;
}

// ---------- Heute ----------

function viewHeute() {
  const target = state.profile.kcal;
  const eaten = eatenToday();
  const rest = Math.max(0, target - eaten);
  const frac = Math.min(1, eaten / target);
  const circ = 2 * Math.PI * 50;
  const date = new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });
  const log = todayLog();

  const tips = prepTips().map((tip) => tip.recipe
    ? `<a class="prep-banner" href="#/rezept/${tip.recipe.id}">${ICONS.clock}<span><b>Nebenbei vorbereiten:</b> ${esc(tip.text)}</span></a>`
    : `<div class="prep-banner">${ICONS.clock}<span><b>Tipp:</b> ${esc(tip.text)}</span></div>`).join('');

  const eatenCard = (e) => `<div class="recipe-card"><div class="info"><div class="title">${esc(e.name)}</div><div class="meta">ca. ${fmt(e.kcal)} kcal</div></div>
      <button class="round" data-action="undo-eaten" data-index="${e.index}" aria-label="${esc(e.name)} wieder austragen">${ICONS.cross}</button></div>`;
  const indexed = log.map((e, index) => ({ ...e, index }));
  const extras = indexed.filter((e) => !MEALS.some((m) => m.id === e.meal));
  const meals = MEALS.map((m) => {
    const eatenHere = indexed.filter((e) => e.meal === m.id);
    if (eatenHere.length) {
      return `<section class="meal-block"><div class="meal-head"><h3>${m.name}</h3><span class="small muted">gegessen</span></div>
        ${eatenHere.map(eatenCard).join('')}
      </section>`;
    }
    const ideas = ideasFor(m.id);
    if (!ideas.length) {
      return `<section class="meal-block"><div class="meal-head"><h3>${m.name}</h3></div>
        <div class="card small muted">Ginger findet gerade kein passendes Rezept. Vielleicht sind zu viele Zutaten auf „mag ich nicht“?</div></section>`;
    }
    const i = (state.pick[m.id] || 0) % ideas.length;
    const idea = ideas[i];
    return `<section class="meal-block">
      <div class="meal-head"><h3>${m.name}</h3><span class="small muted">${state.profile.times[m.id]} Min Zeit</span></div>
      ${recipeCard(idea.recipe, { meal: m.id, mode: idea.mode })}
      ${ideas.length > 1 ? `<button class="link-btn" style="align-self:flex-end" data-action="next-idea" data-meal="${m.id}">Andere Idee</button>` : ''}
    </section>`;
  }).join('');

  return `<main class="screen with-nav">
    <div class="top-row">
      <div><div class="small muted">${date}</div><h1>Hallo!</h1></div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">
        <div class="level-pill">Level ${level()} · ${levelName()}</div>
        <div class="small" style="color:var(--accent-text)">${stampCount()} Stempel gesammelt</div>
      </div>
    </div>
    <div class="card kcal-card">
      <div class="peek">${gingerPeek(96)}</div>
      <svg class="ring" viewBox="0 0 120 120" width="112" height="112" role="img" aria-label="${fmt(eaten)} von ${fmt(target)} Kilokalorien">
        <circle cx="60" cy="60" r="50" fill="none" stroke="#F1E3D6" stroke-width="14"/>
        ${eaten > 0 ? `<circle cx="60" cy="60" r="50" fill="none" stroke="#C2551F" stroke-width="14" stroke-linecap="round" stroke-dasharray="${(frac * circ).toFixed(1)} ${circ.toFixed(1)}" transform="rotate(-90 60 60)"/>` : ''}
        <text x="60" y="58" text-anchor="middle" font-size="22" font-weight="900" fill="#3B2A20" font-family="Nunito, sans-serif">${fmt(eaten)}</text>
        <text x="60" y="76" text-anchor="middle" font-size="11" font-weight="700" fill="#6B5444" font-family="Nunito, sans-serif">von ${fmt(target)} kcal</text>
      </svg>
      <div style="display:flex;flex-direction:column;gap:6px">
        <div style="font-size:16px;font-weight:800">Noch ${fmt(rest)} kcal frei</div>
        ${ui.showManual
          ? `<div class="input-row"><label class="sr-only" for="manual">Kalorien</label><input id="manual" class="input" style="width:90px;flex:none" type="number" inputmode="numeric" placeholder="kcal" value="${esc(ui.manualKcal)}" data-input="manualKcal"><button class="btn dark small-btn" data-action="add-manual">Dazu</button></div>`
          : '<button class="link-btn" style="text-align:left;padding:0" data-action="show-manual">Etwas anderes gegessen?</button>'}
      </div>
    </div>
    ${tips}
    <h2>Gingers Vorschläge für heute</h2>
    ${meals}
    ${extras.length ? `<section class="meal-block"><div class="meal-head"><h3>Sonstiges</h3></div>${extras.map(eatenCard).join('')}</section>` : ''}
  </main>${nav('heute')}`;
}

// ---------- Rezepte ----------

function viewRezepte() {
  const f = ui.recipeFilter;
  const byMeal = (r) => f === 'alle' || r.meals.includes(f);
  const own = state.ownRecipes.filter(byMeal);
  const list = RECIPES.filter(suitable).filter(byMeal)
    .sort((a, b) => likeScore(b) - likeScore(a) || a.time - b.time);
  const filters = [{ id: 'alle', name: 'Alle' }, ...MEALS];
  return `<main class="screen with-nav">
    <h1>Rezepte</h1>
    <p class="lead">Alles unter 30 Minuten und passend zu deinen Angaben. Deine Lieblingszutaten stehen oben.</p>
    <a class="btn secondary" href="#/neu">+ Eigenes Rezept eintragen</a>
    <div class="chips">${filters.map((x) => `<button class="chip" data-action="filter" data-id="${x.id}" aria-pressed="${f === x.id}">${x.name}</button>`).join('')}</div>
    ${own.length ? `<h2>Meine Rezepte</h2>${own.map((r) => recipeCard(r)).join('')}<h2>Gingers Rezepte</h2>` : ''}
    ${list.map((r) => recipeCard(r)).join('') || '<div class="card small muted">Keine passenden Rezepte gefunden.</div>'}
  </main>${nav('rezepte')}`;
}

// ---------- Rezept und Kochen ----------

function viewRezept(id, meal) {
  const r = allRecipes().find((x) => x.id === id);
  if (!r) return viewHeute();
  const done = new Set(state.cooking[r.id] || []);
  const doneCount = r.steps.filter((_, i) => done.has(i)).length;
  const allDone = doneCount === r.steps.length;
  const cheer = allDone ? 'Alles erledigt! Hol dir deinen Stempel.' : doneCount === 0 ? 'Los geht’s, ich schau zu!' : 'Super, weiter so!';
  const stampedNow = ui.justStamped === r.id;
  let note = '';
  if (r.prep) note = `<div class="hint">${ICONS.paw}<span>Am Vorabend vorbereiten, dann ist es morgens sofort fertig.</span></div>`;
  else if (r.mealprep) note = `<div class="hint">${ICONS.paw}<span>${r.own && r.portions >= 2 ? `Vorkoch-Tipp: Das Rezept reicht für ${r.portions} Portionen. Den Rest kannst du am nächsten Tag essen.` : 'Vorkoch-Tipp: Koch die doppelte Menge und nimm eine Portion am nächsten Tag mit.'}</span></div>`;
  const backHref = meal ? '#/heute' : '#/rezepte';

  return `<main class="screen">
    <a class="back" href="${backHref}">${ICONS.back}Zurück</a>
    <div class="hero" style="background:${r.tint}">${gingerPeek(110)}</div>
    <div>
      <h1>${esc(r.name)}</h1>
      <div class="small muted" style="margin-top:4px">${r.time} Min · ca. ${r.kcal} kcal${r.own ? ' pro Portion' : ''} · ${dietName(r.diet)}</div>
    </div>
    ${note}
    <section class="card"><h2 style="margin-bottom:6px">Du brauchst${r.own ? ` <span class="small muted">für ${r.portions} ${r.portions === 1 ? 'Portion' : 'Portionen'}</span>` : ''}</h2>
      <ul class="ing-list">${r.ingredients.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
    </section>
    <h2>So geht’s</h2>
    <div style="display:flex;flex-direction:column;gap:6px">
      <div class="progress">${r.steps.map((_, i) => `<span class="${done.has(i) ? 'on' : ''}"></span>`).join('')}</div>
      <div class="small muted">${doneCount} von ${r.steps.length} Schritten geschafft</div>
    </div>
    <div style="display:flex;flex-direction:column;gap:8px">
      ${r.steps.map((s, i) => `<label class="step"><input type="checkbox" data-action="step" data-recipe="${r.id}" data-step="${i}" ${done.has(i) ? 'checked' : ''}><span>${esc(s)}</span></label>`).join('')}
    </div>
    <div style="display:flex;align-items:flex-end;gap:10px">
      ${ginger(64, { mood: allDone ? 'happy' : 'normal' })}
      <div class="bubble" style="flex:1;margin-bottom:18px">${stampedNow ? `Stempel ist im Heft! +${XP_PER_RECIPE} XP` : cheer}</div>
      ${stampedNow ? '<div class="stamp-big">Gekocht!</div>' : ''}
    </div>
    <div class="bottom">
      ${stampedNow
        ? `<a class="btn" href="#/stempel">Zum Stempelheft</a><button class="link-btn" data-action="undo-eaten" data-index="${todayLog().length - 1}">Doch nicht gekocht? Rückgängig</button>`
        : `<button class="btn" data-action="cooked" data-recipe="${r.id}" data-meal="${meal || ''}" ${allDone ? '' : 'disabled'}>Fertig gekocht</button>`}
      ${r.own ? (ui.confirmDelete
        ? `<div class="input-row"><button class="btn secondary" data-action="cancel-delete">Behalten</button><button class="btn dark" data-action="delete-own" data-recipe="${r.id}">Ja, löschen</button></div>`
        : `<div class="input-row"><a class="btn secondary" href="#/neu/${r.id}">Bearbeiten</a><button class="btn secondary" data-action="ask-delete">Löschen</button></div>`) : ''}
    </div>
  </main>`;
}

// ---------- Eigene Rezepte ----------

const OWN_TINTS = ['#F3C9A8', '#F5E1A4', '#DCE8C8', '#DDEAF4', '#F2D4DC', '#E3DCF2', '#F7D2B0'];

function emptyForm() {
  return {
    id: null, name: '', portions: 2, time: 20, meals: ['abend'], steps: '',
    rows: [{ amount: '', unit: 'g', name: '' }, { amount: '', unit: 'g', name: '' }, { amount: '', unit: 'g', name: '' }]
  };
}

function formFromRecipe(r) {
  return {
    id: r.id, name: r.name, portions: r.portions, time: r.time, meals: [...r.meals],
    steps: r.steps.join('\n'), rows: r.rows.map((x) => ({ ...x }))
  };
}

function unitName(id) { return (UNITS.find((u) => u.id === id) || UNITS[0]).name; }

function roundAmount(x, unit) {
  if (unit === 'g' || unit === 'ml') return Math.max(5, Math.round(x / 5) * 5);
  return Math.max(0.5, Math.round(x * 2) / 2);
}

function fmtAmount(a) { return String(a).replace('.', ','); }

// Rechnet ein Formular durch und sammelt Gingers Tipps
function analyze(form) {
  const p = state.profile;
  const portions = Math.max(1, Number(form.portions) || 1);
  const rows = form.rows
    .map((row, i) => ({ row, i, food: findFood(row.name) }))
    .filter((x) => x.row.name.trim() && Number(String(x.row.amount).replace(',', '.')) > 0);
  let total = 0;
  const unknown = [];
  const lines = rows.map((x) => {
    const kcal = kcalOf(x.row);
    if (kcal === null) unknown.push(x);
    else total += kcal;
    return { ...x, kcal, grams: gramsOf(x.row, x.food) };
  });
  const perPortion = total / portions;
  const share = Math.max(...form.meals.map((m) => (MEALS.find((x) => x.id === m) || MEALS[1]).share), 0.25);
  const budget = Math.round(p.kcal * share);

  // Ernährungsform und Allergene aus den Zutaten ableiten
  const tags = lines.map((x) => x.food && x.food.diet).filter(Boolean);
  const diet = tags.includes('fleisch') ? 'fleisch' : tags.includes('fisch') ? 'fisch' : tags.includes('tierisch') ? 'vegetarisch' : 'vegan';
  const allergens = [...new Set(lines.flatMap((x) => (x.food && x.food.allergens) || []))];

  const tips = [];
  const warn = [];
  if (unknown.length) {
    tips.push({ text: `Diese Zutaten kenne ich nicht: ${unknown.map((x) => x.row.name).join(', ')}. Trag dahinter die kcal pro 100 g ein, sonst zähle ich sie nicht mit.` });
  }
  const dietOk = (DIETS.find((d) => d.id === p.diet) || DIETS[3]).allows.includes(diet);
  if (!dietOk) warn.push(`Passt nicht zu deiner Ernährungsform (${DIETS.find((d) => d.id === p.diet).name}). Ich schlage es dir deshalb nicht vor.`);
  const badAllergens = allergens.filter((a) => p.allergies.includes(a));
  if (badAllergens.length) warn.push(`Achtung, enthält ${badAllergens.map((a) => ALLERGIES.find((x) => x.id === a).name).join(', ')}. Das hast du als Allergie angegeben.`);
  const disliked = Object.entries(p.taste).filter(([f, v]) => v === 'no' && lines.some((x) => x.row.name.toLowerCase().includes(f.toLowerCase()) || (x.food && x.food.name === f)));
  if (disliked.length) warn.push(`Enthält ${disliked.map(([f]) => f).join(', ')}, das magst du laut deinen Angaben nicht.`);

  if (lines.length && total > 0) {
    if (perPortion > budget * 1.15) {
      const f = budget / perPortion;
      const more = Math.ceil(total / budget);
      tips.push({
        text: `Eine Portion hat ca. ${fmt(perPortion)} kcal. Für dein Ziel passen zu dieser Mahlzeit etwa ${fmt(budget)} kcal. Ich kann alle Mengen anpassen, oder du teilst das Rezept auf ${more} Portionen auf.`,
        actions: [{ label: `Mengen auf ${fmt(budget)} kcal anpassen`, kind: 'scale', value: f }, { label: `${more} Portionen`, kind: 'portions', value: more }]
      });
    } else if (perPortion < budget * 0.7) {
      tips.push({ text: `Eine Portion hat ca. ${fmt(perPortion)} kcal, für diese Mahlzeit sind etwa ${fmt(budget)} kcal drin. Nimm ruhig etwas Brot, Reis oder Eiweiß dazu, damit du satt bleibst.`, actions: [{ label: `Mengen auf ${fmt(budget)} kcal anpassen`, kind: 'scale', value: budget / perPortion }] });
    } else {
      tips.push({ text: `Eine Portion hat ca. ${fmt(perPortion)} kcal und passt gut zu deinem Ziel von etwa ${fmt(budget)} kcal für diese Mahlzeit.` });
    }

    // Tausch-Ideen, gerechnet pro Portion
    const per = (x) => x.grams / portions;
    for (const x of lines) {
      if (!x.food || x.kcal === null) continue;
      const n = x.food.name;
      if ((n === 'Öl' || n === 'Butter') && per(x) > 10) {
        const target = 10 * portions;
        const save = ((x.grams - target) * x.food.kcal) / 100 / portions;
        const amount = x.row.unit === 'g' || x.row.unit === 'ml' ? target : roundAmount(target / (x.food.el || 15), 'el');
        const unit = x.row.unit === 'g' || x.row.unit === 'ml' ? x.row.unit : 'el';
        tips.push({ text: `${n}: 1 EL pro Portion reicht meist zum Braten. Das spart etwa ${fmt(save)} kcal pro Portion.`, actions: [{ label: `${n} reduzieren`, kind: 'set', row: x.i, amount, unit }] });
      }
      if (['Käse', 'Parmesan', 'Feta', 'Mozzarella'].includes(n) && per(x) > 40) {
        const save = (x.kcal / 2) / portions;
        tips.push({ text: `${n}: Mit der halben Menge schmeckt es immer noch käsig und spart etwa ${fmt(save)} kcal pro Portion.`, actions: [{ label: 'Halbieren', kind: 'set', row: x.i, amount: roundAmount(Number(String(x.row.amount).replace(',', '.')) / 2, x.row.unit), unit: x.row.unit }] });
      }
      if (['Nudeln', 'Reis', 'Couscous', 'Quinoa'].includes(n) && per(x) > 100) {
        const target = 80 * portions;
        const save = ((x.grams - target) * x.food.kcal) / 100 / portions;
        tips.push({ text: `${n}: ${fmt(per(x))} g pro Portion ist viel. Mit 80 g und einer Handvoll Gemüse mehr sparst du etwa ${fmt(save)} kcal.`, actions: x.row.unit === 'g' ? [{ label: `Auf 80 g pro Portion`, kind: 'set', row: x.i, amount: target, unit: 'g' }] : [] });
      }
      if (['Zucker', 'Honig', 'Ahornsirup'].includes(n) && per(x) > 15) {
        const save = (x.kcal / 2) / portions;
        tips.push({ text: `${n}: Die halbe Menge reicht meist, besonders mit reifem Obst. Spart etwa ${fmt(save)} kcal pro Portion.`, actions: [{ label: 'Halbieren', kind: 'set', row: x.i, amount: roundAmount(Number(String(x.row.amount).replace(',', '.')) / 2, x.row.unit), unit: x.row.unit }] });
      }
      if (n === 'Sahne') tips.push({ text: `Sahne: Milch mit 1 EL Frischkäse wird auch cremig und spart etwa ${fmt((x.grams * (290 - 85)) / 100 / portions)} kcal pro Portion.` });
      if (n === 'Mayonnaise') tips.push({ text: `Mayonnaise: Halb Joghurt, halb Mayo schmeckt fast gleich und spart etwa ${fmt((x.grams / 2) * (700 - 65) / 100 / portions)} kcal pro Portion.` });
      if (n === 'Hackfleisch') tips.push({ text: 'Hackfleisch: Ersetz die Hälfte durch rote Linsen. Das spart Kalorien und bringt Ballaststoffe.' });
    }
    if (!lines.some((x) => x.food && x.food.group === 'gemuese')) {
      tips.push({ text: 'Noch kein Gemüse dabei. Eine Handvoll Spinat, Paprika oder Tomaten macht satt und hat kaum Kalorien.' });
    }
    if (!lines.some((x) => x.food && x.food.group === 'eiweiss')) {
      tips.push({ text: 'Wenig Eiweiß. Linsen, Kichererbsen, Joghurt, Ei oder Tofu halten länger satt.' });
    }
  }
  if (Number(form.time) > 30) {
    tips.push({ text: 'Dauert länger als 30 Minuten. Ich schlage es dir als Vorkoch-Rezept vor, wenn du an einem Tag mehr Zeit hast.' });
  }
  return { portions, total, perPortion, budget, unknown, lines, diet, allergens, tips, warn };
}

function viewAnalysis(form) {
  const a = analyze(form);
  if (!a.lines.length) {
    return `<div class="ginger-says">${ginger(58)}<div class="bubble">Trag Zutaten mit Mengen ein, dann rechne ich die Kalorien aus.</div></div>`;
  }
  const pct = Math.min(100, (a.perPortion / a.budget) * 100);
  const tips = a.tips.map((t, ti) => `<div class="hint">${ICONS.paw}<div style="display:flex;flex-direction:column;gap:6px"><span>${esc(t.text)}</span>
      ${(t.actions || []).length ? `<div class="row">${t.actions.map((ac, ai) => `<button class="btn dark small-btn" data-action="apply-tip" data-tip="${ti}" data-act="${ai}">${esc(ac.label)}</button>`).join('')}</div>` : ''}
    </div></div>`).join('');
  const warns = a.warn.map((w) => `<div class="hint" style="background:var(--red-soft)"><span>${esc(w)}</span></div>`).join('');
  const breakdown = a.lines.map((x) => `<li>${esc(x.row.name)}: ${x.kcal === null ? '?' : `ca. ${fmt(x.kcal)} kcal`}</li>`).join('');
  return `<section class="card" style="display:flex;flex-direction:column;gap:10px">
      <div class="small muted">Gingers Rechnung</div>
      <div style="font-size:28px;font-weight:900">ca. ${fmt(a.perPortion)} kcal <span class="small muted">pro Portion</span></div>
      <div class="bar"><div style="width:${pct}%;${a.perPortion > a.budget * 1.15 ? 'background:#9A3324' : ''}"></div></div>
      <div class="small muted">Dein Rahmen für diese Mahlzeit: etwa ${fmt(a.budget)} kcal · insgesamt ${fmt(a.total)} kcal für ${a.portions} ${a.portions === 1 ? 'Portion' : 'Portionen'}</div>
      <details><summary class="small" style="cursor:pointer;min-height:32px">Kalorien je Zutat</summary><ul class="ing-list" style="font-size:14px">${breakdown}</ul></details>
    </section>
    ${warns}
    ${tips}
    <p class="small muted">Alle Werte sind Schätzungen aus Durchschnittswerten.</p>`;
}

function viewNeu(id) {
  if (!ui.form || (ui.form.id || null) !== (id || null)) {
    const existing = id && state.ownRecipes.find((r) => r.id === id);
    ui.form = existing ? formFromRecipe(existing) : emptyForm();
  }
  const f = ui.form;
  const rows = f.rows.map((row, i) => {
    const unknown = row.name.trim() && !findFood(row.name);
    return `<div class="ing-row">
      <div class="input-row">
        <label class="sr-only" for="amt${i}">Menge</label>
        <input id="amt${i}" class="input" style="flex:0 0 72px;padding:0 10px" inputmode="decimal" placeholder="200" value="${esc(row.amount)}" data-row="${i}" data-field="amount">
        <label class="sr-only" for="unit${i}">Einheit</label>
        <select id="unit${i}" class="input" style="flex:0 0 82px;padding:0 8px" data-row="${i}" data-field="unit">
          ${UNITS.map((u) => `<option value="${u.id}" ${row.unit === u.id ? 'selected' : ''}>${u.name}</option>`).join('')}
        </select>
        <label class="sr-only" for="name${i}">Zutat</label>
        <input id="name${i}" class="input" list="foodlist" placeholder="Zutat" value="${esc(row.name)}" data-row="${i}" data-field="name" autocomplete="off">
        <button class="round" data-action="remove-row" data-row="${i}" aria-label="Zutat entfernen">${ICONS.cross}</button>
      </div>
      ${unknown ? `<div class="row" style="margin-top:6px"><label class="small muted" for="k${i}">Kenne ich nicht. kcal pro 100 g:</label>
        <input id="k${i}" class="input" style="flex:0 0 90px" inputmode="numeric" value="${esc(row.kcal100 ?? '')}" data-row="${i}" data-field="kcal100"></div>` : ''}
    </div>`;
  }).join('');
  return `<main class="screen">
    <a class="back" href="#/rezepte">${ICONS.back}Zurück</a>
    <h1>${f.id ? 'Rezept bearbeiten' : 'Eigenes Rezept'}</h1>
    <div class="field"><label for="rname">Name</label>
      <input id="rname" class="input" placeholder="z. B. Omas Kartoffelsuppe" value="${esc(f.name)}" data-form="name"></div>
    <div class="row">
      <div class="field"><label for="rport">Portionen</label><input id="rport" class="input number-input" type="number" inputmode="numeric" min="1" max="12" value="${f.portions}" data-form="portions"></div>
      <div class="field"><label for="rtime">Minuten</label><input id="rtime" class="input number-input" type="number" inputmode="numeric" min="1" max="240" value="${f.time}" data-form="time"></div>
    </div>
    <div class="field"><span class="small muted" style="font-weight:700">Passt zu</span>
      <div class="chips">${MEALS.map((m) => `<button class="chip" data-action="form-meal" data-id="${m.id}" aria-pressed="${f.meals.includes(m.id)}">${m.name}</button>`).join('')}</div></div>
    <section class="field"><h2>Zutaten (für alle Portionen)</h2>
      <datalist id="foodlist">${FOODS.map((x) => `<option value="${esc(x.name)}"></option>`).join('')}</datalist>
      <div style="display:flex;flex-direction:column;gap:8px">${rows}</div>
      <button class="link-btn" style="align-self:flex-start" data-action="add-row">+ Zutat hinzufügen</button>
    </section>
    <div class="field"><label for="rsteps">Schritte (eine Zeile pro Schritt)</label>
      <textarea id="rsteps" class="input" style="height:auto;min-height:120px;padding:10px 14px;line-height:1.5" data-form="steps" placeholder="Zwiebel würfeln.&#10;In Öl anbraten.">${esc(f.steps)}</textarea></div>
    <div id="analysis" style="display:flex;flex-direction:column;gap:10px">${viewAnalysis(f)}</div>
    ${ui.formError ? `<div class="hint" style="background:var(--red-soft)"><span>${esc(ui.formError)}</span></div>` : ''}
    <div class="bottom"><button class="btn" data-action="save-own">Rezept speichern</button></div>
  </main>`;
}

function refreshAnalysis() {
  const box = document.getElementById('analysis');
  if (box && ui.form) box.innerHTML = viewAnalysis(ui.form);
}

function buildOwnRecipe(form) {
  const a = analyze(form);
  const steps = form.steps.split('\n').map((s) => s.trim()).filter(Boolean);
  const rows = form.rows.filter((r) => r.name.trim() && Number(String(r.amount).replace(',', '.')) > 0);
  const id = form.id || `eigen-${Date.now().toString(36)}`;
  return {
    id, own: true,
    name: form.name.trim(),
    meals: form.meals.length ? form.meals : ['mittag', 'abend'],
    time: Math.max(1, Math.round(Number(form.time) || 20)),
    portions: a.portions,
    kcal: Math.round(a.perPortion),
    diet: a.diet,
    allergens: a.allergens,
    foods: rows.map((r) => (findFood(r.name) || {}).name || r.name.trim()),
    ingredients: rows.map((r) => `${fmtAmount(r.amount)} ${unitName(r.unit)} ${r.name.trim()}`),
    steps: steps.length ? steps : ['Alles nach Gefühl zubereiten.'],
    mealprep: a.portions >= 2 || Number(form.time) > 30,
    tint: (state.ownRecipes.find((r) => r.id === id) || {}).tint || OWN_TINTS[state.ownRecipes.length % OWN_TINTS.length],
    rows: rows.map((r) => ({ ...r }))
  };
}

// ---------- Stempelheft ----------

function viewStempel() {
  const colors = ['#C2551F', '#3E8E5E', '#7A4FB5'];
  const rots = [-8, 6, -3, 10, -12, 4, -6, 8, -10, 3];
  const got = allRecipes().filter((r) => state.stamps[r.id]);
  const total = allRecipes().filter(suitable).length;
  const cells = [];
  got.forEach((r, i) => cells.push(`<div class="stamp" style="border-color:${colors[i % 3]};color:${colors[i % 3]};transform:rotate(${rots[i % rots.length]}deg)" title="${state.stamps[r.id]}× gekocht">${esc(r.name)}</div>`));
  const empty = Math.max(3 - (got.length % 3 || 3) + 3, 3);
  for (let i = 0; i < empty; i++) cells.push('<div class="stamp locked" aria-hidden="true">?</div>');
  const n = got.length;
  const toHat = Math.max(0, STAMPS_FOR_HAT - n);
  const hatText = toHat > 0
    ? `Noch ${toHat} Stempel, dann bekommt Ginger eine Kochmütze.`
    : 'Ginger trägt jetzt stolz ihre Kochmütze!';
  return `<main class="screen with-nav">
    <h1>Mein Stempelheft</h1>
    <div class="card" style="display:flex;gap:12px;align-items:center">
      ${ginger(58)}
      <div style="flex:1;display:flex;flex-direction:column;gap:6px">
        <div style="font-size:15px;font-weight:800;line-height:1.3">${hatText}</div>
        <div class="bar"><div style="width:${Math.min(100, (n / STAMPS_FOR_HAT) * 100)}%"></div></div>
      </div>
    </div>
    <div class="stamp-grid">${cells.join('')}</div>
    <p class="small muted" style="text-align:center">${n} von ${total} passenden Rezepten gekocht · ${state.xp} XP · Level ${level()}</p>
  </main>${nav('stempel')}`;
}

// ---------- Ich ----------

function viewIch() {
  const p = state.profile;
  const likes = Object.entries(p.taste).filter(([, v]) => v === 'like').map(([f]) => f);
  const nos = Object.entries(p.taste).filter(([, v]) => v === 'no').map(([f]) => f);
  const allergies = p.allergies.map((a) => ALLERGIES.find((x) => x.id === a).name).join(', ') || 'keine';
  return `<main class="screen with-nav">
    <div class="ginger-says">${ginger(70)}<div class="bubble">Hier kannst du alles ändern, was ich über dich weiß.</div></div>
    <a class="card" href="#/edit/1" style="text-decoration:none;color:inherit;display:flex;flex-direction:column;gap:4px">
      <h3>Ernährung und Ziel</h3>
      <div class="small muted">${DIETS.find((d) => d.id === p.diet).name} · Allergien: ${esc(allergies)} · ${fmt(p.kcal)} kcal am Tag</div>
    </a>
    <a class="card" href="#/edit/2" style="text-decoration:none;color:inherit;display:flex;flex-direction:column;gap:4px">
      <h3>Geschmack</h3>
      <div class="small muted">Mag ich: ${esc(likes.join(', ') || 'noch nichts')}</div>
      <div class="small muted">Mag ich nicht: ${esc(nos.join(', ') || 'nichts')}</div>
    </a>
    <a class="card" href="#/edit/3" style="text-decoration:none;color:inherit;display:flex;flex-direction:column;gap:4px">
      <h3>Zeit zum Kochen</h3>
      <div class="small muted">${MEALS.map((m) => `${m.name} ${p.times[m.id]} Min`).join(' · ')}</div>
    </a>
    <div class="bottom">${ui.confirmReset
      ? `<p class="small" style="text-align:center">Wirklich alles löschen? Stempel und Einstellungen sind dann weg.</p>
         <div class="input-row"><button class="btn secondary" data-action="cancel-reset">Abbrechen</button><button class="btn dark" data-action="reset">Ja, löschen</button></div>`
      : '<button class="btn secondary" data-action="ask-reset">Alles zurücksetzen</button>'}</div>
  </main>${nav('ich')}`;
}

// ---------- Einkauf scannen ----------

// Open-Food-Facts-Kategorien, die zu Lebensmitteln aus nutrition.js passen
const CATEGORY_FOODS = {
  'en:pastas': 'Nudeln', 'en:rices': 'Reis', 'en:potatoes': 'Kartoffeln', 'en:sweet-potatoes': 'Süßkartoffel',
  'en:rolled-oats': 'Haferflocken', 'en:oat-flakes': 'Haferflocken', 'en:breads': 'Brot', 'en:tortillas': 'Tortilla',
  'en:couscous': 'Couscous', 'en:quinoa': 'Quinoa', 'en:flours': 'Mehl', 'en:lentils': 'Linsen', 'en:chickpeas': 'Kichererbsen',
  'en:kidney-beans': 'Kidneybohnen', 'en:tofu': 'Tofu', 'en:eggs': 'Ei', 'en:chicken-breasts': 'Hähnchen', 'en:chickens': 'Hähnchen',
  'en:minced-meats': 'Hackfleisch', 'en:hams': 'Schinken', 'en:salmons': 'Lachs', 'en:tunas': 'Thunfisch', 'en:shrimps': 'Garnelen',
  'en:milks': 'Milch', 'en:oat-based-drinks': 'Haferdrink', 'en:plant-based-milk-alternatives': 'Haferdrink', 'en:yogurts': 'Joghurt',
  'en:quarks': 'Magerquark', 'en:cream-cheeses': 'Frischkäse', 'en:fetas': 'Feta', 'en:mozzarella': 'Mozzarella',
  'en:parmigiano-reggiano': 'Parmesan', 'en:cheeses': 'Käse', 'en:creams': 'Sahne', 'en:butters': 'Butter',
  'en:vegetable-oils': 'Öl', 'en:olive-oils': 'Öl', 'en:coconut-milks': 'Kokosmilch', 'en:pestos': 'Pesto',
  'en:mayonnaises': 'Mayonnaise', 'en:hummus': 'Hummus', 'en:nuts': 'Nüsse', 'en:peanut-butters': 'Erdnussbutter',
  'en:chia-seeds': 'Chiasamen', 'en:honeys': 'Honig', 'en:chocolates': 'Schokolade', 'en:tomatoes': 'Tomaten',
  'en:tomato-purees': 'Passierte Tomaten', 'en:tomato-pastes': 'Tomatenmark', 'en:onions': 'Zwiebel', 'en:carrots': 'Möhre',
  'en:bell-peppers': 'Paprika', 'en:zucchini': 'Zucchini', 'en:broccoli': 'Brokkoli', 'en:spinachs': 'Spinat',
  'en:mushrooms': 'Champignons', 'en:cucumbers': 'Gurke', 'en:salads': 'Salat', 'en:peas': 'Erbsen', 'en:sweet-corn': 'Mais',
  'en:avocados': 'Avocado', 'en:bananas': 'Banane', 'en:apples': 'Apfel', 'en:berries': 'Beeren', 'en:soy-sauces': 'Sojasauce'
};

// Open-Food-Facts-Allergene auf die Allergien der App abbilden
const OFF_ALLERGENS = {
  'en:nuts': 'nuesse', 'en:peanuts': 'nuesse', 'en:gluten': 'gluten', 'en:milk': 'laktose',
  'en:eggs': 'ei', 'en:soybeans': 'soja', 'en:fish': 'fisch'
};

// Wie ein Lebensmittel in der Geschmacksliste heißt (kurze Namen wie „Ei“ würden sonst in „Reis“ gefunden)
const TASTE_KEY = { Ei: 'Eier', Champignons: 'Pilze', Magerquark: 'Quark', Kidneybohnen: 'Bohnen', Öl: null, Gewürze: null };
function tasteKey(foodName) {
  if (!foodName) return null;
  if (foodName in TASTE_KEY) return TASTE_KEY[foodName];
  return foodName.length >= 4 ? foodName : null;
}

function pantryList() {
  return Object.values(state.pantry).sort((a, b) => (b.last || '').localeCompare(a.last || ''));
}

// Lebensmittel aus dem Einkauf, als Schlüssel wie in der Geschmacksliste
function pantryKeys() {
  return [...new Set(pantryList().map((p) => tasteKey(p.food)).filter(Boolean))];
}

function pantryScore(recipe) {
  const text = textOf(recipe);
  return pantryKeys().filter((k) => text.includes(k.toLowerCase())).length;
}

function productWarnings(p) {
  const prof = state.profile;
  const out = [];
  const bad = (p.allergens || []).filter((a) => prof.allergies.includes(a));
  if (bad.length) out.push(`Enthält ${bad.map((a) => ALLERGIES.find((x) => x.id === a).name).join(', ')}`);
  if (p.diet === 'fleisch' && (prof.diet === 'vegan' || prof.diet === 'vegetarisch')) out.push('Nicht vegetarisch');
  else if (p.diet === 'tierisch' && prof.diet === 'vegan') out.push('Nicht vegan');
  return out;
}

async function lookupProduct(code) {
  const fields = 'product_name,product_name_de,brands,nutriments,allergens_tags,ingredients_analysis_tags,categories_tags';
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  try {
    const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json?fields=${fields}`, { signal: ctrl.signal });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.status !== 1 || !data.product) return null;
    const pr = data.product;
    const name = (pr.product_name_de || pr.product_name || '').trim();
    const cats = pr.categories_tags || [];
    let food = findFood(name);
    if (!food) {
      for (let i = cats.length - 1; i >= 0 && !food; i--) if (CATEGORY_FOODS[cats[i]]) food = findFood(CATEGORY_FOODS[cats[i]]);
    }
    const analysis = pr.ingredients_analysis_tags || [];
    const diet = analysis.includes('en:non-vegetarian') ? 'fleisch'
      : analysis.includes('en:non-vegan') ? 'tierisch'
      : analysis.includes('en:vegan') ? 'vegan' : (food && food.diet) || null;
    const kcal = pr.nutriments && Number(pr.nutriments['energy-kcal_100g']);
    return {
      name: name || (food ? food.name : 'Unbekanntes Produkt'),
      brand: (pr.brands || '').split(',')[0].trim(),
      food: food ? food.name : null,
      kcal100: kcal > 0 ? Math.round(kcal) : (food ? food.kcal : null),
      allergens: [...new Set((pr.allergens_tags || []).map((a) => OFF_ALLERGENS[a]).filter(Boolean))],
      diet
    };
  } catch (e) {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function addToPantry(code, info) {
  const old = state.pantry[code];
  state.pantry[code] = { ...(old || {}), ...info, code, count: ((old && old.count) || 0) + 1, last: todayKey() };
  save();
}

async function handleCode(raw) {
  const code = String(raw).replace(/\D/g, '');
  if (code.length < 8) { ui.scanMsg = 'Das sieht nicht nach einem Barcode aus. Er hat meist 8 oder 13 Ziffern.'; render(); return; }
  if (state.pantry[code]) {
    addToPantry(code, {});
    ui.scanMsg = `${state.pantry[code].name} kenne ich schon. Jetzt ${state.pantry[code].count}× gekauft.`;
    ui.lastCode = code;
    render();
    return;
  }
  ui.scanMsg = '';
  render();
  showWait('Ginger schaut nach, was das ist …');
  const info = await lookupProduct(code);
  hideWait();
  if (info) {
    addToPantry(code, info);
    ui.lastCode = code;
    ui.scanMsg = '';
  } else {
    ui.unknownCode = code;
    ui.scanMsg = '';
  }
  render();
}

let scanner = null;

function loadScannerLib() {
  if (window.__Html5QrcodeLibrary__) return Promise.resolve(window.__Html5QrcodeLibrary__);
  showWait('Ginger holt die Kamera …');
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'vendor/html5-qrcode.min.js';
    s.onload = () => { hideWait(); resolve(window.__Html5QrcodeLibrary__); };
    s.onerror = (e) => { hideWait(); reject(e); };
    document.head.appendChild(s);
  });
}

async function startScanner() {
  try {
    const lib = await loadScannerLib();
    const F = lib.Html5QrcodeSupportedFormats;
    scanner = new lib.Html5Qrcode('reader', { formatsToSupport: [F.EAN_13, F.EAN_8, F.UPC_A, F.UPC_E], verbose: false });
    await scanner.start({ facingMode: 'environment' }, { fps: 10, qrbox: { width: 260, height: 140 } }, async (text) => {
      await stopScanner();
      handleCode(text);
    }, () => {});
  } catch (e) {
    await stopScanner();
    ui.scanMsg = 'Die Kamera ließ sich nicht starten. Erlaube den Kamerazugriff oder tipp die Zahlen unter dem Barcode ein.';
    render();
  }
}

async function stopScanner() {
  const s = scanner;
  scanner = null;
  ui.scanning = false;
  if (s) { try { await s.stop(); } catch (e) { /* lief schon nicht mehr */ } }
}

function viewEinkauf() {
  const items = pantryList();
  const last = ui.lastCode && state.pantry[ui.lastCode];
  const taste = state.profile.taste;
  const card = (p) => {
    const key = tasteKey(p.food);
    const warn = productWarnings(p);
    return `<div class="card pantry-item">
      <div class="info">
        <div class="title">${esc(p.name)}</div>
        <div class="meta">${[p.brand, p.food && p.food !== p.name ? p.food : '', p.kcal100 ? `${fmt(p.kcal100)} kcal/100 g` : '', p.count > 1 ? `${p.count}× gekauft` : ''].filter(Boolean).map(esc).join(' · ')}</div>
        ${warn.length ? `<div class="warn-text">${esc(warn.join(' · '))}</div>` : ''}
      </div>
      ${key ? `<button class="round like" data-action="taste" data-food="${esc(key)}" data-value="like" aria-pressed="${taste[key] === 'like'}" aria-label="${esc(key)} mag ich sehr">${ICONS.heart}</button>` : ''}
      <button class="round" data-action="remove-product" data-code="${esc(p.code)}" aria-label="${esc(p.name)} entfernen">${ICONS.cross}</button>
    </div>`;
  };
  const ideas = allRecipes().filter(suitable).map((r) => ({ r, n: pantryScore(r) })).filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n || a.r.time - b.r.time).slice(0, 3);
  let bubble = 'Scann deinen Einkauf. Dann weiß ich, was du da hast und was du gern kaufst.';
  if (last) {
    bubble = !last.food ? `${last.name} habe ich gespeichert. Zu meinen Rezepten passt es noch nicht.`
      : last.food === last.name ? `${last.name} habe ich gespeichert.` : `${last.name}! Das merke ich mir als ${last.food}.`;
  }
  return `<main class="screen with-nav">
    <div class="ginger-says">${ginger(70)}<div class="bubble">${esc(bubble)}</div></div>
    ${ui.scanning
      ? `<div id="reader" class="reader"></div><button class="btn secondary" data-action="stop-scan">Fertig mit Scannen</button>`
      : '<button class="btn" data-action="scan">Barcode scannen</button>'}
    ${ui.scanMsg ? `<div class="hint">${ICONS.paw}<span>${esc(ui.scanMsg)}</span></div>` : ''}
    ${ui.unknownCode
      ? `<div class="card" style="display:flex;flex-direction:column;gap:8px">
          <label class="small muted" for="pname" style="font-weight:700">Das Produkt kenne ich nicht. Wie heißt es?</label>
          <div class="input-row"><input id="pname" class="input" list="foodlist2" placeholder="z. B. Kichererbsen" value="${esc(ui.productDraft)}" data-input="productDraft" autocomplete="off"><button class="btn dark small-btn" data-action="name-product">Speichern</button></div>
          <datalist id="foodlist2">${FOODS.map((x) => `<option value="${esc(x.name)}"></option>`).join('')}</datalist>
        </div>`
      : ''}
    <div class="input-row">
      <label class="sr-only" for="ean">Barcode-Nummer</label>
      <input id="ean" class="input" inputmode="numeric" placeholder="Barcode-Nummer eintippen" value="${esc(ui.codeDraft)}" data-input="codeDraft">
      <button class="btn dark small-btn" data-action="enter-code">Suchen</button>
    </div>
    ${ideas.length ? `<h2>Daraus kannst du kochen</h2>${ideas.map((x) => recipeCard(x.r)).join('')}` : ''}
    <h2>Mein Einkauf ${items.length ? `<span class="small muted">${items.length} Produkte</span>` : ''}</h2>
    ${items.length ? items.map(card).join('') : '<div class="card small muted">Noch nichts gescannt.</div>'}
    ${items.length ? '<p class="small muted">Tipp aufs Herz, wenn du etwas besonders magst. Was du dreimal kaufst, merke ich mir auch so als Lieblingsessen. Produktdaten kommen von Open Food Facts.</p>' : ''}
  </main>${nav('einkauf')}`;
}

// ---------- Router ----------

function route() {
  const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  if (!state.onboarded && parts[0] !== 'start') return ['start', '1'];
  return parts.length ? parts : ['heute'];
}

const app = document.getElementById('app');

let rendering = false;
function render() {
  const [page, a, b] = route();
  let html;
  if (page === 'start') html = a === '3' ? viewStart3(false) : a === '2' ? viewStart2(false) : viewStart1(false);
  else if (page === 'edit') html = a === '3' ? viewStart3(true) : a === '2' ? viewStart2(true) : viewStart1(true);
  else if (page === 'rezepte') html = viewRezepte();
  else if (page === 'rezept') html = viewRezept(a, b);
  else if (page === 'stempel') html = viewStempel();
  else if (page === 'ich') html = viewIch();
  else if (page === 'neu') html = viewNeu(a);
  else if (page === 'einkauf') html = viewEinkauf();
  else html = viewHeute();
  if (ui.toast) html += `<div class="toast" role="status">${esc(ui.toast)}</div>`;
  // Beim Ersetzen verliert ein Feld den Fokus und löst 'change' aus; das soll nicht erneut zeichnen
  rendering = true;
  try { app.innerHTML = html; } finally { rendering = false; }
}

function go(hash) {
  if (location.hash === hash) render();
  else location.hash = hash;
}

function toast(text) {
  ui.toast = text;
  render();
  clearTimeout(toast.t);
  toast.t = setTimeout(() => { ui.toast = ''; render(); }, 2200);
}

window.addEventListener('hashchange', () => {
  if (ui.scanning) stopScanner();
  ui.scanMsg = '';
  ui.lastCode = null;
  ui.unknownCode = null;
  if (ui.justStamped) { state.cooking[ui.justStamped] = []; save(); }
  ui.justStamped = null;
  ui.showManual = false;
  ui.confirmReset = false;
  ui.confirmDelete = false;
  ui.formError = '';
  if (!location.hash.startsWith('#/neu')) ui.form = null;
  render();
  window.scrollTo(0, 0);
});

// ---------- Aktionen ----------

const actions = {
  diet(el) { state.profile.diet = el.dataset.id; },
  allergy(el) {
    const id = el.dataset.id;
    const list = state.profile.allergies;
    state.profile.allergies = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
  },
  goal(el) {
    const g = GOALS.find((x) => x.id === el.dataset.id);
    state.profile.goal = g.id;
    state.profile.kcal = g.kcal;
  },
  taste(el) {
    const food = el.dataset.food;
    const v = el.dataset.value;
    state.profile.taste[food] = state.profile.taste[food] === v ? null : v;
    if (!state.profile.taste[food] && TASTE_FOODS.includes(food)) delete state.profile.taste[food];
  },
  'add-food'() {
    const v = ui.draft.trim().replace(/\s+/g, ' ');
    if (!v) return;
    const name = v.charAt(0).toUpperCase() + v.slice(1);
    state.profile.taste[name] = 'like';
    ui.draft = '';
  },
  time(el) { state.profile.times[el.dataset.meal] = Number(el.dataset.min); },
  'finish-start'() { state.onboarded = true; save(); go('#/heute'); return 'skip'; },
  'go-ich'() { save(); go('#/ich'); return 'skip'; },
  'next-idea'(el) { const m = el.dataset.meal; state.pick[m] = (state.pick[m] || 0) + 1; },
  filter(el) { ui.recipeFilter = el.dataset.id; },
  'show-manual'() { ui.showManual = true; },
  'add-manual'() {
    const n = Math.round(Number(ui.manualKcal));
    if (!n || n <= 0 || n > 5000) return;
    const key = todayKey();
    state.log[key] = [...todayLog(), { recipeId: null, meal: 'extra', kcal: n, name: 'Etwas anderes' }];
    ui.manualKcal = '';
    ui.showManual = false;
  },
  cooked(el) {
    const r = allRecipes().find((x) => x.id === el.dataset.recipe);
    const meal = el.dataset.meal || currentMeal();
    const key = todayKey();
    state.log[key] = [...todayLog(), { recipeId: r.id, meal, kcal: r.kcal, name: r.name }];
    const before = stampCount();
    state.stamps[r.id] = (state.stamps[r.id] || 0) + 1;
    state.xp += XP_PER_RECIPE;
    ui.justStamped = r.id;
    save();
    if (before < STAMPS_FOR_HAT && stampCount() >= STAMPS_FOR_HAT) toast('Ginger hat ihre Kochmütze bekommen!');
  },
  'undo-eaten'(el) {
    const key = todayKey();
    const log = todayLog();
    const e = log[Number(el.dataset.index)];
    if (!e) return;
    state.log[key] = log.filter((_, i) => i !== Number(el.dataset.index));
    // Stempel und XP, die das Kochen gebracht hat, wieder abziehen
    if (e.recipeId && state.stamps[e.recipeId]) {
      state.stamps[e.recipeId] -= 1;
      if (!state.stamps[e.recipeId]) delete state.stamps[e.recipeId];
      state.xp = Math.max(0, state.xp - XP_PER_RECIPE);
    }
    if (ui.justStamped === e.recipeId) ui.justStamped = null;
  },
  scan() {
    ui.scanning = true;
    ui.scanMsg = '';
    ui.unknownCode = null;
    render();
    startScanner();
    return 'skip';
  },
  'stop-scan'() { stopScanner(); },
  'enter-code'() {
    const code = ui.codeDraft;
    ui.codeDraft = '';
    handleCode(code);
    return 'skip';
  },
  'name-product'() {
    const name = ui.productDraft.trim();
    if (!name) return;
    const food = findFood(name);
    addToPantry(ui.unknownCode, { name, brand: '', food: food ? food.name : null, kcal100: food ? food.kcal : null, allergens: (food && food.allergens) || [], diet: (food && food.diet) || null });
    ui.lastCode = ui.unknownCode;
    ui.unknownCode = null;
    ui.productDraft = '';
  },
  'remove-product'(el) {
    delete state.pantry[el.dataset.code];
    if (ui.lastCode === el.dataset.code) ui.lastCode = null;
  },
  'ask-reset'() { ui.confirmReset = true; },
  'add-row'() { ui.form.rows.push({ amount: '', unit: 'g', name: '' }); },
  'remove-row'(el) {
    ui.form.rows.splice(Number(el.dataset.row), 1);
    if (!ui.form.rows.length) ui.form.rows.push({ amount: '', unit: 'g', name: '' });
  },
  'form-meal'(el) {
    const id = el.dataset.id;
    const m = ui.form.meals;
    ui.form.meals = m.includes(id) ? m.filter((x) => x !== id) : [...m, id];
  },
  'apply-tip'(el) {
    const tip = analyze(ui.form).tips[Number(el.dataset.tip)];
    const ac = tip && tip.actions && tip.actions[Number(el.dataset.act)];
    if (!ac) return;
    if (ac.kind === 'scale') {
      ui.form.rows = ui.form.rows.map((r) => {
        const n = Number(String(r.amount).replace(',', '.'));
        return n > 0 ? { ...r, amount: String(roundAmount(n * ac.value, r.unit)).replace('.', ',') } : r;
      });
    } else if (ac.kind === 'portions') {
      ui.form.portions = ac.value;
    } else if (ac.kind === 'set') {
      ui.form.rows[ac.row] = { ...ui.form.rows[ac.row], amount: String(ac.amount).replace('.', ','), unit: ac.unit };
    }
  },
  'save-own'() {
    const f = ui.form;
    const a = analyze(f);
    if (!f.name.trim()) { ui.formError = 'Gib dem Rezept noch einen Namen.'; return; }
    if (!a.lines.length) { ui.formError = 'Trag mindestens eine Zutat mit Menge ein.'; return; }
    const r = buildOwnRecipe(f);
    const i = state.ownRecipes.findIndex((x) => x.id === r.id);
    if (i >= 0) state.ownRecipes[i] = r; else state.ownRecipes.unshift(r);
    ui.form = null;
    ui.formError = '';
    save();
    go(`#/rezept/${r.id}`);
    return 'skip';
  },
  'ask-delete'() { ui.confirmDelete = true; },
  'cancel-delete'() { ui.confirmDelete = false; },
  'delete-own'(el) {
    state.ownRecipes = state.ownRecipes.filter((x) => x.id !== el.dataset.recipe);
    save();
    go('#/rezepte');
    return 'skip';
  },
  'cancel-reset'() { ui.confirmReset = false; },
  reset() {
    ui.confirmReset = false;
    state = defaultState();
    save();
    go('#/start/1');
    return 'skip';
  }
};

function currentMeal() {
  const h = new Date().getHours();
  return h < 11 ? 'fruehstueck' : h < 16 ? 'mittag' : 'abend';
}

app.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action]');
  if (!el || el.dataset.action === 'step') return;
  const fn = actions[el.dataset.action];
  if (!fn) return;
  e.preventDefault();
  if (fn(el) === 'skip') return;
  save();
  render();
});

app.addEventListener('change', (e) => {
  const el = e.target;
  if (rendering) return;
  // Bei Zutatennamen und Einheiten neu zeichnen (z. B. für das Feld bei unbekannten Zutaten)
  if (ui.form && el.dataset.row !== undefined && (el.dataset.field === 'name' || el.dataset.field === 'unit')) {
    const row = ui.form.rows[Number(el.dataset.row)];
    row[el.dataset.field] = el.value;
    // Nur neu zeichnen, wenn das kcal-Feld für unbekannte Zutaten auftauchen oder verschwinden muss
    const isUnknown = Boolean(row.name.trim() && !findFood(row.name));
    const hasField = Boolean(el.closest('.ing-row').querySelector('[data-field="kcal100"]'));
    if (isUnknown !== hasField) {
      const y = window.scrollY;
      render();
      window.scrollTo(0, y);
    } else refreshAnalysis();
    return;
  }
  if (el.dataset.action === 'step') {
    const id = el.dataset.recipe;
    const i = Number(el.dataset.step);
    const set = new Set(state.cooking[id] || []);
    if (el.checked) set.add(i); else set.delete(i);
    state.cooking[id] = [...set];
    save();
    render();
  } else if (el.dataset.input === 'kcal') {
    const n = Math.round(Number(el.value));
    if (n >= 1000 && n <= 5000) { state.profile.kcal = n; save(); }
    else el.value = state.profile.kcal;
  }
});

app.addEventListener('input', (e) => {
  const t = e.target;
  if (ui.form && t.dataset.row !== undefined) {
    ui.form.rows[Number(t.dataset.row)][t.dataset.field] = t.value;
    refreshAnalysis();
    return;
  }
  if (ui.form && t.dataset.form) {
    ui.form[t.dataset.form] = t.value;
    if (t.dataset.form !== 'name' && t.dataset.form !== 'steps') refreshAnalysis();
    return;
  }
  const key = e.target.dataset.input;
  if (['draft', 'manualKcal', 'codeDraft', 'productDraft'].includes(key)) ui[key] = e.target.value;
});

app.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter') return;
  const key = e.target.dataset.input;
  if (key === 'draft') { actions['add-food'](); save(); render(); document.getElementById('eigenes')?.focus(); }
  if (key === 'manualKcal') { actions['add-manual'](); save(); render(); }
  if (key === 'codeDraft') actions['enter-code']();
  if (key === 'productDraft') { actions['name-product'](); save(); render(); }
});

render();

if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
