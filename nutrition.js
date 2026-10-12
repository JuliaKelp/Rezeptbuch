// Zutaten der Rezepte (pro 100 g bzw. 100 ml, roh/ungekocht wo nicht anders angegeben).
// Die Nährwerte kommen beim Start aus der BLS-Datei des Kalorien-Trackers (tracker/data/bls.json), siehe loadNutrition().
// Quelle: Max Rubner-Institut (2025). Bundeslebensmittelschlüssel (BLS), Version 4.0. Karlsruhe.
// DOI: 10.25826/Data20251217-134202-0. Welche Zutat welcher BLS-Code ist, steht unten in BLS_CODES.
// Ausnahmen ohne BLS-Eintrag: siehe NOT_FROM_BLS.
//
// piece:  Gramm pro Stück (für die Einheit „Stück“)
// el:     Gramm pro Esslöffel (Standard 15)
// diet:   'fleisch' | 'fisch' | 'tierisch' (Milchprodukte, Ei, Honig); fehlt = vegan
// allergens wie in recipes.js
// group:  'gemuese' | 'eiweiss' | 'saettigung' | 'fett' | 'suess' | 'sonst' (für Gingers Tipps)

export const FOODS = [
  // Sättigungsbeilagen
  { name: 'Nudeln', el: 10, allergens: ['gluten'], group: 'saettigung', aliases: ['spaghetti', 'penne', 'pasta', 'fusilli', 'makkaroni', 'vollkornnudeln'] },
  { name: 'Gekochter Reis', el: 20, group: 'saettigung', aliases: ['reis gekocht', 'gekochter reis'] },
  { name: 'Reis', el: 15, group: 'saettigung', aliases: ['basmati', 'jasminreis', 'risottoreis', 'naturreis'] },
  { name: 'Kartoffeln', piece: 100, group: 'saettigung', aliases: ['kartoffel'] },
  { name: 'Süßkartoffel', piece: 300, group: 'saettigung', aliases: ['süßkartoffeln', 'suesskartoffel'] },
  { name: 'Haferflocken', el: 8, allergens: ['gluten'], group: 'saettigung', aliases: ['hafer'] },
  { name: 'Brot', piece: 50, allergens: ['gluten'], group: 'saettigung', aliases: ['vollkornbrot', 'brotscheibe', 'scheibe brot', 'brötchen'] },
  { name: 'Toast', piece: 25, allergens: ['gluten'], group: 'saettigung', aliases: ['toastbrot'] },
  { name: 'Tortilla', piece: 60, allergens: ['gluten'], group: 'saettigung', aliases: ['tortillas', 'wrap', 'wraps', 'fladen'] },
  { name: 'Couscous', el: 12, allergens: ['gluten'], group: 'saettigung', aliases: ['bulgur'] },
  { name: 'Quinoa', el: 12, group: 'saettigung' },
  { name: 'Mehl', el: 10, allergens: ['gluten'], group: 'saettigung', aliases: ['weizenmehl', 'dinkelmehl'] },

  // Hülsenfrüchte und Eiweiß
  { name: 'Linsen', el: 12, group: 'eiweiss', aliases: ['rote linsen', 'berglinsen'] },
  { name: 'Kichererbsen', group: 'eiweiss', aliases: ['kichererbsen dose'] },
  { name: 'Kidneybohnen', group: 'eiweiss', aliases: ['bohnen', 'weiße bohnen', 'schwarze bohnen'] },
  { name: 'Tofu', allergens: ['soja'], group: 'eiweiss', aliases: ['räuchertofu'] },
  { name: 'Ei', piece: 60, diet: 'tierisch', allergens: ['ei'], group: 'eiweiss', aliases: ['eier'] },
  { name: 'Hähnchen', diet: 'fleisch', group: 'eiweiss', aliases: ['hähnchenbrust', 'hühnchen', 'huhn', 'putenbrust', 'pute'] },
  { name: 'Hackfleisch', diet: 'fleisch', group: 'eiweiss', aliases: ['hack', 'rinderhack', 'gemischtes hack'] },
  { name: 'Rindfleisch', diet: 'fleisch', group: 'eiweiss', aliases: ['rind', 'steak'] },
  { name: 'Schinken', diet: 'fleisch', group: 'eiweiss', aliases: ['kochschinken'] },
  { name: 'Speck', diet: 'fleisch', group: 'fett', aliases: ['bacon', 'speckwürfel'] },
  { name: 'Lachs', piece: 125, diet: 'fisch', allergens: ['fisch'], group: 'eiweiss', aliases: ['lachsfilet'] },
  { name: 'Thunfisch', diet: 'fisch', allergens: ['fisch'], group: 'eiweiss', aliases: ['thunfisch dose'] },
  { name: 'Garnelen', diet: 'fisch', group: 'eiweiss', aliases: ['shrimps', 'krabben'] },

  // Milchprodukte
  { name: 'Milch', diet: 'tierisch', allergens: ['laktose'], group: 'eiweiss', aliases: ['milch 1,5%', 'vollmilch'] },
  { name: 'Haferdrink', allergens: ['gluten'], group: 'sonst', aliases: ['hafermilch', 'pflanzendrink', 'sojadrink', 'mandeldrink'] },
  { name: 'Joghurt', diet: 'tierisch', allergens: ['laktose'], group: 'eiweiss', aliases: ['naturjoghurt', 'griechischer joghurt', 'skyr'] },
  { name: 'Magerquark', diet: 'tierisch', allergens: ['laktose'], group: 'eiweiss', aliases: ['quark'] },
  { name: 'Frischkäse', diet: 'tierisch', allergens: ['laktose'], group: 'fett' },
  { name: 'Feta', diet: 'tierisch', allergens: ['laktose'], group: 'fett', aliases: ['schafskäse', 'hirtenkäse'] },
  { name: 'Käse', diet: 'tierisch', allergens: ['laktose'], group: 'fett', aliases: ['gouda', 'emmentaler', 'reibekäse', 'geriebener käse', 'cheddar'] },
  { name: 'Mozzarella', piece: 125, diet: 'tierisch', allergens: ['laktose'], group: 'fett' },
  { name: 'Parmesan', el: 6, diet: 'tierisch', allergens: ['laktose'], group: 'fett', aliases: ['hartkäse'] },
  { name: 'Sahne', diet: 'tierisch', allergens: ['laktose'], group: 'fett', aliases: ['schlagsahne', 'kochsahne'] },
  { name: 'Schmand', diet: 'tierisch', allergens: ['laktose'], group: 'fett', aliases: ['saure sahne', 'crème fraîche', 'creme fraiche'] },
  { name: 'Butter', el: 12, diet: 'tierisch', allergens: ['laktose'], group: 'fett' },

  // Fette, Süßes, Saaten
  { name: 'Öl', el: 10, group: 'fett', aliases: ['olivenöl', 'rapsöl', 'sonnenblumenöl', 'sesamöl'] },
  { name: 'Kokosmilch light', kcal: 75, group: 'fett', aliases: ['kokosmilch fettreduziert'] },
  { name: 'Kokosmilch', group: 'fett' },
  { name: 'Pesto', el: 15, diet: 'tierisch', allergens: ['nuesse', 'laktose'], group: 'fett' },
  { name: 'Mayonnaise', el: 15, diet: 'tierisch', allergens: ['ei'], group: 'fett', aliases: ['mayo'] },
  { name: 'Hummus', el: 15, group: 'eiweiss' },
  { name: 'Nüsse', el: 8, allergens: ['nuesse'], group: 'fett', aliases: ['walnüsse', 'mandeln', 'cashews', 'haselnüsse'] },
  { name: 'Erdnussbutter', el: 15, allergens: ['nuesse'], group: 'fett', aliases: ['erdnussmus'] },
  { name: 'Chiasamen', el: 12, group: 'fett', aliases: ['chia'] },
  { name: 'Leinsamen', el: 10, group: 'fett' },
  { name: 'Zucker', el: 15, group: 'suess', aliases: ['rohrzucker'] },
  { name: 'Honig', el: 20, diet: 'tierisch', group: 'suess' },
  { name: 'Ahornsirup', el: 20, group: 'suess', aliases: ['sirup', 'agavendicksaft'] },
  { name: 'Schokolade', group: 'suess', aliases: ['zartbitterschokolade', 'schoko'] },

  // Gemüse und Obst
  { name: 'Tomaten', piece: 100, group: 'gemuese', aliases: ['tomate', 'kirschtomaten', 'cherrytomaten'] },
  { name: 'Passierte Tomaten', group: 'gemuese', aliases: ['gehackte tomaten', 'tomaten dose', 'dosentomaten'] },
  { name: 'Tomatenmark', el: 15, group: 'gemuese' },
  { name: 'Zwiebel', piece: 80, group: 'gemuese', aliases: ['zwiebeln', 'rote zwiebel', 'frühlingszwiebel', 'lauchzwiebel'] },
  { name: 'Knoblauch', piece: 4, group: 'gemuese', aliases: ['knoblauchzehe', 'zehe'] },
  { name: 'Möhre', piece: 80, group: 'gemuese', aliases: ['möhren', 'karotte', 'karotten'] },
  { name: 'Paprika', piece: 150, group: 'gemuese', aliases: ['paprikaschote'] },
  { name: 'Zucchini', piece: 250, group: 'gemuese' },
  { name: 'Brokkoli', piece: 350, group: 'gemuese', aliases: ['broccoli'] },
  { name: 'Blumenkohl', piece: 600, group: 'gemuese' },
  { name: 'Spinat', group: 'gemuese', aliases: ['blattspinat'] },
  { name: 'Champignons', group: 'gemuese', aliases: ['pilze', 'champignon'] },
  { name: 'Gurke', piece: 400, group: 'gemuese', aliases: ['salatgurke'] },
  { name: 'Salat', group: 'gemuese', aliases: ['eisbergsalat', 'rucola', 'blattsalat'] },
  { name: 'Erbsen', group: 'gemuese', aliases: ['tk-erbsen'] },
  { name: 'Mais', el: 15, group: 'gemuese', aliases: ['maiskörner'] },
  { name: 'Aubergine', piece: 300, group: 'gemuese' },
  { name: 'Kürbis', group: 'gemuese', aliases: ['hokkaido'] },
  { name: 'Avocado', piece: 150, group: 'fett' },
  { name: 'Banane', piece: 120, group: 'suess' },
  { name: 'Apfel', piece: 150, group: 'suess', aliases: ['äpfel'] },
  { name: 'Beeren', group: 'suess', aliases: ['heidelbeeren', 'himbeeren', 'erdbeeren', 'tk-beeren'] },
  { name: 'Zitrone', piece: 100, group: 'sonst', aliases: ['zitronensaft', 'limette'] },

  // Fast ohne Kalorien
  { name: 'Salsa', el: 15, group: 'sonst', aliases: ['tomatensalsa'] },
  { name: 'Gemüsebrühe', group: 'sonst', aliases: ['brühe', 'wasser'] },
  { name: 'Sojasauce', el: 15, allergens: ['soja', 'gluten'], group: 'sonst', aliases: ['sojasoße'] },
  { name: 'Gewürze', kcal: 0, el: 5, group: 'sonst', aliases: ['salz', 'pfeffer', 'curry', 'currypulver', 'paprikapulver', 'zimt', 'oregano', 'kräuter', 'petersilie', 'schnittlauch', 'basilikum', 'senf', 'essig'] }
];

