// Rezepte: einfach, max. 30 Minuten, ohne ausgefallene Zutaten.
// kcal sind grobe Schätzwerte pro Portion.
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
  }
];

// Lebensmittel für die Geschmacksabfrage
export const TASTE_FOODS = [
  'Nudeln', 'Reis', 'Kartoffeln', 'Süßkartoffel', 'Haferflocken', 'Brot',
  'Linsen', 'Kichererbsen', 'Bohnen', 'Tofu', 'Eier', 'Käse', 'Feta', 'Joghurt', 'Quark',
  'Tomaten', 'Paprika', 'Brokkoli', 'Spinat', 'Zucchini', 'Pilze', 'Gurke', 'Avocado', 'Mais',
  'Banane', 'Beeren', 'Hähnchen', 'Lachs', 'Thunfisch'
];
