import type { BarItem, BarPegSize } from "@/lib/api";

export const BAR_CATEGORIES = [
  "Beer",
  "Imported Beer",
  "Craft Beer",
  "Whisky",
  "Scotch",
  "Rum",
  "Vodka",
  "Gin",
  "Tequila",
  "Brandy",
  "Wine",
  "Champagne",
  "Breezer",
  "Cocktails",
  "Mocktails",
  "Energy Drinks",
  "Soft Drinks",
  "Soda Mixers"
];

export const pegOptions: Array<{ value: BarPegSize; label: string; formField: "price30ml" | "price60ml" | "fullBottlePrice" }> = [
  { value: "smallPeg", label: "30ml", formField: "price30ml" },
  { value: "largePeg", label: "60ml", formField: "price60ml" },
  { value: "bottle", label: "Bottle", formField: "fullBottlePrice" }
];

export function getPegLabel(value: BarPegSize) {
  return pegOptions.find((option) => option.value === value)?.label || "30ml";
}

export function getPegPrice(item: BarItem, pegSize: BarPegSize) {
  return Number(item.prices?.[pegSize] || 0);
}

export function getAvailablePegSizes(item: BarItem) {
  return pegOptions.filter((option) => getPegPrice(item, option.value) > 0);
}

export function getDefaultPegSize(item: BarItem): BarPegSize {
  return getAvailablePegSizes(item)[0]?.value || "smallPeg";
}

export function isOutOfStock(item: BarItem) {
  return !item.isAvailable || Number(item.stock || 0) <= 0;
}

export function isLowStock(item: BarItem) {
  return item.isAvailable && Number(item.stock || 0) > 0 && Number(item.stock || 0) <= 5;
}

