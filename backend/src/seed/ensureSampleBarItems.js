import BarItem from "../models/BarItem.js";
import { barItems } from "./sampleBarItems.js";

export async function ensureSampleBarItems() {
  const existingCount = await BarItem.countDocuments();
  if (existingCount > 0) return { inserted: 0, existing: existingCount };

  const insertedItems = await BarItem.insertMany(barItems, { ordered: false });
  return { inserted: insertedItems.length, existing: 0 };
}
