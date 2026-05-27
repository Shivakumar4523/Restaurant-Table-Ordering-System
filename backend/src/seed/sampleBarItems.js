import { BAR_CATEGORIES } from "../constants/barCategories.js";
import { getBarItemImage } from "../utils/barItemImages.js";

const MIN_ITEMS_PER_CATEGORY = 11;

const categoryProfiles = {
  Beer: {
    prices: { smallPeg: 0, largePeg: 0, bottle: 180 },
    stock: 36,
    preparationTime: 3,
    alcoholType: "Beer",
    mlSize: 650,
    isAlcoholic: true,
    description: (name) => `${name} served chilled with a crisp, refreshing finish.`
  },
  "Imported Beer": {
    prices: { smallPeg: 0, largePeg: 0, bottle: 420 },
    stock: 18,
    preparationTime: 3,
    alcoholType: "Imported Beer",
    mlSize: 330,
    isAlcoholic: true,
    description: (name) => `${name} with smooth imported malt character, served ice cold.`
  },
  "Craft Beer": {
    prices: { smallPeg: 0, largePeg: 0, bottle: 280 },
    stock: 24,
    preparationTime: 3,
    alcoholType: "Craft Beer",
    mlSize: 330,
    isAlcoholic: true,
    description: (name) => `${name} with bold craft flavour and a fresh pub-style pour.`
  },
  Whisky: {
    prices: { smallPeg: 110, largePeg: 210, bottle: 2800 },
    stock: 12,
    preparationTime: 4,
    alcoholType: "Whisky",
    mlSize: 750,
    isAlcoholic: true,
    description: (name) => `${name} with warm oak, grain, and spice notes.`
  },
  Scotch: {
    prices: { smallPeg: 260, largePeg: 500, bottle: 7800 },
    stock: 8,
    preparationTime: 4,
    alcoholType: "Scotch",
    mlSize: 750,
    isAlcoholic: true,
    description: (name) => `${name} Scotch served neat, on the rocks, or with a mixer.`
  },
  Rum: {
    prices: { smallPeg: 90, largePeg: 170, bottle: 1800 },
    stock: 14,
    preparationTime: 4,
    alcoholType: "Rum",
    mlSize: 750,
    isAlcoholic: true,
    description: (name) => `${name} with caramel, spice, and tropical rum character.`
  },
  Vodka: {
    prices: { smallPeg: 150, largePeg: 290, bottle: 4200 },
    stock: 10,
    preparationTime: 4,
    alcoholType: "Vodka",
    mlSize: 750,
    isAlcoholic: true,
    description: (name) => `${name} clean vodka for shots, mixers, and cocktails.`
  },
  Gin: {
    prices: { smallPeg: 190, largePeg: 360, bottle: 5600 },
    stock: 9,
    preparationTime: 4,
    alcoholType: "Gin",
    mlSize: 750,
    isAlcoholic: true,
    description: (name) => `${name} with botanical aroma and a bright gin finish.`
  },
  Tequila: {
    prices: { smallPeg: 220, largePeg: 420, bottle: 6200 },
    stock: 7,
    preparationTime: 4,
    alcoholType: "Tequila",
    mlSize: 750,
    isAlcoholic: true,
    description: (name) => `${name} tequila with agave bite and a clean finish.`
  },
  Brandy: {
    prices: { smallPeg: 80, largePeg: 150, bottle: 1500 },
    stock: 16,
    preparationTime: 4,
    alcoholType: "Brandy",
    mlSize: 750,
    isAlcoholic: true,
    description: (name) => `${name} brandy with fruit, oak, and warming spice.`
  },
  Wine: {
    prices: { smallPeg: 0, largePeg: 0, bottle: 1400 },
    stock: 12,
    preparationTime: 5,
    alcoholType: "Wine",
    mlSize: 750,
    isAlcoholic: true,
    description: (name) => `${name} bottle selected for smooth table service.`
  },
  Champagne: {
    prices: { smallPeg: 0, largePeg: 0, bottle: 5200 },
    stock: 6,
    preparationTime: 5,
    alcoholType: "Sparkling Wine",
    mlSize: 750,
    isAlcoholic: true,
    description: (name) => `${name} sparkling bottle with crisp bubbles and a celebratory finish.`
  },
  Breezer: {
    prices: { smallPeg: 0, largePeg: 0, bottle: 220 },
    stock: 30,
    preparationTime: 3,
    alcoholType: "Ready To Drink",
    mlSize: 275,
    isAlcoholic: true,
    description: (name) => `${name} ready-to-drink cooler served chilled.`
  },
  Cocktails: {
    prices: { smallPeg: 0, largePeg: 0, bottle: 320 },
    stock: 25,
    preparationTime: 8,
    alcoholType: "Cocktail",
    mlSize: 300,
    isAlcoholic: true,
    description: (name) => `${name} mixed fresh by the bar team and served over ice.`
  },
  Mocktails: {
    prices: { smallPeg: 0, largePeg: 0, bottle: 220 },
    stock: 28,
    preparationTime: 6,
    alcoholType: "Mocktail",
    mlSize: 300,
    isAlcoholic: false,
    description: (name) => `${name} alcohol-free cooler with bright fruit and fresh garnish.`
  },
  "Energy Drinks": {
    prices: { smallPeg: 0, largePeg: 0, bottle: 180 },
    stock: 32,
    preparationTime: 2,
    alcoholType: "Energy Drink",
    mlSize: 250,
    isAlcoholic: false,
    description: (name) => `${name} chilled energy drink for mixers or standalone service.`
  },
  "Soft Drinks": {
    prices: { smallPeg: 0, largePeg: 0, bottle: 80 },
    stock: 48,
    preparationTime: 2,
    alcoholType: "Soft Drink",
    mlSize: 300,
    isAlcoholic: false,
    description: (name) => `${name} soft drink served chilled.`
  },
  "Soda Mixers": {
    prices: { smallPeg: 0, largePeg: 0, bottle: 120 },
    stock: 40,
    preparationTime: 2,
    alcoholType: "Mixer",
    mlSize: 300,
    isAlcoholic: false,
    description: (name) => `${name} mixer for spirits, cocktails, and table service.`
  }
};

