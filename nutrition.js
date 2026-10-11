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
  { name: 'Lachs', kcal: 200, diet: 'fisch', allergens: ['fisch'], group: 'eiweiss', aliases: ['lachsfilet'] },
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
  { name: 'Kokosmilch', kcal: 180, group: 'fett', aliases: ['kokosmilch light'] },
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
  { name: 'Brokkoli', kcal: 35, piece: 400, group: 'gemuese', aliases: ['broccoli'] },
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
  for (const f of FOODS) {
    const keys = [f.name, ...(f.aliases || [])].map(norm);
    if (keys.some((k) => k.length >= 3 && (n.includes(k) || k.includes(n) && n.length >= 4))) return f;
  }
  return null;
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
