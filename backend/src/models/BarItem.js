import mongoose from "mongoose";
import { BAR_CATEGORIES } from "../constants/barCategories.js";

const priceSchema = new mongoose.Schema(
  {
    smallPeg: { type: Number, default: 0, min: 0 },
    largePeg: { type: Number, default: 0, min: 0 },
    bottle: { type: Number, default: 0, min: 0 }
  },
  { _id: false }
);

const barItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, enum: BAR_CATEGORIES, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    image: { type: String, default: "" },
    prices: { type: priceSchema, default: () => ({}) },
    stock: { type: Number, default: 0, min: 0 },
    preparationTime: { type: Number, default: 5, min: 0 },
    alcoholType: { type: String, default: "", trim: true },
    brand: { type: String, default: "", trim: true },
    mlSize: { type: Number, default: 0, min: 0 },
    isAvailable: { type: Boolean, default: true },
    isAlcoholic: { type: Boolean, default: true },
    gstPercentage: { type: Number, default: 18, min: 0, max: 100 }
  },
  { timestamps: true }
);

barItemSchema.index({ name: "text", description: "text", category: "text", brand: "text", alcoholType: "text" });
barItemSchema.index({ category: 1, isAvailable: 1, stock: 1 });

export default mongoose.model("BarItem", barItemSchema);