const categoryItems = {
  Beer: [
    "Kingfisher Premium Lager",
    "Kingfisher Strong",
    "Tuborg Green",
    "Tuborg Strong",
    "Carlsberg Elephant",
    "Heineken Silver",
    "Budweiser Magnum",
    "Budweiser Premium",
    "Haywards 5000",
    "Knock Out Strong",
    "Royal Challenge Beer"
  ],
  "Imported Beer": [
    "Corona Extra",
    "Hoegaarden Witbier",
    "Stella Artois",
    "Guinness Draught",
    "Asahi Super Dry",
    "Peroni Nastro Azzurro",
    "Erdinger Weissbier",
    "Leffe Blonde",
    "Becks Ice",
    "Miller Genuine Draft",
    "Sol Mexican Lager"
  ],
  "Craft Beer": [
    "Bira 91 White",
    "Bira 91 Blonde",
    "Bira 91 Boom",
    "Simba Stout",
    "Simba Wit",
    "White Owl Spark",
    "White Owl Diablo",
    "Geist Witty Wit",
    "Gateway White Zen",
    "Kati Patang Zesty Amber",
    "Toit Colonial Toit"
  ],
  Whisky: [
    "Blenders Pride Reserve",
    "Royal Stag Barrel Select",
    "Antiquity Blue",
    "Signature Premier",
    "McDowells No.1 Reserve",
    "Imperial Blue",
    "Officer's Choice Blue",
    "Rockford Reserve",
    "8PM Premium Black",
    "Oaksmith Gold",
    "Sterling Reserve B7"
  ],
  Scotch: [
    "Johnnie Walker Black Label",
    "Johnnie Walker Red Label",
    "Chivas Regal 12",
    "Ballantines Finest",
    "Glenfiddich 12",
    "The Glenlivet 12",
    "Monkey Shoulder",
    "Dewars White Label",
    "Teachers Highland Cream",
    "Black Dog Triple Gold",
    "J&B Rare"
  ],
  Rum: [
    "Old Monk Supreme",
    "Old Monk XXX",
    "Bacardi Carta Blanca",
    "Bacardi Black",
    "Captain Morgan Original",
    "Malibu Coconut Rum",
    "Havana Club 3",
    "McDowells No.1 Celebration",
    "Contessa XXX",
    "Amrut Two Indies",
    "Hercules Deluxe Rum"
  ],
  Vodka: [
    "Absolut Vodka",
    "Smirnoff Red",
    "Grey Goose",
    "Belvedere",
    "Ketel One",
    "Magic Moments",
    "Romanov Premium",
    "White Mischief",
    "Stolichnaya",
    "Finlandia",
    "Ciroc Ultra Premium"
  ],
  Gin: [
    "Bombay Sapphire",
    "Tanqueray London Dry",
    "Beefeater London Dry",
    "Gordon's London Dry",
    "Greater Than Gin",
    "Stranger & Sons",
    "Hendrick's Gin",
    "Roku Japanese Gin",
    "Blue Riband Gin",
    "Jaisalmer Indian Craft Gin",
    "Hapusa Himalayan Gin"
  ],
  Tequila: [
    "Jose Cuervo Especial Silver",
    "Jose Cuervo Especial Gold",
    "Patron Silver",
    "Patron Reposado",
    "Camino Real Blanco",
    "Don Julio Blanco",
    "Don Julio Reposado",
    "1800 Silver",
    "Sierra Tequila Silver",
    "El Jimador Blanco",
    "Sauza Silver"
  ],
  Brandy: [
    "Mansion House Brandy",
    "Honey Bee Brandy",
    "McDowells No.1 Brandy",
    "Morpheus XO",
    "Hennessy VS",
    "Courvoisier VSOP",
    "St Remy XO",
    "Old Admiral Brandy",
    "Dreher Brandy",
    "Constantino Brandy",
    "Golden Grape Brandy"
  ],
  Wine: [
    "Sula Chenin Blanc",
    "Sula Shiraz Cabernet",
    "Sula Sauvignon Blanc",
    "Fratelli Sette",
    "Fratelli Chardonnay",
    "Grover Zampa La Reserve",
    "Grover Art Collection Viognier",
    "York Arros",
    "Big Banyan Merlot",
    "Jacobs Creek Shiraz",
    "Four Seasons Barrique Reserve"
  ],
  Champagne: [
    "Chandon Brut",
    "Chandon Rose",
    "Moet & Chandon Brut",
    "Veuve Clicquot Yellow Label",
    "Dom Perignon Vintage",
    "GH Mumm Cordon Rouge",
    "Laurent Perrier La Cuvee",
    "Piper Heidsieck Brut",
    "Nicolas Feuillatte Brut",
    "Freixenet Cordon Negro",
    "Martini Prosecco"
  ],
  Breezer: [
    "Bacardi Breezer Cranberry",
    "Bacardi Breezer Jamaican Passion",
    "Bacardi Breezer Orange",
    "Bacardi Breezer Blackberry",
    "Bacardi Breezer Lime",
    "Bacardi Breezer Watermelon Mint",
    "Bacardi Breezer Pineapple",
    "Bacardi Breezer Blueberry",
    "Bacardi Breezer Lemon Ice",
    "Bacardi Breezer Peach",
    "Bacardi Breezer Lychee"
  ],
  Cocktails: [
    "Classic Mojito",
    "Long Island Iced Tea",
    "Cosmopolitan",
    "Margarita",
    "Whiskey Sour",
    "Old Fashioned",
    "Pina Colada",
    "Daiquiri",
    "Negroni",
    "Manhattan",
    "Espresso Martini"
  ],
  Mocktails: [
    "Virgin Mojito",
    "Blue Lagoon",
    "Fruit Punch",
    "Watermelon Cooler",
    "Mint Lemonade",
    "Virgin Pina Colada",
    "Cucumber Cooler",
    "Mango Mule",
    "Berry Fizz",
    "Green Apple Sparkler",
    "Passion Fruit Spritz"
  ],
  "Energy Drinks": [
    "Red Bull Energy Drink",
    "Red Bull Sugarfree",
    "Monster Energy Original",
    "Monster Ultra",
    "Sting Energy",
    "Hell Energy Classic",
    "Burn Energy",
    "Predator Energy",
    "Rockstar Original",
    "Gatorade Blue Bolt",
    "Powerade Mountain Blast"
  ],
  "Soft Drinks": [
    "Coca-Cola Can",
    "Thums Up Can",
    "Sprite Can",
    "Fanta Orange",
    "Limca",
    "Pepsi Can",
    "7UP",
    "Mountain Dew",
    "Appy Fizz",
    "Maaza Mango",
    "Paper Boat Aam Panna"
  ],
  "Soda Mixers": [
    "Schweppes Tonic Water",
    "Schweppes Soda Water",
    "Schweppes Ginger Ale",
    "Canada Dry Ginger Ale",
    "Sepoy & Co Tonic",
    "Svami Tonic Water",
    "Perrier Sparkling Water",
    "Kinley Club Soda",
    "Bisleri Soda",
    "Catch Club Soda",
    "Himalayan Sparkling Water"
  ]
};