export const UNITS = [
  { id: 'g', name: 'g' },
  { id: 'ml', name: 'ml' },
  { id: 'stueck', name: 'Stück' },
  { id: 'el', name: 'EL' },
  { id: 'tl', name: 'TL' }
];

function norm(s) {
  return String(s).toLowerCase().trim().replace(/\s+/g, ' ');
}

// Findet eine Zutat: exakter Name, Alias, dann Teilwort
export function findFood(name) {
  const n = norm(name);
  if (!n) return null;
  for (const f of FOODS) if (norm(f.name) === n || (f.aliases || []).includes(n)) return f;
  // sonst das längste passende Teilwort, damit „gehackte Tomaten“ nicht bei „Tomaten“ landet
  let best = null;
  let bestLen = 0;
  for (const f of FOODS) {
    for (const k of [f.name, ...(f.aliases || [])].map(norm)) {
      if (k.length >= 3 && (n.includes(k) || (k.includes(n) && n.length >= 4)) && k.length > bestLen) { best = f; bestLen = k.length; }
    }
  }
  return best;
}

// Gramm einer Zeile (ml werden wie g gezählt)
export function gramsOf(row, food) {
  const amount = Number(String(row.amount).replace(',', '.')) || 0;
  switch (row.unit) {
    case 'stueck': return amount * ((food && food.piece) || 100);
    case 'el': return amount * ((food && food.el) || 15);
    case 'tl': return amount * (((food && food.el) || 15) / 3);
    default: return amount;
  }
}

