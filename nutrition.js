// Grobe Nährwerte für gängige Zutaten (kcal pro 100 g bzw. 100 ml, roh/ungekocht wo nicht anders angegeben).
// Die Werte sind gerundete Durchschnittswerte und dienen nur als Schätzung.
//
// piece:  Gramm pro Stück (für die Einheit „Stück“)
// el:     Gramm pro Esslöffel (Standard 15)
// diet:   'fleisch' | 'fisch' | 'tierisch' (Milchprodukte, Ei, Honig); fehlt = vegan
// allergens wie in recipes.js
// group:  'gemuese' | 'eiweiss' | 'saettigung' | 'fett' | 'suess' | 'sonst' (für Gingers Tipps)

export const FOODS = [
  // Sättigungsbeilagen
  { name: 'Nudeln', kcal: 355, el: 10, allergens: ['gluten'], group: 'saettigung', aliases: ['spaghetti', 'penne', 'pasta', 'fusilli', 'makkaroni', 'vollkornnudeln'] },
  { name: 'Gekochter Reis', kcal: 130, el: 20, group: 'saettigung', aliases: ['reis gekocht', 'gekochter reis'] },
  { name: 'Reis', kcal: 350, el: 15, group: 'saettigung', aliases: ['basmati', 'jasminreis', 'risottoreis', 'naturreis'] },
  { name: 'Kartoffeln', kcal: 72, piece: 100, group: 'saettigung', aliases: ['kartoffel'] },
  { name: 'Süßkartoffel', kcal: 86, piece: 300, group: 'saettigung', aliases: ['süßkartoffeln', 'suesskartoffel'] },
  { name: 'Haferflocken', kcal: 370, el: 8, allergens: ['gluten'], group: 'saettigung', aliases: ['hafer'] },
  { name: 'Brot', kcal: 220, piece: 50, allergens: ['gluten'], group: 'saettigung', aliases: ['vollkornbrot', 'brotscheibe', 'scheibe brot', 'brötchen'] },
  { name: 'Toast', kcal: 260, piece: 25, allergens: ['gluten'], group: 'saettigung', aliases: ['toastbrot'] },
  { name: 'Tortilla', kcal: 300, piece: 60, allergens: ['gluten'], group: 'saettigung', aliases: ['tortillas', 'wrap', 'wraps', 'fladen'] },
  { name: 'Couscous', kcal: 360, el: 12, allergens: ['gluten'], group: 'saettigung', aliases: ['bulgur'] },
  { name: 'Quinoa', kcal: 360, el: 12, group: 'saettigung' },
  { name: 'Mehl', kcal: 350, el: 10, allergens: ['gluten'], group: 'saettigung', aliases: ['weizenmehl', 'dinkelmehl'] },

  // Hülsenfrüchte und Eiweiß
  { name: 'Linsen', kcal: 340, el: 12, group: 'eiweiss', aliases: ['rote linsen', 'berglinsen'] },
  { name: 'Kichererbsen', kcal: 120, group: 'eiweiss', aliases: ['kichererbsen dose'] },
  { name: 'Kidneybohnen', kcal: 105, group: 'eiweiss', aliases: ['bohnen', 'weiße bohnen', 'schwarze bohnen'] },
  { name: 'Tofu', kcal: 120, allergens: ['soja'], group: 'eiweiss', aliases: ['räuchertofu'] },
  { name: 'Ei', kcal: 155, piece: 60, diet: 'tierisch', allergens: ['ei'], group: 'eiweiss', aliases: ['eier'] },
  { name: 'Hähnchen', kcal: 110, diet: 'fleisch', group: 'eiweiss', aliases: ['hähnchenbrust', 'hühnchen', 'huhn', 'putenbrust', 'pute'] },
  { name: 'Hackfleisch', kcal: 250, diet: 'fleisch', group: 'eiweiss', aliases: ['hack', 'rinderhack', 'gemischtes hack'] },
  { name: 'Rindfleisch', kcal: 150, diet: 'fleisch', group: 'eiweiss', aliases: ['rind', 'steak'] },
  { name: 'Schinken', kcal: 120, diet: 'fleisch', group: 'eiweiss', aliases: ['kochschinken'] },
  { name: 'Speck', kcal: 400, diet: 'fleisch', group: 'fett', aliases: ['bacon', 'speckwürfel'] },
  { name: 'Lachs', kcal: 200, piece: 125, diet: 'fisch', allergens: ['fisch'], group: 'eiweiss', aliases: ['lachsfilet'] },
  { name: 'Thunfisch', kcal: 110, diet: 'fisch', allergens: ['fisch'], group: 'eiweiss', aliases: ['thunfisch dose'] },
  { name: 'Garnelen', kcal: 90, diet: 'fisch', group: 'eiweiss', aliases: ['shrimps', 'krabben'] },

  // Milchprodukte
  { name: 'Milch', kcal: 47, diet: 'tierisch', allergens: ['laktose'], group: 'eiweiss', aliases: ['milch 1,5%', 'vollmilch'] },
  { name: 'Haferdrink', kcal: 45, allergens: ['gluten'], group: 'sonst', aliases: ['hafermilch', 'pflanzendrink', 'sojadrink', 'mandeldrink'] },
  { name: 'Joghurt', kcal: 65, diet: 'tierisch', allergens: ['laktose'], group: 'eiweiss', aliases: ['naturjoghurt', 'griechischer joghurt', 'skyr'] },
  { name: 'Magerquark', kcal: 67, diet: 'tierisch', allergens: ['laktose'], group: 'eiweiss', aliases: ['quark'] },
  { name: 'Frischkäse', kcal: 250, diet: 'tierisch', allergens: ['laktose'], group: 'fett' },
  { name: 'Feta', kcal: 270, diet: 'tierisch', allergens: ['laktose'], group: 'fett', aliases: ['schafskäse', 'hirtenkäse'] },
  { name: 'Käse', kcal: 360, diet: 'tierisch', allergens: ['laktose'], group: 'fett', aliases: ['gouda', 'emmentaler', 'reibekäse', 'geriebener käse', 'cheddar'] },
  { name: 'Mozzarella', kcal: 250, piece: 125, diet: 'tierisch', allergens: ['laktose'], group: 'fett' },
  { name: 'Parmesan', kcal: 400, el: 6, diet: 'tierisch', allergens: ['laktose'], group: 'fett', aliases: ['hartkäse'] },
  { name: 'Sahne', kcal: 290, diet: 'tierisch', allergens: ['laktose'], group: 'fett', aliases: ['schlagsahne', 'kochsahne'] },
  { name: 'Schmand', kcal: 240, diet: 'tierisch', allergens: ['laktose'], group: 'fett', aliases: ['saure sahne', 'crème fraîche', 'creme fraiche'] },
  { name: 'Butter', kcal: 740, el: 12, diet: 'tierisch', allergens: ['laktose'], group: 'fett' },

  // Fette, Süßes, Saaten
  { name: 'Öl', kcal: 900, el: 10, group: 'fett', aliases: ['olivenöl', 'rapsöl', 'sonnenblumenöl', 'sesamöl'] },
  { name: 'Kokosmilch light', kcal: 75, group: 'fett', aliases: ['kokosmilch fettreduziert'] },
  { name: 'Kokosmilch', kcal: 180, group: 'fett' },
  { name: 'Pesto', kcal: 450, el: 15, diet: 'tierisch', allergens: ['nuesse', 'laktose'], group: 'fett' },
  { name: 'Mayonnaise', kcal: 700, el: 15, diet: 'tierisch', allergens: ['ei'], group: 'fett', aliases: ['mayo'] },
  { name: 'Hummus', kcal: 300, el: 15, group: 'eiweiss' },
  { name: 'Nüsse', kcal: 650, el: 8, allergens: ['nuesse'], group: 'fett', aliases: ['walnüsse', 'mandeln', 'cashews', 'haselnüsse'] },
  { name: 'Erdnussbutter', kcal: 600, el: 15, allergens: ['nuesse'], group: 'fett', aliases: ['erdnussmus'] },
  { name: 'Chiasamen', kcal: 490, el: 12, group: 'fett', aliases: ['chia'] },
  { name: 'Leinsamen', kcal: 500, el: 10, group: 'fett' },
  { name: 'Zucker', kcal: 400, el: 15, group: 'suess', aliases: ['rohrzucker'] },
  { name: 'Honig', kcal: 310, el: 20, diet: 'tierisch', group: 'suess' },
  { name: 'Ahornsirup', kcal: 260, el: 20, group: 'suess', aliases: ['sirup', 'agavendicksaft'] },
  { name: 'Schokolade', kcal: 540, group: 'suess', aliases: ['zartbitterschokolade', 'schoko'] },

  // Gemüse und Obst
  { name: 'Tomaten', kcal: 18, piece: 100, group: 'gemuese', aliases: ['tomate', 'kirschtomaten', 'cherrytomaten'] },
  { name: 'Passierte Tomaten', kcal: 25, group: 'gemuese', aliases: ['gehackte tomaten', 'tomaten dose', 'dosentomaten'] },
  { name: 'Tomatenmark', kcal: 80, el: 15, group: 'gemuese' },
  { name: 'Zwiebel', kcal: 40, piece: 80, group: 'gemuese', aliases: ['zwiebeln', 'rote zwiebel', 'frühlingszwiebel', 'lauchzwiebel'] },
  { name: 'Knoblauch', kcal: 140, piece: 4, group: 'gemuese', aliases: ['knoblauchzehe', 'zehe'] },
  { name: 'Möhre', kcal: 36, piece: 80, group: 'gemuese', aliases: ['möhren', 'karotte', 'karotten'] },
  { name: 'Paprika', kcal: 30, piece: 150, group: 'gemuese', aliases: ['paprikaschote'] },
  { name: 'Zucchini', kcal: 20, piece: 250, group: 'gemuese' },
  { name: 'Brokkoli', kcal: 35, piece: 350, group: 'gemuese', aliases: ['broccoli'] },
  { name: 'Blumenkohl', kcal: 25, piece: 600, group: 'gemuese' },
  { name: 'Spinat', kcal: 23, group: 'gemuese', aliases: ['blattspinat'] },
  { name: 'Champignons', kcal: 22, group: 'gemuese', aliases: ['pilze', 'champignon'] },
  { name: 'Gurke', kcal: 15, piece: 400, group: 'gemuese', aliases: ['salatgurke'] },
  { name: 'Salat', kcal: 15, group: 'gemuese', aliases: ['eisbergsalat', 'rucola', 'blattsalat'] },
  { name: 'Erbsen', kcal: 75, group: 'gemuese', aliases: ['tk-erbsen'] },
  { name: 'Mais', kcal: 80, el: 15, group: 'gemuese', aliases: ['maiskörner'] },
  { name: 'Aubergine', kcal: 20, piece: 300, group: 'gemuese' },
  { name: 'Kürbis', kcal: 30, group: 'gemuese', aliases: ['hokkaido'] },
  { name: 'Avocado', kcal: 200, piece: 150, group: 'fett' },
  { name: 'Banane', kcal: 95, piece: 120, group: 'suess' },
  { name: 'Apfel', kcal: 55, piece: 150, group: 'suess', aliases: ['äpfel'] },
  { name: 'Beeren', kcal: 45, group: 'suess', aliases: ['heidelbeeren', 'himbeeren', 'erdbeeren', 'tk-beeren'] },
  { name: 'Zitrone', kcal: 35, piece: 100, group: 'sonst', aliases: ['zitronensaft', 'limette'] },

  // Fast ohne Kalorien
  { name: 'Salsa', kcal: 35, el: 15, group: 'sonst', aliases: ['tomatensalsa'] },
  { name: 'Gemüsebrühe', kcal: 5, group: 'sonst', aliases: ['brühe', 'wasser'] },
  { name: 'Sojasauce', kcal: 60, el: 15, allergens: ['soja', 'gluten'], group: 'sonst', aliases: ['sojasoße'] },
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

// Nährwerte pro 100 g: Eiweiß, Kohlenhydrate, davon Zucker, Fruktose, Fett, Ballaststoffe.
// Fruktose zählt freie Fruktose plus die Hälfte des Haushaltszuckers (Saccharose besteht zur Hälfte daraus).
// Grobe Durchschnittswerte aus gängigen Nährwerttabellen, gerundet.
const NUTR = {
  'Nudeln': [12.5, 70, 3, 0.1, 1.5, 3], 'Reis': [7, 78, 0.2, 0, 0.6, 1.4], 'Gekochter Reis': [2.7, 28, 0.1, 0, 0.3, 0.4], 'Kartoffeln': [2, 15, 0.8, 0.3, 0.1, 2.1],
  'Süßkartoffel': [1.6, 20, 4.2, 1.5, 0.1, 3], 'Haferflocken': [13.5, 59, 1, 0.1, 7, 10], 'Brot': [7, 40, 3, 0.5, 1.2, 7],
  'Toast': [8, 48, 5, 1, 4, 3], 'Tortilla': [8, 50, 3, 0.5, 7, 3], 'Couscous': [12.8, 72, 0.5, 0, 0.6, 5],
  'Quinoa': [14, 64, 0.5, 0, 6, 7], 'Mehl': [10, 72, 1, 0, 1, 3],
  'Linsen': [24, 48, 2, 0, 1.5, 11], 'Kichererbsen': [7, 14, 0.5, 0, 2.5, 5], 'Kidneybohnen': [7, 13, 0.5, 0, 0.5, 6],
  'Tofu': [13, 2, 0.5, 0, 7.5, 1], 'Ei': [12.5, 0.7, 0.4, 0, 10.5, 0], 'Hähnchen': [23, 0, 0, 0, 1.5, 0],
  'Hackfleisch': [18, 0, 0, 0, 20, 0], 'Rindfleisch': [21, 0, 0, 0, 6, 0], 'Schinken': [19, 1, 1, 0, 4, 0],
  'Speck': [13, 0, 0, 0, 39, 0], 'Lachs': [20, 0, 0, 0, 13, 0], 'Thunfisch': [25, 0, 0, 0, 1, 0], 'Garnelen': [19, 0, 0, 0, 1.5, 0],
  'Milch': [3.4, 4.8, 4.8, 0, 1.5, 0], 'Haferdrink': [1, 7, 4, 0, 1.5, 0.8], 'Joghurt': [4, 4.5, 4.5, 0, 3, 0],
  'Magerquark': [12, 4, 4, 0, 0.3, 0], 'Frischkäse': [6, 3.5, 3.5, 0, 23, 0], 'Feta': [17, 0.7, 0.7, 0, 21, 0],
  'Käse': [26, 0, 0, 0, 28, 0], 'Mozzarella': [18, 1, 1, 0, 17, 0], 'Parmesan': [33, 0, 0, 0, 29, 0],
  'Sahne': [2.4, 3.2, 3.2, 0, 30, 0], 'Schmand': [3, 3.5, 3.5, 0, 24, 0], 'Butter': [0.7, 0.6, 0.6, 0, 83, 0],
  'Öl': [0, 0, 0, 0, 100, 0], 'Kokosmilch light': [0.8, 2, 1.5, 0.3, 7, 0.2], 'Kokosmilch': [1.8, 3, 2, 0.5, 18, 0.5],
  'Pesto': [5, 6, 3, 0.5, 45, 2], 'Mayonnaise': [1, 2, 1.5, 0.5, 76, 0], 'Hummus': [8, 14, 0.5, 0, 18, 6],
  'Nüsse': [16, 10, 4, 1, 60, 8], 'Erdnussbutter': [25, 12, 6, 2, 50, 6], 'Chiasamen': [17, 8, 0, 0, 31, 34],
  'Leinsamen': [18, 2, 1.5, 0, 42, 27], 'Zucker': [0, 100, 100, 50, 0, 0], 'Honig': [0.3, 80, 80, 40, 0, 0],
  'Ahornsirup': [0, 67, 60, 31, 0, 0], 'Schokolade': [7, 46, 40, 20, 33, 10],
  'Tomaten': [1, 3, 2.6, 1.4, 0.2, 1.2], 'Passierte Tomaten': [1.5, 4.5, 4, 2, 0.2, 1.5], 'Tomatenmark': [4.5, 15, 12, 6, 0.5, 4],
  'Zwiebel': [1.2, 7.5, 4.5, 2, 0.1, 1.8], 'Knoblauch': [6, 30, 1, 0.2, 0.5, 2], 'Möhre': [0.9, 7, 4.7, 1.8, 0.2, 3],
  'Paprika': [1, 5, 4, 2.3, 0.3, 2], 'Zucchini': [1.5, 2.5, 2, 1, 0.3, 1], 'Brokkoli': [3, 3, 1.7, 0.7, 0.4, 3],
  'Blumenkohl': [2, 2.5, 2, 1, 0.3, 2], 'Spinat': [2.9, 0.6, 0.4, 0.1, 0.4, 2.2], 'Champignons': [3, 0.5, 0.3, 0.1, 0.3, 2],
  'Gurke': [0.6, 2, 1.7, 0.9, 0.1, 0.5], 'Salat': [1.3, 2, 1, 0.6, 0.2, 1.5], 'Erbsen': [5.5, 10, 4, 2, 0.4, 5],
  'Mais': [3, 15, 4, 1, 1.5, 3], 'Aubergine': [1, 3, 2.5, 1.3, 0.2, 2.5], 'Kürbis': [1, 5, 3, 1.3, 0.1, 2],
  'Avocado': [2, 1.5, 0.5, 0.1, 20, 6], 'Banane': [1.1, 21, 17, 7, 0.2, 2], 'Apfel': [0.3, 12, 10, 7, 0.2, 2.4],
  'Beeren': [1, 7, 5, 2.8, 0.4, 4], 'Zitrone': [0.7, 3, 2.5, 1, 0.3, 0.5], 'Salsa': [1.5, 7, 5, 2.5, 0.2, 1.5],
  'Gemüsebrühe': [0.2, 0.5, 0.3, 0, 0.2, 0], 'Sojasauce': [8, 6, 1, 0.3, 0.1, 0.5], 'Gewürze': [0, 0, 0, 0, 0, 0]
};

// Zugesetzter Zucker: Anteil vom Zucker, der zugesetzt ist (WHO „freier Zucker“, ohne Obst und Milch)
const ADDED_SUGAR = { 'Zucker': 1, 'Honig': 1, 'Ahornsirup': 1, 'Schokolade': 1, 'Toast': 0.6, 'Salsa': 0.5, 'Tomatenmark': 0, 'Haferdrink': 0, 'Kokosmilch': 0 };

// Gramm pro Handvoll, Dose (abgetropft) und Scheibe
const HAND = { 'Spinat': 30, 'Beeren': 70, 'Erbsen': 60, 'Salat': 30, 'Gewürze': 10, 'Nüsse': 25, 'Champignons': 50 };
const DOSE = { 'Kichererbsen': 240, 'Kidneybohnen': 240, 'Passierte Tomaten': 400, 'Tomaten': 400, 'Thunfisch': 150, 'Mais': 140, 'Kokosmilch': 400, 'Kokosmilch light': 400 };
const SCHEIBE = { 'Brot': 50, 'Toast': 25, 'Käse': 20, 'Schinken': 20 };

export const NUTRIENTS = [
  { id: 'protein', name: 'Eiweiß' },
  { id: 'kh', name: 'Kohlenhydrate' },
  { id: 'zucker', name: 'davon Zucker' },
  { id: 'zugesetzt', name: 'zugesetzter Zucker' },
  { id: 'fruktose', name: 'Fruktose' },
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
    [n.protein, n.kh, n.zucker, n.fruktose, n.fett, n.ballast] = v.map((x) => x * f);
    n.zugesetzt = n.zucker * (ADDED_SUGAR[food.name] || 0);
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