function inferBrand(name) {
  const knownBrands = [
    "Johnnie Walker",
    "Royal Stag",
    "Old Monk",
    "Bacardi",
    "Jose Cuervo",
    "Mansion House",
    "Red Bull",
    "Coca-Cola",
    "Kingfisher",
    "Bira 91",
    "White Owl",
    "McDowells",
    "Grover",
    "Moet & Chandon",
    "Veuve Clicquot",
    "Laurent Perrier",
    "Piper Heidsieck",
    "Nicolas Feuillatte",
    "Paper Boat",
    "Mountain Dew",
    "Schweppes",
    "Canada Dry",
    "Sepoy & Co",
    "Svami",
    "Big Banyan",
    "Jacobs Creek",
    "Four Seasons"
  ];
  const match = knownBrands.find((brand) => name.startsWith(brand));
  return match || name.split(" ").slice(0, 2).join(" ");
}

function adjustPrices(prices, categoryIndex, itemIndex) {
  const factor = 1 + (itemIndex % 5) * 0.12 + Math.floor(itemIndex / 5) * 0.08 + categoryIndex * 0.005;
  return Object.fromEntries(
    Object.entries(prices).map(([key, value]) => [key, value > 0 ? Math.round((value * factor) / 10) * 10 : 0])
  );
}

