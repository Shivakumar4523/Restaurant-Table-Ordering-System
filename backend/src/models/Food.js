import mongoose from "mongoose";

const foodSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ["Veg", "Non-Veg", "Fast Food", "Drinks", "Desserts"],
      required: true
    },
    price: { type: Number, required: true, min: 0 },
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
    image: { type: String, required: true },
    tags: [{ type: String }],
    isFeatured: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },
    prepTime: { type: Number, default: 20 }
  },
  { timestamps: true }
);

export default mongoose.model("Food", foodSchema);
