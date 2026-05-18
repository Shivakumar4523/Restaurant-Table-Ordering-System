import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    table: { type: mongoose.Schema.Types.ObjectId, ref: "Table" },
    method: { type: String, enum: ["cash", "card", "upi"], default: "cash" },
    subtotal: { type: Number, required: true },
    gst: { type: Number, required: true },
    total: { type: Number, required: true },
    receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: { type: String, enum: ["paid", "refunded"], default: "paid" },
    paidAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