// Kalorien einer Zeile; null, wenn die Zutat unbekannt ist und kein eigener Wert eingetragen wurde
export function kcalOf(row) {
  const food = findFood(row.name);
  const per100 = row.kcal100 !== undefined && row.kcal100 !== '' ? Number(row.kcal100) : food ? food.kcal : null;
  if (per100 === null || Number.isNaN(per100)) return null;
  return (gramsOf(row, food) * per100) / 100;
}

// BLS-Code je Zutat. Mehrere Codes (z. B. bei „Nüsse“ und „Beeren“) = Mittelwert dieser BLS-Einträge.
const BLS_CODES = {
  'Nudeln': 'E401000', // Teigwaren eifrei, roh
  'Gekochter Reis': 'C352032', // Reis poliert, gekocht
  'Reis': 'C352000', // Reis poliert, roh
  'Kartoffeln': 'K110100', // Kartoffel geschält, roh
  'Süßkartoffel': 'K420100', // Batate/Süßkartoffel, roh
  'Haferflocken': 'C133000', // Hafer Flocken
  'Brot': 'B271000', // Roggenmischbrot
  'Toast': 'B314000', // Weizentoastbrot/Buttertoastbrot
  'Tortilla': 'B783012', // Weizentortilla
  'Couscous': 'C119200', // Couscous (Hartweizen) roh
  'Quinoa': 'C118000', // Quinoa weiß, roh
  'Mehl': 'C214100', // Weizen Mehl, Type 405
  'Linsen': 'H725100', // Linse reif
  'Kichererbsen': 'H720902', // Kichererbse reif, Konserve, abgetropft
  'Kidneybohnen': 'H742902', // Kidneybohne reif, Konserve, abgetropft
  'Tofu': 'H861000', // Tofu
  'Ei': 'E111100', // Hühnerei roh
  'Hähnchen': 'V416100', // Hähnchen Brustfilet, roh
  'Hackfleisch': 'U050100', // Rind/Schwein, Hackfleisch gemischt, roh
  'Rindfleisch': 'U284100', // Rind Hüfte, roh
  'Schinken': 'W424000', // Schwein Kochschinken, Kochpökelware
  'Speck': 'W415000', // Schwein Frühstücksspeck, Rohpökelware, geräuchert
  'Lachs': 'T410100', // Lachs roh
  'Thunfisch': 'T121902', // Thunfisch im eigenen Saft, Konserve, abgetropft
  'Garnelen': 'T753100', // Garnele/Granat/Krabbe, roh
  'Milch': 'M111200', // Milch fettarm, frisch, 1,5 % Fett, pasteurisiert
  'Haferdrink': 'C660000', // Haferdrink ungesüßt
  'Joghurt': 'M141300', // Joghurt mild, mind. 3,5 % Fett
  'Magerquark': 'M713100', // Speisequark Magerstufe, Magerquark < 10 % Fett i. Tr.
  'Frischkäse': 'M710800', // Frischkäsezubereitung Natur, mind. 60 % Fett i. Tr.
  'Feta': 'M012200', // Feta mind. 45 % Fett i. Tr.
  'Käse': 'M402600', // Gouda 48 % Fett i. Tr.
  'Mozzarella': 'M032100', // Mozzarella mind. 45 % Fett i. Tr.
  'Parmesan': 'M306400', // Parmesan mind. 30 % Fett i. Tr.
  'Sahne': 'M173800', // Schlagsahne mind. 30 % Fett
  'Schmand': 'M172700', // Sauerrahm/Schmand, mind. 20 % Fett
  'Butter': 'Q630000', // Süßrahmbutter
  'Öl': 'Q120000', // Olivenöl
  'Kokosmilch': 'H154000', // Kokosmilch/Kokosnussmilch
  'Pesto': 'X372012', // Pesto verde
  'Mayonnaise': 'Q991000', // Mayonnaise (Fertigprodukt)
  'Hummus': 'H960000', // Hummus/Kichererbsenmus
  'Nüsse': 'H120100+H210100+H170100+H130100', // Walnuss / Mandel süß / Cashewkern / Haselnuss
  'Erdnussbutter': 'H880200', // Erdnussbutter/Erdnusscreme
  'Chiasamen': 'H480100', // Chia-Samen
  'Leinsamen': 'H410100', // Leinsamen
  'Zucker': 'S111000', // Zucker weiß (Raffinadezucker/Weißzucker)
  'Honig': 'S120000', // Honig
  'Ahornsirup': 'S151100', // Ahornsirup
  'Schokolade': 'S560000', // Zartbitter-/Halbbitterschokolade
  'Tomaten': 'G561100', // Tomate roh
  'Passierte Tomaten': 'R161200', // Tomaten passiert/Tomatenpüree
  'Tomatenmark': 'R160000', // Tomatenmark
  'Zwiebel': 'G480100', // Speisezwiebel roh
  'Knoblauch': 'G490100', // Knoblauch roh
  'Möhre': 'G620100', // Karotte/Möhre, roh
  'Paprika': 'G543100', // Gemüsepaprika rot, roh
  'Zucchini': 'G582100', // Zucchini roh
  'Brokkoli': 'G312100', // Broccoli roh
  'Blumenkohl': 'G311100', // Blumenkohl roh
  'Spinat': 'G211100', // Spinat roh
  'Champignons': 'K701100', // Champignon roh
  'Gurke': 'G520100', // Gurke roh
  'Salat': 'G105100', // Kopfsalat roh
  'Erbsen': 'G760200', // Erbse grün, tiefgefroren
  'Mais': 'G570902', // Zuckermais Konserve, abgetropft
  'Aubergine': 'G510100', // Aubergine roh
  'Kürbis': 'G581000', // Kürbis Hokkaido (C. maxima) roh
  'Avocado': 'F502100', // Avocado roh
  'Banane': 'F503100', // Banane roh
  'Apfel': 'F110100', // Apfel roh
  'Beeren': 'F301100+F302100+F304100', // Erdbeere roh / Himbeere roh / Heidelbeere roh
  'Zitrone': 'F601100', // Zitrone roh
  'Salsa': 'X3A7040', // Spanische Sauce (Salsa)
  'Gemüsebrühe': 'X416243', // Gemüsebrühe
  'Sojasauce': 'R143000', // Sojasauce/Sojasoße
};

