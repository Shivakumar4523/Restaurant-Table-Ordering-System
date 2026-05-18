import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    type: { type: String, enum: ["flat", "percent"], default: "flat" },
    value: { type: Number, required: true },
    minOrder: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
    expiresAt: Date
  },
  { timestamps: true }
);

export default mongoose.model("Coupon", couponSchema);
