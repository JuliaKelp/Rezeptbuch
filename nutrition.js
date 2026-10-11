// Nährwerte der Zutaten (pro 100 g bzw. 100 ml, roh/ungekocht wo nicht anders angegeben).
// Quelle: Max Rubner-Institut (2025). Bundeslebensmittelschlüssel (BLS), Version 4.0. Karlsruhe.
// DOI: 10.25826/Data20251217-134202-0. Die Werte stehen unten in BLS_VALUES mit BLS-Code.
// Ausnahmen ohne BLS-Eintrag: siehe NOT_FROM_BLS.
//
// piece:  Gramm pro Stück (für die Einheit „Stück“)
// el:     Gramm pro Esslöffel (Standard 15)
// diet:   'fleisch' | 'fisch' | 'tierisch' (Milchprodukte, Ei, Honig); fehlt = vegan
// allergens wie in recipes.js
// group:  'gemuese' | 'eiweiss' | 'saettigung' | 'fett' | 'suess' | 'sonst' (für Gingers Tipps)

export const FOODS = [
  // Sättigungsbeilagen
  { name: 'Nudeln', kcal: 346, el: 10, allergens: ['gluten'], group: 'saettigung', aliases: ['spaghetti', 'penne', 'pasta', 'fusilli', 'makkaroni', 'vollkornnudeln'] },
  { name: 'Gekochter Reis', kcal: 117, el: 20, group: 'saettigung', aliases: ['reis gekocht', 'gekochter reis'] },
  { name: 'Reis', kcal: 351, el: 15, group: 'saettigung', aliases: ['basmati', 'jasminreis', 'risottoreis', 'naturreis'] },
  { name: 'Kartoffeln', kcal: 83, piece: 100, group: 'saettigung', aliases: ['kartoffel'] },
  { name: 'Süßkartoffel', kcal: 119, piece: 300, group: 'saettigung', aliases: ['süßkartoffeln', 'suesskartoffel'] },
  { name: 'Haferflocken', kcal: 348, el: 8, allergens: ['gluten'], group: 'saettigung', aliases: ['hafer'] },
  { name: 'Brot', kcal: 218, piece: 50, allergens: ['gluten'], group: 'saettigung', aliases: ['vollkornbrot', 'brotscheibe', 'scheibe brot', 'brötchen'] },
  { name: 'Toast', kcal: 261, piece: 25, allergens: ['gluten'], group: 'saettigung', aliases: ['toastbrot'] },
  { name: 'Tortilla', kcal: 296, piece: 60, allergens: ['gluten'], group: 'saettigung', aliases: ['tortillas', 'wrap', 'wraps', 'fladen'] },
  { name: 'Couscous', kcal: 350, el: 12, allergens: ['gluten'], group: 'saettigung', aliases: ['bulgur'] },
  { name: 'Quinoa', kcal: 361, el: 12, group: 'saettigung' },
  { name: 'Mehl', kcal: 348, el: 10, allergens: ['gluten'], group: 'saettigung', aliases: ['weizenmehl', 'dinkelmehl'] },

  // Hülsenfrüchte und Eiweiß
  { name: 'Linsen', kcal: 323, el: 12, group: 'eiweiss', aliases: ['rote linsen', 'berglinsen'] },
  { name: 'Kichererbsen', kcal: 136, group: 'eiweiss', aliases: ['kichererbsen dose'] },
  { name: 'Kidneybohnen', kcal: 128, group: 'eiweiss', aliases: ['bohnen', 'weiße bohnen', 'schwarze bohnen'] },
  { name: 'Tofu', kcal: 115, allergens: ['soja'], group: 'eiweiss', aliases: ['räuchertofu'] },
  { name: 'Ei', kcal: 135, piece: 60, diet: 'tierisch', allergens: ['ei'], group: 'eiweiss', aliases: ['eier'] },
  { name: 'Hähnchen', kcal: 109, diet: 'fleisch', group: 'eiweiss', aliases: ['hähnchenbrust', 'hühnchen', 'huhn', 'putenbrust', 'pute'] },
  { name: 'Hackfleisch', kcal: 236, diet: 'fleisch', group: 'eiweiss', aliases: ['hack', 'rinderhack', 'gemischtes hack'] },
  { name: 'Rindfleisch', kcal: 110, diet: 'fleisch', group: 'eiweiss', aliases: ['rind', 'steak'] },
  { name: 'Schinken', kcal: 130, diet: 'fleisch', group: 'eiweiss', aliases: ['kochschinken'] },
  { name: 'Speck', kcal: 304, diet: 'fleisch', group: 'fett', aliases: ['bacon', 'speckwürfel'] },
  { name: 'Lachs', kcal: 180, piece: 125, diet: 'fisch', allergens: ['fisch'], group: 'eiweiss', aliases: ['lachsfilet'] },
  { name: 'Thunfisch', kcal: 95, diet: 'fisch', allergens: ['fisch'], group: 'eiweiss', aliases: ['thunfisch dose'] },
  { name: 'Garnelen', kcal: 87, diet: 'fisch', group: 'eiweiss', aliases: ['shrimps', 'krabben'] },

  // Milchprodukte
  { name: 'Milch', kcal: 44, diet: 'tierisch', allergens: ['laktose'], group: 'eiweiss', aliases: ['milch 1,5%', 'vollmilch'] },
  { name: 'Haferdrink', kcal: 29, allergens: ['gluten'], group: 'sonst', aliases: ['hafermilch', 'pflanzendrink', 'sojadrink', 'mandeldrink'] },
  { name: 'Joghurt', kcal: 67, diet: 'tierisch', allergens: ['laktose'], group: 'eiweiss', aliases: ['naturjoghurt', 'griechischer joghurt', 'skyr'] },
  { name: 'Magerquark', kcal: 66, diet: 'tierisch', allergens: ['laktose'], group: 'eiweiss', aliases: ['quark'] },
  { name: 'Frischkäse', kcal: 252, diet: 'tierisch', allergens: ['laktose'], group: 'fett' },
  { name: 'Feta', kcal: 284, diet: 'tierisch', allergens: ['laktose'], group: 'fett', aliases: ['schafskäse', 'hirtenkäse'] },
  { name: 'Käse', kcal: 379, diet: 'tierisch', allergens: ['laktose'], group: 'fett', aliases: ['gouda', 'emmentaler', 'reibekäse', 'geriebener käse', 'cheddar'] },
  { name: 'Mozzarella', kcal: 259, piece: 125, diet: 'tierisch', allergens: ['laktose'], group: 'fett' },
  { name: 'Parmesan', kcal: 391, el: 6, diet: 'tierisch', allergens: ['laktose'], group: 'fett', aliases: ['hartkäse'] },
  { name: 'Sahne', kcal: 308, diet: 'tierisch', allergens: ['laktose'], group: 'fett', aliases: ['schlagsahne', 'kochsahne'] },
  { name: 'Schmand', kcal: 206, diet: 'tierisch', allergens: ['laktose'], group: 'fett', aliases: ['saure sahne', 'crème fraîche', 'creme fraiche'] },
  { name: 'Butter', kcal: 747, el: 12, diet: 'tierisch', allergens: ['laktose'], group: 'fett' },

  // Fette, Süßes, Saaten
  { name: 'Öl', kcal: 899, el: 10, group: 'fett', aliases: ['olivenöl', 'rapsöl', 'sonnenblumenöl', 'sesamöl'] },
  { name: 'Kokosmilch light', kcal: 75, group: 'fett', aliases: ['kokosmilch fettreduziert'] },
  { name: 'Kokosmilch', kcal: 227, group: 'fett' },
  { name: 'Pesto', kcal: 542, el: 15, diet: 'tierisch', allergens: ['nuesse', 'laktose'], group: 'fett' },
  { name: 'Mayonnaise', kcal: 750, el: 15, diet: 'tierisch', allergens: ['ei'], group: 'fett', aliases: ['mayo'] },
  { name: 'Hummus', kcal: 324, el: 15, group: 'eiweiss' },
  { name: 'Nüsse', kcal: 638, el: 8, allergens: ['nuesse'], group: 'fett', aliases: ['walnüsse', 'mandeln', 'cashews', 'haselnüsse'] },
  { name: 'Erdnussbutter', kcal: 606, el: 15, allergens: ['nuesse'], group: 'fett', aliases: ['erdnussmus'] },
  { name: 'Chiasamen', kcal: 479, el: 12, group: 'fett', aliases: ['chia'] },
  { name: 'Leinsamen', kcal: 470, el: 10, group: 'fett' },
  { name: 'Zucker', kcal: 400, el: 15, group: 'suess', aliases: ['rohrzucker'] },
  { name: 'Honig', kcal: 305, el: 20, diet: 'tierisch', group: 'suess' },
  { name: 'Ahornsirup', kcal: 240, el: 20, group: 'suess', aliases: ['sirup', 'agavendicksaft'] },
  { name: 'Schokolade', kcal: 534, group: 'suess', aliases: ['zartbitterschokolade', 'schoko'] },

  // Gemüse und Obst
  { name: 'Tomaten', kcal: 22, piece: 100, group: 'gemuese', aliases: ['tomate', 'kirschtomaten', 'cherrytomaten'] },
  { name: 'Passierte Tomaten', kcal: 29, group: 'gemuese', aliases: ['gehackte tomaten', 'tomaten dose', 'dosentomaten'] },
  { name: 'Tomatenmark', kcal: 81, el: 15, group: 'gemuese' },
  { name: 'Zwiebel', kcal: 34, piece: 80, group: 'gemuese', aliases: ['zwiebeln', 'rote zwiebel', 'frühlingszwiebel', 'lauchzwiebel'] },
  { name: 'Knoblauch', kcal: 97, piece: 4, group: 'gemuese', aliases: ['knoblauchzehe', 'zehe'] },
  { name: 'Möhre', kcal: 40, piece: 80, group: 'gemuese', aliases: ['möhren', 'karotte', 'karotten'] },
  { name: 'Paprika', kcal: 36, piece: 150, group: 'gemuese', aliases: ['paprikaschote'] },
  { name: 'Zucchini', kcal: 22, piece: 250, group: 'gemuese' },
  { name: 'Brokkoli', kcal: 35, piece: 350, group: 'gemuese', aliases: ['broccoli'] },
  { name: 'Blumenkohl', kcal: 35, piece: 600, group: 'gemuese' },
  { name: 'Spinat', kcal: 18, group: 'gemuese', aliases: ['blattspinat'] },
  { name: 'Champignons', kcal: 28, group: 'gemuese', aliases: ['pilze', 'champignon'] },
  { name: 'Gurke', kcal: 16, piece: 400, group: 'gemuese', aliases: ['salatgurke'] },
  { name: 'Salat', kcal: 18, group: 'gemuese', aliases: ['eisbergsalat', 'rucola', 'blattsalat'] },
  { name: 'Erbsen', kcal: 77, group: 'gemuese', aliases: ['tk-erbsen'] },
  { name: 'Mais', kcal: 79, el: 15, group: 'gemuese', aliases: ['maiskörner'] },
  { name: 'Aubergine', kcal: 19, piece: 300, group: 'gemuese' },
  { name: 'Kürbis', kcal: 30, group: 'gemuese', aliases: ['hokkaido'] },
  { name: 'Avocado', kcal: 132, piece: 150, group: 'fett' },
  { name: 'Banane', kcal: 79, piece: 120, group: 'suess' },
  { name: 'Apfel', kcal: 58, piece: 150, group: 'suess', aliases: ['äpfel'] },
  { name: 'Beeren', kcal: 47, group: 'suess', aliases: ['heidelbeeren', 'himbeeren', 'erdbeeren', 'tk-beeren'] },
  { name: 'Zitrone', kcal: 40, piece: 100, group: 'sonst', aliases: ['zitronensaft', 'limette'] },

  // Fast ohne Kalorien
  { name: 'Salsa', kcal: 100, el: 15, group: 'sonst', aliases: ['tomatensalsa'] },
  { name: 'Gemüsebrühe', kcal: 4, group: 'sonst', aliases: ['brühe', 'wasser'] },
  { name: 'Sojasauce', kcal: 66, el: 15, allergens: ['soja', 'gluten'], group: 'sonst', aliases: ['sojasoße'] },
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

// Nährwerte pro 100 g aus dem BLS 4.0: kcal und [Eiweiß, Kohlenhydrate (verfügbar), Zucker gesamt, Fett, Ballaststoffe].
// Mehrere Codes (z. B. bei „Nüsse“ und „Beeren“) = Mittelwert dieser BLS-Einträge.
const BLS_VALUES = {
  'Nudeln': { bls: 'E401000', kcal: 346, p: [12.4, 68.8, 2.0, 1.6, 3.4] }, // Teigwaren eifrei, roh
  'Gekochter Reis': { bls: 'C352032', kcal: 117, p: [3.3, 24.8, 0.1, 0.4, 0.6] }, // Reis poliert, gekocht
  'Reis': { bls: 'C352000', kcal: 351, p: [7.9, 77.1, 0.3, 0.6, 2.5] }, // Reis poliert, roh
  'Kartoffeln': { bls: 'K110100', kcal: 83, p: [1.9, 17.9, 0.9, 0.1, 1.4] }, // Kartoffel geschält, roh
  'Süßkartoffel': { bls: 'K420100', kcal: 119, p: [1.6, 25.2, 5.5, 0.6, 3.1] }, // Batate/Süßkartoffel, roh
  'Haferflocken': { bls: 'C133000', kcal: 348, p: [13.2, 53.3, 0.7, 6.6, 11.0] }, // Hafer Flocken
  'Brot': { bls: 'B271000', kcal: 218, p: [7.4, 42.0, 1.3, 1.0, 6.1] }, // Roggenmischbrot
  'Toast': { bls: 'B314000', kcal: 261, p: [8.3, 46.8, 3.7, 3.6, 4.0] }, // Weizentoastbrot/Buttertoastbrot
  'Tortilla': { bls: 'B783012', kcal: 296, p: [8.8, 46.6, 1.3, 7.8, 1.2] }, // Weizentortilla
  'Couscous': { bls: 'C119200', kcal: 350, p: [11.7, 68.9, 1.1, 1.7, 6.2] }, // Couscous (Hartweizen) roh
  'Quinoa': { bls: 'C118000', kcal: 361, p: [12.6, 59.6, 1.8, 6.3, 7.6] }, // Quinoa weiß, roh
  'Mehl': { bls: 'C214100', kcal: 348, p: [10.5, 71.8, 0.3, 0.9, 5.3] }, // Weizen Mehl, Type 405
  'Linsen': { bls: 'H725100', kcal: 323, p: [23.4, 44.8, 1.3, 1.7, 17.6] }, // Linse reif
  'Kichererbsen': { bls: 'H720902', kcal: 136, p: [7.5, 15.5, 1.2, 2.7, 9.8] }, // Kichererbse reif, Konserve, abgetropft
  'Kidneybohnen': { bls: 'H742902', kcal: 128, p: [8.5, 15.1, 0.9, 1.0, 11.2] }, // Kidneybohne reif, Konserve, abgetropft
  'Tofu': { bls: 'H861000', kcal: 115, p: [15.5, 0.0, 0.0, 5.6, 1.3] }, // Tofu
  'Ei': { bls: 'E111100', kcal: 135, p: [13.2, 0.3, 0.3, 9.0, 0.0] }, // Hühnerei roh
  'Hähnchen': { bls: 'V416100', kcal: 109, p: [23.2, 0.0, 0.0, 1.8, 0.0] }, // Hähnchen Brustfilet, roh
  'Hackfleisch': { bls: 'U050100', kcal: 236, p: [18.8, 0.0, 0.0, 17.8, 0.0] }, // Rind/Schwein, Hackfleisch gemischt, roh
  'Rindfleisch': { bls: 'U284100', kcal: 110, p: [22.1, 0.0, 0.0, 2.4, 0.0] }, // Rind Hüfte, roh
  'Schinken': { bls: 'W424000', kcal: 130, p: [22.5, 0.7, 0.7, 3.7, 0.0] }, // Schwein Kochschinken, Kochpökelware
  'Speck': { bls: 'W415000', kcal: 304, p: [16.6, 0.5, 0.5, 26.2, 0.0] }, // Schwein Frühstücksspeck, Rohpökelware, geräuchert
  'Lachs': { bls: 'T410100', kcal: 180, p: [19.9, 0.0, 0.0, 11.2, 0.0] }, // Lachs roh
  'Thunfisch': { bls: 'T121902', kcal: 95, p: [22.9, 0.0, 0.0, 0.4, 0.0] }, // Thunfisch im eigenen Saft, Konserve, abgetropft
  'Garnelen': { bls: 'T753100', kcal: 87, p: [18.6, 0.0, 0.0, 1.4, 0.0] }, // Garnele/Granat/Krabbe, roh
  'Milch': { bls: 'M111200', kcal: 44, p: [3.5, 3.9, 3.9, 1.5, 0.0] }, // Milch fettarm, frisch, 1,5 % Fett, pasteurisiert
  'Haferdrink': { bls: 'C660000', kcal: 29, p: [0.7, 4.0, 3.8, 1.0, 0.4] }, // Haferdrink ungesüßt
  'Joghurt': { bls: 'M141300', kcal: 67, p: [4.0, 4.1, 4.1, 3.5, 0.0] }, // Joghurt mild, mind. 3,5 % Fett
  'Magerquark': { bls: 'M713100', kcal: 66, p: [11.8, 3.7, 3.7, 0.2, 0.0] }, // Speisequark Magerstufe, Magerquark < 10 % Fett i. Tr.
  'Frischkäse': { bls: 'M710800', kcal: 252, p: [6.6, 3.7, 3.7, 23.2, 0.0] }, // Frischkäsezubereitung Natur, mind. 60 % Fett i. Tr.
  'Feta': { bls: 'M012200', kcal: 284, p: [15.7, 0.0, 0.0, 24.1, 0.0] }, // Feta mind. 45 % Fett i. Tr.
  'Käse': { bls: 'M402600', kcal: 379, p: [22.5, 0.0, 0.0, 31.6, 0.0] }, // Gouda 48 % Fett i. Tr.
  'Mozzarella': { bls: 'M032100', kcal: 259, p: [17.1, 0.0, 0.0, 21.0, 0.0] }, // Mozzarella mind. 45 % Fett i. Tr.
  'Parmesan': { bls: 'M306400', kcal: 391, p: [35.6, 0.1, 0.1, 27.4, 0.0] }, // Parmesan mind. 30 % Fett i. Tr.
  'Sahne': { bls: 'M173800', kcal: 308, p: [2.3, 3.3, 3.3, 31.7, 0.0] }, // Schlagsahne mind. 30 % Fett
  'Schmand': { bls: 'M172700', kcal: 206, p: [2.8, 3.0, 3.0, 20.0, 0.0] }, // Sauerrahm/Schmand, mind. 20 % Fett
  'Butter': { bls: 'Q630000', kcal: 747, p: [0.6, 0.6, 0.6, 82.5, 0.0] }, // Süßrahmbutter
  'Öl': { bls: 'Q120000', kcal: 899, p: [0.0, 0.0, 0.0, 99.9, 0.0] }, // Olivenöl
  'Kokosmilch': { bls: 'H154000', kcal: 227, p: [2.8, 2.1, 2.1, 21.9, 5.0] }, // Kokosmilch/Kokosnussmilch
  'Pesto': { bls: 'X372012', kcal: 542, p: [6.7, 0.7, 0.7, 56.5, 2.1] }, // Pesto verde
  'Mayonnaise': { bls: 'Q991000', kcal: 750, p: [1.5, 2.3, 2.3, 81.2, 0.6] }, // Mayonnaise (Fertigprodukt)
  'Hummus': { bls: 'H960000', kcal: 324, p: [5.9, 8.0, 0.7, 28.5, 5.9] }, // Hummus/Kichererbsenmus
  'Nüsse': { bls: 'H120100+H210100+H170100+H130100', kcal: 638, p: [18.9, 9.3, 4.1, 56.9, 6.3] }, // Walnuss / Mandel süß / Cashewkern / Haselnuss
  'Erdnussbutter': { bls: 'H880200', kcal: 606, p: [24.1, 16.1, 11.7, 47.8, 7.4] }, // Erdnussbutter/Erdnusscreme
  'Chiasamen': { bls: 'H480100', kcal: 479, p: [22.1, 3.7, 0.5, 32.8, 40.2] }, // Chia-Samen
  'Leinsamen': { bls: 'H410100', kcal: 470, p: [22.3, 1.7, 1.2, 36.5, 22.7] }, // Leinsamen
  'Zucker': { bls: 'S111000', kcal: 400, p: [0.0, 100.0, 100.0, 0.0, 0.0] }, // Zucker weiß (Raffinadezucker/Weißzucker)
  'Honig': { bls: 'S120000', kcal: 305, p: [0.4, 74.1, 70.8, 0.0, 0.0] }, // Honig
  'Ahornsirup': { bls: 'S151100', kcal: 240, p: [0.0, 59.9, 59.9, 0.1, 0.0] }, // Ahornsirup
  'Schokolade': { bls: 'S560000', kcal: 534, p: [6.6, 49.6, 46.9, 32.3, 9.3] }, // Zartbitter-/Halbbitterschokolade
  'Tomaten': { bls: 'G561100', kcal: 22, p: [1.0, 3.2, 3.2, 0.1, 1.3] }, // Tomate roh
  'Passierte Tomaten': { bls: 'R161200', kcal: 29, p: [1.2, 3.9, 3.6, 0.1, 1.8] }, // Tomaten passiert/Tomatenpüree
  'Tomatenmark': { bls: 'R160000', kcal: 81, p: [3.4, 13.2, 12.9, 0.2, 4.7] }, // Tomatenmark
  'Zwiebel': { bls: 'G480100', kcal: 34, p: [1.2, 6.0, 6.0, 0.2, 1.4] }, // Speisezwiebel roh
  'Knoblauch': { bls: 'G490100', kcal: 97, p: [6.0, 3.0, 2.0, 0.4, 28.3] }, // Knoblauch roh
  'Möhre': { bls: 'G620100', kcal: 40, p: [0.8, 6.5, 6.4, 0.4, 2.9] }, // Karotte/Möhre, roh
  'Paprika': { bls: 'G543100', kcal: 36, p: [1.0, 6.2, 6.2, 0.2, 2.2] }, // Gemüsepaprika rot, roh
  'Zucchini': { bls: 'G582100', kcal: 22, p: [1.3, 3.0, 2.0, 0.3, 1.1] }, // Zucchini roh
  'Brokkoli': { bls: 'G312100', kcal: 35, p: [3.6, 2.3, 1.4, 0.6, 3.0] }, // Broccoli roh
  'Blumenkohl': { bls: 'G311100', kcal: 35, p: [2.4, 5.3, 2.2, 0.3, 2.9] }, // Blumenkohl roh
  'Spinat': { bls: 'G211100', kcal: 18, p: [2.1, 0.9, 0.8, 0.3, 1.8] }, // Spinat roh
  'Champignons': { bls: 'K701100', kcal: 28, p: [3.7, 2.9, 0.2, 0.3, 1.9] }, // Champignon roh
  'Gurke': { bls: 'G520100', kcal: 16, p: [1.1, 2.0, 2.0, 0.2, 0.9] }, // Gurke roh
  'Salat': { bls: 'G105100', kcal: 18, p: [1.5, 1.7, 1.7, 0.2, 1.4] }, // Kopfsalat roh
  'Erbsen': { bls: 'G760200', kcal: 77, p: [4.9, 10.0, 5.4, 0.7, 5.3] }, // Erbse grün, tiefgefroren
  'Mais': { bls: 'G570902', kcal: 79, p: [2.7, 10.8, 6.2, 1.9, 3.6] }, // Zuckermais Konserve, abgetropft
  'Aubergine': { bls: 'G510100', kcal: 19, p: [0.6, 3.0, 2.7, 0.2, 1.4] }, // Aubergine roh
  'Kürbis': { bls: 'G581000', kcal: 30, p: [1.4, 5.3, 4.6, 0.2, 0.8] }, // Kürbis Hokkaido (C. maxima) roh
  'Avocado': { bls: 'F502100', kcal: 132, p: [1.4, 1.4, 1.4, 12.5, 4.1] }, // Avocado roh
  'Banane': { bls: 'F503100', kcal: 79, p: [1.3, 15.9, 13.9, 0.4, 2.0] }, // Banane roh
  'Apfel': { bls: 'F110100', kcal: 58, p: [0.4, 11.7, 10.5, 0.5, 2.3] }, // Apfel roh
  'Beeren': { bls: 'F301100+F302100+F304100', kcal: 47, p: [0.8, 6.9, 6.9, 0.4, 3.9] }, // Erdbeere roh / Himbeere roh / Heidelbeere roh
  'Zitrone': { bls: 'F601100', kcal: 40, p: [0.7, 3.2, 3.2, 0.4, 1.3] }, // Zitrone roh
  'Salsa': { bls: 'X3A7040', kcal: 100, p: [0.9, 2.7, 2.7, 9.1, 1.1] }, // Spanische Sauce (Salsa)
  'Gemüsebrühe': { bls: 'X416243', kcal: 4, p: [0.3, 0.5, 0.5, 0.1, 0.0] }, // Gemüsebrühe
  'Sojasauce': { bls: 'R143000', kcal: 66, p: [6.3, 5.5, 4.9, 0.9, 1.1] }, // Sojasauce/Sojasoße
};

// Ohne passenden BLS-Eintrag: Kokosmilch light (fettreduzierte Kokosmilch gibt es im BLS nicht) und Gewürze (in kleinen Mengen vernachlässigt).
export const NOT_FROM_BLS = ['Kokosmilch light', 'Gewürze'];
const NOT_FROM_BLS_VALUES = { 'Kokosmilch light': [0.8, 2, 1.5, 7, 0.2], 'Gewürze': [0, 0, 0, 0, 0] };

// [Eiweiß, Kohlenhydrate, Zucker, Fruktose, Fett, Ballaststoffe]; Fruktose steht nicht im verwendeten BLS-Auszug und bleibt 0.
const NUTR = {};
for (const [name, v] of Object.entries(BLS_VALUES)) NUTR[name] = [v.p[0], v.p[1], v.p[2], 0, v.p[3], v.p[4]];
for (const [name, v] of Object.entries(NOT_FROM_BLS_VALUES)) NUTR[name] = [v[0], v[1], v[2], 0, v[3], v[4]];

// Zugesetzter Zucker (WHO „freier Zucker“): nur Zutaten, deren Zucker per Definition zugesetzt ist.
// Der BLS trennt zugesetzten Zucker nicht aus, deshalb zählen Brot, Salsa usw. hier nicht mit.
const ADDED_SUGAR = { 'Zucker': 1, 'Honig': 1, 'Ahornsirup': 1, 'Schokolade': 1 };

// Gramm pro Handvoll, Dose (abgetropft) und Scheibe
const HAND = { 'Spinat': 30, 'Beeren': 70, 'Erbsen': 60, 'Salat': 30, 'Gewürze': 10, 'Nüsse': 25, 'Champignons': 50 };
const DOSE = { 'Kichererbsen': 240, 'Kidneybohnen': 240, 'Passierte Tomaten': 400, 'Tomaten': 400, 'Thunfisch': 150, 'Mais': 140, 'Kokosmilch': 400, 'Kokosmilch light': 400 };
const SCHEIBE = { 'Brot': 50, 'Toast': 25, 'Käse': 20, 'Schinken': 20 };

export const NUTRIENTS = [
  { id: 'protein', name: 'Eiweiß' },
  { id: 'kh', name: 'Kohlenhydrate' },
  { id: 'zucker', name: 'davon Zucker' },
  { id: 'zugesetzt', name: 'zugesetzter Zucker' },
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