// Ohne passenden BLS-Eintrag: Kokosmilch light (fettreduzierte Kokosmilch gibt es im BLS nicht) und Gewürze (in kleinen Mengen vernachlässigt).
// [Eiweiß, Kohlenhydrate, Zucker, Fett, Ballaststoffe]; kcal steht in FOODS.
export const NOT_FROM_BLS = ['Kokosmilch light', 'Gewürze'];
const NOT_FROM_BLS_VALUES = { 'Kokosmilch light': [0.8, 2, 1.5, 7, 0.2], 'Gewürze': [0, 0, 0, 0, 0] };

// [Eiweiß, Kohlenhydrate, Zucker, freier Zucker, Fett, Ballaststoffe] pro 100 g
const NUTR = {};
for (const [name, v] of Object.entries(NOT_FROM_BLS_VALUES)) NUTR[name] = [v[0], v[1], v[2], 0, v[3], v[4]];

// Liest die Nährwerte aus der BLS-Datei des Trackers (dieselben Daten, die der Tracker selbst nutzt).
// Freier Zucker (WHO) ist die Spalte „fs“ des Trackers. Fehlt die Datei (z. B. offline beim allerersten Start), bleiben die Werte 0.
export async function loadNutrition(url = 'tracker/data/bls.json') {
  let map = new Map();
  try {
    const data = await (await fetch(url)).json();
    map = new Map(data.foods.map((f) => [f.id, f]));
  } catch (e) { /* ohne Datei weiter, Werte 0 */ }
  let missing = 0;
  for (const food of FOODS) {
    const code = BLS_CODES[food.name];
    if (!code) continue;
    const rows = code.split('+').map((c) => map.get(c)).filter(Boolean);
    if (!rows.length) { missing++; food.kcal = 0; NUTR[food.name] = [0, 0, 0, 0, 0, 0]; continue; }
    const avg = (k) => rows.reduce((s, r) => s + (r[k] || 0), 0) / rows.length;
    food.kcal = Math.round(avg('k'));
    NUTR[food.name] = [avg('p'), avg('c'), avg('su'), avg('fs'), avg('f'), avg('fi')];
  }
  return missing === 0;
}

