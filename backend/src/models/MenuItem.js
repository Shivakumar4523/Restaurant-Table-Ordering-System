import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    categoryName: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, default: "" },
    foodType: { type: String, enum: ["veg", "non-veg"], default: "veg" },
    tags: [{ type: String }],
    prepTime: { type: Number, default: 15 },
    isAvailable: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false }
  },
  { timestamps: true }
);

menuItemSchema.index({ name: "text", description: "text", categoryName: "text", tags: "text" });

export default mongoose.model("MenuItem", menuItemSchema);
