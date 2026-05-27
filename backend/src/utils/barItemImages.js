const CATEGORY_IMAGE_TERMS = {
  Beer: ["beer", "bottle", "bar"],
  "Imported Beer": ["imported", "beer", "bottle"],
  "Craft Beer": ["craft", "beer", "pub"],
  Whisky: ["whisky", "glass", "bottle"],
  Scotch: ["scotch", "whisky", "bottle"],
  Rum: ["rum", "bottle", "cocktail"],
  Vodka: ["vodka", "bottle", "bar"],
  Gin: ["gin", "tonic", "bottle"],
  Tequila: ["tequila", "shot", "bottle"],
  Brandy: ["brandy", "glass", "bottle"],
  Wine: ["wine", "bottle", "glass"],
  Champagne: ["champagne", "sparkling", "wine"],
  Breezer: ["breezer", "cooler", "bottle"],
  Cocktails: ["cocktail", "bar", "drink"],
  Mocktails: ["mocktail", "fruit", "drink"],
  "Energy Drinks": ["energy", "drink", "can"],
  "Soft Drinks": ["soft", "drink", "can"],
  "Soda Mixers": ["tonic", "soda", "water"]
};

const STOP_WORDS = new Set(["and", "the", "no", "one"]);

function stableHash(value) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function cleanTokens(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/&/g, " and ")
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .toLowerCase()
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token && !STOP_WORDS.has(token));
}

function uniqueTokens(tokens) {
  return [...new Set(tokens.filter(Boolean))].slice(0, 8);
}

export function getBarItemImage({ name, category, alcoholType }) {
  const nameTokens = cleanTokens(name).slice(0, 2);
  const categoryTokens = CATEGORY_IMAGE_TERMS[category] || cleanTokens(category);
  const alcoholTokens = cleanTokens(alcoholType);
  const tokens = uniqueTokens([...nameTokens, categoryTokens[0], alcoholTokens[0]]).slice(0, 3);
  const keywords = tokens.length ? tokens.join(",") : "bar,drink,bottle";
  const lock = 10000 + (stableHash(`${category || ""}:${name || ""}`) % 90000);

  return `https://loremflickr.com/900/700/${keywords}?lock=${lock}`;
}

export function shouldUseGeneratedBarImage(image) {
  if (!image) return true;

  try {
    const parsed = new URL(image);
    return parsed.hostname === "loremflickr.com";
  } catch {
    return false;
  }
}

export function getDisplayBarItemImage(item) {
  return shouldUseGeneratedBarImage(item?.image) ? getBarItemImage(item || {}) : item.image;
}