// Gramm pro Handvoll, Dose (abgetropft) und Scheibe
const HAND = { 'Spinat': 30, 'Beeren': 70, 'Erbsen': 60, 'Salat': 30, 'Gewürze': 10, 'Nüsse': 25, 'Champignons': 50 };
const DOSE = { 'Kichererbsen': 240, 'Kidneybohnen': 240, 'Passierte Tomaten': 400, 'Tomaten': 400, 'Thunfisch': 150, 'Mais': 140, 'Kokosmilch': 400, 'Kokosmilch light': 400 };
const SCHEIBE = { 'Brot': 50, 'Toast': 25, 'Käse': 20, 'Schinken': 20 };

export const NUTRIENTS = [
  { id: 'protein', name: 'Eiweiß' },
  { id: 'kh', name: 'Kohlenhydrate' },
  { id: 'zucker', name: 'davon Zucker' },
  { id: 'zugesetzt', name: 'freier Zucker' },
  { id: 'fett', name: 'Fett' },
  { id: 'ballast', name: 'Ballaststoffe' }
];

export function emptyNutrients() {
  return { kcal: 0, protein: 0, kh: 0, zucker: 0, zugesetzt: 0, fruktose: 0, fett: 0, ballast: 0 };
}

export function addNutrients(a, b, factor = 1) {
  const out = { ...a };
  for (const k of Object.keys(out)) out[k] += ((b && b[k]) || 0) * factor;
  return out;
}

