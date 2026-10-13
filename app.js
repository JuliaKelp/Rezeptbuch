import { RECIPES, TASTE_FOODS } from './recipes.js';
import { FOODS, UNITS, NUTRIENTS, findFood, gramsOf, kcalOf, emptyNutrients, addNutrients, nutrientsFor, nutrientsOfText, gramsOfText, scaleIngredient, parseIngredient, loadNutrition, NOT_FROM_BLS, MICROS, hasMicros, microsOf, blsMicros } from './nutrition.js';

// ---------- Grunddaten ----------

const STORAGE_KEY = 'rezeptbuch-v1';

const MEALS = [
  { id: 'fruehstueck', name: 'Frühstück', share: 0.25 },
  { id: 'mittag', name: 'Mittagessen', share: 0.35 },
  { id: 'abend', name: 'Abendessen', share: 0.4 }
];
// Bei 2 Mahlzeiten am Tag: lieber zwei Snacks als riesige Portionen
const SNACK = { id: 'snack', name: 'Snack' };
const SNACKS_PER_DAY = 2;
const MEAL_ORDER = ['fruehstueck', 'mittag', 'snack', 'abend'];

// Ernährungsform, Allergien, Kalorien- und Makroziele stellt man im Tracker ein (Einstellungen dort), das Rezeptbuch liest sie nur.
// Welche Rezept-Ernährungsformen zur Tracker-Einstellung passen
const DIET_ALLOWS = { vegan: ['vegan'], veg: ['vegan', 'vegetarisch'], all: ['vegan', 'vegetarisch', 'fisch', 'fleisch'] };
const DIET_NAMES = { vegan: 'Vegan', veg: 'Vegetarisch', all: 'Alles' };
// Allergene der Rezepte (recipes.js) und die passenden Allergen-Codes des Trackers (LMIV)
const ALLERGEN_CODES = { gluten: ['gl'], laktose: ['mi'], ei: ['ei'], nuesse: ['nu', 'er'], soja: ['so'], fisch: ['fi'] };
const ALLERGEN_NAMES = { gl: 'Gluten', mi: 'Milch/Laktose', ei: 'Ei', nu: 'Schalenfrüchte', er: 'Erdnuss', so: 'Soja', fi: 'Fisch', kr: 'Krebstiere', we: 'Weichtiere', se: 'Sellerie', sf: 'Senf', sa: 'Sesam', lu: 'Lupine' };
// Ohne Kalorienziel im Tracker plant Ginger mit diesem Wert
const KCAL_FALLBACK = 2000;

// Erklärungen hinter den Info-Knöpfen: warum Ginger etwas wissen will
const INFO = {
  tracker: 'Ernährungsform, Allergien und dein Kalorienziel stellst du einmal im Tracker ein. Ginger liest sie von dort: Sie schlägt nur passende Rezepte vor und teilt dein Kalorienziel auf die Mahlzeiten auf.',
  taste: 'Was du magst, schlägt Ginger öfter vor. Was du nicht magst, kommt gar nicht mehr. Lebensmittel, die du wegen Ernährung oder Allergie eh nicht isst, fragt sie gar nicht erst ab.',
  meals: 'Ginger teilt deine Kalorien auf die Mahlzeiten auf. Bei 2 Mahlzeiten bleiben die Portionen normal groß und den Rest bekommst du als zwei kleine Snacks.',
  times: 'Ginger schlägt pro Mahlzeit nur Rezepte vor, die in diese Zeit passen. Wenn es knapp ist, plant sie Vorbereitung ein, zum Beispiel Overnight Oats am Vorabend.',
  portions: 'Damit die Zutatenmengen in Rezepten und auf der Einkaufsliste stimmen, wenn du für mehrere kochst.',
  snack: 'Statt dem vorgesehenen Snack kannst du auch etwas aus deinem Vorrat nehmen. Ich zeige, wie viel davon jetzt passt: höchstens eine übliche Portion, höchstens was du da hast, und nur so viel, wie in deinen Rahmen passt. Darunter steht, wie viel deine restlichen kcal ganz ausnutzt, aber nie mehr als eine Packung. Gesund oder nicht spielt keine Rolle.',
  vorrat: 'Tipp auf ein Lebensmittel: Dort änderst du die Menge, trägst es als gegessen ein, markierst es als Snack (dann schlägt Ginger es dir als Snack vor) oder mit dem Herz (das magst du besonders). Beim Kochen ziehe ich ab, was als Zutat passt („zählt als“). Ohne Packungsgröße weiß ich nur, wie viele Packungen da sind, nicht wie viel Gramm.',
  backup: 'Beim Schließen fragen darf eine Web-App nur dort, wo der Browser es zulässt, und dann nur mit seinem eigenen Satz („Seite verlassen?“). Auf dem iPhone geht das gar nicht. Deshalb frage ich zusätzlich, sobald du die App wieder öffnest und seit dem letzten Export etwas geändert wurde.',
  deficit: 'Ich bevorzuge Gerichte, die im Verhältnis zu ihren Kalorien viel davon enthalten, gemessen am Tageswert der Deutschen Gesellschaft für Ernährung (DGE). Das ersetzt keine ärztliche Behandlung: Ob und wie viel du ergänzen solltest, klärst du mit deiner Ärztin oder deinem Arzt. Nichts davon wird geschätzt; fehlt in der Quelle ein Wert, zählt das Gericht nicht.',
  heute: 'Gingers Vorschläge passen zu deiner Zeit, deinem Geschmack und dem, was heute laut Tracker noch frei ist. Was du schon im Vorrat hast, kommt zuerst. Unter jedem Gericht steht, ob alles da ist oder was fehlt.'
};
function infoBtn(key) {
  const open = !!ui.info[key];
  return `<button class="info-btn" data-action="info" data-key="${key}" aria-expanded="${open}" aria-label="Warum fragt Ginger das?">i</button>`;
}
function infoText(key) {
  return ui.info[key] ? `<div class="info-text">${ICONS.paw}<span>${esc(INFO[key])}</span></div>` : '';
}
function infoHead(tag, title, key, extra = '') {
  return `<div class="info-head"><${tag}>${title}</${tag}>${extra}${infoBtn(key)}</div>${infoText(key)}`;
}

const TIME_OPTIONS = [5, 10, 15, 30, 45];
const SHORT_TIME = 10;
const XP_PER_RECIPE = 40;
const STAMPS_FOR_HAT = 10;
const LEVEL_NAMES = ['Küchenkätzchen', 'Schnurr-Köchin', 'Küchenkatze', 'Pfannen-Profi', 'Meisterkatze'];

// Lebensmittel, die bei einer Ernährungsform oder Allergie gar nicht erst abgefragt werden
const HIDE_FOR_DIET = {
  vegan: ['Eier', 'Käse', 'Feta', 'Joghurt', 'Quark', 'Hähnchen', 'Lachs', 'Thunfisch'],
  veg: ['Hähnchen', 'Lachs', 'Thunfisch'],
  all: []
};
const HIDE_FOR_ALLERGY = { ei: ['Eier'], mi: ['Käse', 'Feta', 'Joghurt', 'Quark'], fi: ['Lachs', 'Thunfisch'], so: ['Tofu'] };

