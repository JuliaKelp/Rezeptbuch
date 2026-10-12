// Rezepte: einfach, max. 30 Minuten, ohne ausgefallene Zutaten.
// kcal und Nährwerte werden beim Start aus den Zutaten berechnet (BLS 4.0, siehe nutrition.js).
//
// diet:      'vegan' | 'vegetarisch' | 'fisch' | 'fleisch'
// allergens: 'gluten' | 'laktose' | 'ei' | 'soja' | 'nuesse' | 'fisch'
// foods:     Lebensmittel aus der Geschmacksabfrage (für Vorlieben)
// prep:      wird vorher vorbereitet; serve = Minuten, die man zur Mahlzeit noch braucht
// mealprep:  eignet sich zum doppelt Kochen und Mitnehmen

export const RECIPES = [
  {
    id: 'overnight-oats',
    name: 'Overnight Oats mit Beeren',
    meals: ['fruehstueck'],
    time: 5, serve: 0, prep: true,
    kcal: 380,
    diet: 'vegetarisch',
    allergens: ['gluten', 'laktose'],
    foods: ['Haferflocken', 'Joghurt', 'Beeren'],
    ingredients: ['50 g Haferflocken', '150 g Joghurt', '50 ml Milch', '1 Handvoll Beeren (auch TK)', '1 TL Honig'],
    steps: [
      'Haferflocken, Joghurt und Milch in einem Glas verrühren.',
      'Honig unterrühren, Beeren obendrauf.',
      'Deckel drauf und über Nacht in den Kühlschrank.',
      'Morgens direkt aus dem Glas essen.'
    ],
    tint: '#F2D4DC'
  },
  {
    id: 'overnight-oats-vegan',
    name: 'Vegane Overnight Oats mit Banane',
    meals: ['fruehstueck'],
    time: 5, serve: 0, prep: true,
    kcal: 360,
    diet: 'vegan',
    allergens: ['gluten'],
    foods: ['Haferflocken', 'Banane'],
    ingredients: ['50 g Haferflocken', '150 ml Haferdrink', '1 Banane', '1 EL Leinsamen', 'etwas Zimt'],
    steps: [
      'Banane mit einer Gabel zerdrücken.',
      'Mit Haferflocken, Haferdrink, Leinsamen und Zimt verrühren.',
      'Über Nacht in den Kühlschrank stellen.',
      'Morgens umrühren und genießen.'
    ],
    tint: '#F5E6B8'
  },
  {
    id: 'chia-pudding',
    name: 'Chia-Pudding mit Kokosmilch',
    meals: ['fruehstueck'],
    time: 5, serve: 0, prep: true,
    kcal: 320,
    diet: 'vegan',
    allergens: [],
    foods: ['Beeren'],
    ingredients: ['3 EL Chiasamen', '150 ml Kokosmilch (light)', '1 TL Ahornsirup', '1 Handvoll Beeren'],
    steps: [
      'Chiasamen, Kokosmilch und Ahornsirup in ein Glas geben.',
      'Gut umrühren, nach 5 Minuten nochmal rühren.',
      'Über Nacht kalt stellen.',
      'Morgens Beeren darauf verteilen.'
    ],
    tint: '#E3DCF2'
  },
  {
    id: 'joghurt-bowl',
    name: 'Joghurt mit Obst und Haferflocken',
    meals: ['fruehstueck'],
    time: 5,
    kcal: 310,
    diet: 'vegetarisch',
    allergens: ['gluten', 'laktose'],
    foods: ['Joghurt', 'Haferflocken', 'Banane', 'Beeren'],
    ingredients: ['200 g Joghurt', '3 EL Haferflocken', '½ Banane', '1 Handvoll Beeren'],
    steps: [
      'Joghurt in eine Schüssel geben.',
      'Banane in Scheiben schneiden.',
      'Obst und Haferflocken darüberstreuen.'
    ],
    tint: '#DDEAF4'
  },
  {
    id: 'avocado-brot',
    name: 'Avocado-Brot mit Tomate',
    meals: ['fruehstueck', 'mittag'],
    time: 5,
    kcal: 350,
    diet: 'vegan',
    allergens: ['gluten'],
    foods: ['Avocado', 'Tomaten', 'Brot'],
    ingredients: ['2 Scheiben Vollkornbrot', '½ Avocado', '1 Tomate', 'Salz, Pfeffer, Zitronensaft'],
    steps: [
      'Brot toasten.',
      'Avocado mit Salz, Pfeffer und Zitrone zerdrücken.',
      'Aufs Brot streichen, Tomatenscheiben drauf.'
    ],
    tint: '#DCE8C8'
  },
  {
    id: 'ruehrei-spinat',
    name: 'Rührei mit Spinat auf Brot',
    meals: ['fruehstueck', 'mittag'],
    time: 10,
    kcal: 400,
    diet: 'vegetarisch',
    allergens: ['ei', 'gluten'],
    foods: ['Eier', 'Spinat', 'Brot'],
    ingredients: ['3 Eier', '1 Handvoll Spinat', '1 Scheibe Vollkornbrot', '1 TL Öl', 'Salz, Pfeffer'],
    steps: [
      'Eier mit Salz und Pfeffer verquirlen.',
      'Spinat in Öl kurz zusammenfallen lassen.',
      'Eier dazugeben und unter Rühren stocken lassen.',
      'Auf dem Brot servieren.'
    ],
    tint: '#F5E1A4'
  },
  {
    id: 'bananen-pfannkuchen',
    name: 'Bananen-Pfannkuchen',
    meals: ['fruehstueck'],
    time: 15,
    kcal: 380,
    diet: 'vegetarisch',
    allergens: ['ei', 'gluten'],
    foods: ['Banane', 'Eier', 'Haferflocken'],
    ingredients: ['1 reife Banane', '2 Eier', '3 EL Haferflocken', '1 TL Öl'],
    steps: [
      'Banane zerdrücken, mit Eiern und Haferflocken verrühren.',
      'Öl in einer Pfanne erhitzen.',
      'Kleine Pfannkuchen je 2 Minuten pro Seite braten.'
    ],
    tint: '#F7DDB8'
  },
  {
    id: 'porridge-apfel',
    name: 'Porridge mit Apfel und Zimt',
    meals: ['fruehstueck'],
    time: 10,
    kcal: 330,
    diet: 'vegetarisch',
    allergens: ['gluten', 'laktose'],
    foods: ['Haferflocken'],
    ingredients: ['50 g Haferflocken', '250 ml Milch', '½ Apfel', 'etwas Zimt'],
    steps: [
      'Haferflocken mit Milch in einen Topf geben.',
      'Unter Rühren 5 Minuten köcheln lassen.',
      'Apfel klein würfeln und unterheben.',
      'Mit Zimt bestreuen.'
    ],
    tint: '#F2D4DC'
  },
  {
    id: 'porridge-vegan-beeren',
    name: 'Veganes Porridge mit Beeren',
    meals: ['fruehstueck'],
    time: 10,
    kcal: 300,
    diet: 'vegan',
    allergens: ['gluten'],
    foods: ['Haferflocken', 'Beeren'],
    ingredients: ['50 g Haferflocken', '250 ml Haferdrink', '1 Handvoll Beeren (auch TK)', '1 TL Ahornsirup'],
    steps: [
      'Haferflocken mit Haferdrink aufkochen.',
      '5 Minuten unter Rühren köcheln lassen.',
      'Beeren und Ahornsirup darauf.'
    ],
    tint: '#F5E6B8'
  },
  {
    id: 'quark-beeren-bowl',
    name: 'Quark-Bowl mit Beeren',
    meals: ['fruehstueck'],
    time: 5,
    kcal: 260,
    diet: 'vegetarisch',
    allergens: ['gluten', 'laktose'],
    foods: ['Quark', 'Beeren', 'Haferflocken'],
    ingredients: ['200 g Magerquark', '50 ml Milch', '1 Handvoll Beeren (auch TK)', '2 EL Haferflocken', '1 TL Honig'],
    steps: [
      'Quark mit Milch cremig rühren.',
      'Beeren und Haferflocken darüber.',
      'Mit Honig beträufeln.'
    ],
    tint: '#E3DCF2'
  },
  {
    id: 'ruehrei-tomate',
    name: 'Rührei mit Tomate auf Brot',
    meals: ['fruehstueck'],
    time: 10,
    kcal: 320,
    diet: 'vegetarisch',
    allergens: ['gluten', 'laktose', 'ei'],
    foods: ['Eier', 'Tomaten', 'Brot'],
    ingredients: ['2 Eier', '1 Tomate', '1 Scheibe Vollkornbrot', '1 TL Butter', 'Salz, Pfeffer, Schnittlauch'],
    steps: [
      'Eier mit Salz und Pfeffer verquirlen.',
      'Tomate würfeln.',
      'Butter in der Pfanne schmelzen, Eier und Tomate darin langsam stocken lassen.',
      'Auf dem Brot servieren, Schnittlauch darüber.'
    ],
    tint: '#DDEAF4'
  },
  {
    id: 'tofu-ruehrei',
    name: 'Tofu-Rührei mit Paprika',
    meals: ['fruehstueck'],
    time: 10,
    kcal: 340,
    diet: 'vegan',
    allergens: ['gluten', 'soja'],
    foods: ['Tofu', 'Paprika', 'Spinat', 'Brot'],
    ingredients: ['150 g Tofu', '½ Paprika', '1 Handvoll Spinat', '1 TL Öl', '1 Scheibe Vollkornbrot', 'Salz, Pfeffer, Kurkuma'],
    steps: [
      'Tofu mit einer Gabel zerbröseln.',
      'Paprika würfeln und in Öl 2 Minuten braten.',
      'Tofu und Gewürze dazu, 3 Minuten mitbraten.',
      'Spinat kurz unterheben, mit Brot essen.'
    ],
    tint: '#DCE8C8'
  },
  {
    id: 'frischkaese-brot-gurke',
    name: 'Frischkäse-Brot mit Gurke',
    meals: ['fruehstueck'],
    time: 5,
    kcal: 330,
    diet: 'vegetarisch',
    allergens: ['gluten', 'laktose'],
    foods: ['Brot', 'Gurke'],
    ingredients: ['2 Scheiben Vollkornbrot', '2 EL Frischkäse', '½ Gurke', 'Schnittlauch, Pfeffer'],
    steps: [
      'Brot mit Frischkäse bestreichen.',
      'Gurke in Scheiben schneiden und darauflegen.',
      'Mit Schnittlauch und Pfeffer bestreuen.'
    ],
    tint: '#F5E1A4'
  },
  {
    id: 'hummus-brot-tomate',
    name: 'Hummus-Brot mit Tomate',
    meals: ['fruehstueck'],
    time: 5,
    kcal: 390,
    diet: 'vegan',
    allergens: ['gluten'],
    foods: ['Brot', 'Tomaten'],
    ingredients: ['2 Scheiben Vollkornbrot', '3 EL Hummus', '1 Tomate', 'Salz, Pfeffer'],
    steps: [
      'Brot mit Hummus bestreichen.',
      'Tomate in Scheiben darauflegen.',
      'Mit Salz und Pfeffer würzen.'
    ],
    tint: '#F7DDB8'
  },
  {
    id: 'erdnuss-bananen-toast',
    name: 'Toast mit Erdnussbutter und Banane',
    meals: ['fruehstueck'],
    time: 5,
    kcal: 320,
    diet: 'vegan',
    allergens: ['gluten', 'nuesse'],
    foods: ['Banane'],
    ingredients: ['2 Scheiben Toast', '1 EL Erdnussbutter', '1 Banane'],
    steps: [
      'Toast toasten.',
      'Mit Erdnussbutter bestreichen.',
      'Banane in Scheiben darauflegen.'
    ],
    tint: '#F3C9A8'
  },
  {
    id: 'avocado-toast-ei',
    name: 'Avocado-Toast mit Spiegelei',
    meals: ['fruehstueck'],
    time: 10,
    kcal: 340,
    diet: 'vegetarisch',
    allergens: ['gluten', 'ei'],
    foods: ['Avocado', 'Eier'],
    ingredients: ['2 Scheiben Toast', '½ Avocado', '1 Ei', '1 TL Öl', 'Salz, Pfeffer, Zitronensaft'],
    steps: [
      'Toast toasten.',
      'Avocado mit Salz, Pfeffer und Zitrone zerdrücken und aufstreichen.',
      'Ei in Öl als Spiegelei braten.',
      'Ei auf den Toast legen.'
    ],
    tint: '#F5D9A0'
  },
  {
    id: 'omelett-schinken-kaese',
    name: 'Omelett mit Schinken und Käse',
    meals: ['fruehstueck'],
    time: 10,
    kcal: 320,
    diet: 'fleisch',
    allergens: ['laktose', 'ei'],
    foods: ['Eier', 'Käse'],
    ingredients: ['2 Eier', '2 Scheiben Kochschinken', '1 Scheibe Käse', '1 TL Butter', 'Salz, Pfeffer'],
    steps: [
      'Eier mit Salz und Pfeffer verquirlen.',
      'Schinken in Streifen schneiden.',
      'Butter in der Pfanne schmelzen, Eier hineingießen.',
      'Schinken und Käse darauf, zuklappen, wenn die Eier fest sind.'
    ],
    tint: '#F7D2B0'
  },
  {
    id: 'bircher-muesli',
    name: 'Bircher-Müsli mit Apfel',
    meals: ['fruehstueck'],
    time: 5, serve: 0, prep: true,
    kcal: 390,
    diet: 'vegetarisch',
    allergens: ['gluten', 'laktose', 'nuesse'],
    foods: ['Haferflocken', 'Joghurt'],
    ingredients: ['40 g Haferflocken', '100 ml Milch', '100 g Joghurt', '1 Apfel', '1 EL Nüsse'],
    steps: [
      'Haferflocken, Milch und Joghurt verrühren.',
      'Apfel grob reiben und unterrühren.',
      'Über Nacht in den Kühlschrank stellen.',
      'Morgens Nüsse darüberstreuen.'
    ],
    tint: '#F2D4DC'
  },
  {
    id: 'overnight-oats-erdnuss',
    name: 'Overnight Oats mit Erdnussbutter',
    meals: ['fruehstueck'],
    time: 5, serve: 0, prep: true,
    kcal: 360,
    diet: 'vegan',
    allergens: ['gluten', 'nuesse'],
    foods: ['Haferflocken', 'Banane'],
    ingredients: ['50 g Haferflocken', '150 ml Haferdrink', '1 EL Erdnussbutter', '½ Banane'],
    steps: [
      'Haferflocken, Haferdrink und Erdnussbutter in einem Glas verrühren.',
      'Über Nacht in den Kühlschrank stellen.',
      'Morgens Banane in Scheiben darauf.'
    ],
    tint: '#F5E6B8'
  },
  {
    id: 'chia-joghurt',
    name: 'Chia-Joghurt mit Beeren',
    meals: ['fruehstueck'],
    time: 5, serve: 0, prep: true,
    kcal: 270,
    diet: 'vegetarisch',
    allergens: ['laktose'],
    foods: ['Joghurt', 'Beeren'],
    ingredients: ['2 EL Chiasamen', '150 g Joghurt', '50 ml Milch', '1 Handvoll Beeren (auch TK)'],
    steps: [
      'Chiasamen, Joghurt und Milch in einem Glas verrühren.',
      'Über Nacht kalt stellen.',
      'Morgens Beeren darauf verteilen.'
    ],
    tint: '#E3DCF2'
  },
  {
    id: 'pfannkuchen-beeren',
    name: 'Pfannkuchen mit Beeren',
    meals: ['fruehstueck'],
    time: 15,
    kcal: 360,
    diet: 'vegetarisch',
    allergens: ['gluten', 'laktose', 'ei'],
    foods: ['Eier', 'Beeren'],
    ingredients: ['50 g Mehl', '1 Ei', '100 ml Milch', '1 TL Öl', '1 Handvoll Beeren (auch TK)'],
    steps: [
      'Mehl, Ei und Milch glatt rühren.',
      'Öl in einer Pfanne erhitzen.',
      'Teig in zwei Portionen goldbraun backen, einmal wenden.',
      'Mit Beeren servieren.'
    ],
    tint: '#DDEAF4'
  },
  {
    id: 'pfannkuchen-vegan',
    name: 'Vegane Bananen-Pfannkuchen',
    meals: ['fruehstueck'],
    time: 15,
    kcal: 300,
    diet: 'vegan',
    allergens: ['gluten'],
    foods: ['Banane'],
    ingredients: ['50 g Mehl', '100 ml Haferdrink', '½ Banane', '1 TL Öl', '1 TL Ahornsirup'],
    steps: [
      'Banane zerdrücken, mit Mehl und Haferdrink verrühren.',
      'Öl in einer Pfanne erhitzen.',
      'Kleine Pfannkuchen je 2 Minuten pro Seite backen.',
      'Mit Ahornsirup beträufeln.'
    ],
    tint: '#DCE8C8'
  },
  {
    id: 'ruehrei-wrap',
    name: 'Rührei-Wrap mit Paprika',
    meals: ['fruehstueck'],
    time: 10,
    kcal: 420,
    diet: 'vegetarisch',
    allergens: ['gluten', 'laktose', 'ei'],
    foods: ['Eier', 'Paprika', 'Käse'],
    ingredients: ['1 Tortilla', '2 Eier', '½ Paprika', '1 EL geriebener Käse', 'Salz, Pfeffer'],
    steps: [
      'Paprika würfeln und in der Pfanne 2 Minuten braten.',
      'Eier verquirlen, dazugeben und stocken lassen.',
      'Tortilla kurz in der Pfanne erwärmen.',
      'Rührei und Käse daraufgeben und einrollen.'
    ],
    tint: '#F5E1A4'
  },
  {
    id: 'tofu-burrito',
    name: 'Frühstücks-Burrito mit Tofu und Bohnen',
    meals: ['fruehstueck'],
    time: 10,
    kcal: 380,
    diet: 'vegan',
    allergens: ['gluten', 'soja'],
    foods: ['Tofu', 'Bohnen'],
    ingredients: ['1 Tortilla', '100 g Tofu', '3 EL schwarze Bohnen', '2 EL Salsa', 'Salz, Paprikapulver'],
    steps: [
      'Tofu zerbröseln und mit Paprikapulver und Salz anbraten.',
      'Bohnen abspülen und 1 Minute mitbraten.',
      'Alles mit Salsa auf die Tortilla geben.',
      'Einrollen und warm essen.'
    ],
    tint: '#F7DDB8'
  },
  {
    id: 'joghurt-apfel-nuss',
    name: 'Joghurt mit Apfel und Nüssen',
    meals: ['fruehstueck'],
    time: 5,
    kcal: 290,
    diet: 'vegetarisch',
    allergens: ['laktose', 'nuesse'],
    foods: ['Joghurt'],
    ingredients: ['200 g Joghurt', '1 Apfel', '1 EL Nüsse', '1 TL Honig'],
    steps: [
      'Apfel klein schneiden.',
      'Mit Joghurt in eine Schüssel geben.',
      'Nüsse und Honig darüber.'
    ],
    tint: '#F3C9A8'
  },
  {
    id: 'quarkbrot-beeren',
    name: 'Quarkbrot mit Beeren',
    meals: ['fruehstueck'],
    time: 5,
    kcal: 320,
    diet: 'vegetarisch',
    allergens: ['gluten', 'laktose'],
    foods: ['Brot', 'Quark', 'Beeren'],
    ingredients: ['2 Scheiben Vollkornbrot', '100 g Magerquark', '1 Handvoll Beeren (auch TK)'],
    steps: [
      'Quark mit einem Schluck Wasser glatt rühren.',
      'Aufs Brot streichen.',
      'Beeren darauf verteilen und leicht andrücken.'
    ],
    tint: '#F5D9A0'
  },
  {
    id: 'smoothie-bowl',
    name: 'Beeren-Smoothie-Bowl',
    meals: ['fruehstueck'],
    time: 5,
    kcal: 250,
    diet: 'vegetarisch',
    allergens: ['gluten', 'laktose'],
    foods: ['Banane', 'Beeren', 'Joghurt', 'Haferflocken'],
    ingredients: ['1 Banane', '1 Handvoll Beeren (auch TK)', '100 g Joghurt', '2 EL Haferflocken'],
    steps: [
      'Banane, Beeren und Joghurt pürieren.',
      'In eine Schüssel füllen.',
      'Haferflocken darüberstreuen.'
    ],
    tint: '#F7D2B0'
  },
  {
    id: 'gruener-smoothie',
    name: 'Grüner Smoothie mit Banane',
    meals: ['fruehstueck'],
    time: 5,
    kcal: 210,
    diet: 'vegan',
    allergens: ['gluten'],
    foods: ['Banane', 'Spinat'],
    ingredients: ['1 Banane', '1 Handvoll Spinat', '200 ml Haferdrink', '1 EL Leinsamen'],
    steps: [
      'Alles in einen hohen Becher geben.',
      'Fein pürieren.',
      'Sofort trinken.'
    ],
    tint: '#F2D4DC'
  },
  {
    id: 'mozzarella-brot',
    name: 'Tomate-Mozzarella-Brot',
    meals: ['fruehstueck'],
    time: 5,
    kcal: 400,
    diet: 'vegetarisch',
    allergens: ['gluten', 'laktose'],
    foods: ['Brot', 'Käse', 'Tomaten'],
    ingredients: ['2 Scheiben Vollkornbrot', '½ Mozzarella', '1 Tomate', 'Basilikum, Salz, Pfeffer'],
    steps: [
      'Mozzarella und Tomate in Scheiben schneiden.',
      'Abwechselnd aufs Brot legen.',
      'Mit Basilikum, Salz und Pfeffer würzen.'
    ],
    tint: '#F5E6B8'
  },
  {
    id: 'pilz-ruehrei',
    name: 'Rührei mit Champignons',
    meals: ['fruehstueck'],
    time: 10,
    kcal: 330,
    diet: 'vegetarisch',
    allergens: ['gluten', 'laktose', 'ei'],
    foods: ['Eier', 'Pilze', 'Brot'],
    ingredients: ['2 Eier', '100 g Champignons', '1 TL Butter', '1 Scheibe Vollkornbrot', 'Salz, Pfeffer'],
    steps: [
      'Champignons in Scheiben schneiden und in Butter 3 Minuten braten.',
      'Eier verquirlen und dazugeben.',
      'Unter Rühren stocken lassen.',
      'Mit Brot servieren.'
    ],
    tint: '#E3DCF2'
  },
  {
    id: 'linsen-bolognese',
    name: 'Linsen-Bolognese',
    meals: ['mittag', 'abend'],
    time: 25, mealprep: true,
    kcal: 520,
    diet: 'vegan',
    allergens: ['gluten'],
    foods: ['Linsen', 'Nudeln', 'Tomaten'],
    ingredients: ['80 g Nudeln', '50 g rote Linsen', '1 Zwiebel', '1 Möhre', '200 g passierte Tomaten', '1 TL Öl', 'Salz, Pfeffer, Oregano'],
    steps: [
      'Zwiebel und Möhre klein würfeln.',
      'In Öl 3 Minuten anbraten.',
      'Linsen, Tomaten und 200 ml Wasser dazu.',
      '15 Minuten köcheln, ab und zu umrühren.',
      'Nudeln kochen und alles zusammen servieren.'
    ],
    tint: '#F3C9A8'
  },
  {
    id: 'kichererbsen-curry',
    name: 'Kichererbsen-Curry mit Reis',
    meals: ['mittag', 'abend'],
    time: 25, mealprep: true,
    kcal: 550,
    diet: 'vegan',
    allergens: [],
    foods: ['Kichererbsen', 'Reis', 'Spinat', 'Tomaten'],
    ingredients: ['60 g Reis', '½ Dose Kichererbsen', '1 Zwiebel', '200 g gehackte Tomaten', '100 ml Kokosmilch (light)', '1 Handvoll Spinat', '1 TL Currypulver'],
    steps: [
      'Reis nach Packung kochen.',
      'Zwiebel würfeln und mit Curry in Öl 2 Minuten anbraten.',
      'Kichererbsen, Tomaten und Kokosmilch dazugeben.',
      '10 Minuten köcheln lassen.',
      'Spinat unterheben und mit Reis servieren.'
    ],
    tint: '#F5D9A0'
  },
  {
    id: 'gemuese-omelett',
    name: 'Gemüse-Omelett mit Feta',
    meals: ['mittag', 'abend'],
    time: 15,
    kcal: 420,
    diet: 'vegetarisch',
    allergens: ['ei', 'laktose'],
    foods: ['Eier', 'Paprika', 'Spinat', 'Feta'],
    ingredients: ['3 Eier', '1 Paprika', '1 Handvoll Spinat', '40 g Feta', '1 TL Öl', 'Salz, Pfeffer'],
    steps: [
      'Paprika würfeln, Spinat waschen.',
      'Eier mit Salz und Pfeffer verquirlen.',
      'Paprika in Öl 3 Minuten braten.',
      'Spinat und Eier dazu, Deckel drauf.',
      'Feta darüberbröseln, 5 Minuten stocken lassen.'
    ],
    tint: '#F5E1A4'
  },
  {
    id: 'ofenkartoffeln-quark',
    name: 'Ofenkartoffeln mit Kräuterquark',
    meals: ['mittag', 'abend'],
    time: 30,
    kcal: 450,
    diet: 'vegetarisch',
    allergens: ['laktose'],
    foods: ['Kartoffeln', 'Quark'],
    ingredients: ['400 g kleine Kartoffeln', '150 g Magerquark', '2 EL Milch', 'Schnittlauch oder TK-Kräuter', '1 EL Öl', 'Salz'],
    steps: [
      'Ofen auf 220 °C vorheizen.',
      'Kartoffeln halbieren, mit Öl und Salz mischen.',
      '25 Minuten auf dem Blech backen.',
      'Quark mit Milch, Kräutern und Salz verrühren.',
      'Kartoffeln mit dem Quark servieren.'
    ],
    tint: '#DCE8C8'
  },
  {
    id: 'tomatensuppe',
    name: 'Schnelle Tomatensuppe mit Brot',
    meals: ['mittag', 'abend'],
    time: 20, mealprep: true,
    kcal: 350,
    diet: 'vegan',
    allergens: ['gluten'],
    foods: ['Tomaten', 'Brot'],
    ingredients: ['1 Dose gehackte Tomaten', '1 Zwiebel', '1 Knoblauchzehe', '200 ml Gemüsebrühe', '1 Scheibe Brot', '1 TL Öl'],
    steps: [
      'Zwiebel und Knoblauch würfeln und in Öl andünsten.',
      'Tomaten und Brühe dazu, 10 Minuten köcheln.',
      'Mit dem Pürierstab fein pürieren.',
      'Mit Salz und Pfeffer abschmecken, Brot dazu.'
    ],
    tint: '#F2C2B5'
  },
  {
    id: 'gebratener-reis',
    name: 'Gebratener Reis mit Gemüse und Ei',
    meals: ['mittag', 'abend'],
    time: 20, mealprep: true,
    kcal: 500,
    diet: 'vegetarisch',
    allergens: ['ei', 'soja'],
    foods: ['Reis', 'Eier', 'Paprika', 'Erbsen'],
    ingredients: ['150 g gekochter Reis (gern vom Vortag)', '2 Eier', '1 Paprika', '1 Handvoll TK-Erbsen', '1 EL Sojasauce', '1 TL Öl'],
    steps: [
      'Paprika würfeln.',
      'Paprika und Erbsen in Öl 4 Minuten braten.',
      'Reis dazu und 3 Minuten mitbraten.',
      'Eier darüber, kurz rühren, bis sie stocken.',
      'Mit Sojasauce abschmecken.'
    ],
    tint: '#F5E1A4'
  },
  {
    id: 'tofu-pfanne',
    name: 'Tofu-Gemüse-Pfanne mit Reis',
    meals: ['mittag', 'abend'],
    time: 25, mealprep: true,
    kcal: 480,
    diet: 'vegan',
    allergens: ['soja'],
    foods: ['Tofu', 'Brokkoli', 'Paprika', 'Reis'],
    ingredients: ['60 g Reis', '150 g Tofu natur', '1 kleiner Brokkoli', '1 Paprika', '2 EL Sojasauce', '1 TL Öl'],
    steps: [
      'Reis nach Packung kochen.',
      'Tofu würfeln und in Öl knusprig braten.',
      'Brokkoli und Paprika klein schneiden und 5 Minuten mitbraten.',
      'Mit Sojasauce ablöschen.',
      'Mit dem Reis servieren.'
    ],
    tint: '#DCE8C8'
  },
  {
    id: 'bohnen-wraps',
    name: 'Wraps mit Bohnen und Mais',
    meals: ['mittag', 'abend'],
    time: 15,
    kcal: 520,
    diet: 'vegan',
    allergens: ['gluten'],
    foods: ['Bohnen', 'Mais', 'Paprika', 'Avocado'],
    ingredients: ['2 Weizen-Tortillas', '½ Dose Kidneybohnen', '3 EL Mais', '1 Paprika', '½ Avocado', 'etwas Salsa'],
    steps: [
      'Bohnen und Mais abspülen.',
      'Paprika in Streifen, Avocado in Scheiben schneiden.',
      'Tortillas kurz in der Pfanne erwärmen.',
      'Alles einfüllen, Salsa drauf, einrollen.'
    ],
    tint: '#F3C9A8'
  },
  {
    id: 'couscous-salat',
    name: 'Couscous-Salat mit Feta',
    meals: ['mittag', 'abend'],
    time: 15, mealprep: true,
    kcal: 450,
    diet: 'vegetarisch',
    allergens: ['gluten', 'laktose'],
    foods: ['Couscous', 'Gurke', 'Tomaten', 'Feta'],
    ingredients: ['70 g Couscous', '½ Gurke', '1 Tomate', '40 g Feta', '1 EL Olivenöl', 'Zitronensaft, Salz'],
    steps: [
      'Couscous mit heißem Wasser übergießen, 5 Minuten quellen lassen.',
      'Gurke und Tomate würfeln.',
      'Alles mischen, Feta darüberbröseln.',
      'Mit Öl, Zitrone und Salz anmachen.'
    ],
    tint: '#E6EFD0'
  },
  {
    id: 'suesskartoffel-bowl',
    name: 'Süßkartoffel-Kichererbsen-Bowl',
    meals: ['mittag', 'abend'],
    time: 30, mealprep: true,
    kcal: 520,
    diet: 'vegan',
    allergens: [],
    foods: ['Süßkartoffel', 'Kichererbsen', 'Spinat'],
    ingredients: ['1 Süßkartoffel', '½ Dose Kichererbsen', '1 Handvoll Spinat', '1 EL Öl', 'Paprikapulver, Salz', '2 EL Hummus'],
    steps: [
      'Ofen auf 220 °C vorheizen.',
      'Süßkartoffel würfeln, mit Kichererbsen, Öl und Gewürzen mischen.',
      '20 Minuten im Ofen backen.',
      'Mit Spinat in eine Schüssel geben, Hummus drauf.'
    ],
    tint: '#F7D2B0'
  },
  {
    id: 'brokkoli-nudeln',
    name: 'Brokkoli-Nudeln mit Käse',
    meals: ['mittag', 'abend'],
    time: 20,
    kcal: 580,
    diet: 'vegetarisch',
    allergens: ['gluten', 'laktose'],
    foods: ['Nudeln', 'Brokkoli', 'Käse'],
    ingredients: ['90 g Nudeln', '½ Brokkoli', '30 g geriebener Käse', '1 Knoblauchzehe', '1 TL Öl'],
    steps: [
      'Nudeln kochen, 4 Minuten vor Ende Brokkoli mit ins Wasser.',
      'Knoblauch in Öl kurz anbraten.',
      'Nudeln und Brokkoli abgießen, in die Pfanne geben.',
      'Käse unterrühren und servieren.'
    ],
    tint: '#DCE8C8'
  },
  {
    id: 'pilz-reispfanne',
    name: 'Pilz-Reispfanne',
    meals: ['mittag', 'abend'],
    time: 25, mealprep: true,
    kcal: 470,
    diet: 'vegan',
    allergens: [],
    foods: ['Pilze', 'Reis', 'Zwiebeln'],
    ingredients: ['60 g Reis', '200 g Champignons', '1 Zwiebel', '1 Handvoll Petersilie', '1 EL Öl', 'Salz, Pfeffer'],
    steps: [
      'Reis nach Packung kochen.',
      'Pilze in Scheiben schneiden, Zwiebel würfeln.',
      'Beides in Öl 6 Minuten braten.',
      'Reis untermischen, mit Petersilie servieren.'
    ],
    tint: '#E8DCCB'
  },
  {
    id: 'lachs-ofengemuese',
    name: 'Lachs mit Ofengemüse',
    meals: ['abend'],
    time: 30,
    kcal: 520,
    diet: 'fisch',
    allergens: ['fisch'],
    foods: ['Lachs', 'Zucchini', 'Paprika', 'Kartoffeln'],
    ingredients: ['1 Lachsfilet (TK geht)', '1 Zucchini', '1 Paprika', '200 g kleine Kartoffeln', '1 EL Öl', 'Zitrone, Salz'],
    steps: [
      'Ofen auf 200 °C vorheizen.',
      'Kartoffeln halbieren, Gemüse in Stücke schneiden.',
      'Alles mit Öl und Salz aufs Blech, 10 Minuten backen.',
      'Lachs dazulegen und weitere 15 Minuten backen.',
      'Mit Zitrone beträufeln.'
    ],
    tint: '#F6CFC2'
  },
  {
    id: 'thunfisch-nudelsalat',
    name: 'Thunfisch-Nudelsalat',
    meals: ['mittag', 'abend'],
    time: 20, mealprep: true,
    kcal: 550,
    diet: 'fisch',
    allergens: ['fisch', 'gluten', 'laktose'],
    foods: ['Thunfisch', 'Nudeln', 'Mais', 'Gurke'],
    ingredients: ['80 g Nudeln', '1 Dose Thunfisch im eigenen Saft', '3 EL Mais', '½ Gurke', '3 EL Joghurt', 'Salz, Pfeffer'],
    steps: [
      'Nudeln kochen und kalt abschrecken.',
      'Gurke würfeln, Thunfisch abtropfen lassen.',
      'Alles mit Mais und Joghurt mischen.',
      'Mit Salz und Pfeffer abschmecken.'
    ],
    tint: '#DDEAF4'
  },
  {
    id: 'haehnchen-pfanne',
    name: 'Hähnchen-Gemüse-Pfanne mit Reis',
    meals: ['mittag', 'abend'],
    time: 25, mealprep: true,
    kcal: 520,
    diet: 'fleisch',
    allergens: ['soja'],
    foods: ['Hähnchen', 'Paprika', 'Brokkoli', 'Reis'],
    ingredients: ['60 g Reis', '150 g Hähnchenbrust', '1 Paprika', '½ Brokkoli', '1 EL Sojasauce', '1 TL Öl'],
    steps: [
      'Reis nach Packung kochen.',
      'Hähnchen in Streifen schneiden und in Öl durchbraten.',
      'Gemüse klein schneiden und 5 Minuten mitbraten.',
      'Mit Sojasauce abschmecken, mit Reis servieren.'
    ],
    tint: '#F5D9A0'
  },
  {
    id: 'haehnchen-wrap',
    name: 'Hähnchen-Wrap mit Joghurtsoße',
    meals: ['mittag', 'abend'],
    time: 20,
    kcal: 540,
    diet: 'fleisch',
    allergens: ['gluten', 'laktose'],
    foods: ['Hähnchen', 'Gurke', 'Tomaten', 'Joghurt'],
    ingredients: ['2 Tortillas', '120 g Hähnchenbrust', '½ Gurke', '1 Tomate', '3 EL Joghurt', 'Salz, Paprikapulver'],
    steps: [
      'Hähnchen würzen und in der Pfanne durchbraten.',
      'Gurke und Tomate klein schneiden.',
      'Joghurt mit etwas Salz verrühren.',
      'Alles in die Tortillas füllen und einrollen.'
    ],
    tint: '#F3C9A8'
  },
  {
    id: 'kartoffel-pfanne-ei',
    name: 'Kartoffel-Paprika-Pfanne mit Ei',
    meals: ['mittag', 'abend'],
    time: 30,
    kcal: 540,
    diet: 'vegetarisch',
    allergens: ['ei'],
    foods: ['Kartoffeln', 'Paprika', 'Eier'],
    ingredients: ['250 g Kartoffeln', '1 Paprika', '1 Zwiebel', '2 Eier', '1 EL Öl', 'Salz, Pfeffer, Paprikapulver'],
    steps: [
      'Kartoffeln in kleine Würfel schneiden.',
      'In Öl 15 Minuten bei mittlerer Hitze braten, ab und zu wenden.',
      'Zwiebel und Paprika würfeln, 5 Minuten mitbraten.',
      'Zwei Mulden machen, Eier hineinschlagen und zugedeckt stocken lassen.'
    ],
    tint: '#DDEAF4'
  },
  {
    id: 'tomaten-mozzarella-nudeln',
    name: 'Nudeln mit Tomaten und Mozzarella',
    meals: ['mittag', 'abend'],
    time: 15,
    kcal: 500,
    diet: 'vegetarisch',
    allergens: ['gluten', 'laktose'],
    foods: ['Nudeln', 'Tomaten', 'Käse'],
    ingredients: ['80 g Nudeln', '150 g Kirschtomaten', '½ Mozzarella', '1 TL Öl', 'Basilikum, Salz, Pfeffer'],
    steps: [
      'Nudeln kochen.',
      'Tomaten halbieren und in Öl 3 Minuten braten.',
      'Nudeln dazugeben, Mozzarella zupfen und unterheben.',
      'Mit Basilikum, Salz und Pfeffer abschmecken.'
    ],
    tint: '#DCE8C8'
  },
  {
    id: 'pesto-nudeln-tomaten',
    name: 'Pesto-Nudeln mit Tomaten',
    meals: ['mittag', 'abend'],
    time: 15,
    kcal: 500,
    diet: 'vegetarisch',
    allergens: ['gluten', 'laktose', 'nuesse'],
    foods: ['Nudeln', 'Tomaten', 'Käse'],
    ingredients: ['80 g Nudeln', '2 EL Pesto', '150 g Kirschtomaten', '1 EL Parmesan'],
    steps: [
      'Nudeln kochen.',
      'Tomaten halbieren.',
      'Nudeln abgießen und mit Pesto und Tomaten mischen.',
      'Mit Parmesan bestreuen.'
    ],
    tint: '#F5E1A4'
  },
  {
    id: 'chili-sin-carne',
    name: 'Chili sin Carne mit Reis',
    meals: ['mittag', 'abend'],
    time: 25, mealprep: true,
    kcal: 570,
    diet: 'vegan',
    allergens: [],
    foods: ['Reis', 'Bohnen', 'Mais', 'Paprika', 'Tomaten'],
    ingredients: ['60 g Reis', '½ Dose Kidneybohnen', '3 EL Mais', '1 Paprika', '1 Zwiebel', '200 g passierte Tomaten', '1 TL Öl', 'Salz, Paprikapulver, Chili'],
    steps: [
      'Reis nach Packung kochen.',
      'Zwiebel und Paprika würfeln und in Öl 3 Minuten anbraten.',
      'Tomaten, Bohnen und Mais dazugeben.',
      '10 Minuten köcheln, kräftig würzen.',
      'Mit Reis servieren.'
    ],
    tint: '#F7DDB8'
  },
  {
    id: 'linsen-dal',
    name: 'Rote-Linsen-Dal mit Reis',
    meals: ['mittag', 'abend'],
    time: 25, mealprep: true,
    kcal: 690,
    diet: 'vegan',
    allergens: [],
    foods: ['Reis', 'Linsen', 'Tomaten'],
    ingredients: ['50 g Reis', '60 g rote Linsen', '1 Zwiebel', '1 Knoblauchzehe', '200 g gehackte Tomaten', '100 ml Kokosmilch', '1 TL Currypulver'],
    steps: [
      'Reis nach Packung kochen.',
      'Zwiebel und Knoblauch fein hacken und mit Curry kurz anbraten.',
      'Linsen, Tomaten, Kokosmilch und 150 ml Wasser dazu.',
      '15 Minuten köcheln, bis die Linsen weich sind.',
      'Mit Reis servieren.'
    ],
    tint: '#F3C9A8'
  },
  {
    id: 'lachs-spinat-nudeln',
    name: 'Lachs-Spinat-Nudeln',
    meals: ['mittag', 'abend'],
    time: 20,
    kcal: 670,
    diet: 'fisch',
    allergens: ['gluten', 'laktose', 'fisch'],
    foods: ['Nudeln', 'Lachs', 'Spinat'],
    ingredients: ['80 g Nudeln', '1 Lachsfilet', '2 Handvoll Spinat', '50 ml Kochsahne', '1 Knoblauchzehe', 'Salz, Pfeffer, Zitronensaft'],
    steps: [
      'Nudeln kochen.',
      'Lachs würfeln und in der Pfanne 4 Minuten braten.',
      'Knoblauch, Spinat und Sahne dazugeben, kurz köcheln.',
      'Mit den Nudeln mischen, mit Zitrone abschmecken.'
    ],
    tint: '#F5D9A0'
  },
  {
    id: 'garnelen-nudeln',
    name: 'Knoblauch-Garnelen mit Nudeln',
    meals: ['mittag', 'abend'],
    time: 20,
    kcal: 490,
    diet: 'fisch',
    allergens: ['gluten'],
    foods: ['Nudeln', 'Tomaten'],
    ingredients: ['80 g Nudeln', '100 g Garnelen', '2 Knoblauchzehen', '150 g Kirschtomaten', '1 EL Öl', 'Salz, Pfeffer, Petersilie'],
    steps: [
      'Nudeln kochen.',
      'Knoblauch hacken und in Öl kurz anbraten.',
      'Garnelen und halbierte Tomaten 4 Minuten mitbraten.',
      'Mit den Nudeln mischen und mit Petersilie bestreuen.'
    ],
    tint: '#F7D2B0'
  },
  {
    id: 'thunfisch-tomaten-nudeln',
    name: 'Nudeln mit Thunfisch-Tomatensoße',
    meals: ['mittag', 'abend'],
    time: 20, mealprep: true,
    kcal: 460,
    diet: 'fisch',
    allergens: ['gluten', 'fisch'],
    foods: ['Nudeln', 'Thunfisch', 'Tomaten'],
    ingredients: ['80 g Nudeln', '½ Dose Thunfisch im eigenen Saft', '200 g passierte Tomaten', '1 Zwiebel', '1 TL Öl', 'Salz, Pfeffer, Oregano'],
    steps: [
      'Nudeln kochen.',
      'Zwiebel würfeln und in Öl anbraten.',
      'Tomaten dazu und 5 Minuten köcheln.',
      'Thunfisch abtropfen lassen, unterrühren und mit den Nudeln servieren.'
    ],
    tint: '#F2D4DC'
  },
  {
    id: 'haehnchen-curry',
    name: 'Hähnchen-Curry mit Reis',
    meals: ['mittag', 'abend'],
    time: 25, mealprep: true,
    kcal: 690,
    diet: 'fleisch',
    allergens: [],
    foods: ['Reis', 'Hähnchen', 'Paprika'],
    ingredients: ['60 g Reis', '150 g Hähnchenbrust', '1 Paprika', '100 ml Kokosmilch', '1 TL Öl', '1 TL Currypulver'],
    steps: [
      'Reis nach Packung kochen.',
      'Hähnchen würfeln und in Öl rundum anbraten.',
      'Paprika in Streifen dazu, Curry darüberstreuen.',
      'Kokosmilch angießen und 8 Minuten köcheln.',
      'Mit Reis servieren.'
    ],
    tint: '#F5E6B8'
  },
  {
    id: 'spaghetti-bolognese',
    name: 'Spaghetti Bolognese',
    meals: ['mittag', 'abend'],
    time: 25, mealprep: true,
    kcal: 640,
    diet: 'fleisch',
    allergens: ['gluten'],
    foods: ['Nudeln', 'Tomaten'],
    ingredients: ['80 g Spaghetti', '100 g Hackfleisch', '1 Zwiebel', '1 Möhre', '200 g passierte Tomaten', '1 EL Tomatenmark', 'Salz, Pfeffer, Oregano'],
    steps: [
      'Zwiebel und Möhre fein würfeln.',
      'Hackfleisch krümelig anbraten, Gemüse und Tomatenmark kurz mitbraten.',
      'Tomaten dazu und 15 Minuten köcheln.',
      'Spaghetti kochen und mit der Soße servieren.'
    ],
    tint: '#E3DCF2'
  },
  {
    id: 'haehnchen-geschnetzeltes',
    name: 'Hähnchen-Geschnetzeltes mit Champignons',
    meals: ['mittag', 'abend'],
    time: 25,
    kcal: 690,
    diet: 'fleisch',
    allergens: ['gluten', 'laktose'],
    foods: ['Nudeln', 'Hähnchen', 'Pilze'],
    ingredients: ['80 g Nudeln', '150 g Hähnchenbrust', '150 g Champignons', '1 Zwiebel', '50 ml Kochsahne', '1 TL Öl', 'Salz, Pfeffer'],
    steps: [
      'Nudeln kochen.',
      'Hähnchen in Streifen schneiden und in Öl durchbraten.',
      'Zwiebel und Champignons dazu, 5 Minuten braten.',
      'Sahne angießen, kurz köcheln und mit den Nudeln servieren.'
    ],
    tint: '#DDEAF4'
  },
  {
    id: 'zucchini-feta-nudeln',
    name: 'Zucchini-Feta-Nudeln',
    meals: ['mittag', 'abend'],
    time: 20,
    kcal: 510,
    diet: 'vegetarisch',
    allergens: ['gluten', 'laktose'],
    foods: ['Nudeln', 'Zucchini', 'Feta'],
    ingredients: ['80 g Nudeln', '1 Zucchini', '50 g Feta', '1 Knoblauchzehe', '1 TL Öl', 'Salz, Pfeffer'],
    steps: [
      'Nudeln kochen.',
      'Zucchini würfeln und mit Knoblauch in Öl 5 Minuten braten.',
      'Nudeln dazugeben.',
      'Feta darüberbröseln.'
    ],
    tint: '#DCE8C8'
  },
  {
    id: 'shakshuka',
    name: 'Shakshuka mit Brot',
    meals: ['mittag', 'abend'],
    time: 25,
    kcal: 440,
    diet: 'vegetarisch',
    allergens: ['gluten', 'ei'],
    foods: ['Eier', 'Tomaten', 'Paprika', 'Brot'],
    ingredients: ['2 Eier', '200 g gehackte Tomaten', '1 Paprika', '1 Zwiebel', '1 TL Öl', '1 Scheibe Vollkornbrot', 'Salz, Paprikapulver, Kreuzkümmel'],
    steps: [
      'Zwiebel und Paprika würfeln und in Öl 5 Minuten braten.',
      'Tomaten und Gewürze dazu, 5 Minuten köcheln.',
      'Zwei Mulden machen, Eier hineinschlagen.',
      'Zugedeckt 6 Minuten stocken lassen, mit Brot essen.'
    ],
    tint: '#F5E1A4'
  },
  {
    id: 'kartoffel-linsen-eintopf',
    name: 'Kartoffel-Linsen-Eintopf',
    meals: ['mittag', 'abend'],
    time: 25, mealprep: true,
    kcal: 430,
    diet: 'vegan',
    allergens: [],
    foods: ['Kartoffeln', 'Linsen'],
    ingredients: ['200 g Kartoffeln', '50 g rote Linsen', '1 Möhre', '1 Zwiebel', '400 ml Gemüsebrühe', '1 TL Öl', 'Salz, Pfeffer, Majoran'],
    steps: [
      'Kartoffeln, Möhre und Zwiebel würfeln.',
      'Zwiebel in Öl anbraten.',
      'Gemüse, Linsen und Brühe dazu.',
      '18 Minuten köcheln, bis alles weich ist, dann würzen.'
    ],
    tint: '#F7DDB8'
  },
  {
    id: 'erbsensuppe',
    name: 'Schnelle Erbsensuppe mit Brot',
    meals: ['mittag', 'abend'],
    time: 20, mealprep: true,
    kcal: 390,
    diet: 'vegan',
    allergens: ['gluten'],
    foods: ['Kartoffeln', 'Brot'],
    ingredients: ['200 g Erbsen (TK)', '1 Kartoffel', '1 Zwiebel', '300 ml Gemüsebrühe', '1 Scheibe Vollkornbrot', 'Salz, Pfeffer'],
    steps: [
      'Zwiebel und Kartoffel würfeln.',
      'Mit der Brühe 10 Minuten kochen.',
      'Erbsen dazu und 5 Minuten weiterkochen.',
      'Pürieren, abschmecken und mit Brot essen.'
    ],
    tint: '#F3C9A8'
  },
  {
    id: 'quesadilla',
    name: 'Quesadilla mit Paprika und Mais',
    meals: ['mittag', 'abend'],
    time: 15,
    kcal: 600,
    diet: 'vegetarisch',
    allergens: ['gluten', 'laktose'],
    foods: ['Käse', 'Paprika', 'Mais'],
    ingredients: ['2 Tortillas', '40 g geriebener Käse', '½ Paprika', '3 EL Mais', '2 EL Salsa'],
    steps: [
      'Paprika klein würfeln.',
      'Eine Tortilla mit Käse, Paprika und Mais belegen, zweite Tortilla darauf.',
      'In der Pfanne ohne Fett je Seite 3 Minuten braten.',
      'In Stücke schneiden und mit Salsa essen.'
    ],
    tint: '#F5D9A0'
  },
  {
    id: 'asia-nudeln-tofu',
    name: 'Asia-Nudeln mit Tofu',
    meals: ['mittag', 'abend'],
    time: 20,
    kcal: 490,
    diet: 'vegan',
    allergens: ['gluten', 'soja'],
    foods: ['Nudeln', 'Tofu', 'Paprika'],
    ingredients: ['80 g Nudeln', '100 g Tofu', '1 Möhre', '½ Paprika', '1 EL Sojasauce', '1 TL Öl'],
    steps: [
      'Nudeln kochen.',
      'Tofu würfeln und in Öl knusprig braten.',
      'Möhre und Paprika in Streifen dazu, 4 Minuten braten.',
      'Nudeln und Sojasauce untermischen.'
    ],
    tint: '#F7D2B0'
  },
  {
    id: 'quinoa-bohnen-salat',
    name: 'Quinoa-Salat mit Bohnen und Mais',
    meals: ['mittag', 'abend'],
    time: 20, mealprep: true,
    kcal: 520,
    diet: 'vegan',
    allergens: [],
    foods: ['Bohnen', 'Mais', 'Tomaten'],
    ingredients: ['60 g Quinoa', '½ Dose Kidneybohnen', '3 EL Mais', '1 Tomate', '1 EL Öl', 'Salz, Pfeffer, Zitronensaft'],
    steps: [
      'Quinoa nach Packung kochen und abkühlen lassen.',
      'Bohnen abspülen, Tomate würfeln.',
      'Alles mit Öl, Zitrone, Salz und Pfeffer mischen.'
    ],
    tint: '#F2D4DC'
  },
  {
    id: 'kuerbissuppe',
    name: 'Kürbissuppe mit Brot',
    meals: ['mittag', 'abend'],
    time: 25, mealprep: true,
    kcal: 350,
    diet: 'vegan',
    allergens: ['gluten'],
    foods: ['Brot'],
    ingredients: ['300 g Kürbis (Hokkaido)', '1 Zwiebel', '300 ml Gemüsebrühe', '50 ml Kokosmilch', '1 Scheibe Vollkornbrot', 'Salz, Pfeffer, Currypulver'],
    steps: [
      'Kürbis mit Schale würfeln, Zwiebel hacken.',
      'Mit der Brühe 15 Minuten weich kochen.',
      'Kokosmilch dazu und fein pürieren.',
      'Abschmecken und mit Brot essen.'
    ],
    tint: '#F5E6B8'
  },
  // ---------- Snacks (bei 2 Mahlzeiten am Tag) ----------
  {
    id: 'snack-apfel-erdnuss',
    name: 'Apfel mit Erdnussbutter',
    meals: ['snack'],
    time: 2,
    kcal: 190,
    diet: 'vegan',
    allergens: ['nuesse'],
    foods: ['Apfel'],
    ingredients: ['1 Apfel', '1 EL Erdnussbutter'],
    steps: ['Apfel in Spalten schneiden.', 'Mit Erdnussbutter zum Dippen essen.'],
    tint: '#DCE8C8'
  },
  {
    id: 'snack-joghurt-beeren',
    name: 'Joghurt mit Beeren',
    meals: ['snack'],
    time: 2,
    kcal: 180,
    diet: 'vegetarisch',
    allergens: ['laktose'],
    foods: ['Joghurt', 'Beeren'],
    ingredients: ['150 g Joghurt', '1 Handvoll Beeren (auch TK)', '1 TL Honig'],
    steps: ['Joghurt in eine Schale geben.', 'Beeren und Honig darüber.'],
    tint: '#F2D4DC'
  },
  {
    id: 'snack-hummus-sticks',
    name: 'Gemüsesticks mit Hummus',
    meals: ['snack'],
    time: 5,
    kcal: 170,
    diet: 'vegan',
    allergens: [],
    foods: ['Gurke'],
    ingredients: ['1 Möhre', '½ Gurke', '3 EL Hummus'],
    steps: ['Möhre schälen, Möhre und Gurke in Stifte schneiden.', 'In Hummus dippen.'],
    tint: '#F7D2B0'
  },
  {
    id: 'snack-quark-banane',
    name: 'Quark mit Banane und Zimt',
    meals: ['snack'],
    time: 3,
    kcal: 220,
    diet: 'vegetarisch',
    allergens: ['laktose'],
    foods: ['Quark', 'Banane'],
    ingredients: ['150 g Magerquark', '1 Banane', 'etwas Zimt'],
    steps: ['Quark mit einem Schluck Wasser cremig rühren.', 'Banane in Scheiben drauf, Zimt darüber.'],
    tint: '#F5E1A4'
  },
  {
    id: 'snack-nuesse-banane',
    name: 'Nüsse und eine Banane',
    meals: ['snack'],
    time: 1,
    kcal: 260,
    diet: 'vegan',
    allergens: ['nuesse'],
    foods: ['Banane'],
    ingredients: ['25 g Nüsse', '1 Banane'],
    steps: ['Nüsse abwiegen, Banane schälen, fertig.'],
    tint: '#E3DCF2'
  },
  {
    id: 'snack-kaesebrot',
    name: 'Käsebrot mit Gurke',
    meals: ['snack'],
    time: 3,
    kcal: 230,
    diet: 'vegetarisch',
    allergens: ['gluten', 'laktose'],
    foods: ['Käse', 'Brot', 'Gurke'],
    ingredients: ['1 Scheibe Vollkornbrot', '1 Scheibe Käse', '½ Gurke'],
    steps: ['Brot mit Käse belegen.', 'Gurke in Scheiben schneiden und dazu essen.'],
    tint: '#DDEAF4'
  },
  {
    id: 'snack-eier-tomate',
    name: 'Gekochte Eier mit Tomate',
    meals: ['snack'],
    time: 10,
    kcal: 180,
    diet: 'vegetarisch',
    allergens: ['ei'],
    foods: ['Eier', 'Tomaten'],
    ingredients: ['2 Eier', '1 Tomate', 'Salz, Pfeffer'],
    steps: ['Eier 8 Minuten kochen, kalt abschrecken.', 'Pellen und mit Tomate, Salz und Pfeffer essen.'],
    tint: '#F3C9A8'
  },
  {
    id: 'snack-gurke-frischkaese',
    name: 'Gurke mit Frischkäse-Dip',
    meals: ['snack'],
    time: 3,
    kcal: 110,
    diet: 'vegetarisch',
    allergens: ['laktose'],
    foods: ['Gurke'],
    ingredients: ['½ Gurke', '2 EL Frischkäse', 'Schnittlauch, Pfeffer'],
    steps: ['Gurke in Stifte schneiden.', 'Frischkäse mit Schnittlauch und Pfeffer verrühren und dazu dippen.'],
    tint: '#E3DCF2'
  },
  {
    id: 'snack-paprika-hummus',
    name: 'Paprikastreifen mit Hummus',
    meals: ['snack'],
    time: 3,
    kcal: 200,
    diet: 'vegan',
    allergens: [],
    foods: ['Paprika'],
    ingredients: ['1 Paprika', '3 EL Hummus'],
    steps: ['Paprika in Streifen schneiden.', 'In Hummus dippen.'],
    tint: '#DDEAF4'
  },
  {
    id: 'snack-erdnuss-toast',
    name: 'Toast mit Erdnussbutter',
    meals: ['snack'],
    time: 3,
    kcal: 160,
    diet: 'vegan',
    allergens: ['gluten', 'nuesse'],
    foods: [],
    ingredients: ['1 Scheibe Toast', '1 EL Erdnussbutter'],
    steps: ['Toast toasten.', 'Mit Erdnussbutter bestreichen.'],
    tint: '#DCE8C8'
  },
  {
    id: 'snack-banane-schoko',
    name: 'Banane mit Schokostückchen',
    meals: ['snack'],
    time: 3,
    kcal: 150,
    diet: 'vegan',
    allergens: [],
    foods: ['Banane'],
    ingredients: ['1 Banane', '10 g Zartbitterschokolade'],
    steps: ['Banane in Scheiben schneiden.', 'Schokolade grob hacken und darüberstreuen.'],
    tint: '#F5E1A4'
  },
  {
    id: 'snack-apfel-kaese',
    name: 'Apfel mit Käse',
    meals: ['snack'],
    time: 2,
    kcal: 240,
    diet: 'vegetarisch',
    allergens: ['laktose'],
    foods: ['Käse'],
    ingredients: ['1 Apfel', '2 Scheiben Käse'],
    steps: ['Apfel in Spalten schneiden.', 'Mit dem Käse zusammen essen.'],
    tint: '#F7DDB8'
  },
  {
    id: 'snack-quark-beeren',
    name: 'Quark mit Beeren',
    meals: ['snack'],
    time: 3,
    kcal: 130,
    diet: 'vegetarisch',
    allergens: ['laktose'],
    foods: ['Quark', 'Beeren'],
    ingredients: ['150 g Magerquark', '1 Handvoll Beeren (auch TK)'],
    steps: ['Quark mit einem Schluck Wasser cremig rühren.', 'Beeren darauf verteilen.'],
    tint: '#F3C9A8'
  },
  {
    id: 'snack-kichererbsen',
    name: 'Knusprige Kichererbsen',
    meals: ['snack'],
    time: 20, serve: 0, prep: true,
    kcal: 190,
    diet: 'vegan',
    allergens: [],
    foods: ['Kichererbsen'],
    ingredients: ['½ Dose Kichererbsen', '1 TL Öl', 'Salz, Paprikapulver'],
    steps: [
      'Kichererbsen abspülen und gut trocken tupfen.',
      'In Öl bei mittlerer Hitze 15 Minuten rösten, oft schwenken.',
      'Mit Salz und Paprikapulver würzen.',
      'Abgekühlt in einer Dose mitnehmen.'
    ],
    tint: '#F5D9A0'
  },
  {
    id: 'snack-tomate-mozzarella',
    name: 'Tomate mit Mozzarella',
    meals: ['snack'],
    time: 3,
    kcal: 180,
    diet: 'vegetarisch',
    allergens: ['laktose'],
    foods: ['Tomaten', 'Käse'],
    ingredients: ['1 Tomate', '½ Mozzarella', 'Basilikum, Salz, Pfeffer'],
    steps: ['Tomate und Mozzarella in Scheiben schneiden.', 'Mit Basilikum, Salz und Pfeffer würzen.'],
    tint: '#F7D2B0'
  },
  {
    id: 'snack-avocado-brot',
    name: 'Kleines Avocado-Brot',
    meals: ['snack'],
    time: 3,
    kcal: 160,
    diet: 'vegan',
    allergens: ['gluten'],
    foods: ['Brot', 'Avocado'],
    ingredients: ['1 Scheibe Vollkornbrot', '¼ Avocado', 'Salz, Pfeffer'],
    steps: ['Avocado zerdrücken und aufs Brot streichen.', 'Mit Salz und Pfeffer würzen.'],
    tint: '#F2D4DC'
  },
  {
    id: 'snack-chia-joghurt',
    name: 'Joghurt mit Chiasamen',
    meals: ['snack'],
    time: 2,
    kcal: 180,
    diet: 'vegetarisch',
    allergens: ['laktose'],
    foods: ['Joghurt'],
    ingredients: ['150 g Joghurt', '1 EL Chiasamen', '1 TL Honig'],
    steps: ['Alles verrühren.', '10 Minuten quellen lassen, dann essen.'],
    tint: '#F5E6B8'
  },
  {
    id: 'snack-obstsalat',
    name: 'Kleiner Obstsalat',
    meals: ['snack'],
    time: 5,
    kcal: 170,
    diet: 'vegan',
    allergens: [],
    foods: ['Banane', 'Beeren'],
    ingredients: ['1 Apfel', '½ Banane', '1 Handvoll Beeren (auch TK)', 'etwas Zitronensaft'],
    steps: ['Apfel und Banane klein schneiden.', 'Mit Beeren und Zitronensaft mischen.'],
    tint: '#E3DCF2'
  },
  {
    id: 'snack-bananen-shake',
    name: 'Bananen-Milch-Shake',
    meals: ['snack'],
    time: 3,
    kcal: 200,
    diet: 'vegetarisch',
    allergens: ['laktose'],
    foods: ['Banane'],
    ingredients: ['1 Banane', '250 ml Milch'],
    steps: ['Banane und Milch pürieren.', 'Gleich trinken.'],
    tint: '#DDEAF4'
  },
  {
    id: 'snack-beeren-shake',
    name: 'Veganer Beeren-Shake',
    meals: ['snack'],
    time: 3,
    kcal: 150,
    diet: 'vegan',
    allergens: ['gluten'],
    foods: ['Beeren', 'Banane'],
    ingredients: ['1 Handvoll Beeren (auch TK)', '½ Banane', '250 ml Haferdrink'],
    steps: ['Alles fein pürieren.', 'Gleich trinken.'],
    tint: '#DCE8C8'
  },
  {
    id: 'snack-schinken-roellchen',
    name: 'Schinkenröllchen mit Frischkäse',
    meals: ['snack'],
    time: 5,
    kcal: 150,
    diet: 'fleisch',
    allergens: ['laktose'],
    foods: ['Gurke'],
    ingredients: ['3 Scheiben Kochschinken', '1 EL Frischkäse', '½ Gurke'],
    steps: ['Schinken mit Frischkäse bestreichen und einrollen.', 'Gurke in Scheiben dazu essen.'],
    tint: '#F5E1A4'
  },
  {
    id: 'snack-thunfisch-dip',
    name: 'Thunfisch-Dip mit Gurke',
    meals: ['snack'],
    time: 5,
    kcal: 120,
    diet: 'fisch',
    allergens: ['laktose', 'fisch'],
    foods: ['Thunfisch', 'Joghurt', 'Gurke'],
    ingredients: ['½ Dose Thunfisch im eigenen Saft', '2 EL Joghurt', '½ Gurke', 'Salz, Pfeffer, Zitronensaft'],
    steps: [
      'Thunfisch abtropfen lassen und mit Joghurt verrühren.',
      'Mit Salz, Pfeffer und Zitrone abschmecken.',
      'Gurke in Stifte schneiden und dippen.'
    ],
    tint: '#F7DDB8'
  },
  {
    id: 'snack-eibrot',
    name: 'Brot mit gekochtem Ei',
    meals: ['snack'],
    time: 10,
    kcal: 190,
    diet: 'vegetarisch',
    allergens: ['gluten', 'ei'],
    foods: ['Brot', 'Eier'],
    ingredients: ['1 Scheibe Vollkornbrot', '1 Ei', 'Salz, Schnittlauch'],
    steps: [
      'Ei 8 Minuten kochen, abschrecken und pellen.',
      'In Scheiben aufs Brot legen.',
      'Mit Salz und Schnittlauch bestreuen.'
    ],
    tint: '#F3C9A8'
  },
  {
    id: 'snack-hafer-kekse',
    name: 'Bananen-Hafer-Kekse',
    meals: ['snack'],
    time: 25, serve: 0, prep: true,
    kcal: 290,
    diet: 'vegan',
    allergens: ['gluten'],
    foods: ['Banane', 'Haferflocken'],
    ingredients: ['1 Banane', '40 g Haferflocken', '10 g Zartbitterschokolade'],
    steps: [
      'Ofen auf 180 °C vorheizen.',
      'Banane zerdrücken, mit Haferflocken und gehackter Schokolade mischen.',
      'Kleine Häufchen aufs Backblech setzen.',
      '15 Minuten backen, abkühlen lassen.'
    ],
    tint: '#F5D9A0'
  },
  {
    id: 'snack-energy-balls',
    name: 'Hafer-Erdnuss-Kugeln',
    meals: ['snack'],
    time: 10,
    kcal: 180,
    diet: 'vegan',
    allergens: ['gluten', 'nuesse'],
    foods: ['Haferflocken'],
    ingredients: ['20 g Haferflocken', '1 EL Erdnussbutter', '1 TL Ahornsirup'],
    steps: [
      'Alles in einer Schüssel gut verkneten.',
      'Mit feuchten Händen kleine Kugeln formen.',
      'Kurz kalt stellen oder gleich essen.'
    ],
    tint: '#F7D2B0'
  },
  {
    id: 'snack-frischkaese-tomate',
    name: 'Frischkäse-Brot mit Tomate',
    meals: ['snack'],
    time: 3,
    kcal: 170,
    diet: 'vegetarisch',
    allergens: ['gluten', 'laktose'],
    foods: ['Brot', 'Tomaten'],
    ingredients: ['1 Scheibe Vollkornbrot', '1 EL Frischkäse', '1 Tomate', 'Salz, Pfeffer'],
    steps: ['Brot mit Frischkäse bestreichen.', 'Tomate in Scheiben darauflegen und würzen.'],
    tint: '#F2D4DC'
  },
  {
    id: 'snack-joghurt-apfel',
    name: 'Joghurt mit Apfel und Zimt',
    meals: ['snack'],
    time: 3,
    kcal: 140,
    diet: 'vegetarisch',
    allergens: ['laktose'],
    foods: ['Joghurt'],
    ingredients: ['150 g Joghurt', '½ Apfel', 'etwas Zimt'],
    steps: ['Apfel klein würfeln.', 'Unter den Joghurt mischen, Zimt darüber.'],
    tint: '#F5E6B8'
  },
  {
    id: 'snack-moehren-quark',
    name: 'Möhrensticks mit Kräuterquark',
    meals: ['snack'],
    time: 5,
    kcal: 130,
    diet: 'vegetarisch',
    allergens: ['laktose'],
    foods: ['Quark'],
    ingredients: ['2 Möhren', '100 g Magerquark', 'Salz, Kräuter'],
    steps: ['Möhren schälen und in Stifte schneiden.', 'Quark mit Kräutern und Salz verrühren und dippen.'],
    tint: '#E3DCF2'
  },
  {
    id: 'snack-hummus-wrap',
    name: 'Mini-Wrap mit Hummus',
    meals: ['snack'],
    time: 5,
    kcal: 300,
    diet: 'vegan',
    allergens: ['gluten'],
    foods: ['Paprika'],
    ingredients: ['1 Tortilla', '2 EL Hummus', '½ Paprika'],
    steps: [
      'Tortilla mit Hummus bestreichen.',
      'Paprika in Streifen darauflegen.',
      'Einrollen und halbieren.'
    ],
    tint: '#DDEAF4'
  },
  {
    id: 'snack-nuesse-beeren',
    name: 'Nüsse mit Beeren',
    meals: ['snack'],
    time: 1,
    kcal: 160,
    diet: 'vegan',
    allergens: ['nuesse'],
    foods: ['Beeren'],
    ingredients: ['20 g Nüsse', '1 Handvoll Beeren (auch TK)'],
    steps: ['Nüsse abwiegen und mit den Beeren in eine Schale geben.'],
    tint: '#DCE8C8'
  },
  {
    id: 'snack-gurken-feta-salat',
    name: 'Gurken-Tomaten-Salat mit Feta',
    meals: ['snack'],
    time: 5,
    kcal: 170,
    diet: 'vegetarisch',
    allergens: ['laktose'],
    foods: ['Gurke', 'Tomaten', 'Feta'],
    ingredients: ['½ Gurke', '1 Tomate', '30 g Feta', '1 TL Öl', 'Salz, Pfeffer'],
    steps: [
      'Gurke und Tomate würfeln.',
      'Feta darüberbröseln.',
      'Mit Öl, Salz und Pfeffer anmachen.'
    ],
    tint: '#F5E1A4'
  }
];

// Lebensmittel für die Geschmacksabfrage
export const TASTE_FOODS = [
  'Nudeln', 'Reis', 'Kartoffeln', 'Süßkartoffel', 'Haferflocken', 'Brot',
  'Linsen', 'Kichererbsen', 'Bohnen', 'Tofu', 'Eier', 'Käse', 'Feta', 'Joghurt', 'Quark',
  'Tomaten', 'Paprika', 'Brokkoli', 'Spinat', 'Zucchini', 'Pilze', 'Gurke', 'Avocado', 'Mais',
  'Banane', 'Beeren', 'Hähnchen', 'Lachs', 'Thunfisch'
];
