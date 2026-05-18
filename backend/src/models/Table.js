import mongoose from "mongoose";

const tableSchema = new mongoose.Schema(
  {
    number: { type: String, required: true, unique: true, trim: true },
    capacity: { type: Number, required: true, min: 1 },
    section: { type: String, default: "Main Dining", trim: true },
    status: {
      type: String,
      enum: ["empty", "ordered", "busy", "billing"],
      default: "empty"
    },
    currentOrder: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model("Table", tableSchema);