function createBarItem(category, name, itemIndex) {
  const profile = categoryProfiles[category];
  const categoryIndex = BAR_CATEGORIES.indexOf(category);

  return {
    name,
    category,
    description: profile.description(name),
    image: getBarItemImage({ name, category, alcoholType: profile.alcoholType }),
    prices: adjustPrices(profile.prices, categoryIndex, itemIndex),
    stock: Math.max(6, profile.stock - (itemIndex % 6) * 2),
    preparationTime: profile.preparationTime,
    alcoholType: profile.alcoholType,
    brand: inferBrand(name),
    mlSize: profile.mlSize,
    isAvailable: true,
    isAlcoholic: profile.isAlcoholic,
    gstPercentage: 18
  };
}

export const barItems = BAR_CATEGORIES.flatMap((category) =>
  (categoryItems[category] || []).map((name, itemIndex) => createBarItem(category, name, itemIndex))
);

const seededCategories = new Set(barItems.map((item) => item.category));
const missingCategories = BAR_CATEGORIES.filter((category) => !seededCategories.has(category));
const undersizedCategories = BAR_CATEGORIES.filter(
  (category) => barItems.filter((item) => item.category === category).length < MIN_ITEMS_PER_CATEGORY
);

if (missingCategories.length) {
  throw new Error(`Sample bar items missing categories: ${missingCategories.join(", ")}`);
}

if (undersizedCategories.length) {
  throw new Error(`Sample bar categories need at least ${MIN_ITEMS_PER_CATEGORY} items: ${undersizedCategories.join(", ")}`);
}