// Nährwerte einer Menge in Gramm
export function nutrientsFor(food, grams, kcal100) {
  const n = emptyNutrients();
  if (!food && kcal100 == null) return n;
  const v = (food && NUTR[food.name]) || [0, 0, 0, 0, 0, 0];
  const f = grams / 100;
  n.kcal = (kcal100 != null && kcal100 !== '' ? Number(kcal100) : food.kcal) * f;
  if (food) {
    [n.protein, n.kh, n.zucker, n.zugesetzt, n.fett, n.ballast] = v.map((x) => x * f);
  }
  return n;
}

// ---------- Zutatenzeilen der fertigen Rezepte lesen und skalieren ----------

const FRACTIONS = { '½': 0.5, '¼': 0.25, '¾': 0.75, '⅓': 1 / 3, '⅔': 2 / 3 };
const UNIT_WORDS = {
  g: 'g', ml: 'ml', el: 'el', tl: 'tl', handvoll: 'hand', dose: 'dose', dosen: 'dose', scheibe: 'scheibe', scheiben: 'scheibe', stück: 'stueck'
};
const UNIT_LABEL = { g: 'g', ml: 'ml', el: 'EL', tl: 'TL', hand: 'Handvoll', stueck: 'Stück' };
const PLURAL = {
  Zwiebel: 'Zwiebeln', Möhre: 'Möhren', Tomate: 'Tomaten', Banane: 'Bananen', Knoblauchzehe: 'Knoblauchzehen', Süßkartoffel: 'Süßkartoffeln',
  Avocado: 'Avocados', Gurke: 'Gurken', Lachsfilet: 'Lachsfilets', Paprika: 'Paprika', Zucchini: 'Zucchini', Brokkoli: 'Brokkoli', Zitrone: 'Zitronen',
  Scheibe: 'Scheiben', Dose: 'Dosen', Ei: 'Eier', Tortilla: 'Tortillas'
};