function defaultState() {
  return {
    onboarded: false,
    profile: {
      portions: 1,
      mealCount: 3,          // 2 oder 3 Mahlzeiten am Tag
      skip: 'fruehstueck',   // welche Mahlzeit bei 2 ausfällt
      taste: {},
      times: { fruehstueck: 5, mittag: 15, abend: 30 }
    },
    stamps: {},    // { recipeId: Anzahl gekocht }
    xp: 0,
    cooking: {},   // { recipeId: [erledigte Schritt-Indizes] }
    pick: {},      // { meal: Index der aktuellen Idee }
    ownRecipes: [], // selbst eingetragene Rezepte
    snacks: {},    // { Tracker-Lebensmittel-ID: true } vorgemerkte Produkte, die Ginger als Snack vorschlägt
    cookedEntries: {}, // { Tracker-Eintrags-ID: recipeId } Einträge, die einen Stempel gebracht haben
    rejected: {},  // { recipeId: true } abgelehnte Vorschläge
    favorites: {}, // { recipeId: true }
    listExtra: {}, // { recipeId: { n, f } } fehlende Zutaten zum Kochen aus dem Vorrat auf der Einkaufsliste
    week: null     // { seed, meals, slots: { 'JJJJ-MM-TT|meal': { id, ok } }, bought: { key: true }, portions }
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

function allRecipes() { return [...state.ownRecipes, ...RECIPES, ...productSnacks()]; }

// Eingaben, die nicht sofort neu gezeichnet werden (sonst springt die Tastatur weg)
const ui = { info: {}, rejecting: null, swapFrom: null, cell: null, otherSeen: {}, planning: null, recipeQuery: '', have: [], haveDraft: '', prevPage: '', portions: {}, form: null, formError: '', confirmDelete: false, confirmReset: false, draft: '', recipeFilter: 'alle', toast: '', justStamped: null };

// ---------- Hilfsfunktionen ----------

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function todayKey() { return keyOf(new Date()); }

function fmt(n) { return Math.round(n).toLocaleString('de-DE'); }

function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function mealName(id) { return ([...MEALS, SNACK].find((m) => m.id === id) || {}).name || ''; }

function mainMeals() {
  const p = state.profile;
  return p.mealCount === 2 ? MEALS.filter((m) => m.id !== p.skip) : MEALS;
}
// Hauptmahlzeiten plus Snacks, in Tagesreihenfolge
function dayMeals() {
  const list = state.profile.mealCount === 2 ? [...mainMeals(), SNACK] : mainMeals();
  return list.sort((a, b) => MEAL_ORDER.indexOf(a.id) - MEAL_ORDER.indexOf(b.id));
}
// Kalorienbudget für eine Mahlzeit. Bei 2 Mahlzeiten bleiben die Portionen normal groß (je 35 %),
// den Rest decken zwei Snacks mit je 15 %.
function mealBudget(meal) {
  const p = state.profile;
  const kcal = kcalGoal();
  if (p.mealCount === 2) return kcal * (meal === 'snack' ? 0.15 : 0.35);
  if (meal === 'snack') return kcal * 0.1;
  return kcal * (MEALS.find((m) => m.id === meal) || MEALS[1]).share;
}
// ---------- Ziele und Journal aus dem Tracker ----------

// Kalorienziel, das heute im Tracker gilt (oder der Startwert, wenn dort noch keins steht)
function kcalGoal() { return trackerGoal().goal || KCAL_FALLBACK; }
function hasKcalGoal() { return !!trackerGoal().goal; }

// Tagesziele für Nährstoffe, wie der Tracker sie rechnet: Makros aus seinem Ernährungsziel,
// Ballaststoffe 30 g und freier Zucker < 10 % (bzw. 5 %) der kcal bei seinen Presets, sonst die eigenen Werte dort.
function nutrientTargets() {
  const g = trackerGoal();
  const kcal = g.goal || null;
  const auto = g.preset && g.preset !== 'custom';
  const pct = readTracker().sugarPct === 5 ? 5 : 10;
  return {
    kcal, protein: g.protein || null, kh: g.carbs || null, fett: g.fat || null,
    ballast: auto ? 30 : g.fiber || null,
    zugesetzt: auto ? (kcal ? Math.round((kcal * pct) / 100 / 4) : null) : g.sugar || null
  };
}

// Richtung des Ziels wie im Tracker: Gewichtsziel (aktiv) > Ernährungsziel (Muskelaufbau = zunehmen, Fettabbau = abnehmen) > halten
function goalDir() {
  const t = readTracker();
  const o = t.wgoal;
  const w = t.profile && t.profile.weight;
  if (o && o.on && o.target && w) return o.target > w ? 'gain' : o.target < w ? 'lose' : 'keep';
  const pr = trackerGoal().preset;
  return pr === 'muscle' ? 'gain' : pr === 'cut' ? 'lose' : 'keep';
}

// Ernährungsform und Allergene aus den Tracker-Einstellungen
function trackerDiet() {
  const d = readTracker().diet || {};
  return { type: DIET_ALLOWS[d.type] ? d.type : 'all', allergens: Array.isArray(d.allergens) ? d.allergens : [] };
}
function blockedAllergens() {
  const codes = trackerDiet().allergens;
  return Object.keys(ALLERGEN_CODES).filter((a) => ALLERGEN_CODES[a].some((c) => codes.includes(c)));
}

// Journal-Einträge eines Tages im Tracker, mit kcal und Mahlzeit wie im Rezeptbuch
const FROM_TRACKER_MEAL = { breakfast: 'fruehstueck', lunch: 'mittag', dinner: 'abend', snack: 'snack' };
function journal(day = todayKey()) {
  const days = readTracker().days || {};
  return (days[day] || []).map((e) => ({
    id: e.id, name: e.n || 'Eintrag', meal: FROM_TRACKER_MEAL[e.meal] || 'snack',
    kcal: ((e.k || 0) * (e.grams || 0)) / 100,
    recipeId: typeof e.ref === 'string' && e.ref.startsWith('custom:rezeptbuch-') ? e.ref.slice(18) : null
  }));
}
function eatenToday() { return journal().reduce((s, e) => s + e.kcal, 0); }

// Wie weit liegt die Makro-Verteilung eines Rezepts neben den Tageszielen? 0 = passt genau, negativ = weiter weg.
// Beim Abnehmen zählt mehr Eiweiß nicht als Abweichung.
function macroScore(r) {
  const n = recipeNutrients(r);
  if (!n || !n.kcal || !(n.protein || n.kh || n.fett)) return 0;
  const t = nutrientTargets();
  if (!t.kcal || !t.protein || !t.fett) return 0; // ohne Makroziel im Tracker zählen nur die Kalorien
  const p = (n.protein * 4) / n.kcal;
  const f = (n.fett * 9) / n.kcal;
  const tp = (t.protein * 4) / t.kcal;
  const tf = (t.fett * 9) / t.kcal;
  let dp = p - tp;
  if (goalDir() === 'lose' && dp > 0) dp = 0;
  return -(Math.abs(dp) + Math.abs(f - tf) * 0.7) * 12;
}

// Eiweiß, Kohlenhydrate, Fett kurz in einer Zeile
function macroLine(n, f = 1) {
  return `${fmt(n.protein * f)} g Eiweiß · ${fmt(n.kh * f)} g KH · ${fmt(n.fett * f)} g Fett`;
}

// Makros als kleiner Balken (Anteil an der Energie, Farben wie im Tracker) und darunter die Gramm in denselben Farben
function macroMini(n, f = 1) {
  const p = (n.protein || 0) * f, c = (n.kh || 0) * f, fa = (n.fett || 0) * f;
  const e = p * 4 + c * 4 + fa * 9 || 1;
  const w = (x) => (x / e).toFixed(3);
  return `<span class="rc-macro"><span class="mini-bar" aria-hidden="true"><i style="flex:${w(p * 4)};background:var(--mp)"></i><i style="flex:${w(c * 4)};background:var(--mc)"></i><i style="flex:${w(fa * 9)};background:var(--mf)"></i></span><span class="m-p" title="Eiweiß">E ${fmt(p)}</span><span class="m-c" title="Kohlenhydrate">KH ${fmt(c)}</span><span class="m-f" title="Fett">F ${fmt(fa)} g</span><span class="sr-only">${macroLine({ protein: p, kh: c, fett: fa })}</span></span>`;
}

// Drei kleine Balken für die Makros im Wochenplan, gemessen an einem (Teil-)Ziel aus dem Tracker. Ohne Makroziel nur die Gramm.
function macroBars(n, t, share = 1) {
  const row = (id, name) => {
    const goal = t[id] ? Math.round(t[id] * share) : 0;
    const v = n[id] || 0;
    return `<div class="macro"><span>${name}</span><div class="bar small-bar"><div style="width:${goal ? Math.min(100, (v / goal) * 100) : 0}%"></div></div><b>${fmt(v)}<small>${goal ? ` / ${fmt(goal)}` : ''} g</small></b></div>`;
  };
  return `<div class="macros">${row('protein', 'Eiweiß')}${row('kh', 'Kohlenhydrate')}${row('fett', 'Fett')}</div>`;
}

function dietName(id) { return { vegan: 'vegan', vegetarisch: 'vegetarisch', fisch: 'mit Fisch', fleisch: 'mit Fleisch' }[id]; }

function stampCount() { return Object.keys(state.stamps).length; }
function level() { return Math.floor(state.xp / 100) + 1; }
function levelName() { return LEVEL_NAMES[Math.min(level(), LEVEL_NAMES.length) - 1]; }

// ---------- Rezeptauswahl ----------

function textOf(recipe) {
  return (recipe.foods.join(' ') + ' ' + recipe.ingredients.join(' ') + ' ' + recipe.name).toLowerCase();
}

function suitable(recipe) {
  const p = state.profile;
  if (state.rejected && state.rejected[recipe.id]) return false;
  if (!DIET_ALLOWS[trackerDiet().type].includes(recipe.diet)) return false;
  const blocked = blockedAllergens();
  if (recipe.allergens.some((a) => blocked.includes(a))) return false;
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
  return liked.filter((food) => text.includes(food.toLowerCase())).length;
}

// ---------- Aus abgelehnten Rezepten lernen ----------
// Ähnlich = gleiche Hauptzutaten oder gleiche Wörter im Namen (z. B. „Overnight Oats“). Ähnliche Rezepte rutschen in den
// Vorschlägen und im Wochenplan weit nach hinten; Zutaten, die in 2 oder mehr abgelehnten Rezepten stecken, werden seltener.
const COMMON_FOODS = new Set(['Öl', 'Zwiebel', 'Knoblauch', 'Gewürze', 'Butter', 'Gemüsebrühe', 'Zitrone']);
const NAME_FILLER = new Set(['mit', 'und', 'auf', 'aus', 'im', 'in', 'vom', 'dem', 'der', 'die', 'das', 'ein', 'eine', 'kleiner', 'kleines', 'kleine', 'schnelle', 'vegane', 'veganes', 'veganer', 'brot']);
const keyCache = new WeakMap();
function recipeKeys(r) {
  if (keyCache.has(r)) return keyCache.get(r);
  const foods = new Set();
  for (const line of r.ingredients || []) {
    const p = parseIngredient(line);
    if (p.amount === null) continue;
    const f = findFood(p.name.replace(/[()]/g, ' '));
    if (f && !COMMON_FOODS.has(f.name)) foods.add(f.name);
  }
  const words = new Set(String(r.name).toLowerCase().split(/[\s\-–,]+/).filter((w) => w.length > 2 && !NAME_FILLER.has(w)));
  const keys = { foods, words };
  keyCache.set(r, keys);
  return keys;
}
function overlap(a, b) {
  if (!a.size || !b.size) return 0;
  let both = 0;
  for (const x of a) if (b.has(x)) both++;
  return both / (a.size + b.size - both);
}
function rejectedRecipes() {
  const all = allRecipes();
  return Object.keys(state.rejected || {}).map((id) => all.find((r) => r.id === id)).filter(Boolean);
}
// Zutaten, die in mindestens 2 abgelehnten Rezepten vorkommen (außer als Lieblingszutat markierte)
function learnedFoods() {
  const count = {};
  for (const r of rejectedRecipes()) for (const f of recipeKeys(r).foods) count[f] = (count[f] || 0) + 1;
  const taste = state.profile.taste || {};
  return Object.keys(count).filter((f) => count[f] >= 2 && taste[tasteKey(f)] !== 'like');
}
// 0 = gar nicht ähnlich, 1 = gleich
function rejectSimilarity(recipe) {
  const k = recipeKeys(recipe);
  let best = 0;
  for (const r of rejectedRecipes()) {
    if (r.id === recipe.id) continue;
    const rk = recipeKeys(r);
    best = Math.max(best, overlap(k.foods, rk.foods), overlap(k.words, rk.words));
  }
  return best;
}
// Abzug für die Vorschlags-Punkte; ab 50 % Ähnlichkeit so viel, dass das Rezept praktisch nicht mehr vorgeschlagen wird
function rejectPenalty(recipe) {
  if (!Object.keys(state.rejected || {}).length) return 0;
  const sim = rejectSimilarity(recipe);
  const learned = learnedFoods();
  const foods = recipeKeys(recipe).foods;
  return (sim >= 0.5 ? 20 : sim * 10) + 2 * learned.filter((f) => foods.has(f)).length;
}

// Wie passt ein Rezept in die verfügbare Zeit? 'fits', 'prep' (am Vorabend), 'vorkochen' (doppelt kochen) oder null
function timeMode(recipe, meal) {
  const t = meal === 'snack' ? 10 : state.profile.times[meal];
  if (recipe.prep) return recipe.serve <= t ? 'prep' : null;
  if (recipe.time <= t) return 'fits';
  if (recipe.mealprep) return 'vorkochen';
  return null;
}

function ideasFor(meal) {
  const budget = mealBudget(meal);
  const day = todayKey();
  const cookedToday = new Set(journal().map((e) => e.recipeId).filter(Boolean));
  const tipRecipe = meal === 'mittag' ? (prepTips().find((t) => t.recipe && t.recipe.mealprep) || {}).recipe?.id : null;
  const stocked = trackerPantry().some((x) => x.qty !== 0);
  const persons = state.profile.portions || 1;
  return allRecipes()
    .filter((r) => r.meals.includes(meal) && suitable(r))
    .map((r) => ({ recipe: r, mode: timeMode(r, meal) }))
    .filter((x) => x.mode)
    .map((x) => {
      const r = x.recipe;
      let score = likeScore(r) * 3 - Math.abs(r.kcal - budget) / 80;
      if (x.mode === 'vorkochen') score -= 2;
      if (x.mode === 'vorkochen' && r.id === tipRecipe) score += 4; // passt zum Vorkoch-Tipp
      if (stocked && !r.product) {
        // Was schon im Vorrat ist, kommt zuerst (dieselbe Prüfung wie bei „Kochen mit dem Vorrat“)
        const c = cookCheck(r, persons);
        score += c.missing.length ? -c.missing.filter((m) => !m.part).length * 1.2 - c.missing.filter((m) => m.part).length * 0.8 : 3;
      } else score += pantryScore(r) * 1.5;
      score += macroScore(r); // passt zu deinen Makro-Zielen
      if (isFav(r)) score += 3;
      if (cookedToday.has(r.id)) score -= 10;
      score -= rejectPenalty(r); // ähnlich wie abgelehnte Rezepte
      score += microBonus(r); // reich an dem, was dir fehlt
      score += (hashStr(day + r.id) % 100) / 60; // jeden Tag etwas Abwechslung
      return { ...x, score };
    })
    .sort((a, b) => b.score - a.score);
}

function prepTips() {
  const times = state.profile.times;
  const tips = [];
  const eats = mainMeals().map((m) => m.id);
  if (eats.includes('fruehstueck') && times.fruehstueck <= SHORT_TIME) {
    const oats = allRecipes().filter((r) => r.prep && r.meals.includes('fruehstueck') && suitable(r))
      .sort((a, b) => likeScore(b) - rejectPenalty(b) - likeScore(a) + rejectPenalty(a))[0];
    if (oats) tips.push({ recipe: oats, text: `Setz heute Abend nebenbei ${oats.name} für morgen früh an. Dauert nur ${oats.time} Min.` });
  }
  const dinnerDone = journal().some((e) => e.meal === 'abend');
  if (eats.includes('mittag') && eats.includes('abend') && times.mittag <= SHORT_TIME && !dinnerDone) {
    const mp = allRecipes().filter((r) => r.mealprep && r.meals.includes('abend') && suitable(r))
      .sort((a, b) => likeScore(b) - rejectPenalty(b) - likeScore(a) + rejectPenalty(a) || (hashStr(todayKey() + a.id) % 7) - (hashStr(todayKey() + b.id) % 7))[0];
    if (mp) tips.push({ recipe: mp, text: `Koch heute Abend ${mp.name} doppelt und nimm eine Portion morgen zum Mittagessen mit.` });
  }
  if (eats.includes('abend') && times.abend <= SHORT_TIME) {
    tips.push({ recipe: null, text: 'Abends ist wenig Zeit: Koch am Wochenende ein Gericht mit Vorkoch-Tipp in doppelter Menge und friere Portionen ein.' });
  }
  return tips;
}

// ---------- Wochenplan ----------

function keyOf(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function dateOf(key) { const [y, m, d] = key.split('-').map(Number); return new Date(y, m - 1, d); }
function addDays(key, n) { const d = dateOf(key); d.setDate(d.getDate() + n); return keyOf(d); }
function weekDays() { const t = todayKey(); return [0, 1, 2, 3, 4, 5, 6].map((i) => addDays(t, i)); }
function dayName(key) {
  if (key === todayKey()) return 'Heute';
  if (key === addDays(todayKey(), 1)) return 'Morgen';
  return dateOf(key).toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'numeric' });
}
function shortDay(key) {
  const d = dateOf(key);
  return `${['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'][d.getDay()]} ${d.getDate()}.`;
}

function recipeById(id) { return allRecipes().find((r) => r.id === id); }
function isFav(r) { return !!(state.favorites && state.favorites[r.id]); }

// Der Plan läuft immer über die nächsten 7 Tage ab heute. Leere Plätze füllt Ginger selbst.
function ensureWeek() {
  if (!state.week) state.week = { seed: 0, meals: [], slots: {}, bought: {} };
  const w = state.week;
  // Mahlzeiten im Plan folgen dem Profil (2 oder 3 Mahlzeiten), bis man sie im Plan selbst ändert
  const mealsKey = `${state.profile.mealCount}|${state.profile.skip}`;
  if (w.mealsKey !== mealsKey) { w.meals = dayMeals().map((m) => m.id); w.mealsKey = mealsKey; }
  const days = weekDays();
  const used = {};
  for (const [k, s] of Object.entries(w.slots)) {
    const r = recipeById(s.id);
    if (k.split('|')[0] < days[0] || !r || !suitable(r)) delete w.slots[k];
    else used[s.id] = (used[s.id] || 0) + 1;
  }
  for (const day of days) {
    for (const meal of w.meals) {
      const k = `${day}|${meal}`;
      if (w.slots[k]) continue;
      const r = weekCandidates(meal, day, used)[0];
      if (!r) continue;
      w.slots[k] = { id: r.id, ok: false };
      used[r.id] = (used[r.id] || 0) + 1;
    }
  }
  return w;
}

// ---------- Mängel (Eisen, B12 …) ----------
// Tageswerte der DGE für Erwachsene (Referenzwerte, Abruf 13.10.2026). w = Frauen, m = Männer.
const DGE = {
  fe: { w: 16, m: 11, kind: 'Empfehlung', year: 2023, note: 'Frauen vor den Wechseljahren 16 mg, danach und ohne Regelblutung 14 bzw. 11 mg', url: 'https://www.dge.de/wissenschaft/referenzwerte/eisen/' },
  mg: { w: 300, m: 350, kind: 'Schätzwert', year: 2021, url: 'https://www.dge.de/wissenschaft/referenzwerte/magnesium/' },
  b12: { w: 4, m: 4, kind: 'Schätzwert', year: 2018, url: 'https://www.dge.de/wissenschaft/referenzwerte/vitamin-b12/' },
  zn: { w: 8, m: 14, kind: 'Empfehlung', year: 2019, note: 'bei mittlerer Phytatzufuhr; Frauen 7 bis 10 mg, Männer 11 bis 16 mg', url: 'https://www.dge.de/wissenschaft/referenzwerte/zink/' },
  ca: { w: 1000, m: 1000, kind: 'Empfehlung', year: 2013, url: 'https://www.dge.de/wissenschaft/referenzwerte/calcium/' },
  fol: { w: 300, m: 300, kind: 'Empfehlung', year: 2015, note: 'Folat-Äquivalente', url: 'https://www.dge.de/wissenschaft/referenzwerte/folat/' },
  vd: { w: 20, m: 20, kind: 'Schätzwert', year: 2012, note: 'bei fehlender Bildung in der Haut durch Sonne', url: 'https://www.dge.de/wissenschaft/referenzwerte/vitamin-d/' },
  jod: { w: 150, m: 150, kind: 'Empfehlung', year: 2025, url: 'https://www.dge.de/wissenschaft/referenzwerte/jod/' }
};
function dgeRef(id) {
  const sex = (readTracker().profile || {}).sex;
  const d = DGE[id];
  return sex === 'm' ? d.m : d.w;
}
function deficits() { return hasMicros() ? (state.profile.deficits || []).filter((id) => DGE[id]) : []; }
// Wie reich ist ein Gericht an dem, was fehlt? Verglichen wird der Anteil am DGE-Tageswert mit dem Anteil an den
// Tages-kcal: 1 = so viel, wie es für seine kcal „sein Teil“ wäre. Fehlt der Wert in der Quelle, zählt das Gericht nicht.
function microRatio(n, id) {
  if (!n || n['miss_' + id] > 0 || !n.kcal) return null;
  return (n[id] / dgeRef(id)) / (n.kcal / kcalGoal());
}
function microBonus(r) {
  const ids = deficits();
  if (!ids.length) return 0;
  const n = recipeNutrients(r);
  let b = 0;
  for (const id of ids) {
    const q = microRatio(n, id);
    if (q != null) b += Math.max(-1, Math.min(2, q - 1)) * 2;
  }
  return b;
}
// Kleines Schild auf Rezeptkarten: reich an dem, was dir fehlt (mindestens 1,5× „sein Teil“)
function microTags(r) {
  const n = recipeNutrients(r);
  return deficits().filter((id) => (microRatio(n, id) || 0) >= 1.5).map((id) => MICROS.find((m) => m.id === id).name);
}

function weekCandidates(meal, day, used) {
  const budget = mealBudget(meal);
  const seed = state.week.seed;
  return allRecipes()
    .filter((r) => r.meals.includes(meal) && suitable(r) && timeMode(r, meal))
    .map((r) => {
      let s = likeScore(r) * 3 - Math.abs(r.kcal - budget) / 80 + pantryScore(r) + macroScore(r);
      if (isFav(r)) s += 4; // Favoriten kommen öfter dran
      if (timeMode(r, meal) === 'vorkochen') s -= 2;
      s -= (used[r.id] || 0) * 5; // Abwechslung über die Woche
      s -= rejectPenalty(r); // ähnlich wie abgelehnte Rezepte
      s += microBonus(r); // reich an dem, was dir fehlt
      s += (hashStr(seed + day + meal + r.id) % 100) / 40;
      return { r, s };
    })
    .sort((a, b) => b.s - a.s)
    .map((x) => x.r);
}

function slotFits(r, meal) { return r.meals.includes(meal) && !!timeMode(r, meal); }

// Mengenfaktoren für einen Tag im Plan: Die Gerichte werden so hoch- oder heruntergerechnet,
// dass der ganze Tag höchstens 5 % vom Kalorienziel der geplanten Mahlzeiten abweicht.
// Jedes Gericht bleibt zwischen 0,6× und 1,6× der Rezeptmenge; gekaufte Produkte bleiben, wie sie sind.
const FIT_MIN = 0.6;
const FIT_MAX = 1.6;
const DAY_TOLERANCE = 0.05;
function dayFactors(day) {
  const w = state.week;
  const out = {};
  const items = w.meals.map((m) => {
    const k = `${day}|${m}`;
    const r = w.slots[k] && recipeById(w.slots[k].id);
    return r ? { k, r, budget: mealBudget(m), f: 1 } : null;
  }).filter(Boolean);
  if (w.fit === false) { for (const x of items) out[x.k] = 1; return out; }
  const target = items.reduce((a, x) => a + x.budget, 0);
  const fixed = items.filter((x) => x.r.product || !x.r.kcal);
  const free = items.filter((x) => !x.r.product && x.r.kcal);
  // Erst jedes Gericht auf seinen Platz, dann den Tag als Ganzes nachziehen
  for (const x of free) x.f = Math.min(FIT_MAX, Math.max(FIT_MIN, x.budget / x.r.kcal));
  const fixedKcal = fixed.reduce((a, x) => a + x.r.kcal, 0);
  for (let i = 0; i < 6; i++) {
    const sum = free.reduce((a, x) => a + x.r.kcal * x.f, 0);
    if (!sum) break;
    const ratio = (target - fixedKcal) / sum;
    if (Math.abs(ratio - 1) < 0.005) break;
    for (const x of free) x.f = Math.min(FIT_MAX, Math.max(FIT_MIN, x.f * ratio));
  }
  for (const x of free) x.f = Math.round(x.f * 20) / 20;
  for (const x of items) out[x.k] = x.f;
  return out;
}
function slotFactor(k) {
  if (!state.week || !state.week.slots[k]) return 1;
  return dayFactors(k.split('|')[0])[k] || 1;
}
function fmtFactor(f) { return String(f).replace('.', ','); }

// Übernommenes Gericht für einen Tag und eine Mahlzeit
function plannedRecipe(day, meal) {
  const s = state.week && state.week.slots[`${day}|${meal}`];
  if (!s || !s.ok || !state.week.meals.includes(meal)) return null;
  const r = recipeById(s.id);
  return r && suitable(r) ? r : null;
}

function acceptedSlots() {
  const w = state.week;
  if (!w) return [];
  const days = weekDays();
  return Object.entries(w.slots)
    .filter(([k, s]) => s.ok && days.includes(k.split('|')[0]) && w.meals.includes(k.split('|')[1]))
    .map(([k, s]) => ({ key: k, recipe: recipeById(s.id), n: s.n || weekPortions(), f: slotFactor(k) }))
    .filter((x) => x.recipe);
}

function portionStepper(action, n, attrs) {
  return `<div class="stepper" role="group" aria-label="Portionen">
    <button class="round" data-action="${action}" ${attrs} data-n="${n - 1}" aria-label="Eine Portion weniger" ${n <= 1 ? 'disabled' : ''}>−</button>
    <span><b>${n}</b> ${n === 1 ? 'Portion' : 'Portionen'}</span>
    <button class="round" data-action="${action}" ${attrs} data-n="${n + 1}" aria-label="Eine Portion mehr" ${n >= 12 ? 'disabled' : ''}>+</button>
  </div>`;
}

function weekPortions() { return (state.week && state.week.portions) || state.profile.portions || 1; }

// Gerichte, deren fehlende Zutaten man unter „Kochen mit dem, was da ist“ auf die Einkaufsliste gesetzt hat
function extraSlots() {
  return Object.entries(state.listExtra || {}).map(([id, x]) => ({ key: `extra|${id}`, recipe: recipeById(id), n: x.n || 1, f: x.f || 1 }))
    .filter((x) => x.recipe && !x.recipe.product);
}

// Zutaten aller übernommenen Gerichte zusammenzählen
const STAPLES = ['Gewürze', 'Öl', 'Gemüsebrühe'];
function shoppingList() {
  const groups = new Map();
  const staples = new Map();
  for (const { recipe, n, f } of [...acceptedSlots(), ...extraSlots()]) {
    if (recipe.product) {
      const key = `p|${recipe.code}`;
      const g = groups.get(key) || { key, product: recipe, amount: 0, recipes: new Set() };
      g.amount += n;
      g.recipes.add('Snack');
      groups.set(key, g);
      continue;
    }
    for (const line of scaledIngredients(recipe, 1)) {
      const p = parseIngredient(line);
      const food = findFood(p.name.replace(/[()]/g, ' '));
      if (p.amount === null || (food && STAPLES.includes(food.name))) {
        const name = p.amount === null ? line.replace(/^etwas\s+/i, '') : p.name;
        for (const part of name.split(/,\s*|\s+und\s+/)) {
          const t = part.trim();
          if (t) staples.set(t.toLowerCase(), t.charAt(0).toUpperCase() + t.slice(1));
        }
        continue;
      }
      const key = `${food ? food.name : p.name.toLowerCase()}|${p.unit}`;
      const g = groups.get(key) || { key, p, food, amount: 0, grams: 0, recipes: new Set() };
      g.amount += p.amount * n * f;
      g.grams += gramsOfText(line) * n * f;
      g.recipes.add(recipe.name);
      groups.set(key, g);
    }
  }
  // Mit der Vorratskammer verrechnen: was da ist, muss nicht gekauft werden; bei zu wenig nur der Rest
  const pantry = trackerPantry();
  const items = [...groups.values()].map((g) => {
    const base = { key: g.key, recipes: [...g.recipes], food: g.food || null, unit: g.p ? g.p.unit : null };
    if (g.product) {
      const x = pantry.find((y) => y.id === g.product.code);
      const need = g.amount * g.product.serving;
      const have = x ? V.grams(x) : null;
      const text = `${g.amount}× ${g.product.name}${g.product.brand ? ` (${g.product.brand})` : ''}`;
      if (have == null || have >= need) return { ...base, product: true, text, stock: have == null ? 'open' : 'full', stockText: x ? `${V.label(x)} da` : '' };
      return { ...base, product: true, text, stock: 'part', stockText: V.label(x) };
    }
    const text = (amount) => scaleIngredient(`1 ${g.p.unitWord ? g.p.unitWord + ' ' : ''}${g.p.name}`, amount);
    const st = g.food ? stockOf(g.food.name) : { g: 0, open: false };
    if (!g.grams || (!st.g && !st.open)) return { ...base, text: text(g.amount), needG: g.grams, stock: null };
    if (st.g >= g.grams * 0.98) return { ...base, text: text(g.amount), needG: 0, stock: 'full', stockText: `${fmt(st.g)} g da` };
    if (st.g > 0) {
      const rest = g.grams - st.g;
      return { ...base, text: text(g.amount * (rest / g.grams)), needG: rest, stock: 'part', stockText: `${fmt(st.g)} g schon da` };
    }
    return { ...base, text: text(g.amount), needG: g.grams, stock: 'open', stockText: 'im Vorrat, Menge offen' };
  }).sort((a, b) => a.key.localeCompare(b.key, 'de'));
  return { items, staples: [...staples.values()].sort((a, b) => a.localeCompare(b, 'de')) };
}

// Auswahl, an welchem Tag ein Rezept gegessen werden soll
function planPicker(r) {
  ensureWeek();
  const meals = [...MEALS, SNACK].filter((m) => r.meals.includes(m.id));
  return `<div class="card plan-picker">
    <div class="small" style="font-weight:800">Wann willst du es essen?</div>
    ${meals.map((m) => `<div class="small muted">${m.name}</div>
      <div class="chips">${weekDays().map((d) => {
        const s = state.week.slots[`${d}|${m.id}`];
        return `<button class="chip day-chip" data-action="plan-at" data-recipe="${r.id}" data-day="${d}" data-meal="${m.id}" aria-pressed="${!!(s && s.id === r.id && s.ok && state.week.meals.includes(m.id))}">${shortDay(d)}</button>`;
      }).join('')}</div>`).join('')}
    <button class="link-btn" style="align-self:flex-start" data-action="plan-open" data-recipe="">Fertig</button>
  </div>`;
}

// Darf das Gericht von Platz a nach b und umgekehrt?
function canSwap(a, b) {
  const w = state.week;
  if (!a || !b || a === b || !w.slots[a] || !w.slots[b]) return false;
  const ra = recipeById(w.slots[a].id);
  const rb = recipeById(w.slots[b].id);
  return !!(ra && rb && slotFits(ra, b.split('|')[1]) && slotFits(rb, a.split('|')[1]));
}

function viewWoche() {
  const w = ensureWeek();
  save();
  const days = weekDays();
  const shown = days.flatMap((d) => w.meals.map((m) => w.slots[`${d}|${m}`]).filter(Boolean));
  const okCount = shown.filter((s) => s.ok).length;
  if (ui.cell && !w.slots[ui.cell]) ui.cell = null;
  const cell = (day, meal) => {
    const k = `${day}|${meal}`;
    const s = w.slots[k];
    if (!s) return '<td class="wk-cell empty">–</td>';
    const r = recipeById(s.id);
    let cls = s.ok ? ' ok' : '';
    if (ui.cell === k) cls += ' sel';
    if (ui.swapFrom && ui.swapFrom !== k) cls += canSwap(ui.swapFrom, k) ? ' target' : ' off';
    const label = ui.swapFrom && ui.swapFrom !== k && canSwap(ui.swapFrom, k) ? `${r.name} tauschen` : r.name;
    return `<td class="wk-cell${cls}"><button data-action="cell" data-slot="${k}" aria-label="${esc(label)}${s.ok ? ', übernommen' : ''}" aria-pressed="${ui.cell === k}">
      <span class="wk-name">${esc(r.name)}</span>
      <span class="wk-foot"><span class="wk-kcal">${fmt(Math.round((r.kcal * slotFactor(k)) / 10) * 10)}</span>${s.ok ? `<span class="wk-ok">${ICONS.check}${s.n || weekPortions()}×</span>` : ''}</span>
    </button></td>`;
  };
  const detail = (k) => {
    const s = w.slots[k];
    const [day, meal] = k.split('|');
    const r = recipeById(s.id);
    const n = s.n || weekPortions();
    const dn = w.meals.reduce((acc, m) => {
      const kk = `${day}|${m}`;
      const rr = w.slots[kk] && recipeById(w.slots[kk].id);
      return rr ? addNutrients(acc, recipeNutrients(rr), slotFactor(kk)) : acc;
    }, emptyNutrients());
    const share = w.meals.reduce((a, m) => a + mealBudget(m), 0) / kcalGoal();
    return `<tr class="wk-detail"><td colspan="${w.meals.length + 1}">
      <div class="small muted" style="font-weight:800">${dayName(day)}: ${fmt(Math.round(dn.kcal / 10) * 10)} kcal geplant</div>
      ${macroBars(dn, nutrientTargets(), share)}
      <div class="small muted" style="font-weight:800">${mealName(meal)}</div>
      ${recipeCard(r, { meal, mode: timeMode(r, meal), factor: slotFactor(k) })}
      ${slotFactor(k) !== 1 ? `<div class="small muted">Menge ${fmtFactor(slotFactor(k))}× Rezept, damit der Tag zu deinem Kalorienziel passt.</div>` : ''}
      ${ui.swapFrom === k
        ? '<div class="plan-actions"><span class="small muted">Tipp in der Tabelle auf den Platz zum Tauschen.</span><button class="link-btn" data-action="week-swap">Abbrechen</button></div>'
        : `<div class="plan-actions">
          <button class="chip ok-chip" data-action="week-ok" data-slot="${k}" aria-pressed="${s.ok}">${s.ok ? `${ICONS.check} Übernommen` : 'Übernehmen'}</button>
          <span class="plan-more">
            <button class="link-btn" data-action="week-other" data-slot="${k}">Andere</button>
            <button class="link-btn" data-action="week-swap" data-slot="${k}">Tauschen</button>
          </span>
        </div>
        ${s.ok ? `<div class="plan-portions"><span class="small muted">Wie viele Portionen kochst du?</span>${portionStepper('slot-portions', n, `data-slot="${k}"`)}</div>` : ''}`}
    </td></tr>`;
  };
  const selDay = ui.cell && ui.cell.split('|')[0];
  // Summe des Tages und Abweichung vom Ziel der geplanten Mahlzeiten
  function dayTotal(d) {
    let sum = 0;
    let goal = 0;
    for (const m of w.meals) {
      const k = `${d}|${m}`;
      const r = w.slots[k] && recipeById(w.slots[k].id);
      if (!r) continue;
      sum += r.kcal * slotFactor(k);
      goal += mealBudget(m);
    }
    if (!sum) return '';
    const off = Math.abs(sum - goal) / goal > DAY_TOLERANCE;
    return `<span class="wk-sum${off ? ' off' : ''}" title="Ziel ca. ${fmt(Math.round(goal / 10) * 10)} kcal">${fmt(Math.round(sum / 10) * 10)}<small>kcal</small></span>`;
  }
  return `<main class="screen with-nav">
    <div class="ginger-says">${ginger(70)}<div class="bubble">Mein Plan für die nächsten 7 Tage. Tipp ein Gericht an, um es zu übernehmen, zu tauschen oder ein anderes zu bekommen.</div></div>
    <div class="chips" role="group" aria-label="Welche Mahlzeiten planen">${[...MEALS, SNACK].sort((a, b) => MEAL_ORDER.indexOf(a.id) - MEAL_ORDER.indexOf(b.id)).map((m) => `<button class="chip" data-action="week-meal" data-meal="${m.id}" aria-pressed="${w.meals.includes(m.id)}">${m.name}</button>`).join('')}</div>
    <div class="wk-wrap"><table class="wk">
      <thead><tr><th scope="col"><span class="sr-only">Tag</span></th>${w.meals.map((m) => `<th scope="col">${{ fruehstueck: 'Früh&shy;stück', mittag: 'Mittag', snack: 'Snack', abend: 'Abend' }[m]}</th>`).join('')}</tr></thead>
      <tbody>${days.map((d) => `<tr><th scope="row" class="${d === days[0] ? 'today' : ''}">${d === days[0] ? 'Heute' : shortDay(d).replace(' ', '<br>')}${dayTotal(d)}</th>${w.meals.map((m) => cell(d, m)).join('')}</tr>${selDay === d ? detail(ui.cell) : ''}`).join('')}</tbody>
    </table></div>
    <div class="card week-sum">
      <div style="font-weight:800">${okCount} von ${shown.length} Gerichten übernommen</div>
      <div class="input-row">
        <button class="btn secondary small-btn" data-action="${okCount === shown.length ? 'week-none' : 'week-all'}">${okCount === shown.length ? 'Keins übernehmen' : 'Alle übernehmen'}</button>
        <button class="btn secondary small-btn" data-action="week-new">Rest neu mischen</button>
      </div>
      <label class="row fit-row"><input type="checkbox" data-action="week-fit" ${w.fit === false ? '' : 'checked'}><span class="small">Mengen an mein Kalorienziel anpassen</span></label>
      <div class="plan-portions"><span class="small muted">Portionen pro Gericht, wenn du nichts änderst</span>${portionStepper('week-portions', weekPortions(), '')}</div>
      <a class="btn" href="#/liste">Einkaufsliste${okCount ? ` (${okCount} Gerichte)` : ''}</a>
    </div>
  </main>${nav('woche')}`;
}

// Was die übernommenen Gerichte pro Tag im Schnitt liefern (eine Portion je Gericht, mit Mengenfaktor)
function listMacros(slots) {
  const days = new Set(slots.map((x) => x.key.split('|')[0]));
  if (!days.size) return '';
  const sum = slots.reduce((acc, x) => addNutrients(acc, recipeNutrients(x.recipe), x.f), emptyNutrients());
  const avg = addNutrients(emptyNutrients(), sum, 1 / days.size);
  return `<div class="card macro-card"><div class="small" style="font-weight:800">Pro Tag im Schnitt für dich: ca. ${fmt(Math.round(avg.kcal / 10) * 10)} von ${fmt(kcalGoal())} kcal</div>
    ${macroBars(avg, nutrientTargets())}
    <p class="small muted">Gerechnet mit einer Portion je Gericht an ${days.size === 1 ? 'einem Tag' : `${days.size} Tagen`}. Ginger wählt die Gerichte im Plan so, dass Eiweiß und Fett möglichst gut zu deinem Ziel passen.</p></div>`;
}

function viewListe() {
  ensureWeek();
  const { items, staples } = shoppingList();
  const slots = acceptedSlots();
  const bought = state.week.bought;
  const inStock = items.filter((x) => x.stock === 'full');
  const open = items.filter((x) => !bought[x.key] && x.stock !== 'full');
  const done = items.filter((x) => bought[x.key] && x.stock !== 'full');
  const usedUp = trackerPantry().filter((x) => x.qty === 0);
  const tag = (x) => (x.stock === 'part' ? ` <em class="have part">${esc(x.stockText)}</em>` : x.stock === 'open' ? ` <em class="have">${esc(x.stockText || 'im Vorrat')}</em>` : '');
  const row = (x) => `<label class="step list-item"><input type="checkbox" data-action="list-check" data-key="${esc(x.key)}" ${bought[x.key] ? 'checked' : ''}>
    <span>${x.stock === 'part' ? 'noch ' : ''}${esc(x.text)}${tag(x)}<small>${esc(x.recipes.join(', '))}</small></span></label>`;
  const extras = extraSlots();
  return `<main class="screen with-nav">
    <a class="back" href="#/woche">${ICONS.back}Wochenplan</a>
    <h1>Einkaufsliste</h1>
    ${items.length ? `
      ${listMacros(slots)}
      ${extras.length ? `<div class="card small">Dazu zum Kochen aus dem Vorrat: ${extras.map((x) => `${esc(x.recipe.name)} <button class="link-btn" data-action="cook-list" data-recipe="${x.recipe.id}" aria-label="${esc(x.recipe.name)} von der Liste nehmen">✕</button>`).join(' · ')}</div>` : ''}
      ${slots.length ? `<p class="small muted">Für ${slots.length === 1 ? 'ein übernommenes Gericht' : `${slots.length} übernommene Gerichte`} mit zusammen ${slots.reduce((a, x) => a + x.n, 0) === 1 ? 'einer Portion' : `${slots.reduce((a, x) => a + x.n, 0)} Portionen`}. Die Portionen stellst du im Wochenplan ein.</p>` : ''}
      <div class="list">${open.map(row).join('') || '<div class="card small muted">Alles im Korb!</div>'}</div>
      ${done.length ? `<h2>Im Korb</h2><div class="list">${done.map(row).join('')}</div>
        ${done.some((x) => x.food && x.needG) ? '<button class="btn secondary" data-action="list-to-vorrat">Gekauftes in den Vorrat legen</button><p class="small muted">Für Lose ohne Barcode. Gescannte Produkte zählt der Scanner schon mit.</p>' : ''}` : ''}
      ${inStock.length ? `<h2>Schon im Vorrat</h2><div class="card small muted">${inStock.map((x) => `${esc(x.text)} <span class="have-ok">· ${esc(x.stockText || 'da')}</span>`).join('<br>')}</div>` : ''}
      ${usedUp.length ? `<h2>Im Vorrat aufgebraucht</h2><p class="small muted">${esc(usedUp.map((x) => x.n).join(', '))}</p>` : ''}
      ${staples.length ? `<h2>Vorrat prüfen</h2><p class="small muted">${esc(staples.join(', '))}</p>` : ''}
      <button class="btn secondary" data-action="list-copy">Liste kopieren</button>`
      : `<div class="card small muted">Noch nichts übernommen. Tipp im Wochenplan bei den Gerichten auf „Übernehmen“, dann schreibe ich dir hier alles auf.</div>
      <a class="btn" href="#/woche">Zum Wochenplan</a>`}
  </main>${nav('woche')}`;
}

// ---------- Ginger ----------

// Ginger sieht aus wie die echte Ginger: weiße Schnauze, Brust und Pfoten, Kopf und Rücken braun getigert
// mit M-Zeichnung auf der Stirn, schmale weiße Blesse, grün-goldene Augen, rosa Nase, geringelter Schwanz mit dunkler Spitze
const G = { fur: '#9A7353', stripe: '#4A3628', white: '#FFFFFF', line: '#E3D3C4', ear: '#F1BDB4', nose: '#EFA3A6', eye: '#241912', iris: '#AFA34C', rim: '#6F6A2E', tip: '#2B201A' };
let gingerId = 0;

function gingerHead({ happy = false, hat = false } = {}) {
  const id = `gh${++gingerId}`;
  // Augen leicht verschlafen wie auf den Fotos: obere Lider in Fellfarbe
  const eye = (x) => `<ellipse cx="${x}" cy="54" rx="6.4" ry="5.6" fill="${G.iris}" stroke="${G.rim}" stroke-width="0.8"/>
      <ellipse cx="${x}" cy="54.5" rx="3" ry="4.6" fill="${G.eye}"/><circle cx="${x + 2}" cy="52.6" r="1.4" fill="#FFF"/>
      <path d="M${x - 7.5} 50.5 Q${x} 46 ${x + 7.5} 50.5 L${x + 7.5} 47 L${x - 7.5} 47 Z" fill="${G.fur}"/>
      <path d="M${x - 6.6} 51.2 Q${x} 47.6 ${x + 6.6} 51.2" stroke="${G.stripe}" stroke-width="1.1" fill="none"/>`;
  const eyes = happy
    ? `<path d="M31 55 Q37 50 43 55 M57 55 Q63 50 69 55" stroke="${G.stripe}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`
    : eye(37) + eye(63);
  const mouth = `<path d="M50 66.5 L50 68.5 M50 68.5 Q46.5 72 43.5 69.5 M50 68.5 Q53.5 72 56.5 69.5" stroke="${G.stripe}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`
    + (happy ? `<ellipse cx="50" cy="72" rx="2.2" ry="1.8" fill="#EE8F98"/>` : '');
  const hatSvg = hat
    ? '<path d="M30 30 Q26 14 38 14 Q40 4 50 6 Q60 4 62 14 Q74 14 70 30 Z" fill="#FFFFFF" stroke="#E2CFBF" stroke-width="1.5"/><rect x="30" y="26" width="40" height="8" rx="3" fill="#FFFFFF" stroke="#E2CFBF" stroke-width="1.5"/>'
    : '';
  return `<defs><clipPath id="${id}"><ellipse cx="50" cy="57" rx="37" ry="33"/></clipPath></defs>
    <path d="M15 47 L19 7 L47 30 Z" fill="${G.fur}"/>
    <path d="M85 47 L81 7 L53 30 Z" fill="${G.fur}"/>
    <path d="M22 35 L24.5 17 L37 29 Z" fill="${G.ear}"/>
    <path d="M78 35 L75.5 17 L63 29 Z" fill="${G.ear}"/>
    <path d="M24 30 L28 25 M25 34 L30 30 M76 30 L72 25 M75 34 L70 30" stroke="#FFF" stroke-width="1.2" stroke-linecap="round"/>
    <ellipse cx="50" cy="57" rx="37" ry="33" fill="${G.white}" stroke="${G.line}" stroke-width="1.5"/>
    <g clip-path="url(#${id})">
      <path d="M0 0 L100 0 L100 70 Q76 66 64 63 Q58 61 56 52 Q54.5 42 52.5 34 Q50 30.5 47.5 34 Q45.5 42 44 52 Q42 61 36 63 Q24 66 0 70 Z" fill="${G.fur}"/>
      <path d="M42 22 L44.5 31 M50 20 L50 29.5 M58 22 L55.5 31 M36 26 L39 33 M64 26 L61 33 M27 45 Q21 44 16 40 M73 45 Q79 44 84 40 M26 59 Q20 59 15 56 M74 59 Q80 59 85 56" stroke="${G.stripe}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    </g>
    <ellipse cx="43" cy="66" rx="5" ry="3.6" fill="#FAF3EE"/><ellipse cx="57" cy="66" rx="5" ry="3.6" fill="#FAF3EE"/>
    ${eyes}
    <path d="M46.2 61.5 Q50 60.5 53.8 61.5 L50 66 Z" fill="${G.nose}"/>
    ${mouth}
    <path d="M13 61 L30 63.5 M13 68 L30 67 M87 61 L70 63.5 M87 68 L70 67" stroke="#BDAD9E" stroke-width="1.1" stroke-linecap="round"/>
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
  const leg = (x, cls) => `<rect class="leg ${cls}" x="${x}" y="60" width="9" height="24" rx="4.5" fill="${G.white}" stroke="${G.line}" stroke-width="1.2"/>`;
  const paw = leg(78, 'leg-b paw');
  const tail = 'M24 52 Q8 46 10 26 Q11 18 17 13';
  return `<svg viewBox="0 0 120 90" width="110" height="83" aria-hidden="true">
    <defs><clipPath id="${id}"><ellipse cx="56" cy="55" rx="34" ry="18"/></clipPath></defs>
    <g class="tail"><path d="${tail}" stroke="${G.fur}" stroke-width="7" fill="none" stroke-linecap="round"/>
      <path d="${tail}" stroke="${G.stripe}" stroke-width="7" fill="none" stroke-dasharray="2.5 5" stroke-dashoffset="-4"/>
      <path d="M13.5 17 Q15 14.5 17 13" stroke="${G.tip}" stroke-width="7" fill="none" stroke-linecap="round"/></g>
    ${leg(30, 'leg-b')}${leg(40, 'leg-a')}${leg(68, 'leg-a')}
    ${mode === 'putzen' ? '' : paw}
    <ellipse cx="56" cy="55" rx="34" ry="18" fill="${G.white}" stroke="${G.line}" stroke-width="1.2"/>
    <g clip-path="url(#${id})">
      <path d="M18 30 L82 30 L82 42 Q76 51 66 50 Q54 56 42 52 Q30 58 18 54 Z" fill="${G.fur}"/>
      <ellipse cx="30" cy="52" rx="7" ry="3.5" fill="${G.white}"/>
      <path d="M36 37 Q38 43 36 50 M45 36 Q47 43 45 51 M54 37 Q56 43 54 50 M63 37 Q65 42 63 48 M72 37 Q74 41 72 46" stroke="${G.stripe}" stroke-width="2" fill="none" stroke-linecap="round"/>
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
  tracker: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3 A9 9 0 1 1 3.5 9"/><path d="M12 7 A5 5 0 1 1 7 12"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/></svg>',
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
  week: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10 H20 M9 3 V7 M15 3 V7"/></svg>',
  me: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 20 A8 8 0 0 1 20 20"/></svg>'
};

// ---------- Nährwerte ----------

function g1(x) { return (Math.round(x * 10) / 10).toLocaleString('de-DE'); }

// Nährwerte pro Portion. Eigene Rezepte aus älteren Versionen haben noch keine gespeicherten Werte.
function recipeNutrients(r) {
  if (r.nutrients) return r.nutrients;
  if (r.own && r.rows) {
    const sum = r.rows.reduce((acc, row) => {
      const food = findFood(row.name);
      return addNutrients(acc, nutrientsFor(food, gramsOf(row, food), food ? null : row.kcal100));
    }, emptyNutrients());
    return addNutrients(emptyNutrients(), sum, 1 / (r.portions || 1));
  }
  const n = { ...emptyNutrients(), kcal: r.kcal };
  for (const m of MICROS) n['miss_' + m.id] = 1; // gekaufte Produkte: keine BLS-Werte
  return n;
}

// Tabelle mit Nährwerten und dem Anteil an den Tageszielen aus dem Tracker
function nutrientTable(n, { title = 'Nährwerte pro Portion' } = {}) {
  const t = nutrientTargets();
  const row = (id, name) => {
    const v = n[id] || 0;
    const goal = t[id];
    const limit = id === 'zugesetzt';
    const pct = goal ? Math.min(100, (v / goal) * 100) : 0;
    const over = limit && v > goal;
    return `<div class="nut-row ${id === 'zucker' || id === 'zugesetzt' || id === 'fruktose' ? 'sub' : ''}">
      <span>${name}</span><b>${g1(v)} g</b>
      ${goal ? `<div class="bar small-bar" title="${Math.round((v / goal) * 100)} % von ${limit ? 'höchstens ' : ''}${goal} g"><div style="width:${pct}%;${over ? 'background:#9A3324' : ''}"></div></div>
        <span class="small muted nut-goal">${limit ? 'max. ' : 'von '}${goal} g</span>` : '<span></span><span class="small muted nut-goal">kein Richtwert</span>'}
    </div>`;
  };
  return `<section class="card nut-card"><h2 style="margin-bottom:8px">${title}</h2>
    <div class="nut-row"><span>Kalorien</span><b>${fmt(n.kcal)} kcal</b>${t.kcal ? `<div class="bar small-bar"><div style="width:${Math.min(100, (n.kcal / t.kcal) * 100)}%"></div></div><span class="small muted nut-goal">von ${fmt(t.kcal)}</span>` : '<span></span><span class="small muted nut-goal">kein Ziel</span>'}</div>
    ${NUTRIENTS.map((x) => row(x.id, x.name)).join('')}
    ${hasMicros() ? `<h3 style="margin:12px 0 4px">Mineralstoffe und Vitamine</h3>${MICROS.map((m) => {
      const ref = dgeRef(m.id);
      const miss = n['miss_' + m.id] > 0;
      const mine = deficits().includes(m.id);
      const v = n[m.id] || 0;
      return `<div class="nut-row${mine ? ' mine' : ''}"><span>${m.name}${mine ? ' ★' : ''}</span><b>${miss ? '<span class="muted">unvollständig</span>' : `${v >= 10 ? fmt(v) : g1(v)} ${m.unit}`}</b>
        ${miss ? '<span></span><span></span>' : `<div class="bar small-bar"><div style="width:${Math.min(100, (v / ref) * 100)}%"></div></div><span class="small muted nut-goal">${Math.round((v / ref) * 100)} % von ${fmt(ref)}</span>`}</div>`;
    }).join('')}` : ''}
    <p class="small muted" style="margin-top:6px">Aus dem Bundeslebensmittelschlüssel. Die Balken zeigen den Anteil an deinen Tageszielen im Tracker${hasMicros() ? ', bei Mineralstoffen und Vitaminen am Tageswert der DGE (Quellen unter „Ich“)' : ''}.${hasMicros() ? ' „Unvollständig“: Für mindestens eine Zutat nennt die Quelle keinen Wert, dann rechne ich nichts.' : ''}</p>
  </section>`;
}

// Zutaten für eine gewünschte Portionenzahl
function scaledIngredients(r, n) {
  if (r.product) return [`${n}× ${r.name}${r.brand ? ` (${r.brand})` : ''}`];
  if (r.own && r.rows) {
    const f = n / (r.portions || 1);
    return r.rows.map((row) => {
      const a = Number(String(row.amount).replace(',', '.')) * f;
      const amount = row.unit === 'g' || row.unit === 'ml' ? (a >= 20 ? Math.round(a / 5) * 5 : Math.round(a)) : Math.round(a * 4) / 4;
      return `${String(amount).replace('.', ',')} ${unitName(row.unit)} ${row.name.trim()}`;
    });
  }
  return r.ingredients.map((x) => scaleIngredient(x, n));
}

function portionsOf(r) {
  return ui.portions[r.id] || state.profile.portions || 1;
}

// Nachfrage nach einem „Mag ich nicht“: nur dieses Rezept oder eine Zutat darin?
function rejectPanel(r) {
  const foods = [...new Set(r.foods)].filter((f) => state.profile.taste[f] !== 'no');
  return `<div class="card reject-panel">
    <div class="small" style="font-weight:800">Was magst du daran nicht?</div>
    ${foods.length ? `<div class="chips">${foods.map((f) => `<button class="chip danger" data-action="reject-food" data-recipe="${r.id}" data-food="${esc(f)}">${esc(f)}</button>`).join('')}</div>
      <p class="small muted">Tippst du eine Zutat an, schlage ich nichts mehr damit vor.</p>` : ''}
    <div class="input-row">
      <button class="btn secondary small-btn" data-action="cancel-reject">Doch behalten</button>
      <button class="btn dark small-btn" data-action="reject-recipe" data-recipe="${r.id}">Nur dieses Rezept</button>
    </div>
  </div>`;
}

// ---------- Bausteine ----------

// Menü (Entwurf B, 12.10.): 4 Reiter, Rezepte mit Unterleiste, Scan-Knopf unten rechts. Der Tracker hat dieselbe Leiste.
const REZEPTE_PAGES = ['rezepte', 'woche', 'einkauf', 'stempel'];
function nav(active) {
  const main = REZEPTE_PAGES.includes(active) ? 'rezepte' : active;
  const item = (id, label, icon) =>
    `<a href="#/${id}" ${main === id ? 'aria-current="page"' : ''}>${ICONS[icon]}${label}</a>`;
  const back = (location.hash.replace(/^#\/?/, '').split('/')[0] || 'heute').replace(/[^a-z0-9]/g, '');
  return `<nav class="nav" aria-label="Hauptmenü"><div class="nav-inner">
    ${item('heute', 'Heute', 'home')}
    ${item('rezepte', 'Rezepte', 'book')}
    <a href="tracker/">${ICONS.tracker}Tracker</a>
    ${item('ich', 'Ich', 'me')}
  </div></nav>
  <a class="scan-fab" href="tracker/?zurueck=${back}#einkauf" aria-label="Einkauf scannen">${ICONS.cart}</a>`;
}
// Unterleiste der Rezepte-Seiten
function subnav(active) {
  const item = (id, label) => `<a href="#/${id}" ${active === id ? 'aria-current="page"' : ''}>${label}</a>`;
  return `<nav class="subnav" aria-label="Rezepte-Bereiche">${item('rezepte', 'Rezepte')}${item('woche', 'Woche')}${item('einkauf', 'Vorrat')}${item('stempel', 'Stempel')}</nav>`;
}

function stepsBar(n) {
  return `<div class="steps-bar" aria-label="Schritt ${n} von 3">
    <span class="${n >= 1 ? 'on' : ''}"></span><span class="${n >= 2 ? 'on' : ''}"></span><span class="${n >= 3 ? 'on' : ''}"></span>
    <b>${n} von 3</b></div>`;
}

function recipeCard(recipe, { meal, mode, factor = 1 } = {}) {
  const cooked = !!state.stamps[recipe.id];
  let badge = cooked
    ? `<div class="stamp-mini" title="Schon gekocht">${ICONS.check}<span class="sr-only">Schon gekocht</span></div>`
    : '';
  let meta = `${recipe.time} Min · ca. ${recipe.kcal} kcal`;
  if (mode === 'prep') { badge = '<div class="badge prep">Vorbereiten</div>'; meta = `Am Vorabend ${recipe.time} Min · ca. ${recipe.kcal} kcal`; }
  if (recipe.product) { badge = '<div class="badge new">Gekauft</div>'; meta = `${recipe.servingGuess ? 'ca. ' : ''}${fmt(recipe.serving)} g · ca. ${recipe.kcal} kcal`; }
  if (mode === 'vorkochen') { badge = '<div class="badge prep">Vorkochen</div>'; meta = `Vorher doppelt kochen · ca. ${recipe.kcal} kcal`; }
  if (factor !== 1) meta = meta.replace(`ca. ${recipe.kcal} kcal`, `ca. ${Math.round((recipe.kcal * factor) / 10) * 10} kcal (${fmtFactor(factor)}× Menge)`);
  const href = `#/rezept/${recipe.id}${meal ? '/' + meal : ''}${meal && factor !== 1 ? '/' + factor : ''}`;
  return `<a class="recipe-card" href="${href}">
    <div class="thumb" style="background:${recipe.tint}">${gingerPeek(44)}</div>
    <div class="info"><div class="title">${isFav(recipe) ? `<span class="fav-mark" title="Favorit">${ICONS.heart}</span>` : ''}${esc(recipe.name)}</div><div class="meta">${meta}</div>${microTags(recipe).map((t) => `<span class="badge micro-tag">viel ${esc(t)}</span>`).join(' ')}${recipeNutrients(recipe).protein || recipeNutrients(recipe).kh ? `<div class="meta macro-meta">${macroMini(recipeNutrients(recipe), factor)}</div>` : ''}</div>
    ${badge}
  </a>`;
}

// ---------- Start-Ablauf ----------

// Ernährung, Allergien und Kalorienziel kommen aus dem Tracker; hier sieht man sie und springt zum Einstellen hin.
// Einstellungen des Trackers, wie dort gruppiert; „Ich“ verlinkt direkt auf den jeweiligen Bereich
const TRACKER_SETTINGS = [['Ziele', ['Tagesziel', 'Gewichtsziel']], ['Über mich', ['Ernährung & Allergien', 'Schlaf & Körper']],
  ['Tracker', ['Wasser', 'Koffein', 'Alkohol', 'Supplements']], ['Planung', ['Timeline']],
  ['Daten', ['Lebensmittel teilen']]];
function trackerSettingsSummary() {
  const d = trackerDiet();
  const allergens = d.allergens.map((c) => ALLERGEN_NAMES[c] || c).join(', ') || 'keine';
  const t = nutrientTargets();
  return `${DIET_NAMES[d.type]} · Allergien: ${esc(allergens)} · ${t.kcal ? `${fmt(t.kcal)} kcal am Tag` : 'noch kein Kalorienziel'}${t.protein ? ` · ${fmt(t.protein)} g Eiweiß` : ''}`;
}

function viewStart1(edit) {
  const back = edit ? 'edit/1' : 'start/1';
  return `<main class="screen">
    ${edit ? '' : stepsBar(1)}
    <div class="ginger-says">${ginger(78)}<div class="bubble">Ich bin Ginger! Wie heißt du? Wie du isst, was du nicht verträgst und dein Kalorienziel stellst du im Tracker ein. Ich lese es dort ab.</div></div>
    <section class="card" style="display:flex;flex-direction:column;gap:8px">
      <label for="pname"><h3>Wie soll ich dich nennen?</h3></label>
      <input id="pname" type="text" data-input="profileName" value="${esc(state.profile.name || '')}" placeholder="Dein Vorname" autocomplete="given-name" maxlength="30">
      <div class="small muted">Bleibt nur auf diesem Handy.</div>
    </section>
    <section class="card" style="display:flex;flex-direction:column;gap:10px">
      ${infoHead('h3', 'Aus deinem Tracker', 'tracker')}
      <div class="small muted">${trackerSettingsSummary()}</div>
      <a class="btn secondary" href="tracker/?zurueck=${back}#ernaehrung">Ernährung und Allergien einstellen</a>
      <a class="btn secondary" href="tracker/?zurueck=${back}#ziel">Kalorienziel einstellen</a>
    </section>
    <div class="bottom"><a class="btn" href="${edit ? '#/ich' : '#/start/2'}">${edit ? 'Fertig' : 'Weiter'}</a></div>
  </main>`;
}

function tasteFoods() {
  const p = state.profile;
  const d = trackerDiet();
  const hidden = new Set([...(HIDE_FOR_DIET[d.type] || []), ...d.allergens.flatMap((a) => HIDE_FOR_ALLERGY[a] || [])]);
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
  const d = trackerDiet();
  const dietTag = DIET_NAMES[d.type];
  const allergyTags = d.allergens.map((a) => `<span class="tag red">Allergie: ${esc(ALLERGEN_NAMES[a] || a)}</span>`).join('');
  return `<main class="screen">
    ${edit ? '' : stepsBar(2)}
    <div class="ginger-says">${ginger(70)}<div class="bubble">Herz für Lieblingsessen, Kreuz für alles, was nie auf den Teller soll.</div></div>
    ${infoHead('h2', 'Was magst du?', 'taste')}
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
  const p = state.profile;
  const count = `<div class="card" style="display:flex;flex-direction:column;gap:10px">
      ${infoHead('h3', 'Wie oft isst du am Tag?', 'meals')}
      <div class="seg" role="group" aria-label="Mahlzeiten am Tag">
        ${[2, 3].map((n) => `<button data-action="meal-count" data-n="${n}" aria-pressed="${p.mealCount === n}">${n} Mahlzeiten</button>`).join('')}
      </div>
      ${p.mealCount === 2 ? `<div class="small muted" style="font-weight:700">Welche lässt du aus?</div>
      <div class="seg" role="group" aria-label="Ausgelassene Mahlzeit">
        ${MEALS.map((m) => `<button data-action="skip-meal" data-id="${m.id}" aria-pressed="${p.skip === m.id}">${m.name.replace('essen', '')}</button>`).join('')}
      </div>
      <div class="hint">${ICONS.paw}<span>Deine Mahlzeiten bleiben normal groß. Was dann noch an Kalorien fehlt, schlägt Ginger dir als zwei kleine Snacks vor.</span></div>` : ''}
    </div>`;
  const blocks = mainMeals().map((m) => `<div class="card" style="display:flex;flex-direction:column;gap:10px">
      <div class="meal-head"><h3>${m.name}</h3><span class="small" style="color:var(--accent-text)">${t[m.id]} Min</span></div>
      <div class="seg" role="group" aria-label="Zeit für ${m.name}">
        ${TIME_OPTIONS.map((n) => `<button data-action="time" data-meal="${m.id}" data-min="${n}" aria-pressed="${t[m.id] === n}">${n}</button>`).join('')}
      </div>
      ${t[m.id] <= SHORT_TIME ? `<div class="hint">${ICONS.paw}<span>${TIME_TIPS[m.id]}</span></div>` : ''}
    </div>`).join('');
  return `<main class="screen">
    ${edit ? '' : stepsBar(3)}
    ${infoHead('h1', 'Wie viel Zeit hast du zum Kochen?', 'times')}
    <p class="lead">Pro Mahlzeit, in Minuten. Wenn es knapp wird, plant Ginger Vorbereitung an Zeiten mit mehr Luft ein.</p>
    ${count}
    ${blocks}
    <div class="card" style="display:flex;flex-direction:column;gap:10px">
      ${infoHead('h3', 'Ich koche meist für', 'portions', `<span class="small" style="color:var(--accent-text);margin-left:auto">${state.profile.portions || 1} ${(state.profile.portions || 1) === 1 ? 'Portion' : 'Portionen'}</span>`)}
      <div class="seg" role="group" aria-label="Portionen">
        ${[1, 2, 3, 4, 6].map((n) => `<button data-action="portions" data-n="${n}" aria-pressed="${(state.profile.portions || 1) === n}">${n}</button>`).join('')}
      </div>
      <p class="small muted">Die Zutatenmengen in den Rezepten passen sich daran an. Du kannst sie in jedem Rezept auch einzeln ändern.</p>
    </div>
    <div class="bottom"><button class="btn" data-action="${edit ? 'go-ich' : 'finish-start'}">${edit ? 'Speichern' : 'Fertig'}</button></div>
  </main>`;
}

// ---------- Heute ----------

// Zwei kleine Snacks, wenn man nur 2 Mahlzeiten am Tag isst
function snackBlock(eatenHere) {
  const need = Math.max(0, SNACKS_PER_DAY - eatenHere.length);
  const planned = plannedRecipe(todayKey(), 'snack');
  let ideas = ideasFor('snack');
  if (planned) ideas = [{ recipe: planned, mode: 'fits', planned: true, factor: slotFactor(`${todayKey()}|snack`) }, ...ideas.filter((x) => x.recipe.id !== planned.id)];
  const start = ideas.length ? (state.pick.snack || 0) % ideas.length : 0;
  const shown = [];
  for (let i = 0; i < Math.min(need, ideas.length); i++) shown.push(ideas[(start + i) % ideas.length]);
  return `<section class="meal-block">
    <div class="meal-head"><h3>Snacks</h3><span class="small muted">${eatenHere.length ? `${eatenHere.length} von ${SNACKS_PER_DAY} gegessen` : `je ca. ${fmt(Math.round(mealBudget('snack') / 10) * 10)} kcal`}</span></div>
    ${eatenHere.length ? eatenRow('Gegessen', mealTotals('snack')) : ''}
    ${shown.map((x) => recipeCard(x.recipe, { meal: 'snack', factor: x.factor || 1 })).join('')}
    <div class="idea-actions"><a class="link-btn" href="#/snacks">Was darf ich jetzt?</a>${need && ideas.length > need ? '<button class="link-btn" data-action="next-idea" data-meal="snack">Andere Snacks</button>' : ''}</div>
  </section>`;
}

// Unter einem Vorschlag: alles im Vorrat oder was fehlt (mit Knopf für die Einkaufsliste)
function pantryStatus(r, f = 1) {
  if (r.product || !trackerPantry().some((x) => x.qty !== 0)) return '';
  const c = cookCheck(r, (state.profile.portions || 1) * f);
  if (!c.total) return '';
  if (!c.missing.length) return `<div class="small cook-ok">${ICONS.check}<span>Alles im Vorrat</span></div>`;
  return `<div class="small cook-missing">Fehlt: ${esc(c.missing.map((m) => (m.part ? 'noch ' : '') + m.text).join(', '))}</div>`;
}
// Knopf „Auf die Einkaufsliste“, nur wenn etwas fehlt
function listButton(r, f = 1) {
  if (r.product || !trackerPantry().some((x) => x.qty !== 0)) return '';
  if (!cookCheck(r, (state.profile.portions || 1) * f).missing.length) return '';
  const onList = state.listExtra && state.listExtra[r.id];
  return `<button class="link-btn" data-action="cook-list" data-recipe="${r.id}" data-f="${f}">${onList ? 'Auf der Liste ✓' : 'Auf die Einkaufsliste'}</button>`;
}

// Gegessenes einer Mahlzeit zusammengezählt (kcal, Eiweiß, KH, Fett), aus dem Tracker-Journal
function mealTotals(meal) {
  const sum = { kcal: 0, protein: 0, kh: 0, fett: 0, n: 0 };
  for (const e of (readTracker().days || {})[todayKey()] || []) {
    if ((FROM_TRACKER_MEAL[e.meal] || 'snack') !== meal) continue;
    const f = (e.grams || 0) / 100;
    sum.kcal += (e.k || 0) * f; sum.protein += (e.p || 0) * f; sum.kh += (e.c || 0) * f; sum.fett += (e.f || 0) * f; sum.n++;
  }
  return sum;
}
// Eine Zeile pro gegessener Mahlzeit: kcal und Makros, die einzelnen Einträge stehen im Tracker
function eatenRow(name, t) {
  return `<a class="card eaten-row" href="tracker/">
    <span class="eaten-l1"><b>${esc(name)}</b><span class="small muted">${t.n} ${t.n === 1 ? 'Eintrag' : 'Einträge'}</span><span class="eaten-kcal">${fmt(t.kcal)} kcal</span></span>
    ${macroMini(t)}
  </a>`;
}

// Oben auf „Heute“: was noch frei ist, mit Makro-Balken wie im Tracker
function dayCard() {
  const left = dayLeft();
  const t = nutrientTargets();
  const e = left.eaten;
  const goal = kcalGoal();
  // Gefüllt wird nach dem Anteil von Eiweiß, KH und Fett an den gegessenen kcal, die Länge ist gegessen / Ziel
  const parts = [['protein', 4, 'var(--mp)'], ['kh', 4, 'var(--mc)'], ['fett', 9, 'var(--mf)']];
  const macroKcal = parts.reduce((x, [id, k]) => x + e[id] * k, 0) || 1;
  const full = Math.min(100, (e.kcal / goal) * 100);
  const seg = parts.map(([id, k, c]) => `<i style="width:${((e[id] * k) / macroKcal) * full}%;background:${c}"></i>`).join('');
  const leg = (id, name, cls) => `<span class="${cls}"><b>${fmt(e[id])}</b>${t[id] ? ` / ${fmt(t[id])}` : ''} g ${name}</span>`;
  return `<a class="card journal-card" href="tracker/">
      <div class="peek">${gingerPeek(72)}</div>
      <div class="day-top"><div><div class="journal-kcal">${fmt(Math.max(0, left.kcal))} <small>kcal frei</small></div>
        <div class="small muted">${fmt(e.kcal)} von ${fmt(goal)} kcal gegessen${hasKcalGoal() ? '' : ' (kein Ziel im Tracker, ich rechne mit 2.000)'}</div></div></div>
      <div class="comp-bar" aria-hidden="true">${seg}</div>
      <div class="comp-legend">${leg('protein', 'Eiweiß', 'm-p')}${leg('kh', 'KH', 'm-c')}${leg('fett', 'Fett', 'm-f')}</div>
    </a>`;
}

// Begrüßung nach Tageszeit, mit Namen, wenn er unter „Ich“ steht (nur lokal gespeichert)
function greeting() {
  const h = new Date().getHours();
  const g = h < 5 ? 'Gute Nacht' : h < 11 ? 'Guten Morgen' : h < 17 ? 'Schön, dass du da bist' : 'Guten Abend';
  const name = (state.profile.name || '').trim();
  return name ? `${g}, ${name}!` : `${g}!`;
}

function viewHeute() {
  const date = new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });
  const log = journal();

  const tips = prepTips().slice(0, 1).map((tip) => tip.recipe
    ? `<a class="hint tip-line" href="#/rezept/${tip.recipe.id}">${ICONS.clock}<span>${esc(tip.text)}</span></a>`
    : `<div class="hint tip-line">${ICONS.clock}<span>${esc(tip.text)}</span></div>`).join('');
  const indexed = log;
  const extras = indexed.filter((e) => !dayMeals().some((m) => m.id === e.meal));
  const shownToday = new Set();
  const meals = dayMeals().map((m) => {
    const eatenHere = indexed.filter((e) => e.meal === m.id);
    if (m.id === 'snack') return snackBlock(eatenHere);
    if (eatenHere.length) return `<section class="meal-block">${eatenRow(m.name, mealTotals(m.id))}</section>`;
    // Dasselbe Gericht nicht mittags und abends vorschlagen
    let ideas = ideasFor(m.id).filter((x) => !shownToday.has(x.recipe.id));
    const planned = plannedRecipe(todayKey(), m.id);
    if (planned) ideas = [{ recipe: planned, mode: timeMode(planned, m.id) || 'fits', planned: true, factor: slotFactor(`${todayKey()}|${m.id}`) }, ...ideas.filter((x) => x.recipe.id !== planned.id)];
    if (!ideas.length) {
      return `<section class="meal-block"><div class="meal-head"><h3>${m.name}</h3></div>
        <div class="card small muted">Ginger findet gerade kein passendes Rezept. Vielleicht sind zu viele Zutaten auf „mag ich nicht“?</div></section>`;
    }
    const i = (state.pick[m.id] || 0) % ideas.length;
    const idea = ideas[i];
    shownToday.add(idea.recipe.id);
    return `<section class="meal-block">
      <div class="meal-head"><h3>${m.name}</h3><span class="small muted">${idea.planned ? 'Aus deinem Wochenplan' : `${state.profile.times[m.id]} Min Zeit`}</span></div>
      ${recipeCard(idea.recipe, { meal: m.id, mode: idea.mode, factor: idea.factor || 1 })}
      ${pantryStatus(idea.recipe, idea.factor || 1)}
      ${ui.rejecting === idea.recipe.id ? rejectPanel(idea.recipe) : `<div class="idea-actions">
        ${ideas.length > 1 ? `<button class="link-btn" data-action="next-idea" data-meal="${m.id}">Andere Idee</button>` : ''}
        ${listButton(idea.recipe, idea.factor || 1)}
        <button class="link-btn muted-link" data-action="ask-reject" data-recipe="${idea.recipe.id}">Mag ich nicht</button>
      </div>`}
    </section>`;
  }).join('');

  return `<main class="screen with-nav">
    <div class="top-row">
      <div><div class="small muted">${date}</div><h1>${esc(greeting())}</h1></div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">
        <div class="level-pill">Level ${level()} · ${levelName()}</div>
        <div class="small" style="color:var(--accent-text)">${stampCount()} Stempel gesammelt</div>
      </div>
    </div>
    ${dayCard()}
    ${infoHead('h2', 'Deine Mahlzeiten', 'heute')}
    ${meals}
    ${[...new Set(extras.map((e) => e.meal))].map((id) => `<section class="meal-block">${eatenRow(id === 'snack' ? 'Snacks' : mealName(id), mealTotals(id))}</section>`).join('')}
    <button class="link-btn" data-action="cook-open" data-meal="${(dayMeals().find((m) => m.id === currentMeal()) || dayMeals()[0]).id}">Mehr Ideen aus dem Vorrat</button>
    ${tips}
  </main>${nav('heute')}`;
}

// ---------- Rezepte ----------

function viewRezepte() {
  // Eine Filterreihe: Mahlzeiten, Favoriten und „Ich habe …“; darüber ein Suchfeld für Namen und Zutaten
  const f = ui.recipeFilter;
  const filters = [{ id: 'alle', name: 'Alle' }, ...MEALS, { id: 'snack', name: 'Snacks' }, { id: 'fav', name: 'Favoriten' }, { id: 'habe', name: 'Ich habe …' }];
  const chips = `<nav class="chips chip-scroll" aria-label="Filter">${filters.map((x) => `<button class="chip" data-action="filter" data-id="${x.id}" aria-pressed="${f === x.id}">${x.name}</button>`).join('')}</nav>`;
  let body;
  if (f === 'habe') body = viewHabe();
  else if (f === 'fav') body = viewFavoriten();
  else {
    const q = (ui.recipeQuery || '').trim().toLowerCase();
    const byMeal = (r) => f === 'alle' || r.meals.includes(f);
    const byQuery = (r) => !q || r.name.toLowerCase().includes(q) || textOf(r).includes(q);
    const mealIdx = (r) => Math.min(...r.meals.map((m) => { const i = ['fruehstueck', 'mittag', 'abend', 'snack'].indexOf(m); return i < 0 ? 9 : i; }));
    const own = state.ownRecipes.filter(byMeal).filter(byQuery);
    const bought = f === 'alle' || f === 'snack' ? productSnacks().filter(suitable).filter(byQuery) : [];
    const list = RECIPES.filter(suitable).filter(byMeal).filter(byQuery)
      .sort((a, b) => likeScore(b) + microBonus(b) / 2 - likeScore(a) - microBonus(a) / 2 || mealIdx(a) - mealIdx(b) || a.time - b.time);
    body = `${own.length ? `<h2>Meine Rezepte</h2>${own.map((r) => recipeCard(r)).join('')}` : ''}
    ${bought.length ? `<h2>Snacks aus deinem Einkauf</h2>${bought.map((r) => recipeCard(r)).join('')}` : ''}
    ${own.length || bought.length ? '<h2>Gingers Rezepte</h2>' : ''}
    <div class="small muted">${list.length} ${list.length === 1 ? 'Rezept' : 'Rezepte'}${q ? ` mit „${esc(ui.recipeQuery.trim())}“` : ''}</div>
    ${list.map((r) => recipeCard(r)).join('') || '<div class="card small muted">Keine passenden Rezepte gefunden.</div>'}`;
  }
  return `<main class="screen with-nav">
    <div class="top-row"><h1>Rezepte</h1><a class="link-btn" href="#/neu">+ Eigenes Rezept</a></div>
    ${f === 'habe' ? '' : `<div class="search-field"><label class="sr-only" for="rq">Rezept suchen</label><input id="rq" type="search" data-input="recipeQuery" placeholder="Rezept oder Zutat suchen" value="${esc(ui.recipeQuery || '')}" autocomplete="off"></div>`}
    ${chips}
    ${body}
  </main>${nav('rezepte')}`;
}

// Welche der eingegebenen Lebensmittel kommen im Rezept vor?
function haveMatches(r, terms) {
  const text = textOf(r);
  const foods = new Set(r.ingredients.map((l) => (findFood(parseIngredient(l).name.replace(/[()]/g, ' ')) || {}).name).filter(Boolean));
  return terms.filter((t) => {
    if (text.includes(t.toLowerCase())) return true;
    const f = findFood(t);
    return f && f.name !== 'Gewürze' && foods.has(f.name);
  });
}

function viewHabe() {
  const terms = ui.have;
  const fromPantry = pantryKeys().filter((k) => !terms.includes(k)).slice(0, 8);
  const results = terms.length ? allRecipes().filter(suitable)
    .map((r) => ({ r, hit: haveMatches(r, terms) }))
    .filter((x) => x.hit.length)
    .sort((a, b) => b.hit.length - a.hit.length || isFav(b.r) - isFav(a.r) || likeScore(b.r) + microBonus(b.r) / 2 - likeScore(a.r) - microBonus(a.r) / 2 || a.r.time - b.r.time) : [];
  return `<p class="lead">Sag mir, was weg muss oder worauf du Lust hast. Ich suche Gerichte, die dazu und zu dir passen.</p>
    <div class="input-row">
      <label class="sr-only" for="have">Lebensmittel</label>
      <input id="have" class="input" list="foodlist3" placeholder="z. B. Zucchini" value="${esc(ui.haveDraft)}" data-input="haveDraft" autocomplete="off">
      <button class="btn dark small-btn" data-action="have-add">Dazu</button>
    </div>
    <datalist id="foodlist3">${FOODS.filter((x) => x.name !== 'Gewürze').map((x) => `<option value="${esc(x.name)}"></option>`).join('')}</datalist>
    ${terms.length ? `<div class="chips">${terms.map((t) => `<button class="chip" aria-pressed="true" data-action="have-remove" data-food="${esc(t)}" aria-label="${esc(t)} entfernen">${esc(t)} ✕</button>`).join('')}</div>` : ''}
    ${fromPantry.length ? `<div class="small muted">Aus deinem Einkauf:</div><div class="chips">${fromPantry.map((t) => `<button class="chip" data-action="have-chip" data-food="${esc(t)}">+ ${esc(t)}</button>`).join('')}</div>` : ''}
    ${!terms.length ? '' : results.length
      ? `<h2>Passt dazu</h2>${results.map((x) => `<div class="have-hit">${recipeCard(x.r)}<div class="small muted">${terms.length > 1 ? `${x.hit.length} von ${terms.length}: ` : 'Mit '}${esc(x.hit.join(', '))}</div></div>`).join('')}`
      : '<div class="card small muted">Dazu habe ich kein passendes Rezept. Versuch ein anderes Lebensmittel oder trag ein eigenes Rezept ein.</div>'}`;
}

function viewFavoriten() {
  const favs = allRecipes().filter((r) => isFav(r));
  if (!favs.length) return `<div class="ginger-says">${ginger(70)}<div class="bubble">Tipp bei einem Rezept auf „Zu Favoriten“. Dann landet es hier und kommt öfter in deinen Wochenplan.</div></div>`;
  return `<p class="lead">Deine Lieblinge kommen öfter in den Wochenplan. Mit „Einplanen“ legst du selbst einen Tag fest.</p>
    ${favs.map((r) => `<div class="have-hit">${recipeCard(r)}
      <div class="idea-actions"><button class="link-btn" data-action="plan-open" data-recipe="${r.id}">Einplanen</button>
      <button class="link-btn" data-action="fav" data-recipe="${r.id}">Aus Favoriten nehmen</button></div>
      ${ui.planning === r.id ? planPicker(r) : ''}</div>`).join('')}`;
}

// ---------- Rezept und Kochen ----------

function viewProdukt(r, meal) {
  const backHref = ['#/woche', '#/liste', '#/einkauf', '#/rezepte', '#/heute', '#/kochen'].includes(ui.prevPage) ? ui.prevPage : '#/heute';
  return `<main class="screen">
    <a class="back" href="${backHref}">${ICONS.back}Zurück</a>
    <div class="hero" style="background:${r.tint}">${gingerPeek(110)}</div>
    <div>
      <h1>${esc(r.name)}</h1>
      <div class="small muted" style="margin-top:4px">${[r.brand, `Snack aus deinem Einkauf`, `${r.servingGuess ? 'ca. ' : ''}${fmt(r.serving)} g pro Portion`].filter(Boolean).map(esc).join(' · ')}</div>
    </div>
    <div class="input-row">
      <button class="btn secondary small-btn fav-btn" data-action="fav" data-recipe="${r.id}" aria-pressed="${isFav(r)}">${ICONS.heart}${isFav(r) ? 'Favorit' : 'Zu Favoriten'}</button>
      <button class="btn secondary small-btn" data-action="plan-open" data-recipe="${r.id}" aria-expanded="${ui.planning === r.id}">Einplanen</button>
    </div>
    ${ui.planning === r.id ? planPicker(r) : ''}
    ${nutrientTable(r.nutrients)}
    ${r.servingGuess || r.addedGuess ? `<p class="small muted">${r.servingGuess ? 'Die Packung nennt keine Portionsgröße, ich rechne mit 40 g. ' : ''}${r.addedGuess ? 'Freien Zucker meldet das Produkt nicht, gezeigt ist der ganze Zucker.' : ''}</p>` : ''}
    <div class="bottom">
      <button class="btn" data-action="eat-product" data-recipe="${r.id}" data-meal="${meal || 'snack'}">Gegessen</button>
      <button class="link-btn" data-action="pantry-snack" data-code="${esc(r.code)}">Nicht mehr als Snack vorschlagen</button>
    </div>
  </main>`;
}

function viewRezept(id, meal, factorParam) {
  const r = allRecipes().find((x) => x.id === id);
  // Aus dem Wochenplan kann eine angepasste Menge mitkommen (z. B. 1.2)
  const f = Math.min(FIT_MAX, Math.max(FIT_MIN, Number(factorParam) || 1));
  if (!r) return viewHeute();
  if (r.product) return viewProdukt(r, meal);
  const done = new Set(state.cooking[r.id] || []);
  const doneCount = r.steps.filter((_, i) => done.has(i)).length;
  const allDone = doneCount === r.steps.length;
  const cheer = allDone ? 'Alles erledigt! Hol dir deinen Stempel.' : doneCount === 0 ? 'Los geht’s, ich schau zu!' : 'Super, weiter so!';
  const stampedNow = ui.justStamped === r.id;
  let note = '';
  if (r.prep) note = `<div class="hint">${ICONS.paw}<span>Am Vorabend vorbereiten, dann ist es morgens sofort fertig.</span></div>`;
  else if (r.mealprep) note = `<div class="hint">${ICONS.paw}<span>${r.own && r.portions >= 2 ? `Vorkoch-Tipp: Das Rezept reicht für ${r.portions} Portionen. Den Rest kannst du am nächsten Tag essen.` : 'Vorkoch-Tipp: Koch die doppelte Menge und nimm eine Portion am nächsten Tag mit.'}</span></div>`;
  const backHref = ['#/woche', '#/liste', '#/einkauf', '#/rezepte', '#/heute', '#/kochen'].includes(ui.prevPage) ? ui.prevPage : meal ? '#/heute' : '#/rezepte';

  return `<main class="screen">
    <a class="back" href="${backHref}">${ICONS.back}Zurück</a>
    <div class="hero" style="background:${r.tint}">${gingerPeek(110)}</div>
    <div>
      <h1>${esc(r.name)}</h1>
      <div class="small muted" style="margin-top:4px">${r.time} Min · ca. ${Math.round((r.kcal * f) / 10) * 10} kcal pro Portion · ${dietName(r.diet)}</div>
      <div class="small muted macro-meta">${macroLine(recipeNutrients(r), f)}</div>
    </div>
    <div class="input-row">
      <button class="btn secondary small-btn fav-btn" data-action="fav" data-recipe="${r.id}" aria-pressed="${isFav(r)}">${ICONS.heart}${isFav(r) ? 'Favorit' : 'Zu Favoriten'}</button>
      <button class="btn secondary small-btn" data-action="plan-open" data-recipe="${r.id}" aria-expanded="${ui.planning === r.id}">Einplanen</button>
    </div>
    ${ui.planning === r.id ? planPicker(r) : ''}
    ${f !== 1 ? `<div class="hint">${ICONS.paw}<span>Für deinen Plan nimmst du ${fmtFactor(f)}× die Rezeptmenge, damit der Tag zu deinem Kalorienziel passt. Die Zutaten unten sind schon umgerechnet.</span></div>` : ''}
    ${note}
    <section class="card"><div class="meal-head" style="margin-bottom:6px"><h2>Du brauchst</h2>
        <div class="stepper" role="group" aria-label="Portionen">
          <button class="round" data-action="portions" data-recipe="${r.id}" data-n="${portionsOf(r) - 1}" aria-label="Eine Portion weniger" ${portionsOf(r) <= 1 ? 'disabled' : ''}>−</button>
          <span><b>${portionsOf(r)}</b> ${portionsOf(r) === 1 ? 'Portion' : 'Portionen'}</span>
          <button class="round" data-action="portions" data-recipe="${r.id}" data-n="${portionsOf(r) + 1}" aria-label="Eine Portion mehr" ${portionsOf(r) >= 12 ? 'disabled' : ''}>+</button>
        </div></div>
      <ul class="ing-list">${scaledIngredients(r, portionsOf(r) * f).map((x) => { const n = nutrientsOfText(x); const mic = deficits().filter((id) => !n['miss_' + id]).map((id) => { const m = MICROS.find((y) => y.id === id); return `<span class="micro-line">${m.name} ${g1(n[id])} ${m.unit}</span>`; }).join(' '); return `<li><span>${esc(x)}</span>${n.kcal >= 1 ? `<span class="ing-n">${fmt(n.kcal)} kcal ${macroMini(n)}</span>` : ''}${mic && n.kcal >= 1 ? `<span class="ing-n">${mic}</span>` : ''}</li>`; }).join('')}</ul>
    </section>
    ${nutrientTable(addNutrients(emptyNutrients(), recipeNutrients(r), f))}
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
      <div class="bubble" style="flex:1;margin-bottom:18px">${stampedNow ? `Stempel ist im Heft! +${XP_PER_RECIPE} XP${ui.justEntry ? ' Im Tracker-Journal steht es auch schon.' : ''}${ui.justVorrat ? ' ' + esc(ui.justVorrat) : ''}` : cheer}</div>
      ${stampedNow ? '<div class="stamp-big">Gekocht!</div>' : ''}
    </div>
    <div class="bottom">
      ${stampedNow
        ? `<a class="btn" href="#/stempel">Zum Stempelheft</a><button class="link-btn" data-action="undo-eaten" data-entry="${esc(ui.justEntry || '')}" data-recipe="${r.id}">Doch nicht gekocht? Rückgängig</button>`
        : `<button class="btn" data-action="cooked" data-recipe="${r.id}" data-meal="${meal || ''}" data-factor="${f}" ${allDone ? '' : 'disabled'}>Fertig gekocht</button>`}
      ${stampedNow ? '' : `<button class="link-btn" data-action="tracker-one" data-recipe="${r.id}" data-meal="${meal || ''}" data-factor="${f}">Nur im Tracker eintragen, ohne Stempel</button>`}
      ${r.own ? '' : ui.rejecting === r.id ? rejectPanel(r) : `<button class="link-btn" data-action="ask-reject" data-recipe="${r.id}">Mag ich nicht, nicht mehr vorschlagen</button>`}
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
  const nutrients = lines.reduce((acc, x) => addNutrients(acc, x.kcal === null ? null : nutrientsFor(x.food, x.grams, x.food ? null : x.row.kcal100)), emptyNutrients());
  const share = Math.max(...form.meals.map((m) => (MEALS.find((x) => x.id === m) || MEALS[1]).share), 0.25);
  const budget = Math.round(kcalGoal() * share);

  // Ernährungsform und Allergene aus den Zutaten ableiten
  const tags = lines.map((x) => x.food && x.food.diet).filter(Boolean);
  const diet = tags.includes('fleisch') ? 'fleisch' : tags.includes('fisch') ? 'fisch' : tags.includes('tierisch') ? 'vegetarisch' : 'vegan';
  const allergens = [...new Set(lines.flatMap((x) => (x.food && x.food.allergens) || []))];

  const tips = [];
  const warn = [];
  if (unknown.length) {
    tips.push({ text: `Diese Zutaten kenne ich nicht: ${unknown.map((x) => x.row.name).join(', ')}. Trag dahinter die kcal pro 100 g ein, sonst zähle ich sie nicht mit.` });
  }
  const dietType = trackerDiet().type;
  if (!DIET_ALLOWS[dietType].includes(diet)) warn.push(`Passt nicht zu deiner Ernährungsform (${DIET_NAMES[dietType]}). Ich schlage es dir deshalb nicht vor.`);
  const badAllergens = allergens.filter((a) => blockedAllergens().includes(a));
  if (badAllergens.length) warn.push(`Achtung, enthält ${badAllergens.map((a) => ALLERGEN_NAMES[ALLERGEN_CODES[a][0]]).join(', ')}. Das hast du im Tracker als Allergie angegeben.`);
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
  return { portions, total, perPortion, nutrients, budget, unknown, lines, diet, allergens, tips, warn };
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
      <div class="small" style="font-weight:700">Pro Portion: ${g1(a.nutrients.protein / a.portions)} g Eiweiß · ${g1(a.nutrients.kh / a.portions)} g Kohlenhydrate · ${g1(a.nutrients.fett / a.portions)} g Fett · ${g1(a.nutrients.ballast / a.portions)} g Ballaststoffe · ${g1(a.nutrients.zugesetzt / a.portions)} g freier Zucker</div>
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
    nutrients: addNutrients(emptyNutrients(), a.nutrients, 1 / a.portions),
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
  return `<main class="screen with-nav">
    <div class="ginger-says">${ginger(70)}<div class="bubble">Hier kannst du alles ändern, was ich über dich weiß.</div></div>
    <h2>Rezeptbuch</h2>
    <a class="card" href="#/edit/1" style="text-decoration:none;color:inherit;display:flex;flex-direction:column;gap:4px">
      <h3>Name</h3>
      <div class="small muted">${esc((state.profile.name || '').trim() || 'noch keiner')}</div>
    </a>
    <a class="card" href="#/edit/2" style="text-decoration:none;color:inherit;display:flex;flex-direction:column;gap:4px">
      <h3>Geschmack</h3>
      <div class="small muted">Mag ich: ${esc(likes.join(', ') || 'noch nichts')}</div>
      <div class="small muted">Mag ich nicht: ${esc(nos.join(', ') || 'nichts')}</div>
    </a>
    <a class="card" href="#/edit/3" style="text-decoration:none;color:inherit;display:flex;flex-direction:column;gap:4px">
      <h3>Zeit und Portionen</h3>
      <div class="small muted">${p.mealCount === 2 ? '2 Mahlzeiten und Snacks · ' : ''}${mainMeals().map((m) => `${m.name} ${p.times[m.id]} Min`).join(' · ')} · für ${p.portions || 1} ${(p.portions || 1) === 1 ? 'Portion' : 'Portionen'}</div>
    </a>
    ${TRACKER_SETTINGS.filter(([group]) => group !== 'Tracker').map(([group, items]) => `<h2>${group}</h2>
    <section class="card set-list">${items.map((t) => `<a href="tracker/?zurueck=ich#set:${encodeURIComponent(t)}"><span>${esc(t)}${t === 'Tagesziel' || t === 'Ernährung & Allergien' ? `<span class="small muted">${t === 'Tagesziel' ? (nutrientTargets().kcal ? `${fmt(nutrientTargets().kcal)} kcal am Tag` : 'noch kein Kalorienziel') : esc(trackerSettingsSummary().split(' · ').slice(0, 2).join(' · '))}</span>` : ''}</span><span aria-hidden="true">›</span></a>`).join('')}</section>`).join('')}
    ${deficitCard()}
    ${trackerCardsCard()}
    ${backupCard()}
    ${Object.keys(state.rejected || {}).length ? `<section class="card" style="display:flex;flex-direction:column;gap:8px">
      <h3>Abgelehnte Rezepte</h3>
      <div class="small muted">Ähnliche Rezepte schlage ich dir seltener vor.${learnedFoods().length ? ` Gelernt: weniger mit ${esc(learnedFoods().join(', '))}.` : ''}</div>
      ${Object.keys(state.rejected).map((id) => allRecipes().find((r) => r.id === id)).filter(Boolean).map((r) => `<div class="row" style="justify-content:space-between"><span>${esc(r.name)}</span><button class="link-btn" data-action="unreject" data-recipe="${r.id}">Wieder vorschlagen</button></div>`).join('')}
    </section>` : ''}
    <section class="card set-list"><a href="#/quellen"><span>Quellen und Lizenzen</span><span aria-hidden="true">›</span></a></section>
    <div class="danger-zone">${ui.confirmReset
      ? `<p class="small" style="text-align:center">Wirklich alles löschen? Stempel, Wochenplan und Geschmack sind dann weg. Dein Tracker bleibt, wie er ist.</p>
         <div class="input-row"><button class="btn secondary" data-action="cancel-reset">Abbrechen</button><button class="btn dark" data-action="reset">Ja, löschen</button></div>`
      : '<button class="link-btn danger" data-action="ask-reset">Rezeptbuch zurücksetzen …</button>'}</div>
  </main>${nav('ich')}`;
}

// Mängel: Was du ankreuzt, bevorzugt Ginger überall (Vorschläge, Rezepte, Wochenplan, Kochen, Snacks). Nur auf diesem Handy.
function deficitCard() {
  const mine = state.profile.deficits || [];
  return `${infoHead('h2', 'Mängel', 'deficit')}
    <section class="card" style="display:flex;flex-direction:column;gap:10px">
      <div class="small muted">Hast du einen festgestellten Mangel? Dann schlage ich dir Gerichte vor, die davon viel enthalten.</div>
      <div class="chips">${MICROS.map((m) => `<button class="chip" data-action="deficit" data-id="${m.id}" aria-pressed="${mine.includes(m.id)}">${m.name}</button>`).join('')}</div>
      ${hasMicros() ? '' : '<div class="small" style="color:var(--accent-text)">Die Werte aus dem Bundeslebensmittelschlüssel fehlen noch in der App, deshalb wirkt das noch nicht.</div>'}
      <details class="small muted"><summary>Tageswerte und Quellen</summary>
        <ul class="src-list">${MICROS.map((m) => { const d = DGE[m.id]; return `<li>${m.name}: ${fmt(dgeRef(m.id))} ${m.unit} am Tag (DGE-${d.kind}, Stand ${d.year}${d.note ? `; ${esc(d.note)}` : ''}). <a href="${d.url}" target="_blank" rel="noopener">dge.de</a></li>`; }).join('')}</ul>
        Gehalt der Lebensmittel: Bundeslebensmittelschlüssel 4.0, Max Rubner-Institut 2025 (CC BY 4.0).
      </details>
    </section>`;
}

// Welche Zusatz-Karten das Tracker-Journal zeigt (die Schalter gibt es im Tracker, hier alle an einer Stelle)
const TRACKER_CARDS = [['water', 'Wasser'], ['caffeine', 'Koffein'], ['alcohol', 'Alkohol'], ['supp', 'Supplements'], ['sug', 'Abend-Vorschläge mit Tracker-Rezepten']];
function trackerCardsCard() {
  const t = readTracker();
  return `<h2>Im Tracker anzeigen</h2>
    <section class="card set-list toggles">${TRACKER_CARDS.map(([k, name]) => `<label class="row fit-row"><input type="checkbox" data-action="tracker-card" data-k="${k}" ${!t[k] || t[k].enabled !== false ? 'checked' : ''}><span>${esc(name)}</span><a class="link-btn" href="tracker/?zurueck=ich#set:${encodeURIComponent(name.split(' ')[0])}">Einstellen</a></label>`).join('')}
      <div class="small muted">Was du nicht brauchst, blende ich im Journal aus. Deine Einträge bleiben gespeichert.</div></section>`;
}

// Backup für Rezeptbuch und Tracker zusammen (backup.js). Alles liegt nur auf diesem Gerät.
function backupCard() {
  const m = RBBackup.meta();
  const dirty = RBBackup.dirty();
  return `<h2 id="backup">Backup</h2>
    <section class="card backup-card">
      <p class="small">Deine Daten liegen nur auf diesem Handy. Löschst du die App oder die Browserdaten, sind sie weg. Exportier ab und zu und leg die Datei sicher ab (z. B. „In Dateien sichern“).</p>
      <div class="small ${dirty ? '' : 'muted'}" style="${dirty ? 'color:var(--accent-text)' : ''}">${esc(RBBackup.lastText())}${dirty ? ' Seitdem hat sich etwas geändert.' : m.at ? ' Seitdem nichts geändert.' : ''}</div>
      <div class="input-row">
        <button class="btn small-btn" data-action="backup-export" style="flex:1">Exportieren</button>
        <label class="btn secondary small-btn" style="flex:1">Importieren<input type="file" id="backup-file" accept="application/json,.json" hidden></label>
      </div>
      <div class="info-head"><label class="row fit-row"><input type="checkbox" data-action="backup-remind" ${m.remind ? 'checked' : ''}><span class="small">Ans Exportieren erinnern</span></label>${infoBtn('backup')}</div>${infoText('backup')}
    </section>`;
}

// ---------- Kalorien-Tracker ----------
// Der Tracker (Ordner tracker/, von ST0PTV, MIT-Lizenz) läuft auf derselben Seite und speichert unter „ct.v1“.
// Er ist die einzige Stelle für Journal, Ziele, Ernährungsform, Allergien und Einkauf (Vormerken per Barcode).
// Das Rezeptbuch liest dort mit und trägt Gekochtes direkt in sein Journal ein:
// als eigenes Lebensmittel (Nährwerte pro 100 g) plus Eintrag.

const TRACKER_KEY = 'ct.v1';
const TRACKER_DIET = { vegan: 2, vegetarisch: 1, fisch: 0, fleisch: 0 };
const TRACKER_MEAL = { fruehstueck: 'breakfast', mittag: 'lunch', abend: 'dinner', snack: 'snack' };

// Gewicht einer Portion in Gramm
function portionGrams(r) {
  if (r.own && r.rows) return r.rows.reduce((sum, row) => sum + gramsOf(row, findFood(row.name)), 0) / (r.portions || 1);
  return (r.ingredients || []).reduce((sum, line) => sum + gramsOfText(line), 0);
}

function trackerFood(r) {
  const n = recipeNutrients(r);
  const grams = Math.round(portionGrams(r));
  if (!n.kcal || grams < 10) return null;
  const per100 = (x) => Math.round(((x || 0) * 1000) / grams) / 10;
  return {
    src: 'custom', id: 'custom:rezeptbuch-' + r.id, n: r.name, brand: 'Rezeptbuch',
    k: Math.round((n.kcal * 100) / grams), p: per100(n.protein), c: per100(n.kh), f: per100(n.fett),
    fi: per100(n.ballast), su: per100(n.zucker), fs: per100(Math.min(n.zugesetzt, n.zucker)),
    serving: grams, barcode: null, liq: false,
    d: r.diet in TRACKER_DIET ? TRACKER_DIET[r.diet] : null,
    a: (r.allergens || []).flatMap((a) => (ALLERGEN_CODES[a] || []).slice(0, 1))
  };
}

// Tracker-Speicher lesen. Pro Zeichnen nur einmal (suitable() fragt ihn für jedes Rezept).
let trackerCache = null;
function readTracker() {
  if (!trackerCache) {
    try { trackerCache = JSON.parse(localStorage.getItem(TRACKER_KEY)) || {}; } catch (e) { trackerCache = {}; }
  }
  return trackerCache;
}
function writeTracker(t) {
  trackerCache = null;
  try { localStorage.setItem(TRACKER_KEY, JSON.stringify(t)); return true; } catch (e) { return false; }
}
// Ziel, das an einem Tag im Tracker gilt (wie goalsFor() dort: Tage vor dem ersten Ziel nutzen das erste)
function trackerGoal(day = todayKey()) {
  const h = (readTracker().goalHistory || []).slice().sort((a, b) => a.from.localeCompare(b.from));
  let g = h[0] || {};
  for (const e of h) { if (e.from <= day) g = e; else break; }
  return g;
}

function newEntryId() { return 'rb' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

// Trägt eine Portion (× factor) ins Tracker-Journal von heute ein. Gibt die Eintrags-ID zurück oder null.
function addToTracker(r, meal, factor = 1, extra = null) {
  const food = trackerFood(r);
  if (!food) return null;
  const t = readTracker();
  t.custom = Array.isArray(t.custom) ? t.custom : [];
  const i = t.custom.findIndex((x) => x.id === food.id);
  if (i >= 0) t.custom[i] = food; else t.custom.push(food);
  return addEntry(t, food, Math.round(food.serving * factor), meal, todayKey(), extra);
}
// Ein Produkt aus dem Vorrat (vorgemerkt im Tracker) eintragen, standardmäßig eine Packungsportion; zieht es vom Vorrat ab
function addProductToTracker(code, meal, grams) {
  const t = readTracker();
  const item = (t.pantry || []).find((x) => x.id === code);
  if (!item) return null;
  const vu = V.take(t.pantry, (x) => x.id === code, grams).used;
  return addEntry(t, item, grams, meal, todayKey(), vu.length ? { vu } : null);
}
function addEntry(t, food, grams, meal, day = todayKey(), extra = null) {
  t.days = t.days && typeof t.days === 'object' ? t.days : {};
  const id = newEntryId();
  const { src, n, brand, liq, serving, k, p, c, f, fi, su, fs } = food;
  const entry = { id, meal: TRACKER_MEAL[meal] || 'snack', grams, ref: food.id, src, n, brand, liq, serving, k, p, c, f, fi, su, fs, ...(extra || {}) };
  t.days[day] = [...(t.days[day] || []), entry];
  return writeTracker(t) ? id : null;
}

function removeFromTracker(entryId, day = todayKey()) {
  const t = readTracker();
  if (!t.days || !t.days[day]) return;
  const gone = t.days[day].find((e) => e.id === entryId);
  if (gone && gone.vu) V.giveBack(t.pantry, gone.vu); // Abgezogenes kommt zurück in den Vorrat
  t.days[day] = t.days[day].filter((e) => e.id !== entryId);
  writeTracker(t);
}

// Einmalige Übernahme aus Versionen, in denen das Rezeptbuch Profil, Tagebuch und Einkauf selbst gespeichert hat.
// Der Tracker gewinnt: Was dort schon eingestellt ist, bleibt; nur Lücken werden aus dem Rezeptbuch gefüllt.
function migrateToTracker() {
  if (state.trackerMigrated) return;
  const p = state.profile;
  if (state.onboarded) {
    const t = readTracker();
    const today = todayKey();
    if ((!Array.isArray(t.goalHistory) || !t.goalHistory.length) && !(t.settings && t.settings.goal) && p.kcal) {
      t.goalHistory = [{ from: Object.keys(state.log || {}).sort()[0] || today, goal: p.kcal, protein: null, carbs: null, fat: null, fiber: null, sugar: null, weight: p.weight || null, preset: null, pf: null, ff: null }];
    }
    t.profile = t.profile || {};
    if (t.profile.weight == null && p.weight) t.profile.weight = p.weight;
    if (t.profile.height == null && p.height) t.profile.height = p.height;
    if (t.profile.sex == null && (p.sex === 'w' || p.sex === 'm')) t.profile.sex = p.sex === 'w' ? 'f' : 'm';
    const d = t.diet || {};
    if ((!d.type || d.type === 'all') && !(d.allergens || []).length && p.diet) {
      t.diet = {
        type: { vegan: 'vegan', vegetarisch: 'veg' }[p.diet] || 'all',
        allergens: [...new Set((p.allergies || []).flatMap((a) => ALLERGEN_CODES[a] || []))]
      };
    }
    // Tagebuch-Einträge, die noch nicht im Tracker stehen (vor der Tracker-Kopplung)
    t.days = t.days && typeof t.days === 'object' ? t.days : {};
    for (const [day, list] of Object.entries(state.log || {})) {
      for (const e of list) {
        if (e.trackerId) continue;
        const n = e.n || { kcal: e.kcal };
        t.days[day] = [...(t.days[day] || []), { id: newEntryId(), quick: true, grams: 100, src: 'quick', n: e.name || 'Rezeptbuch', meal: TRACKER_MEAL[e.meal] || 'snack',
          k: Math.round(e.kcal), p: Math.round(n.protein || 0), c: Math.round(n.kh || 0), f: Math.round(n.fett || 0), fi: 0, su: 0 }];
      }
    }
    // Gescannter Einkauf → im Tracker vorgemerkt; Snack-Markierungen bleiben
    t.pantry = Array.isArray(t.pantry) ? t.pantry : [];
    for (const [code, x] of Object.entries(state.pantry || {})) {
      const id = 'off:' + code;
      if (x.snack) state.snacks[id] = true;
      if (t.pantry.some((y) => y.id === id) || !x.kcal100) continue;
      const n = x.n100 || {};
      const food = { src: 'off', id, n: x.name, brand: x.brand || '', serving: x.serving || null, liq: false, k: x.kcal100,
        p: n.protein || 0, c: n.kh || 0, f: n.fett || 0, fi: n.ballast || 0, su: n.zucker || 0, fs: n.zugesetzt ?? null };
      t.pantry.push({ ...food, added: Date.now() });
      // Ernährungsform und Allergene kennt der Tracker aus seinem Barcode-Speicher
      const d = { vegan: 2, tierisch: 1, fleisch: 0 }[x.diet];
      t.offCache = t.offCache && typeof t.offCache === 'object' ? t.offCache : {};
      if (!t.offCache[code]) t.offCache[code] = { ...food, barcode: code, d: d ?? null, a: d == null ? null : (x.allergens || []).flatMap((a) => ALLERGEN_CODES[a] || []) };
    }
    writeTracker(t);
  }
  for (const k of ['diet', 'allergies', 'goal', 'kcal', 'sex', 'weight', 'height']) delete p[k];
  delete state.log; delete state.dayGoals; delete state.pantry; delete state.trackerAuto;
  state.trackerMigrated = true;
  save();
}

// ---------- Quellen und Lizenzen ----------

const SOURCES = [
  { group: 'In der App enthalten', items: [
    { name: 'Kalorien-Tracker', what: 'Der ganze Bereich „Tracker“ (Ordner tracker/): Journal, Timeline, Essen, Analytics, Ziele und Makros, Ernährungsform und Allergien, Barcode-Scanner und Vormerken, Wasser, Koffein, Alkohol, Supplements, Gewichtsziel. Das Rezeptbuch liest Ziele, Ernährung und Einkauf von dort und trägt Gekochtes in sein Journal ein. Für das Rezeptbuch umgefärbt.', who: 'ST0PTV', license: 'MIT-Lizenz', link: 'https://github.com/st0ptv/Calorie-Tracker', note: 'Lizenztext liegt bei: tracker/LICENSE. Studien und Quellen des Trackers (z. B. zu Eiweiß, Fett und Zucker) stehen dort unter Einstellungen → Quellen & Lizenzen.' },
    { name: 'ZXing für JavaScript (@zxing/library)', what: 'Erkennt die Barcodes beim Scannen im Tracker (tracker/vendor/zxing.min.js).', who: 'ZXing-Autoren', license: 'Apache License 2.0', link: 'https://github.com/zxing-js/library', note: 'Lizenztext liegt bei: tracker/vendor/ZXING-LICENSE' },
    { name: 'tesseract.js mit Tesseract OCR', what: 'Liest im Scanner die Zahlen vom Foto der Nährwerttabelle (tracker/vendor/tesseract/). Läuft auf dem Handy, das Foto wird nicht verschickt. Mit deutschem Sprachmodell (tessdata).', who: 'Projekt Naptha / tesseract.js-Autoren; Tesseract OCR (Google u. a.)', license: 'Apache License 2.0 (Sprachmodell-Paket MIT)', link: 'https://github.com/naptha/tesseract.js', note: 'Lizenztext und Herkunft: tracker/vendor/tesseract/LICENSE und README.md; Hinweise zu den mitgebündelten Bibliotheken (regenerator-runtime, buffer, ieee754, zlib.js; MIT bzw. BSD-3-Clause) in tesseract.min.js.LICENSE.txt und worker.min.js.LICENSE.txt.' }
  ] },
  { group: 'Aus dem Internet geladen', items: [
    { name: 'Schrift Nunito', what: 'Die Schrift der ganzen App, geladen von Google Fonts.', who: 'The Nunito Project Authors (Vernon Adams u. a.)', license: 'SIL Open Font License 1.1', link: 'https://github.com/googlefonts/nunito', note: 'Beim Laden der Schrift sieht Google deine IP-Adresse.' },
    { name: 'Open Food Facts', what: 'Produktdaten beim Barcode-Scan im Tracker: Name, Marke, Nährwerte, Allergene, Zutaten-Hinweise. Produktfotos nutzt die App nicht.', who: 'Open Food Facts und Mitwirkende', license: 'Datenbank: Open Database License (ODbL) 1.0 · einzelne Einträge: Database Contents License (DbCL) 1.0', link: 'https://world.openfoodfacts.org/terms-of-use', note: 'Beim Scannen wird nur die Barcode-Nummer an Open Food Facts geschickt.' }
  ] },
  { group: 'Grundlage für Zahlen', items: [
    { name: 'Bundeslebensmittelschlüssel (BLS) 4.0', what: 'Kalorien, Eiweiß, Kohlenhydrate, Zucker, freier Zucker, Fett und Ballaststoffe sowie Eisen, Magnesium, Vitamin B12, Zink, Calcium, Folat-Äquivalent, Vitamin D und Jodid pro 100 g für die Zutaten der Rezepte. Ausnahmen: Kokosmilch light und Gewürze (kein BLS-Eintrag, geschätzt).', who: 'Max Rubner-Institut (2025): Bundeslebensmittelschlüssel (BLS), Version 4.0 – Deutsche Nährstoffdatenbank. Karlsruhe', license: 'CC BY 4.0 (Creative Commons Namensnennung 4.0 International)', licenseLink: 'https://creativecommons.org/licenses/by/4.0/deed.de', link: 'https://doi.org/10.25826/Data20251217-134202-0', note: 'Verändert: Die App nutzt nur einen Auszug (Energie, Makronährstoffe, Ballaststoffe, Zucker und acht Mineralstoffe/Vitamine je 100 g; Werte unter der Nachweisgrenze als 0, fehlende Werte gelten als unbekannt, tools/bls_micros.py); freier Zucker, Ernährungsform und Allergene sind daraus abgeleitet, nicht vom Max Rubner-Institut. Das Rezeptbuch liest die Werte beim Start aus derselben Datei wie der Tracker (tracker/data/bls.json). Welche Zutat welcher BLS-Eintrag ist, steht in nutrition.js. Freier Zucker ist die abgeleitete Spalte des Trackers.' },
    { name: 'Referenzwerte der DGE', what: 'Tageswerte für Eisen, Magnesium, Vitamin B12, Zink, Calcium, Folat, Vitamin D und Jod für Erwachsene, als Bezug bei „Mängel“ und in den Nährwerttabellen.', who: 'Deutsche Gesellschaft für Ernährung e. V. (DGE): Referenzwerte für die Nährstoffzufuhr (Stand der Ableitung je Nährstoff 2012 bis 2025, abgerufen am 13.10.2026)', license: 'Zitiert, nicht kopiert', link: 'https://www.dge.de/wissenschaft/referenzwerte/', note: 'Eisen: Frauen vor den Wechseljahren 16 mg (danach 14, ohne Regelblutung 11), Männer 11 mg. Zink bei mittlerer Phytatzufuhr. Vitamin D bei fehlender Bildung in der Haut. Die App kennt Alter und Wechseljahre nicht und nimmt den Frauenwert, solange im Tracker nicht „männlich“ steht.' },
    { name: 'Kalorien- und Makroziele', what: 'Kommen aus dem Tracker (Einstellungen → Tagesziel). Dort stehen auch die Studien und Leitlinien, auf die sich die Ziele stützen (DGE, WHO, Morton 2018 u. a.).', who: 'siehe Tracker', license: 'zitiert' }
  ] },
  { group: 'Selbst gemacht', items: [
    { name: 'Rezepte', what: 'Alle Rezepte in recipes.js.', who: 'von Claude für diese App geschrieben', license: 'eigene Inhalte', note: 'Allgemein bekannte Gerichte, kein Rezept aus einem Buch oder einer Website abgeschrieben.' },
    { name: 'Katze Ginger', what: 'Alle Ginger-Zeichnungen und die Warte-Animation.', who: 'von Claude als SVG gezeichnet, nach Fotos einer echten Katze', license: 'eigene Inhalte' },
    { name: 'Icons, App-Icon und Design', what: 'Linien-Icons, App-Icon, Farben und Gestaltung „Gemütliche Katzenküche“.', who: 'von Claude für diese App gemacht', license: 'eigene Inhalte' },
    { name: 'Programmcode der App', what: 'app.js, nutrition.js, recipes.js, vorrat.js, backup.js, styles.css, index.html, sw.js.', who: 'von Claude geschrieben', license: 'noch keine Lizenz festgelegt', note: 'Ohne Lizenzdatei gilt: alle Rechte vorbehalten. Wenn andere den Code nutzen dürfen sollen, kann eine Lizenz (z. B. MIT) ergänzt werden.' }
  ] }
];

function viewQuellen() {
  const item = (s) => `<div class="card source">
      <h3>${esc(s.name)}</h3>
      <p class="small muted">${esc(s.what)}</p>
      <p class="small"><span class="muted">Von:</span> ${esc(s.who)}</p>
      <p class="small"><span class="muted">Lizenz:</span> ${esc(s.license)}</p>
      ${s.note ? `<p class="small muted">${esc(s.note)}</p>` : ''}
      ${s.link ? `<a class="link-btn source-link" href="${s.link}" target="_blank" rel="noopener">${esc(s.link.replace(/^https:\/\/(www\.)?/, ''))}</a>` : ''}
      ${s.licenseLink ? `<a class="link-btn source-link" href="${s.licenseLink}" target="_blank" rel="noopener">Lizenztext</a>` : ''}
    </div>`;
  return `<main class="screen with-nav">
    <a class="back" href="#/ich">${ICONS.back}Ich</a>
    <h1>Quellen und Lizenzen</h1>
    <p class="lead">Alles, was die App von anderen benutzt, und was selbst gemacht ist.</p>
    ${SOURCES.map((g) => `<section class="source-group"><h2>${esc(g.group)}</h2>${g.intro ? `<p class="small muted">${esc(g.intro)}</p>` : ''}${g.items.map(item).join('')}</section>`).join('')}
  </main>${nav('ich')}`;
}

// ---------- Vorratskammer ----------
// Gescannt wird im Tracker („Einkauf scannen“, dort heißt es Vormerken); jedes Produkt zählt eine Packung in den Vorrat.
// Hier im Rezeptbuch: Mengen ändern, lose Zutaten dazulegen, Kochen und Essen ziehen ab (vorrat.js).
// Gespeichert ist alles im Tracker (ct.v1 → pantry), damit beide dieselbe Liste sehen.
const V = globalThis.Vorrat;

// Vorgemerkte Lebensmittel aus dem Tracker, neueste zuerst
function trackerPantry() {
  return (readTracker().pantry || []).filter((x) => x && x.id && x.n);
}
// Zutat aus nutrition.js zu einem Produktnamen, nur bei ganzem Wort („Milchschnitte“ ist keine Milch)
function matchFood(name) {
  const n = ' ' + String(name).toLowerCase().replace(/[^a-z0-9äöüß]+/g, ' ') + ' ';
  let best = null;
  let len = 0;
  for (const f of FOODS) {
    for (const k of [f.name, ...(f.aliases || [])].map((x) => x.toLowerCase())) {
      if (k.length < 3 || k.length <= len || f.name === 'Gewürze') continue;
      if ([k, k + 'n', k + 'e', k + 's', k + 'en'].some((w) => n.includes(` ${w} `))) { best = f; len = k.length; }
    }
  }
  return best;
}
// Als welche Rezept-Zutat ein Vorrats-Eintrag zählt (fn: selbst gewählt, '' = keine)
function vorratFood(x) {
  if (x.fn !== undefined) return x.fn || null;
  if (state.snacks && state.snacks[x.id]) return null; // Snacks (z. B. ein Schokoriegel) sind keine Kochzutat, außer selbst so eingestellt
  return (matchFood(x.n) || {}).name || null;
}
function pantryList() {
  return trackerPantry().map((x) => ({ ...x, food: vorratFood(x) }));
}
// Wie viel von einer Zutat da ist: g = bekannte Gramm, open = es gibt sie auch ohne Mengenangabe
function stockOf(foodName) {
  let g = 0;
  let open = false;
  for (const x of trackerPantry()) {
    if (vorratFood(x) !== foodName) continue;
    const have = V.grams(x);
    if (have == null) open = open || x.qty == null || x.qty > 0; else g += have; // Menge ohne Grammangabe: da, aber wie viel unklar
  }
  return { g, open };
}
function changePantry(fn) {
  const t = readTracker();
  t.pantry = Array.isArray(t.pantry) ? t.pantry : [];
  const out = fn(t.pantry, t);
  writeTracker(t);
  return out;
}

// Zieht die Zutaten (Textzeilen) vom Vorrat im Tracker-Objekt t ab. Gibt { used, text } zurück; text für die Meldung.
function takeIngredients(t, lines) {
  t.pantry = Array.isArray(t.pantry) ? t.pantry : [];
  const used = [];
  const names = [];
  for (const line of lines) {
    const p = parseIngredient(line);
    if (p.amount === null) continue;
    const food = findFood(p.name.replace(/[()]/g, ' '));
    const g = gramsOfText(line);
    if (!food || !g) continue;
    const r = V.take(t.pantry, (x) => vorratFood(x) === food.name, g);
    if (r.used.length) { used.push(...r.used); names.push(food.name); }
  }
  return { used, text: names.length ? `Aus dem Vorrat abgezogen: ${names.join(', ')}.` : '' };
}

// Diät und Allergene eines vorgemerkten Produkts, soweit der Tracker sie kennt (Open Food Facts bzw. BLS)
function pantryInfo(x) {
  const t = readTracker();
  const o = String(x.id).startsWith('off:') ? (t.offCache || {})[x.id.slice(4)] : null;
  const own = (t.custom || []).find((c) => c.id === x.id);
  const src = o || own || {};
  return { d: src.d != null ? src.d : null, a: src.d != null ? src.a || [] : null };
}

// Vorgemerkte Produkte, die als Snack markiert sind, werden wie Rezepte vorgeschlagen (eine Packungsportion)
function productRecipe(x) {
  const g = x.serving || 40;
  const f = g / 100;
  const n = { ...emptyNutrients(), kcal: (x.k || 0) * f, protein: (x.p || 0) * f, kh: (x.c || 0) * f, zucker: (x.su || 0) * f, fett: (x.f || 0) * f, ballast: (x.fi || 0) * f };
  // Ohne Angabe zählt der ganze Zucker als frei (Obergrenze)
  n.zugesetzt = x.fs != null ? x.fs * f : n.zucker;
  const info = pantryInfo(x);
  // Unbekannt = vegan: Du hast es selbst als Snack markiert
  const diet = info.d === 0 ? 'fleisch' : info.d === 1 ? 'vegetarisch' : 'vegan';
  const allergens = Object.keys(ALLERGEN_CODES).filter((a) => (info.a || []).some((c) => ALLERGEN_CODES[a].includes(c)));
  const key = tasteKey(vorratFood(x));
  return {
    id: `p-${x.id}`, product: true, code: x.id,
    name: x.n, brand: x.brand,
    meals: ['snack'], time: 0,
    kcal: Math.round(n.kcal / 10) * 10,
    diet, allergens,
    foods: key ? [key] : [],
    ingredients: [`1 ${x.n}`], steps: [],
    serving: g, servingGuess: !x.serving, addedGuess: x.fs == null,
    nutrients: n, tint: '#EFE3D3'
  };
}

// Aufgebrauchte Snacks (Menge 0) schlägt Ginger nicht mehr vor
function productSnacks() {
  return trackerPantry().filter((x) => state.snacks && state.snacks[x.id] && x.k && x.qty !== 0).map(productRecipe);
}

// Wie ein Lebensmittel in der Geschmacksliste heißt (kurze Namen wie „Ei“ würden sonst in „Reis“ gefunden)
const TASTE_KEY = { Ei: 'Eier', Champignons: 'Pilze', Magerquark: 'Quark', Kidneybohnen: 'Bohnen', Öl: null, Gewürze: null };
function tasteKey(foodName) {
  if (!foodName) return null;
  if (foodName in TASTE_KEY) return TASTE_KEY[foodName];
  return foodName.length >= 4 ? foodName : null;
}

// Lebensmittel aus dem Vorrat (nicht aufgebraucht), als Schlüssel wie in der Geschmacksliste
function pantryKeys() {
  return [...new Set(pantryList().filter((p) => p.qty !== 0).map((p) => tasteKey(p.food)).filter(Boolean))];
}

function pantryScore(recipe) {
  const text = textOf(recipe);
  return pantryKeys().filter((k) => text.includes(k.toLowerCase())).length;
}

// Eine lose Zutat (aus nutrition.js) in den Vorrat legen. unit: g, ml oder stk. Nährwerte pro 100 g aus dem BLS.
function vorratEntry(food) {
  const n = nutrientsFor(food, 100);
  const r1 = (x) => Math.round(x * 10) / 10;
  return {
    src: NOT_FROM_BLS.includes(food.name) ? 'custom' : 'bls', id: 'rb:' + food.name, n: food.name, brand: '', serving: food.piece || null,
    liq: false, k: Math.round(n.kcal), p: r1(n.protein), c: r1(n.kh), f: r1(n.fett), fi: r1(n.ballast), su: r1(n.zucker), fs: r1(n.zugesetzt),
    fn: food.name,
    mi: microsOf(food) ? { ...microsOf(food) } : undefined
  };
}
function addToVorrat(food, amount, unit) {
  const ug = unit === 'stk' ? food.piece || null : 1;
  if (!ug || !(amount > 0)) return false;
  changePantry((pantry) => {
    let x = pantry.find((y) => y.id === 'rb:' + food.name);
    if (!x) { x = Object.assign(vorratEntry(food), { added: Date.now(), count: 0, qty: 0, qu: unit, ug }); pantry.unshift(x); }
    if (x.qty == null || !x.ug) Object.assign(x, { qty: 0, qu: unit, ug });
    x.qty = Math.round((x.qty + (amount * ug) / x.ug) * 100) / 100;
    if (unit === 'ml') x.liq = true;
    x.count = (x.count || 0) + 1;
  });
  return true;
}

// ---------- Gruppen und Nährwerte im Vorrat ----------
const VR_GROUPS = [
  ['fleisch', 'Fleisch & Fleischersatz'], ['fisch', 'Fisch'], ['milch', 'Milch, Käse & Eier'], ['gemuese', 'Gemüse'], ['obst', 'Obst'],
  ['huelsen', 'Hülsenfrüchte'], ['getreide', 'Brot, Nudeln & Getreide'], ['nuesse', 'Nüsse & Samen'], ['suess', 'Süßes & Snacks'],
  ['getraenke', 'Getränke'], ['wuerzen', 'Öle, Saucen & Gewürze'], ['sonst', 'Sonstiges']
];
// Zutaten aus nutrition.js → Gruppe
const FOOD_GROUP = {
  fleisch: ['Hähnchen', 'Hackfleisch', 'Rindfleisch', 'Schinken', 'Speck', 'Tofu'],
  fisch: ['Lachs', 'Thunfisch', 'Garnelen'],
  milch: ['Milch', 'Haferdrink', 'Joghurt', 'Magerquark', 'Frischkäse', 'Feta', 'Käse', 'Mozzarella', 'Parmesan', 'Sahne', 'Schmand', 'Butter', 'Ei'],
  huelsen: ['Linsen', 'Kichererbsen', 'Kidneybohnen', 'Hummus'],
  getreide: ['Nudeln', 'Gekochter Reis', 'Reis', 'Haferflocken', 'Brot', 'Toast', 'Tortilla', 'Couscous', 'Quinoa', 'Mehl'],
  obst: ['Avocado', 'Banane', 'Apfel', 'Beeren', 'Zitrone'],
  nuesse: ['Nüsse', 'Erdnussbutter', 'Chiasamen', 'Leinsamen'],
  suess: ['Zucker', 'Honig', 'Ahornsirup', 'Schokolade'],
  wuerzen: ['Öl', 'Kokosmilch light', 'Kokosmilch', 'Pesto', 'Mayonnaise', 'Salsa', 'Gemüsebrühe', 'Sojasauce', 'Gewürze', 'Tomatenmark']
};
function foodGroup(name) {
  if (!name) return null;
  for (const [g, list] of Object.entries(FOOD_GROUP)) if (list.includes(name)) return g;
  const f = FOODS.find((x) => x.name === name);
  return f && f.group === 'gemuese' ? 'gemuese' : name === 'Kartoffeln' || name === 'Süßkartoffel' ? 'gemuese' : null;
}
// Kategorien von Open Food Facts → Gruppe (Reihenfolge zählt: Spezielles vor Allgemeinem)
const OFF_GROUP = [
  ['fleisch', /meat-analogue|meat-alternative|meat-substitute|tofu|meats|sausage|ham|poultr|salami|chicken|beef|pork/],
  ['fisch', /fishes|fish|seafood|tuna|salmon/],
  ['milch', /dairies|cheese|milk|yogurt|yoghurt|eggs|butter|cream|quark/],
  ['suess', /snack|chocolate|confectioner|biscuit|cookie|cake|sweet|candies|candy|chips|crisps|dessert|ice-cream|spread|bar/],
  ['getraenke', /beverage|drink|juice|water|soda|coffee|tea/],
  ['huelsen', /legume|pulse|bean|lentil|chickpea/],
  ['nuesse', /nuts|seeds/],
  ['getreide', /bread|cereal|pasta|rice|flour|grain|breakfast|noodle/],
  ['obst', /fruit/],
  ['gemuese', /vegetable|potato|mushroom|tomato/],
  ['wuerzen', /sauce|condiment|oil|fat|spice|vinegar|broth|soup|seasoning|ketchup|mustard|mayonnaise/]
];
// BLS-Code: erster Buchstabe = Hauptgruppe des Bundeslebensmittelschlüssels
function blsGroup(code) {
  const c = String(code || '');
  if (/^H7/.test(c)) return 'huelsen';
  if (/^H86/.test(c)) return 'fleisch';
  if (/^E1/.test(c)) return 'milch';
  return { B: 'getreide', C: 'getreide', E: 'getreide', D: 'suess', F: 'obst', G: 'gemuese', H: 'nuesse', K: 'gemuese', M: 'milch', N: 'getraenke', P: 'getraenke', Q: 'wuerzen', R: 'wuerzen', S: 'suess', T: 'fisch', U: 'fleisch', V: 'fleisch', W: 'fleisch' }[c[0]] || null;
}
// Die Daten hinter einem Vorrats-Eintrag: Werte pro 100 g, woher sie stammen, was fehlt
function vorratSource(x) {
  const t = readTracker();
  const id = String(x.id);
  if (id.startsWith('off:')) {
    const o = (t.offCache || {})[id.slice(4)];
    return { v: o || x, src: `Open Food Facts, Barcode ${id.slice(4)}`, miss: (o && o.miss) || [], cat: (o && o.cat) || null, off: true, old: !o || !o.cat };
  }
  if (id.startsWith('custom:')) {
    const o = (t.custom || []).find((c) => c.id === id) || x;
    const src = o.ns === 'foto' ? 'Vom Foto der Nährwerttabelle gelesen und von dir geprüft'
      : o.ns === 'off-edit' ? 'Open Food Facts, von dir korrigiert' : o.src === 'recipe' ? 'Rezept im Tracker' : 'Von dir eingetragen';
    return { v: o, src, miss: o.miss || [], grp: o.grp };
  }
  if (id.startsWith('bls:')) return { v: x, src: 'Bundeslebensmittelschlüssel (BLS) 4.0, Max Rubner-Institut', miss: [], grp: blsGroup(id.slice(4)) };
  if (id.startsWith('rb:')) {
    const name = id.slice(3);
    return { v: x, src: NOT_FROM_BLS.includes(name) ? 'Rezeptbuch-Zutat ohne BLS-Eintrag (Wert aus dem Rezeptbuch)' : 'Bundeslebensmittelschlüssel (BLS) 4.0, Max Rubner-Institut', miss: [] };
  }
  return { v: x, src: 'Tracker', miss: [] };
}
function vorratGroup(x) {
  if (x.grp) return x.grp; // selbst gewählt
  const s = vorratSource(x);
  if (s.grp) return s.grp;
  if (s.cat && s.cat.length) {
    const tags = s.cat.map((c) => c.slice(3)).reverse().join(' '); // spezifischste Kategorie zuerst
    for (const [g, re] of OFF_GROUP) if (re.test(tags)) return g;
  }
  return foodGroup(x.fn || (matchFood(x.n) || {}).name) || 'sonst';
}
const r1n = (x) => (x > 0 && x < 1 ? Math.round(x * 100) / 100 : Math.round(x * 10) / 10).toLocaleString('de-DE');
function vorratDetail(x) {
  const s = vorratSource(x);
  const v = s.v || {};
  const rows = [['k', 'Energie', 'kcal'], ['f', 'Fett', 'g'], ['sf', 'davon gesättigte Fettsäuren', 'g', true], ['c', 'Kohlenhydrate', 'g'], ['su', 'davon Zucker', 'g'],
    ['fs', 'davon freier Zucker', 'g', true], ['fi', 'Ballaststoffe', 'g'], ['p', 'Eiweiß', 'g'], ['sa', 'Salz', 'g', true]];
  const sv = x.serving || v.serving;
  const unit = x.liq || v.liq ? 'ml' : 'g';
  const val = (k, opt) => (s.miss.includes(k) || (opt && v[k] == null) ? null : v[k] || 0);
  const cell = (k, opt, f, u) => { const a = val(k, opt); return a == null ? '<span class="muted">keine Angabe</span>' : `${k === 'k' ? fmt(a * f) : r1n(a * f)} ${u}`; };
  return `<div class="vr-detail">
    <table class="nutri-table"><thead><tr><th></th><th>pro 100 ${unit}</th>${sv ? `<th>pro Portion (${fmt(sv)} ${unit})</th>` : ''}</tr></thead>
      <tbody>${rows.map(([k, label, u, opt]) => `<tr><td>${label}</td><td>${cell(k, opt, 1, u)}</td>${sv ? `<td>${cell(k, opt, sv / 100, u)}</td>` : ''}</tr>`).join('')}</tbody></table>
    <div class="small muted">Quelle: ${esc(s.src)}.${s.miss.length ? ' „keine Angabe“ heißt: Die Quelle nennt den Wert nicht, ich rechne dafür mit 0. Im Scanner kannst du das Produkt unter „Bearbeiten“ mit einem Foto der Nährwerttabelle ergänzen.' : ''}</div>
    ${s.off ? `<button class="chip" style="align-self:flex-start" data-action="vr-refresh" data-id="${esc(x.id)}">Bei Open Food Facts neu laden</button>` : ''}
  </div>`;
}

// Produkt neu bei Open Food Facts holen (z. B. wenn dort inzwischen mehr Werte stehen oder für die Gruppe)
async function refreshOff(id) {
  const code = String(id).slice(4);
  const fields = 'product_name,product_name_de,brands,nutriments,serving_quantity,product_quantity,quantity,categories_tags';
  const n = (x) => (x == null || x === '' || Number.isNaN(Number(x)) ? null : Number(x));
  let data;
  try { data = await (await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json?fields=${fields}`)).json(); }
  catch (e) { return 'offline'; }
  const p = data && data.product;
  const nm = p && p.nutriments;
  if (!p || data.status !== 1 || !nm) return 'missing';
  let k = n(nm['energy-kcal_100g']);
  if (k == null && n(nm['energy_100g']) != null) k = n(nm['energy_100g']) / 4.184;
  if (k == null) return 'missing';
  const keys = [['p', 'proteins_100g'], ['c', 'carbohydrates_100g'], ['f', 'fat_100g'], ['fi', 'fiber_100g'], ['su', 'sugars_100g']];
  const upd = { k, sf: n(nm['saturated-fat_100g']), sa: n(nm.salt_100g), fs: n(nm['added-sugars_100g']), miss: keys.filter(([, f]) => n(nm[f]) == null).map(([key]) => key), cat: (p.categories_tags || []).filter((x) => x.startsWith('en:')).slice(-12) };
  for (const [key, f] of keys) upd[key] = n(nm[f]) || 0;
  if (n(p.serving_quantity)) upd.serving = n(p.serving_quantity);
  if (n(p.product_quantity)) upd.pq = n(p.product_quantity);
  changePantry((pantry, t) => {
    t.offCache = t.offCache || {};
    t.offCache[code] = Object.assign({ src: 'off', id: 'off:' + code, barcode: code, n: p.product_name_de || p.product_name || ('Produkt ' + code), brand: (p.brands || '').split(',')[0].trim() }, t.offCache[code] || {}, upd);
    const x = pantry.find((y) => y.id === id);
    if (x) { for (const key of ['k', 'p', 'c', 'f', 'fi', 'su', 'fs', 'serving']) if (upd[key] != null) x[key] = upd[key]; if (upd.pq) { x.pq = upd.pq; if (x.qu === 'pkg' && !x.ug) x.ug = upd.pq; } }
  });
  return 'ok';
}

// Packungsgröße zum Eintrag: aus Open Food Facts bzw. selbst eingetragen
function packText(p) {
  const u = p.liq ? 'ml' : 'g';
  const pq = p.qu === 'pkg' && p.ug ? p.ug : p.pq;
  if (pq) return `Packung ${fmt(pq)} ${u}`;
  return p.qu === 'pkg' ? 'Packungsgröße unbekannt' : '';
}
// kcal und Makro-Balken wie im Tracker: Anteil von Eiweiß, Kohlenhydraten und Fett an der Energie
function vorratMacros(p) {
  const e = (p.p || 0) * 4 + (p.c || 0) * 4 + (p.f || 0) * 9 || 1;
  const w = (x) => (x / e).toFixed(3);
  const kcal = `<span>${fmt(p.k)} kcal/100 ${p.liq ? 'ml' : 'g'}</span>`;
  if (p.p == null && p.c == null && p.f == null) return `<span class="vr-macro">${kcal}</span>`;
  return `<span class="vr-macro">${kcal}<span class="mini-bar" aria-hidden="true"><i style="flex:${w((p.p || 0) * 4)};background:var(--mp)"></i><i style="flex:${w((p.c || 0) * 4)};background:var(--mc)"></i><i style="flex:${w((p.f || 0) * 9)};background:var(--mf)"></i></span><span class="m-p">E ${r1n(p.p || 0)}</span><span class="m-c">KH ${r1n(p.c || 0)}</span><span class="m-f">F ${r1n(p.f || 0)} g</span></span>`;
}
// „Gegessen“: Menge wählen, in den Tracker eintragen, aus dem Vorrat nehmen
function vorratEat(p) {
  const g = ui.vrEatG;
  const stock = V.grams(p);
  const meals = [['fruehstueck', 'Frühstück'], ['mittag', 'Mittag'], ['abend', 'Abend'], ['snack', 'Snack']];
  return `<div class="snack-eat vr-eat">
    <div class="stepper" role="group" aria-label="Menge">
      <button class="round" data-action="vr-eat-g" data-d="-${ui.vrEatStep}" aria-label="Weniger" ${g - ui.vrEatStep <= 0 ? 'disabled' : ''}>−</button>
      <span><b>${fmt(g)} ${p.liq ? 'ml' : 'g'}</b> · ${fmt((g * p.k) / 100)} kcal</span>
      <button class="round" data-action="vr-eat-g" data-d="${ui.vrEatStep}" aria-label="Mehr">+</button>
    </div>
    <div class="vr-meals" role="group" aria-label="Mahlzeit">${meals.map(([v, l]) => `<button class="chip" data-action="vr-eat-meal" data-meal="${v}" aria-pressed="${ui.vrEatMeal === v}">${l}</button>`).join('')}</div>
    ${stock == null ? '<div class="small muted">Die Packungsgröße fehlt, deshalb kann ich nichts vom Vorrat abziehen. Trag sie unter „Ändern“ ein.</div>'
      : g > stock ? `<div class="small" style="color:var(--accent-text)">So viel hast du nicht im Vorrat (${fmt(stock)} g).</div>` : ''}
    <button class="btn small-btn" data-action="vr-eat" data-id="${esc(p.id)}">Eintragen</button>
  </div>`;
}

// „Weggeworfen“: schlecht gewordenes aus dem Vorrat nehmen, ohne Tracker-Eintrag. Menge in der Einheit des Eintrags.
function vorratToss(p) {
  const n = Math.min(ui.vrTossQ, p.qty);
  const st = V.step(p);
  const lbl = V.label({ ...p, qty: n });
  return `<div class="snack-eat vr-eat">
    <div class="small muted">Wie viel ist schlecht geworden? Das kommt aus dem Vorrat, aber nicht in den Tracker.</div>
    <div class="stepper" role="group" aria-label="Menge wegwerfen">
      <button class="round" data-action="vr-toss-q" data-d="-${st}" aria-label="Weniger" ${n - st <= 0 ? 'disabled' : ''}>−</button>
      <span><b>${esc(lbl)}</b>${n >= p.qty ? ' · alles' : ''}</span>
      <button class="round" data-action="vr-toss-q" data-d="${st}" aria-label="Mehr" ${n >= p.qty ? 'disabled' : ''}>+</button>
    </div>
    <div class="input-row"><button class="btn small-btn" data-action="vr-toss" data-id="${esc(p.id)}">Wegwerfen</button><button class="btn secondary small-btn" data-action="vr-toss-open" data-id="${esc(p.id)}">Abbrechen</button></div>
  </div>`;
}

function vorratItem(p) {
  const key = tasteKey(p.food);
  const taste = state.profile.taste;
  const editing = ui.vorratEdit === p.id;
  const unitOpts = [['g', 'g'], ['ml', 'ml'], ...((p.food && (FOODS.find((f) => f.name === p.food) || {}).piece) || p.qu === 'stk' ? [['stk', 'Stück']] : []), ['pkg', 'Packungen']];
  const edit = editing ? `<div class="vr-edit">
      <div class="input-row">
        <label class="vr-field"><span class="small muted">Menge</span><input id="vr-qty" type="text" inputmode="decimal" value="${p.qty != null ? String(p.qty).replace('.', ',') : ''}" placeholder="z. B. 2"></label>
        <label class="vr-field"><span class="small muted">Einheit</span><select id="vr-qu">${unitOpts.map(([v, l]) => `<option value="${v}" ${(p.qu || 'pkg') === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
      </div>
      <label class="vr-field"><span class="small muted">Packungsgröße in g bzw. ml (nur bei Packungen)</span><input id="vr-pq" type="text" inputmode="decimal" value="${p.qu === 'pkg' && p.ug ? p.ug : p.pq || ''}" placeholder="steht auf der Packung"></label>
      <label class="vr-field"><span class="small muted">Gruppe</span><select id="vr-grp">${VR_GROUPS.map(([v, l]) => `<option value="${v}" ${vorratGroup(p) === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
      <label class="vr-field"><span class="small muted">Zählt bei Rezepten als</span><select id="vr-fn"><option value="">nichts davon</option>${FOODS.filter((f) => f.name !== 'Gewürze').map((f) => `<option ${p.food === f.name ? 'selected' : ''}>${esc(f.name)}</option>`).join('')}</select></label>
      <div class="input-row"><button class="btn small-btn" data-action="vr-save" data-id="${esc(p.id)}">Speichern</button><button class="btn secondary small-btn" data-action="vr-edit" data-id="">Abbrechen</button></div>
      <button class="link-btn" data-action="vr-remove" data-id="${esc(p.id)}">Aus dem Vorrat entfernen</button>
    </div>` : '';
  const amount = p.qty == null
    ? `<button class="chip" data-action="vr-edit" data-id="${esc(p.id)}">Menge eintragen</button>`
    : `<div class="stepper" role="group" aria-label="Menge">
        <button class="round" data-action="vr-step" data-id="${esc(p.id)}" data-d="-1" aria-label="Weniger" ${p.qty <= 0 ? 'disabled' : ''}>−</button>
        <span class="vr-qty">${esc(V.label(p))}</span>
        <button class="round" data-action="vr-step" data-id="${esc(p.id)}" data-d="1" aria-label="Mehr">+</button>
      </div>`;
  // Zu: eine Zeile mit Name, Menge und Makro-Balken. Antippen öffnet Menge, Gegessen, Snack, Herz, Ändern und Nährwerte.
  const open = ui.vorratOpen === p.id;
  const marks = `${state.snacks[p.id] ? '<span class="badge snack-tag">Snack</span>' : ''}${key && taste[key] === 'like' ? `<span class="fav-mark" title="Magst du besonders">${ICONS.heart}</span>` : ''}`;
  return `<div class="card vr-item${p.qty === 0 ? ' empty' : ''}${open ? ' open' : ''}" id="vr-${esc(p.id)}">
    <button class="vr-line" data-action="vr-open" data-id="${esc(p.id)}" aria-expanded="${open}">
      <span class="vr-l1"><span class="title">${esc(p.n)}</span>${marks}<span class="vr-amount">${esc(p.qty == null ? 'Menge offen' : V.label(p).replace(/ \(.*\)$/, ''))}</span><span class="vr-chev" aria-hidden="true">${open ? '▴' : '▾'}</span></span>
      <span class="meta">${[p.brand, p.food && p.food !== p.n ? `zählt als ${p.food}` : '', packText(p)].filter(Boolean).map(esc).join(' · ')}</span>
      ${p.k ? vorratMacros(p) : ''}
      ${(() => { const mi = p.mi || blsMicros(p.id) || {}; return deficits().filter((id) => mi[id] != null).map((id) => { const m = MICROS.find((x) => x.id === id); return `<span class="small micro-line">${m.name} ${g1(mi[id])} ${m.unit}/100 g · ${Math.round((mi[id] / dgeRef(id)) * 100)} % vom Tageswert</span>`; }).join(''); })()}
    </button>
    ${open ? `<div class="vr-row">${amount}${p.qty > 0 ? `<button class="chip" data-action="vr-eat-open" data-id="${esc(p.id)}" aria-expanded="${ui.vrEat === p.id}" ${p.k ? '' : 'disabled title="Ohne Kalorienangabe kann ich es nicht eintragen"'}>Gegessen</button><button class="chip" data-action="vr-toss-open" data-id="${esc(p.id)}" aria-expanded="${ui.vrToss === p.id}">Weggeworfen</button>` : ''}</div>
    ${ui.vrEat === p.id ? vorratEat(p) : ''}
    ${ui.vrToss === p.id ? vorratToss(p) : ''}
    <div class="vr-row">
      <button class="chip snack-chip" data-action="pantry-snack" data-code="${esc(p.id)}" aria-pressed="${!!state.snacks[p.id]}" ${p.k ? '' : 'disabled title="Ohne Kalorienangabe kann ich es nicht vorschlagen"'}>Als Snack</button>
      ${key ? `<button class="round like" data-action="taste" data-food="${esc(key)}" data-value="like" aria-pressed="${taste[key] === 'like'}" aria-label="${esc(key)} mag ich sehr">${ICONS.heart}</button>` : ''}
      <button class="link-btn" data-action="vr-nutri" aria-expanded="${!!ui.vrNutri}" style="margin-left:auto">${ui.vrNutri ? 'Nährwerte zu' : 'Nährwerte'}</button>
      ${!editing ? `<button class="link-btn" data-action="vr-edit" data-id="${esc(p.id)}">Ändern</button>` : ''}
    </div>
    ${edit}
    ${ui.vrNutri ? vorratDetail(p) : ''}` : ''}
  </div>`;
}

function viewEinkauf() {
  const items = pantryList();
  const have = items.filter((p) => p.qty !== 0);
  const empty = items.filter((p) => p.qty === 0);
  const groups = VR_GROUPS.map(([g, label]) => [g, label, have.filter((p) => vorratGroup(p) === g).sort((a, b) => a.n.localeCompare(b.n, 'de'))]).filter((x) => x[2].length);
  // Suche: Name, Marke, „zählt als“ und Gruppe; Vorhandenes zuerst, Aufgebrauchtes danach
  const q = (ui.vrQuery || '').trim().toLowerCase();
  const groupName = Object.fromEntries(VR_GROUPS);
  const found = q ? [...have, ...empty].filter((p) => [p.n, p.brand, p.food, groupName[vorratGroup(p)]].some((v) => v && String(v).toLowerCase().includes(q))) : [];
  return `<main class="screen with-nav">
    <div class="ginger-says">${ginger(70)}<div class="bubble">Deine Vorratskammer. Scann deinen Einkauf, dann zähle ich mit. Was du kochst oder isst, ziehe ich wieder ab.</div></div>
    <a class="btn" href="tracker/?zurueck=einkauf#einkauf">Einkauf scannen</a>
    <div class="input-row"><a class="btn secondary small-btn" href="#/liste" style="flex:1">Einkaufsliste</a><a class="btn secondary small-btn" href="#/kochen" style="flex:1">Daraus kochen</a></div>
    ${ui.vrAddOpen || ui.vrError ? `<section class="card vr-add">
      <h3>Ohne Barcode dazulegen</h3>
      <div class="small muted">Für Obst, Gemüse und Lose: z. B. 6 Stück Eier oder 500 g Kartoffeln.</div>
      <input type="text" list="vr-foods" placeholder="Zutat, z. B. Kartoffeln" data-input="vrName" value="${esc(ui.vrName || '')}" aria-label="Zutat">
      <datalist id="vr-foods">${FOODS.filter((f) => f.name !== 'Gewürze').map((f) => `<option value="${esc(f.name)}">`).join('')}</datalist>
      <div class="input-row">
        <input type="text" inputmode="decimal" placeholder="Menge" data-input="vrAmount" value="${esc(ui.vrAmount || '')}" aria-label="Menge" style="flex:1">
        <select data-input="vrUnit" aria-label="Einheit" style="flex:1">${[['g', 'g'], ['ml', 'ml'], ['stk', 'Stück']].map(([v, l]) => `<option value="${v}" ${(ui.vrUnit || 'g') === v ? 'selected' : ''}>${l}</option>`).join('')}</select>
        <button class="btn small-btn" data-action="vr-add">Dazu</button>
      </div>
      ${ui.vrError ? `<div class="small" style="color:var(--accent-text)">${esc(ui.vrError)}</div>` : ''}
      <button class="link-btn" data-action="vr-add-toggle">Schließen</button>
    </section>` : '<button class="link-btn" data-action="vr-add-toggle">+ Ohne Barcode dazulegen (Obst, Gemüse, Loses)</button>'}
    ${infoHead('h2', `Im Vorrat ${have.length ? `<span class="small muted">${have.length} Lebensmittel</span>` : ''}`, 'vorrat')}
    ${items.length ? `<div class="search-field"><label class="sr-only" for="vq">Im Vorrat suchen</label><input id="vq" type="search" data-input="vrQuery" placeholder="Im Vorrat suchen, z. B. Salami" value="${esc(ui.vrQuery || '')}" autocomplete="off"></div>` : ''}
    ${q ? `<div class="small muted">${found.length ? `${found.length} Treffer für „${esc(ui.vrQuery.trim())}“` : `Nichts im Vorrat passt zu „${esc(ui.vrQuery.trim())}“.`}</div>${found.map(vorratItem).join('')}` : `
    ${have.length ? `<nav class="vr-tabs" aria-label="Kategorien">${groups.map(([g, label, list]) => `<button class="chip" data-action="vr-jump" data-g="${g}">${label} <span class="vr-n">${list.length}</span></button>`).join('')}${empty.length ? '<button class="chip" data-action="vr-jump" data-g="leer">Aufgebraucht</button>' : ''}</nav>` : ''}
    ${have.length ? groups.map(([g, label, list]) => `<h3 class="vr-group" id="vr-g-${g}">${label} <span class="small muted">${list.length}</span></h3>${list.map(vorratItem).join('')}`).join('') : '<div class="card small muted">Noch nichts im Vorrat.</div>'}
    ${empty.length ? `<h2 id="vr-g-leer" class="vr-group">Aufgebraucht</h2>${empty.map(vorratItem).join('')}` : ''}`}
  </main>${nav('einkauf')}`;
}

// ---------- Kochen mit dem Vorrat ----------
// Gerichte aus Gingers und eigenen Rezepten, sortiert danach, wie viel schon im Vorrat ist und wie gut kcal und Makros
// zu dem passen, was heute laut Tracker noch frei ist. Nährwerte kommen aus den Rezepten (BLS), nichts geschätzt.

// Heute schon gegessen (Tracker-Journal) und was vom Tagesziel noch frei ist
function dayLeft() {
  const t = nutrientTargets();
  const eaten = { kcal: 0, protein: 0, kh: 0, fett: 0 };
  for (const e of (readTracker().days || {})[todayKey()] || []) {
    const f = (e.grams || 0) / 100;
    eaten.kcal += (e.k || 0) * f;
    eaten.protein += (e.p || 0) * f;
    eaten.kh += (e.c || 0) * f;
    eaten.fett += (e.f || 0) * f;
  }
  const rest = (goal, x) => (goal ? goal - x : null);
  return { eaten, kcal: kcalGoal() - eaten.kcal, protein: rest(t.protein, eaten.protein), kh: rest(t.kh, eaten.kh), fett: rest(t.fett, eaten.fett) };
}

// kcal für dieses Gericht: was heute frei ist, minus die Rahmen der Mahlzeiten, die danach noch kommen
function cookTarget(meal, left) {
  const log = journal();
  const order = dayMeals().map((m) => m.id);
  let later = 0;
  for (const m of order.slice(order.indexOf(meal) + 1)) {
    if (m === 'snack') later += mealBudget('snack') * Math.max(0, SNACKS_PER_DAY - log.filter((e) => e.meal === 'snack').length);
    else if (!log.some((e) => e.meal === m)) later += mealBudget(m);
  }
  return Math.max(0, left.kcal - later);
}

// Was vom Rezept (n Rezeptportionen) im Vorrat ist und was fehlt. Gewürze, Öl, Brühe und „etwas …“ zählen nicht.
function cookCheck(r, n) {
  const need = new Map();
  for (const line of scaledIngredients(r, n)) {
    const p = parseIngredient(line);
    if (p.amount === null) continue;
    const food = findFood(p.name.replace(/[()]/g, ' '));
    if (food && STAPLES.includes(food.name)) continue;
    const key = food ? food.name : p.name.toLowerCase();
    const x = need.get(key) || { food, g: 0, lines: [] };
    x.g += gramsOfText(line);
    x.lines.push(line);
    need.set(key, x);
  }
  const have = [];
  const missing = [];
  for (const x of need.values()) {
    const st = x.food ? stockOf(x.food.name) : { g: 0, open: false };
    if (st.open || (x.g && st.g >= x.g * 0.98)) { have.push(x.food.name); continue; }
    const share = x.g && st.g > 0 ? (x.g - st.g) / x.g : 1;
    const text = x.lines.length === 1 ? scaleIngredient(x.lines[0], share) : `${fmt(x.g * share)} g ${x.food ? x.food.name : x.lines[0]}`;
    missing.push({ text, part: share < 1, food: x.food ? x.food.name : null });
  }
  return { have, missing, total: need.size };
}

// Abweichung der Makros vom Rest des Tages, als Anteil der kcal (0 = passt genau). null ohne Makroziele im Tracker.
function macroGap(n, f, left) {
  if (left.protein == null || left.fett == null || left.kh == null || left.kcal <= 0) return null;
  const k = n.kcal * f;
  if (!k) return null;
  const share = Math.min(1, k / left.kcal);
  let dev = 0;
  for (const [id, kcalPerG] of [['protein', 4], ['kh', 4], ['fett', 9]]) {
    const ideal = Math.max(0, left[id]) * share;
    let d = n[id] * f - ideal;
    if (id === 'protein' && goalDir() !== 'gain' && d > 0) d = 0; // mehr Eiweiß ist kein Problem
    dev += (Math.abs(d) * kcalPerG) / k;
  }
  return dev;
}

function cookIdeas(meal) {
  const left = dayLeft();
  const target = cookTarget(meal, left);
  const persons = state.profile.portions || 1;
  const cookedToday = new Set(journal().map((e) => e.recipeId).filter(Boolean));
  const list = allRecipes()
    .filter((r) => !r.product && r.meals.includes(meal) && suitable(r))
    .map((r) => {
      const n = recipeNutrients(r);
      const f = target > 0 && r.kcal ? Math.min(FIT_MAX, Math.max(FIT_MIN, Math.round((target / r.kcal) * 10) / 10)) : 1;
      const c = cookCheck(r, persons * f);
      const gap = macroGap(n, f, left);
      let score = -c.missing.filter((m) => !m.part).length * 3 - c.missing.filter((m) => m.part).length * 2;
      score += c.total ? (c.have.length / c.total) * 2 : 0;
      if (target > 0) score -= (Math.abs(r.kcal * f - target) / target) * 4;
      if (gap != null) score -= gap * 6;
      score += likeScore(r) + (isFav(r) ? 2 : 0) - rejectPenalty(r) - (cookedToday.has(r.id) ? 5 : 0) + microBonus(r);
      return { r, n, f, c, gap, score };
    })
    .sort((a, b) => b.score - a.score);
  return { left, target, all: list.filter((x) => !x.c.missing.length), few: list.filter((x) => x.c.missing.length && x.c.missing.length <= 2) };
}

// Einschätzung, wie gut die Makros zum Rest passen (aus der Abweichung oben)
function gapLabel(gap) {
  if (gap == null) return '';
  return gap < 0.25 ? 'Makros passen gut zu deinem Rest' : gap < 0.5 ? 'Makros passen ganz gut' : 'Makros passen weniger gut';
}

function viewKochen() {
  const meals = dayMeals();
  const meal = meals.some((m) => m.id === ui.cookMeal) ? ui.cookMeal : (meals.find((m) => m.id === currentMeal()) || meals[0]).id;
  const { left, target, all, few } = cookIdeas(meal);
  const pantryEmpty = !trackerPantry().some((x) => x.qty !== 0);
  const more = !!ui.cookMore;
  const after = (x) => {
    const k = Math.max(0, left.kcal - x.n.kcal * x.f);
    const parts = [`${fmt(k)} kcal`];
    if (left.protein != null) parts.push(`${fmt(Math.max(0, left.protein - x.n.protein * x.f))} g Eiweiß`);
    if (left.kh != null) parts.push(`${fmt(Math.max(0, left.kh - x.n.kh * x.f))} g KH`);
    if (left.fett != null) parts.push(`${fmt(Math.max(0, left.fett - x.n.fett * x.f))} g Fett`);
    return parts.join(' · ');
  };
  const card = (x) => {
    const onList = state.listExtra && state.listExtra[x.r.id];
    return `<div class="have-hit cook-hit">${recipeCard(x.r, { meal, factor: x.f })}
      <div class="small muted">${x.gap != null ? `${esc(gapLabel(x.gap))} · ` : ''}danach noch frei: ${esc(after(x))}</div>
      ${x.c.missing.length ? `<div class="small cook-missing">Fehlt: ${esc(x.c.missing.map((m) => (m.part ? 'noch ' : '') + m.text).join(', '))}</div>
        <div class="idea-actions"><span></span><button class="link-btn" data-action="cook-list" data-recipe="${x.r.id}" data-f="${x.f}">${onList ? 'Steht auf der Einkaufsliste ✓ (wieder runter)' : 'Fehlendes auf die Einkaufsliste'}</button></div>` : ''}
    </div>`;
  };
  const free = [`<b>${fmt(Math.max(0, left.kcal))} kcal</b>`];
  if (left.protein != null) free.push(`${fmt(Math.max(0, left.protein))} g Eiweiß`, `${fmt(Math.max(0, left.kh))} g KH`, `${fmt(Math.max(0, left.fett))} g Fett`);
  return `<main class="screen with-nav">
    <a class="back" href="#/heute">${ICONS.back}Heute</a>
    <h1>Kochen mit dem, was da ist</h1>
    <div class="chips">${meals.map((m) => `<button class="chip" data-action="cook-meal" data-id="${m.id}" aria-pressed="${m.id === meal}">${m.name}</button>`).join('')}</div>
    <div class="card snack-budget">
      <div class="small muted">Heute noch frei laut Tracker</div>
      <div>${free.join(' · ')}</div>
      <div class="small muted">Für ${esc(mealName(meal))} rechne ich mit ca. ${fmt(Math.round(target / 10) * 10)} kcal, damit noch Platz für die restlichen Mahlzeiten bleibt.${hasKcalGoal() ? '' : ' Ohne Kalorienziel im Tracker rechne ich mit 2.000 kcal.'}${left.protein == null ? ' Ohne Makroziele im Tracker zählen nur die Kalorien.' : ''}</div>
    </div>
    ${pantryEmpty ? '<div class="card small muted">Im Vorrat ist noch nichts. Scann deinen Einkauf oder leg Zutaten in der Vorratskammer dazu, dann finde ich Gerichte dazu.</div><a class="btn secondary" href="#/einkauf">Zur Vorratskammer</a>' : ''}
    ${target < 150 ? '<div class="hint">' + ICONS.paw + '<span>Heute ist kaum noch Platz. Die Gerichte unten sind dann schon auf die kleinste Menge (0,6×) gerechnet.</span></div>' : ''}
    <h2>Alles da</h2>
    ${all.length ? all.slice(0, more ? 20 : 5).map(card).join('') : '<div class="card small muted">Für alles reicht der Vorrat gerade bei keinem Rezept.</div>'}
    <h2>Fehlt nur wenig</h2>
    ${few.length ? few.slice(0, more ? 20 : 5).map(card).join('') : '<div class="card small muted">Kein Rezept, bei dem nur 1 oder 2 Zutaten fehlen.</div>'}
    ${all.length > 5 || few.length > 5 ? `<button class="link-btn" data-action="cook-more">${more ? 'Weniger zeigen' : 'Mehr Gerichte zeigen'}</button>` : ''}
    <p class="small muted">Gewürze, Öl und Brühe zähle ich nicht mit, schau kurz selbst nach. Die Menge (z. B. 1,2×) ist so gewählt, dass das Gericht zu deinen restlichen Kalorien passt. Nährwerte aus dem Bundeslebensmittelschlüssel.</p>
  </main>${nav('heute')}`;
}

// ---------- Snack: Was darf ich jetzt? ----------
// Rahmen = die Snack-Kalorien des Tages (wie im Plan: bei 2 Mahlzeiten 2 × 15 %, sonst 10 %), minus schon gegessene
// Snacks, minus was die Hauptmahlzeiten bisher über ihrem Rahmen lagen (darunter = mehr Platz). Gesund oder nicht zählt nicht.
function snackAllowance() {
  const log = journal();
  const mains = mainMeals().map((m) => m.id);
  const total = mealBudget('snack') * (state.profile.mealCount === 2 ? SNACKS_PER_DAY : 1);
  const eaten = log.filter((e) => !mains.includes(e.meal)).reduce((s, e) => s + e.kcal, 0);
  let over = 0;
  for (const m of mains) {
    const k = log.filter((e) => e.meal === m).reduce((s, e) => s + e.kcal, 0);
    if (k > 0) over += k - mealBudget(m);
  }
  return { total, eaten, over, left: Math.max(0, total - eaten - over) };
}

// Wie viel von einem Produkt passt in left kcal? Begrenzt durch das, was im Vorrat ist.
// Eine übliche Portion: zuerst die Packungsportion des Herstellers (Open Food Facts bzw. selbst eingetragen),
// sonst die Standardportion für Erwachsene nach SINU, LARN – V Revisione 2024 „Porzioni standard“ (dieselbe Quelle wie im Tracker).
// Ohne beides gibt es keine Portion; dann schlage ich keine Menge vor.
const LARN = 'Standardportion SINU/LARN 2024';
// Nie mehr als eine Packung vorschlagen, auch wenn mehrere da sind
function snackPortion(x) {
  const por = portionOf(x);
  const pack = x.qu === 'pkg' && x.ug ? x.ug : x.pq;
  return por && pack && pack < por.g ? { g: pack, src: `1 Packung (${fmt(pack)} ${x.liq ? 'ml' : 'g'}), kleiner als eine übliche Portion` } : por;
}
function portionOf(x) {
  const id = String(x.id);
  const grp = groupPortion(x);
  // Packungsportion nur, wenn sie nicht größer ist als eine übliche Snack-Portion (manche Einträge nennen die ganze Packung)
  if (x.serving && !id.startsWith('rb:') && (!grp || x.serving <= grp.g)) return { g: x.serving, src: id.startsWith('off:') ? 'Packungsportion laut Open Food Facts' : 'deine Portionsangabe' };
  return grp;
}
// Übliche Menge als Snack. Grundlage: Standardportionen SINU/LARN 2024. Was dort eine Mahlzeit-Portion ist
// (Wurst, Fleisch, Fisch, Käse, Hülsenfrüchte), zählt als Snack nur zur Hälfte.
function groupPortion(x) {
  const n = x.n || '';
  const P = (g, what) => ({ g, src: `${LARN} (${what})` });
  const H = (g, what) => ({ g: g / 2, src: `halbe ${LARN} (${what}, ${g} g)` });
  switch (vorratGroup(x)) {
    case 'obst': return /getrocknet|Trocken|Rosine|Dattel/i.test(n) ? P(30, 'Trockenobst') : P(150, '1 Stück Obst');
    case 'gemuese': return /salat|rucola/i.test(n) ? P(80, 'Blattsalat') : /kartoffel/i.test(n) ? null : P(200, 'Gemüse, z. B. 2 Tomaten');
    case 'nuesse': return /mus|butter|creme/i.test(n) ? null : P(30, 'Nüsse/Samen');
    case 'huelsen': return /hummus/i.test(n) ? null : /reif|getrocknet|trocken/i.test(n) ? null : H(150, 'Hülsenfrüchte gegart');
    case 'getreide':
      if (/brot|brötchen|toast|tortilla|wrap/i.test(n)) return P(50, '1 Scheibe Brot');
      if (/flocken|müsli|cerealien|flakes/i.test(n)) return P(30, 'Frühstückscerealien');
      return null; // Mehl, Nudeln, Reis sind kein Snack
    case 'milch':
      if (/joghurt|kefir|skyr/i.test(n)) return P(125, '1 Becher Joghurt');
      if (/milch|drink/i.test(n) && !/käse/i.test(n)) return P(125, '1 kleines Glas Milch');
      if (/\bei(er)?\b/i.test(n)) return P(50, '1 Ei');
      if (/butter|sahne|rahm/i.test(n)) return null;
      return (x.f || 0) > 25 ? H(50, 'gereifter Käse') : H(100, 'Frischkäse/Quark/Mozzarella');
    case 'fleisch':
      if (/tofu|tempeh|seitan/i.test(n)) return null;
      return /salami|schinken|wurst|aufschnitt|mortadella|chorizo|speck|bacon|pastrami|bresaola|lyoner|cabanossi|kabanos|landjäger/i.test(n) ? H(50, 'Wurst/Aufschnitt') : H(100, 'Fleisch');
    case 'fisch': return /dose|konserve|thunfisch|sardine/i.test(n) ? H(50, 'Fischkonserve') : H(150, 'Fisch');
    default: return null;
  }
}

// Wie viel davon jetzt? Höchstens eine übliche Portion, höchstens was im Vorrat ist, höchstens was in den Snack-Rahmen passt.
function snackAmount(x, left) {
  const por = snackPortion(x);
  const stock = V.grams(x);
  const room = left / (x.k / 100);
  // Restliche kcal ausnutzen: so viel, wie in den Rahmen passt, aber nie mehr als eine Packung und als da ist.
  const pack = x.qu === 'pkg' && x.ug ? x.ug : x.pq;
  // Ohne bekannte Packungsgröße (lose Ware, unbekannte Packung) bleibt es bei einer Portion
  const fillCap = pack ? Math.min(room, pack, stock != null ? stock : Infinity) : 0;
  const fill = Math.floor(fillCap / 5) * 5;
  const fillWhy = fill <= 0 ? '' : stock != null && stock <= Math.min(room, pack || Infinity) ? 'stock' : pack && pack <= room ? 'pack' : 'room';
  if (!por) return { g: 0, step: 10, none: true, stock, fill, fillWhy };
  let g = Math.min(por.g, room);
  let why = g < por.g ? 'room' : 'portion';
  if (stock != null && stock < g) { g = stock; why = 'stock'; }
  g = g >= por.g ? por.g : Math.floor(g / 5) * 5;
  const share = g / por.g;
  const text = share >= 0.99 ? `1 Portion (${fmt(g)} g)` : share >= 0.45 && share <= 0.55 ? `½ Portion (${fmt(g)} g)` : `${fmt(g)} g`;
  return { g, step: por.g >= 50 ? 10 : 5, text, why, por, stock, fill, fillWhy };
}

function viewSnacks() {
  const a = snackAllowance();
  const left = a.left;
  const pantry = trackerPantry().filter((x) => x.k > 0 && x.qty !== 0);
  const marked = pantry.filter((x) => state.snacks[x.id]);
  const others = pantry.filter((x) => !state.snacks[x.id] && !String(x.id).startsWith('rb:'));
  const productRow = (x) => {
    const m = snackAmount(x, left);
    const ok = m.g >= 5;
    const pick = ui.snackPick === x.id;
    const g = pick ? ui.snackG : m.g;
    return `<div class="card snack-opt">
      <div class="snack-top">
        <div class="info"><div class="title">${esc(x.n)}</div>
          <div class="meta">${m.none ? `100 g haben ${fmt(x.k)} kcal · keine Portionsangabe, wähl die Menge selbst` : ok ? `<b>${esc(m.text)}</b> · ca. ${fmt((m.g * x.k) / 100)} kcal` : `heute nicht mehr drin · 1 Portion (${fmt(m.por.g)} g) hat ${fmt((m.por.g * x.k) / 100)} kcal`}</div>
          <div class="meta">${[x.brand, x.qty != null ? `im Vorrat: ${V.label(x)}` : '', ok && m.why === 'stock' ? 'mehr hast du nicht da' : '', ok && m.why === 'room' ? 'mehr passt heute nicht' : ''].filter(Boolean).map(esc).join(' · ')}</div>
          ${m.fill >= 5 && m.fill > m.g + 2 ? `<div class="meta snack-fill">Restliche ${fmt(left)} kcal ausnutzen: <b>${fmt(m.fill)} g</b> · ca. ${fmt((m.fill * x.k) / 100)} kcal${m.fillWhy === 'pack' ? ' (1 Packung, mehr nicht)' : m.fillWhy === 'stock' ? ' (alles, was da ist)' : ''} <button class="link-btn" data-action="snack-pick" data-id="${esc(x.id)}" data-g="${m.fill}">So viel</button></div>` : ''}
          ${m.por ? `<div class="meta small muted">1 Portion: ${esc(m.por.src)}</div>` : ''}
        </div>
        <button class="chip" data-action="snack-pick" data-id="${esc(x.id)}" data-g="${ok ? m.g : m.por ? Math.min(m.por.g, m.stock != null ? Math.max(5, Math.floor(m.stock)) : m.por.g) : 10}" aria-expanded="${pick}">Essen</button>
      </div>
      ${pick ? `<div class="snack-eat">
        <div class="stepper" role="group" aria-label="Menge">
          <button class="round" data-action="snack-g" data-d="-${m.step}" aria-label="Weniger" ${g - m.step <= 0 ? 'disabled' : ''}>−</button>
          <span><b>${fmt(g)} g</b> · ${fmt((g * x.k) / 100)} kcal</span>
          <button class="round" data-action="snack-g" data-d="${m.step}" aria-label="Mehr">+</button>
        </div>
        ${g * x.k / 100 > left + 1 ? `<div class="small" style="color:var(--accent-text)">Das sind ${fmt((g * x.k) / 100 - left)} kcal über deinem Snack-Rahmen.</div>` : ''}
        ${m.por && g > m.por.g && g > m.fill ? `<div class="small" style="color:var(--accent-text)">Mehr als eine übliche Portion (${fmt(m.por.g)} g).</div>` : ''}
        ${m.stock != null && g > m.stock ? `<div class="small" style="color:var(--accent-text)">So viel hast du nicht im Vorrat (${fmt(m.stock)} g).</div>` : ''}
        <button class="btn small-btn" data-action="snack-eat" data-id="${esc(x.id)}">Eintragen</button>
      </div>` : ''}
    </div>`;
  };
  // Vorgesehene Snacks: aus dem Wochenplan und Gingers Snack-Rezepte
  const planned = plannedRecipe(todayKey(), 'snack');
  let recipes = ideasFor('snack').map((x) => x.recipe).filter((r) => !r.product);
  if (planned && !planned.product) recipes = [planned, ...recipes.filter((r) => r.id !== planned.id)];
  const moreRecipes = recipes.length > 4;
  recipes = recipes.slice(0, ui.snackMore ? 30 : 4);
  const recipeRow = (r) => {
    const f = Math.floor((left / r.kcal) * 10) / 10;
    const fit = Math.min(FIT_MAX, Math.max(FIT_MIN, f));
    const p = Math.min(f, 1); // höchstens eine Rezeptportion
    const text = f >= 0.3 ? `${p >= 1 ? '1 Portion' : `${fmtFactor(p)} Portion`} · ca. ${fmt(r.kcal * p)} kcal` : `heute nicht mehr drin · 1 Portion hat ${fmt(r.kcal)} kcal`;
    return `<a class="recipe-card" href="#/rezept/${r.id}/snack${f >= 0.3 && f < 1 && fit !== 1 ? '/' + fit : ''}">
      <div class="thumb" style="background:${r.tint}">${gingerPeek(44)}</div>
      <div class="info"><div class="title">${esc(r.name)}${planned && planned.id === r.id ? ' <span class="small muted">(im Plan)</span>' : ''}</div><div class="meta">${esc(text)}</div></div>
    </a>`;
  };
  return `<main class="screen with-nav">
    <a class="back" href="#/heute">${ICONS.back}Heute</a>
    <h1>Snack: Was darf ich jetzt?</h1>
    <div class="card snack-budget">
      <div class="journal-kcal">${fmt(left)} <small>kcal frei für Snacks</small></div>
      <div class="small muted">Snack-Rahmen heute ${fmt(a.total)} kcal${a.eaten ? ` · schon gesnackt ${fmt(a.eaten)} kcal` : ''}${Math.abs(a.over) >= 10 ? ` · Mahlzeiten bisher ${fmt(Math.abs(a.over))} kcal ${a.over > 0 ? 'über' : 'unter'} Plan` : ''}${hasKcalGoal() ? '' : ' · ohne Kalorienziel im Tracker rechne ich mit 2.000 kcal'}</div>
    </div>
    ${infoHead('h2', 'Aus deinem Vorrat', 'snack')}
    ${marked.length ? marked.map(productRow).join('') : `<div class="card small muted">${others.length ? 'Noch nichts als Snack markiert. Unten kannst du trotzdem alles aus dem Vorrat ansehen, oder du markierst in der Vorratskammer, was als Snack gilt.' : 'Im Vorrat ist gerade nichts, was als Snack passt.'}</div>`}
    ${others.length ? `<button class="link-btn" data-action="snack-more-products" aria-expanded="${!!ui.snackOthers}">${ui.snackOthers ? 'Andere Produkte ausblenden' : `${marked.length ? 'Weitere' : 'Alle'} ${others.length} Produkte aus dem Vorrat zeigen`}</button>
      ${ui.snackOthers ? others.map(productRow).join('') : ''}` : ''}
    <h2>Vorgesehen</h2>
    ${recipes.length ? recipes.map(recipeRow).join('') : '<div class="card small muted">Gerade kein passendes Snack-Rezept.</div>'}
    ${moreRecipes ? `<button class="link-btn" data-action="snack-more">${ui.snackMore ? 'Weniger Rezepte' : 'Mehr Snack-Rezepte'}</button>` : ''}
  </main>${nav('heute')}`;
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
  trackerCache = null; // der Tracker kann sich in der Zwischenzeit geändert haben
  const [page, a, b] = route();
  let html;
  if (page === 'start') html = a === '3' ? viewStart3(false) : a === '2' ? viewStart2(false) : viewStart1(false);
  else if (page === 'edit') html = a === '3' ? viewStart3(true) : a === '2' ? viewStart2(true) : viewStart1(true);
  else if (page === 'rezepte') html = viewRezepte();
  else if (page === 'rezept') html = viewRezept(a, b, route()[3]);
  else if (page === 'stempel') html = viewStempel();
  else if (page === 'ich') html = viewIch();
  else if (page === 'neu') html = viewNeu(a);
  else if (page === 'einkauf') html = viewEinkauf();
  else if (page === 'woche') html = viewWoche();
  else if (page === 'liste') html = viewListe();
  else if (page === 'quellen') html = viewQuellen();
  else if (page === 'snacks') html = viewSnacks();
  else if (page === 'kochen') html = viewKochen();
  else html = viewHeute();
  const sub = { rezepte: 'rezepte', woche: 'woche', liste: 'woche', einkauf: 'einkauf', stempel: 'stempel' }[page];
  if (sub) html = html.replace('<main class="screen with-nav">', `<main class="screen with-nav">${subnav(sub)}`);
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

window.addEventListener('hashchange', (e) => {
  // Woher kam man? Damit „Zurück“ auf der Rezeptseite dorthin führt
  const old = (e.oldURL || '').split('#')[1] || '';
  if (!old.startsWith('/rezept/')) ui.prevPage = old ? '#' + old : '';
  if (ui.justStamped) { state.cooking[ui.justStamped] = []; save(); }
  ui.justStamped = null;
  ui.justEntry = null;
  ui.justVorrat = '';
  ui.vorratEdit = null;
  ui.vorratOpen = null;
  ui.vrError = '';
  ui.snackPick = null;
  ui.confirmReset = false;
  ui.confirmDelete = false;
  ui.rejecting = null;
  ui.swapFrom = null;
  ui.planning = null;
  ui.formError = '';
  if (!location.hash.startsWith('#/neu')) ui.form = null;
  render();
  window.scrollTo(0, 0);
});

// ---------- Aktionen ----------

const actions = {
  portions(el) {
    const n = Math.max(1, Math.min(12, Number(el.dataset.n)));
    if (el.dataset.recipe) ui.portions[el.dataset.recipe] = n;
    else state.profile.portions = n;
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
  'meal-count'(el) { state.profile.mealCount = Number(el.dataset.n); },
  'skip-meal'(el) { state.profile.skip = el.dataset.id; },
  time(el) { state.profile.times[el.dataset.meal] = Number(el.dataset.min); },
  'finish-start'() { state.onboarded = true; save(); go('#/heute'); return 'skip'; },
  'go-ich'() { save(); go('#/ich'); return 'skip'; },
  'ask-reject'(el) { ui.rejecting = el.dataset.recipe; },
  'cancel-reject'() { ui.rejecting = null; },
  'reject-recipe'(el) {
    state.rejected[el.dataset.recipe] = true;
    ui.rejecting = null;
    if (location.hash.startsWith('#/rezept/')) { save(); go('#/heute'); toast('Okay, das schlage ich dir nicht mehr vor.'); return 'skip'; }
    toast('Okay, das schlage ich dir nicht mehr vor.');
  },
  'reject-food'(el) {
    state.profile.taste[el.dataset.food] = 'no';
    ui.rejecting = null;
    if (location.hash.startsWith('#/rezept/')) { save(); go('#/heute'); toast(`Gemerkt: kein ${el.dataset.food} mehr.`); return 'skip'; }
    toast(`Gemerkt: kein ${el.dataset.food} mehr.`);
  },
  'unreject'(el) { delete state.rejected[el.dataset.recipe]; },
  'week-ok'(el) { const s = state.week.slots[el.dataset.slot]; s.ok = !s.ok; },
  'week-all'() { const w = state.week; for (const d of weekDays()) for (const m of w.meals) { const s = w.slots[`${d}|${m}`]; if (s) s.ok = true; } },
  'week-none'() { for (const s of Object.values(state.week.slots)) s.ok = false; },
  'week-new'() {
    ui.cell = null;
    const w = state.week;
    w.seed = (w.seed || 0) + 1;
    for (const [k, s] of Object.entries(w.slots)) if (!s.ok) delete w.slots[k];
    ui.otherSeen = {};
  },
  'week-other'(el) {
    const k = el.dataset.slot;
    const w = state.week;
    const [day, meal] = k.split('|');
    const used = {};
    for (const [key, s] of Object.entries(w.slots)) if (key !== k) used[s.id] = (used[s.id] || 0) + 1;
    const seen = ui.otherSeen[k] || (ui.otherSeen[k] = [w.slots[k].id]);
    const list = weekCandidates(meal, day, used);
    let next = list.find((r) => !seen.includes(r.id));
    if (!next) { ui.otherSeen[k] = [w.slots[k].id]; next = list.find((r) => r.id !== w.slots[k].id); }
    if (!next) { toast('Mehr passende Rezepte habe ich gerade nicht.'); return 'skip'; }
    ui.otherSeen[k].push(next.id);
    w.slots[k] = { id: next.id, ok: false };
  },
  'week-swap'(el) { ui.swapFrom = el.dataset.slot && ui.swapFrom !== el.dataset.slot ? el.dataset.slot : null; },
  cell(el) {
    const k = el.dataset.slot;
    if (ui.swapFrom) {
      if (canSwap(ui.swapFrom, k)) {
        const w = state.week;
        [w.slots[ui.swapFrom], w.slots[k]] = [w.slots[k], w.slots[ui.swapFrom]];
        ui.cell = k;
      }
      ui.swapFrom = null;
      return;
    }
    ui.cell = ui.cell === k ? null : k;
  },
  'week-meal'(el) {
    const w = state.week;
    const m = el.dataset.meal;
    if (w.meals.includes(m)) { if (w.meals.length > 1) w.meals = w.meals.filter((x) => x !== m); }
    else w.meals = MEAL_ORDER.filter((x) => x === m || w.meals.includes(x));
  },
  'week-fit'() { state.week.fit = state.week.fit === false; },
  'week-portions'(el) { state.week.portions = Math.max(1, Math.min(12, Number(el.dataset.n))); },
  'slot-portions'(el) { state.week.slots[el.dataset.slot].n = Math.max(1, Math.min(12, Number(el.dataset.n))); },
  'list-check'(el) {
    const b = state.week.bought;
    if (b[el.dataset.key]) delete b[el.dataset.key]; else b[el.dataset.key] = true;
  },
  'list-copy'() {
    const { items, staples } = shoppingList();
    const text = items.filter((x) => !state.week.bought[x.key] && x.stock !== 'full').map((x) => `- ${x.text}`).join('\n')
      + (staples.length ? `\n\nVorrat prüfen: ${staples.join(', ')}` : '');
    const done = () => toast('Liste kopiert.');
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, () => toast('Kopieren hat nicht geklappt.'));
    else toast('Kopieren geht in diesem Browser nicht.');
    return 'skip';
  },
  fav(el) {
    const id = el.dataset.recipe;
    if (state.favorites[id]) delete state.favorites[id]; else state.favorites[id] = true;
  },
  'plan-open'(el) { ui.planning = el.dataset.recipe && ui.planning !== el.dataset.recipe ? el.dataset.recipe : null; },
  'plan-at'(el) {
    const w = ensureWeek();
    const { recipe: id, day, meal } = el.dataset;
    const k = `${day}|${meal}`;
    if (w.slots[k] && w.slots[k].id === id && w.slots[k].ok && w.meals.includes(meal)) {
      w.slots[k].ok = false;
      toast('Wieder ausgeplant.');
      return;
    }
    w.slots[k] = { id, ok: true };
    if (!w.meals.includes(meal)) w.meals = MEAL_ORDER.filter((x) => x === meal || w.meals.includes(x));
    toast(`Eingeplant: ${dayName(day)}, ${mealName(meal)}`);
  },
  'have-add'() {
    const t = ui.haveDraft.trim();
    if (t && !ui.have.some((x) => x.toLowerCase() === t.toLowerCase())) ui.have.push(t);
    ui.haveDraft = '';
  },
  'have-chip'(el) { if (!ui.have.includes(el.dataset.food)) ui.have.push(el.dataset.food); },
  'have-remove'(el) { ui.have = ui.have.filter((x) => x !== el.dataset.food); },
  info(el) { ui.info[el.dataset.key] = !ui.info[el.dataset.key]; },
  'next-idea'(el) { const m = el.dataset.meal; state.pick[m] = (state.pick[m] || 0) + (m === 'snack' ? SNACKS_PER_DAY : 1); },
  filter(el) { ui.recipeFilter = el.dataset.id; },
  cooked(el) {
    const r = allRecipes().find((x) => x.id === el.dataset.recipe);
    const meal = el.dataset.meal || currentMeal();
    const f = Number(el.dataset.factor) || 1;
    const t = readTracker();
    const vr = takeIngredients(t, scaledIngredients(r, portionsOf(r) * f)); // gekochte Portionen aus dem Vorrat
    const entryId = addToTracker(r, meal, f, vr.used.length ? { vu: vr.used } : null);
    if (!entryId && vr.used.length) writeTracker(t);
    if (state.listExtra) delete state.listExtra[r.id]; // gekocht, muss nicht mehr eingekauft werden
    ui.justVorrat = vr.text;
    if (entryId) state.cookedEntries[entryId] = r.id;
    ui.justEntry = entryId;
    const before = stampCount();
    state.stamps[r.id] = (state.stamps[r.id] || 0) + 1;
    state.xp += XP_PER_RECIPE;
    ui.justStamped = r.id;
    save();
    if (before < STAMPS_FOR_HAT && stampCount() >= STAMPS_FOR_HAT) toast('Ginger hat ihre Kochmütze bekommen!');
  },
  'eat-product'(el) {
    const r = recipeById(el.dataset.recipe);
    if (!r) return;
    const ok = addProductToTracker(r.code, el.dataset.meal || 'snack', r.serving);
    go('#/heute');
    toast(ok ? `${r.name} ist im Tracker eingetragen.` : 'Das ging nicht, das Produkt ist im Tracker nicht mehr vorgemerkt.');
    return 'skip';
  },
  'pantry-snack'(el) {
    const id = el.dataset.code;
    if (state.snacks[id]) delete state.snacks[id]; else state.snacks[id] = true;
    if (!state.snacks[id] && location.hash.startsWith('#/rezept/')) { save(); go('#/heute'); toast('Okay, kommt nicht mehr als Snack.'); return 'skip'; }
  },
  'undo-eaten'(el) {
    // Eintrag aus dem Tracker-Journal nehmen; hat er einen Stempel gebracht, Stempel und XP wieder abziehen
    const entry = el.dataset.entry;
    if (entry) removeFromTracker(entry);
    const recipeId = (entry && state.cookedEntries[entry]) || (!entry && ui.justStamped === el.dataset.recipe ? el.dataset.recipe : null);
    if (entry) delete state.cookedEntries[entry];
    if (recipeId && state.stamps[recipeId]) {
      state.stamps[recipeId] -= 1;
      if (!state.stamps[recipeId]) delete state.stamps[recipeId];
      state.xp = Math.max(0, state.xp - XP_PER_RECIPE);
    }
    if (ui.justStamped && (ui.justStamped === recipeId || ui.justStamped === el.dataset.recipe)) { ui.justStamped = null; ui.justEntry = null; }
  },
  'ask-reset'() { ui.confirmReset = true; },
  // ---------- Vorratskammer ----------
  'vr-add'() {
    const food = findFood(ui.vrName || '');
    const amount = Number(String(ui.vrAmount || '').replace(',', '.'));
    const unit = ui.vrUnit || 'g';
    if (!food || food.name === 'Gewürze') { ui.vrError = (ui.vrName || '').trim() ? `„${ui.vrName}“ kenne ich nicht. Produkte mit Barcode bitte scannen.` : 'Welche Zutat?'; return; }
    if (!(amount > 0)) { ui.vrError = 'Wie viel? Bitte eine Menge eintragen.'; return; }
    if (unit === 'stk' && !food.piece) { ui.vrError = `${food.name} zähle ich in g oder ml, nicht in Stück.`; return; }
    addToVorrat(food, amount, unit);
    ui.vrName = ''; ui.vrAmount = ''; ui.vrError = '';
    toast(`${food.name} liegt im Vorrat.`);
    return 'skip';
  },
  'vr-nutri'() { ui.vrNutri = !ui.vrNutri; },
  'vr-add-toggle'() { ui.vrAddOpen = !ui.vrAddOpen; ui.vrError = ''; },
  'vr-edit'(el) { ui.vorratEdit = el.dataset.id || null; },
  'vr-jump'(el) {
    const h = document.getElementById(`vr-g-${el.dataset.g}`);
    if (h) h.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return 'skip';
  },
  'vr-eat-open'(el) {
    const id = el.dataset.id;
    if (ui.vrEat === id) { ui.vrEat = null; return; }
    const x = trackerPantry().find((y) => y.id === id);
    if (!x) return;
    // Vorschlag: eine Portion (Packungsportion oder übliche Portion), sonst 100 g; nie mehr als da ist
    const por = snackPortion(x);
    const stock = V.grams(x);
    let g = por ? por.g : x.serving || 100;
    if (stock != null && stock < g) g = Math.max(1, Math.round(stock));
    ui.vrEat = id; ui.vrToss = null; ui.vrEatG = g; ui.vrEatStep = g >= 100 ? 25 : g >= 30 ? 10 : 5; ui.vrEatMeal = currentMeal();
  },
  'vr-eat-g'(el) { ui.vrEatG = Math.max(ui.vrEatStep, ui.vrEatG + Number(el.dataset.d)); },
  'vr-eat-meal'(el) { ui.vrEatMeal = el.dataset.meal; },
  'vr-eat'(el) {
    const x = trackerPantry().find((y) => y.id === el.dataset.id);
    if (!x || !(ui.vrEatG > 0)) return;
    const id = addProductToTracker(x.id, ui.vrEatMeal || currentMeal(), Math.round(ui.vrEatG));
    ui.vrEat = null;
    toast(id ? `${fmt(ui.vrEatG)} ${x.liq ? 'ml' : 'g'} ${x.n} eingetragen${V.grams(x) != null ? ' und aus dem Vorrat genommen' : ''}.` : 'Das ging nicht.');
  },
  'vr-toss-open'(el) {
    const id = el.dataset.id;
    if (ui.vrToss === id) { ui.vrToss = null; return; }
    const x = trackerPantry().find((y) => y.id === id);
    if (!x || !(x.qty > 0)) return;
    ui.vrToss = id; ui.vrEat = null; ui.vrTossMax = x.qty;
    ui.vrTossQ = x.qty; // meist ist alles schlecht; mit − weniger
  },
  'vr-toss-q'(el) { ui.vrTossQ = Math.min(ui.vrTossMax, Math.max(0, Math.round((ui.vrTossQ + Number(el.dataset.d)) * 100) / 100)); },
  'vr-toss'(el) {
    const id = el.dataset.id;
    let name = '';
    let lbl = '';
    changePantry((pantry) => {
      const x = pantry.find((y) => y.id === id);
      if (!x || x.qty == null) return;
      const n = Math.min(ui.vrTossQ, x.qty);
      name = x.n; lbl = V.label({ ...x, qty: n });
      x.qty = Math.max(0, Math.round((x.qty - n) * 100) / 100);
    });
    ui.vrToss = null;
    if (name) toast(`${lbl} ${name} weggeworfen und aus dem Vorrat genommen.`);
  },
  'vr-open'(el) { ui.vorratOpen = ui.vorratOpen === el.dataset.id ? null : el.dataset.id; },
  'vr-refresh'(el) {
    const id = el.dataset.id;
    el.disabled = true;
    refreshOff(id).then((r) => toast(r === 'ok' ? 'Neu geladen.' : r === 'offline' ? 'Keine Verbindung zu Open Food Facts.' : 'Open Food Facts hat dazu keine Nährwerte.'));
    return 'skip';
  },
  'vr-step'(el) {
    const d = Number(el.dataset.d);
    changePantry((pantry) => {
      const x = pantry.find((y) => y.id === el.dataset.id);
      if (x && x.qty != null) x.qty = Math.max(0, Math.round((x.qty + d * V.step(x)) * 100) / 100);
    });
  },
  'vr-save'(el) {
    const val = (id) => (document.getElementById(id) || {}).value || '';
    const qty = Number(val('vr-qty').replace(',', '.'));
    const qu = val('vr-qu') || 'pkg';
    const pq = Number(val('vr-pq').replace(',', '.')) || null;
    const fn = val('vr-fn');
    const grp = val('vr-grp');
    if (!(qty >= 0) || val('vr-qty').trim() === '') { toast('Bitte eine Menge eintragen.'); return 'skip'; }
    changePantry((pantry) => {
      const x = pantry.find((y) => y.id === el.dataset.id);
      if (!x) return;
      const piece = (FOODS.find((f) => f.name === (fn || vorratFood(x))) || {}).piece || (x.qu === 'stk' ? x.ug : null);
      x.qty = Math.round(qty * 100) / 100;
      x.qu = qu;
      x.ug = qu === 'pkg' ? pq : qu === 'stk' ? piece || null : 1;
      if (qu === 'pkg' && pq) x.pq = pq;
      if (qu === 'ml') x.liq = true;
      x.fn = fn;
      if (grp && grp !== vorratGroup(Object.assign({}, x, { grp: undefined }))) x.grp = grp; else delete x.grp;
    });
    ui.vorratEdit = null;
  },
  'vr-remove'(el) {
    const id = el.dataset.id;
    changePantry((pantry, t) => { t.pantry = pantry.filter((y) => y.id !== id); });
    delete state.snacks[id];
    ui.vorratEdit = null;
  },
  'list-to-vorrat'() {
    // Abgehakte Zutaten der Einkaufsliste in den Vorrat legen
    const { items } = shoppingList();
    let n = 0;
    for (const x of items) {
      if (!state.week.bought[x.key] || !x.food || x.product || !x.needG) continue;
      const unit = x.unit === 'stueck' && x.food.piece ? 'stk' : x.unit === 'ml' ? 'ml' : 'g';
      const amount = unit === 'stk' ? Math.ceil(x.needG / x.food.piece) : Math.round(x.needG);
      if (addToVorrat(x.food, amount, unit)) { delete state.week.bought[x.key]; n++; }
    }
    toast(n ? `${n} ${n === 1 ? 'Zutat liegt' : 'Zutaten liegen'} jetzt im Vorrat.` : 'Hak erst ab, was du gekauft hast.');
    return 'skip';
  },
  // ---------- Kochen mit dem Vorrat ----------
  'cook-open'(el) { ui.cookMeal = el.dataset.meal; ui.cookMore = false; go('#/kochen'); return 'skip'; },
  'cook-meal'(el) { ui.cookMeal = el.dataset.id; ui.cookMore = false; },
  'cook-more'() { ui.cookMore = !ui.cookMore; },
  'cook-list'(el) {
    const id = el.dataset.recipe;
    state.listExtra = state.listExtra || {};
    if (state.listExtra[id]) { delete state.listExtra[id]; save(); toast('Wieder von der Einkaufsliste genommen.'); return 'skip'; }
    state.listExtra[id] = { n: state.profile.portions || 1, f: Number(el.dataset.f) || 1 };
    save();
    toast('Steht auf der Einkaufsliste, nur was im Vorrat fehlt.');
    return 'skip';
  },
  // ---------- Snacks ----------
  'snack-pick'(el) {
    const g = Number(el.dataset.g) || 0;
    ui.snackPick = ui.snackPick === el.dataset.id && ui.snackG === g ? null : el.dataset.id;
    ui.snackG = g;
  },
  'snack-g'(el) { ui.snackG = Math.max(0, ui.snackG + Number(el.dataset.d)); },
  'snack-more'() { ui.snackMore = !ui.snackMore; },
  'snack-more-products'() { ui.snackOthers = !ui.snackOthers; },
  'snack-eat'(el) {
    const x = trackerPantry().find((y) => y.id === el.dataset.id);
    if (!x || !(ui.snackG > 0)) return;
    const id = addProductToTracker(x.id, 'snack', Math.round(ui.snackG));
    ui.snackPick = null;
    toast(id ? `${fmt(ui.snackG)} g ${x.n} eingetragen und aus dem Vorrat genommen.` : 'Das ging nicht.');
    return 'skip';
  },
  // ---------- Backup ----------
  'backup-export'() {
    save();
    RBBackup.exportAll().then((ok) => { if (ok) toast('Backup exportiert. Leg die Datei an einem sicheren Ort ab.'); });
    return 'skip';
  },
  deficit(el) {
    const d = new Set(state.profile.deficits || []);
    if (d.has(el.dataset.id)) d.delete(el.dataset.id); else d.add(el.dataset.id);
    state.profile.deficits = [...d];
  },
  'tracker-card'(el) {
    const t = readTracker();
    const k = el.dataset.k;
    if (!t[k] && k === 'supp') { toast('Öffne den Tracker einmal, dann kannst du das hier ändern.'); return; }
    const on = !t[k] || t[k].enabled !== false; // fehlt der Eintrag, ist es im Tracker an
    t[k] = Object.assign({}, t[k] || {}, { enabled: !on });
    writeTracker(t);
  },
  'backup-remind'(el) { RBBackup.setMeta({ remind: el.checked }); },
  'tracker-one'(el) {
    const r = recipeById(el.dataset.recipe);
    if (!r) return;
    const f = Number(el.dataset.factor) || 1;
    const t = readTracker();
    const vr = takeIngredients(t, scaledIngredients(r, portionsOf(r) * f));
    const id = addToTracker(r, el.dataset.meal || currentMeal(), f, vr.used.length ? { vu: vr.used } : null);
    if (!id && vr.used.length) writeTracker(t);
    if (id && state.listExtra) delete state.listExtra[r.id];
    toast(id ? `Im Tracker eingetragen. ${vr.text}`.trim() : 'Dazu kenne ich noch keine Nährwerte.');
  },
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
  if (el.dataset.input === 'vrUnit') { ui.vrUnit = el.value; return; }
  if (el.id === 'backup-file') { importBackup(el); return; }
  if (el.dataset.action === 'step') {
    const id = el.dataset.recipe;
    const i = Number(el.dataset.step);
    const set = new Set(state.cooking[id] || []);
    if (el.checked) set.add(i); else set.delete(i);
    state.cooking[id] = [...set];
    save();
    render();
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
  if (['draft', 'haveDraft', 'vrName', 'vrAmount'].includes(key)) ui[key] = e.target.value;
  if (key === 'profileName') { state.profile.name = t.value.slice(0, 30); save(); }
  if (key === 'recipeQuery' || key === 'vrQuery') {
    ui[key] = t.value;
    const pos = t.selectionStart;
    render();
    const n = document.getElementById(key === 'vrQuery' ? 'vq' : 'rq');
    if (n) { n.focus(); try { n.setSelectionRange(pos, pos); } catch (err) { /* type=search */ } }
  }
});

app.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter') return;
  const key = e.target.dataset.input;
  if (key === 'draft') { actions['add-food'](); save(); render(); document.getElementById('eigenes')?.focus(); }
  if (key === 'haveDraft') { actions['have-add'](); render(); document.getElementById('have')?.focus(); }
  if (key === 'vrName' || key === 'vrAmount') { actions['vr-add'](); save(); render(); }
});

function importBackup(input) {
  const file = input.files && input.files[0];
  if (!file) return;
  const rd = new FileReader();
  rd.onload = () => {
    input.value = '';
    let data = null;
    try { data = JSON.parse(rd.result); } catch (e) { /* unten */ }
    const parts = RBBackup.check(data);
    if (!parts) { toast('Das ist keine Backup-Datei.'); return; }
    const what = parts.rezeptbuch && parts.tracker ? 'Rezeptbuch und Tracker' : parts.tracker ? 'Tracker' : 'Rezeptbuch';
    if (!confirm(`Backup einlesen? Die Daten von ${what} auf diesem Handy werden durch die aus der Datei ersetzt.`)) return;
    try { RBBackup.restore(parts); } catch (e) { toast('Einlesen hat nicht geklappt (Speicher voll?).'); return; }
    RBBackup.markNav();
    location.reload();
  };
  rd.readAsText(file);
}
window.addEventListener('rb-backup', () => render());

// Nährwerte aus der BLS-Datei des Trackers laden (dauert es, läuft Ginger), dann die fertigen Rezepte aus den Zutaten berechnen (alle für 1 Portion)
let waiting = false;
const waitTimer = setTimeout(() => { waiting = true; showWait('Ginger holt die Nährwerte …'); }, 400);
const nutritionOk = await loadNutrition();
clearTimeout(waitTimer);
if (waiting) hideWait();
for (const r of RECIPES) {
  r.nutrients = r.ingredients.reduce((sum, line) => addNutrients(sum, nutrientsOfText(line)), emptyNutrients());
  r.kcal = Math.round(r.nutrients.kcal / 10) * 10;
}

migrateToTracker();
// Einmalig: Die Abend-Vorschläge des Trackers (eigene Rezepte dort) aus, Vorschläge gibt es nur noch auf „Heute“
if (!state.oneSuggest && localStorage.getItem(TRACKER_KEY)) {
  const t = readTracker();
  if (!t.sug || t.sug.enabled !== false) { t.sug = Object.assign({}, t.sug || {}, { enabled: false }); writeTracker(t); }
  state.oneSuggest = true;
  save();
}
// Lose Zutaten aus älteren Versionen ohne Makros: Werte aus dem BLS nachtragen (wie beim Dazulegen)
if (trackerPantry().some((x) => String(x.id).startsWith('rb:') && x.p == null)) {
  changePantry((pantry) => {
    for (const x of pantry) {
      const food = String(x.id).startsWith('rb:') && x.p == null && FOODS.find((f) => f.name === x.id.slice(3));
      if (food) { const v = vorratEntry(food); Object.assign(x, { k: v.k, p: v.p, c: v.c, f: v.f, fi: v.fi, su: v.su, fs: v.fs }); }
    }
  });
}
if (trackerPantry().some((x) => x.qty == null)) changePantry((pantry, t) => V.fillDefaults(pantry, t.offCache)); // alte Einträge: 1 Packung
render();
if (!nutritionOk) toast('Die Nährwerte ließen sich nicht laden. Öffne die App einmal mit Internet.');
// Zurück aus dem Tracker (Seite aus dem Zwischenspeicher des Browsers): neu zeichnen
window.addEventListener('pageshow', (e) => { if (e.persisted) render(); });

// Updates: Beim Öffnen und jedes Mal, wenn die App wieder in den Vordergrund kommt, nach einer neuen Version fragen.
// Übernimmt eine neue Version, lädt die Seite einmal neu (nicht beim allerersten Installieren).
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  const hadController = !!navigator.serviceWorker.controller;
  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController || reloading) return;
    reloading = true;
    if (globalThis.RBBackup) RBBackup.markNav(); // Update-Neuladen ist kein Schließen
    location.reload();
  });
  navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then((reg) => {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') reg.update().catch(() => {});
    });
  }).catch(() => {});
}
