import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    food: { type: mongoose.Schema.Types.ObjectId, ref: "Food" },
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem" },
    barItem: { type: mongoose.Schema.Types.ObjectId, ref: "BarItem" },
    itemType: { type: String, enum: ["food", "menuItem", "barItem"], default: "menuItem" },
    name: String,
    image: String,
    price: Number,
    quantity: { type: Number, default: 1, min: 1 },
    pegSize: String,
    gstPercentage: Number,
    stationStatus: { type: String, enum: ["pending", "preparing", "ready", "served"], default: "pending" },
    note: String
  },
  { _id: false }
);

const stationStatuses = ["pending", "preparing", "ready", "served"];

const addressSchema = new mongoose.Schema(
  {
    name: String,
    phone: String,
    line1: String,
    line2: String,
    city: String,
    state: String,
    pincode: String,
    landmark: String
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    waiter: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    table: { type: mongoose.Schema.Types.ObjectId, ref: "Table" },
    tableNumber: String,
    orderType: { type: String, enum: ["delivery", "table"], default: "delivery" },
    guestName: String,
    guestPhone: String,
    items: [orderItemSchema],
    address: addressSchema,
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 49 },
    tax: { type: Number, default: 0 },
    gst: { type: Number, default: 0 },
    gstRate: { type: Number, default: 5 },
    total: { type: Number, required: true },
    couponCode: String,
    paymentMethod: {
      type: String,
      enum: ["razorpay", "upi", "cod", "cash", "card"],
      default: "cash"
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending"
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    status: {
      type: String,
      enum: [
        "placed",
        "confirmed",
        "pending",
        "preparing",
        "ready",
        "served",
        "billing",
        "out-for-delivery",
        "delivered",
        "merged",
        "cancelled"
      ],
      default: "pending"
    },
    kitchenStatus: { type: String, enum: stationStatuses },
    barStatus: { type: String, enum: stationStatuses },
    tracking: [
      {
        status: String,
        message: String,
        at: { type: Date, default: Date.now }
      }
    ],
    notes: String,
    customerNotes: String,
    billNumber: String,
    mergedInto: { type: mongoose.Schema.Types.ObjectId, ref: "Order" }
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