// „½ Dose Kichererbsen“ → { amount: 0.5, unit: 'dose', name: 'Kichererbsen' }; ohne Menge (z. B. „Salz, Pfeffer“) ist amount null
export function parseIngredient(text) {
  const m = String(text).match(/^\s*(\d+(?:[.,]\d+)?)?\s*([½¼¾⅓⅔])?\s+(.*)$/) || [];
  let amount = null;
  if (m[1] || m[2]) amount = (m[1] ? Number(m[1].replace(',', '.')) : 0) + (m[2] ? FRACTIONS[m[2]] : 0);
  let rest = amount === null ? String(text) : m[3];
  let unit = 'stueck';
  if (amount !== null) {
    const w = rest.split(/\s+/)[0];
    const u = UNIT_WORDS[w.toLowerCase()];
    if (u) { unit = u; rest = rest.slice(w.length).trim(); }
  }
  return { amount, unit, unitWord: amount !== null && UNIT_WORDS[String(m[3] || '').split(/\s+/)[0].toLowerCase()] ? String(m[3]).split(/\s+/)[0] : '', name: rest };
}

function gramsParsed(p, food) {
  const a = p.amount || 0;
  if (!food) return 0;
  switch (p.unit) {
    case 'g': case 'ml': return a;
    case 'el': return a * (food.el || 15);
    case 'tl': return a * (food.el || 15) / 3;
    case 'hand': return a * (HAND[food.name] || 30);
    case 'dose': return a * (DOSE[food.name] || 400);
    case 'scheibe': return a * (SCHEIBE[food.name] || 40);
    default: return a * (food.piece || 100);
  }
}

// Nährwerte einer Zutatenzeile wie „60 g Reis“
export function nutrientsOfText(text) {
  const p = parseIngredient(text);
  if (p.amount === null) return emptyNutrients();
  const food = findFood(p.name.replace(/[()]/g, ' '));
  return nutrientsFor(food, gramsParsed(p, food));
}

// Gewicht einer Zutatenzeile in Gramm (ml zählen wie g, unbekannte Zutaten 0)
export function gramsOfText(text) {
  const p = parseIngredient(text);
  if (p.amount === null) return 0;
  return gramsParsed(p, findFood(p.name.replace(/[()]/g, ' ')));
}

function fmtAmount(x) {
  const whole = Math.floor(x + 1e-9);
  const frac = x - whole;
  const nice = [[0.25, '¼'], [0.5, '½'], [0.75, '¾']].find(([v]) => Math.abs(frac - v) < 0.04);
  if (frac < 0.04) return String(whole);
  if (nice) return whole ? `${whole} ${nice[1]}` : nice[1];
  return String(Math.round(x * 10) / 10).replace('.', ',');
}

// Skaliert eine Zutatenzeile, z. B. („½ Dose Kichererbsen“, 3) → „1 ½ Dosen Kichererbsen“
export function scaleIngredient(text, factor) {
  if (factor === 1) return text;
  const p = parseIngredient(text);
  if (p.amount === null) return text;
  let x = p.amount * factor;
  if (p.unit === 'g' || p.unit === 'ml') x = x >= 20 ? Math.round(x / 5) * 5 : Math.round(x);
  else x = Math.round(x * 4) / 4;
  const many = x > 1;
  let word = p.unitWord;
  if (word && many && PLURAL[word]) word = PLURAL[word];
  let name = p.name;
  if (!word && many) name = name.replace(/^(\S+)/, (w) => PLURAL[w] || w).replace(/(\S+)$/, (w) => (p.name.split(' ').length > 1 && PLURAL[w] ? PLURAL[w] : w));
  return `${fmtAmount(x)} ${word ? word + ' ' : ''}${name}`;
}
