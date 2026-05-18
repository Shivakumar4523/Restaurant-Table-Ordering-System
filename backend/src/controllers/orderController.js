import Coupon from "../models/Coupon.js";
import Food from "../models/Food.js";
import Order from "../models/Order.js";

export async function calculateOrder({ items, couponCode }) {
  const ids = items.map((item) => item.food || item._id || item.id);
  const foods = await Food.find({ _id: { $in: ids } });
  const byId = new Map(foods.map((food) => [food._id.toString(), food]));

  const normalized = items.map((item) => {
    const id = String(item.food || item._id || item.id);
    const food = byId.get(id);

    if (!food) throw Object.assign(new Error(`Food item not found: ${id}`), { status: 400 });

    const quantity = Math.max(1, Number(item.quantity || 1));
    return {
      food: food._id,
      name: food.name,
      image: food.image,
      price: food.price,
      quantity
    };
  });

  const subtotal = normalized.reduce((sum, item) => sum + item.price * item.quantity, 0);
  let discount = 0;
  let appliedCoupon = null;

  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), active: true });
    const expired = coupon?.expiresAt && coupon.expiresAt < new Date();

    if (coupon && !expired && subtotal >= coupon.minOrder) {
      discount = coupon.type === "percent" ? Math.round((subtotal * coupon.value) / 100) : coupon.value;
      appliedCoupon = coupon.code;
    }
  }

  const deliveryFee = subtotal >= 999 ? 0 : 49;
  const tax = Math.round((subtotal - discount) * 0.05);
  const total = Math.max(0, subtotal - discount + deliveryFee + tax);

  return { items: normalized, subtotal, discount, deliveryFee, tax, total, couponCode: appliedCoupon };
}

export async function quoteOrder(req, res, next) {
  try {
    const quote = await calculateOrder(req.body);
    res.json({ quote });
  } catch (error) {
    next(error);
  }
}

export async function createOrder(req, res, next) {
  try {
    const quote = await calculateOrder(req.body);
    const paymentMethod = req.body.paymentMethod || "cod";

    const order = await Order.create({
      user: req.user?._id,
      guestName: req.body.guestName,
      guestPhone: req.body.guestPhone,
      address: req.body.address,
      paymentMethod,
      paymentStatus: "pending",
      notes: req.body.notes,
      tracking: [{ status: "placed", message: "Your order has been placed." }],
      ...quote
    });

    res.status(201).json({ order });
  } catch (error) {
    next(error);
  }
}

export async function getMyOrders(req, res, next) {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (error) {
    next(error);
  }
}

export async function getAllOrders(_req, res, next) {
  try {
    const orders = await Order.find({}).populate("user", "name email phone").sort({ createdAt: -1 });
    res.json({ orders });
  } catch (error) {
    next(error);
  }
}

export async function getOrder(req, res, next) {
  try {
    const order = await Order.findById(req.params.id).populate("user", "name email phone");
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ order });
  } catch (error) {
    next(error);
  }
}

export async function updateOrderStatus(req, res, next) {
  try {
    const { status, message } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    order.tracking.push({ status, message: message || `Order marked as ${status}` });
    await order.save();

    res.json({ order });
  } catch (error) {
    next(error);
  }
}
