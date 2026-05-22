import Coupon from "../models/Coupon.js";

function activeCouponFilter() {
  const now = new Date();
  return {
    active: true,
    $or: [{ expiresAt: { $exists: false } }, { expiresAt: null }, { expiresAt: { $gte: now } }]
  };
}

function parseExpiry(value) {
  if (!value) return undefined;
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T23:59:59.999Z`);
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw Object.assign(new Error("Invalid expiry date"), { status: 400 });
  }

  return date;
}

function normalizeCouponPayload(body, { partial = false } = {}) {
  const payload = {};

  if (!partial || body.code !== undefined) {
    const code = String(body.code || "").trim().toUpperCase();
    if (!code) throw Object.assign(new Error("Coupon code is required"), { status: 400 });
    payload.code = code;
  }

  if (!partial || body.type !== undefined) {
    const type = body.type || "flat";
    if (!["flat", "percent"].includes(type)) throw Object.assign(new Error("Coupon type must be flat or percent"), { status: 400 });
    payload.type = type;
  }

  if (!partial || body.value !== undefined) {
    const value = Number(body.value);
    if (!Number.isFinite(value) || value <= 0) throw Object.assign(new Error("Coupon value must be greater than 0"), { status: 400 });
    if ((body.type || payload.type) === "percent" && value > 100) {
      throw Object.assign(new Error("Percent coupons cannot be greater than 100"), { status: 400 });
    }
    payload.value = value;
  }

  if (!partial || body.minOrder !== undefined) {
    const minOrder = Number(body.minOrder || 0);
    if (!Number.isFinite(minOrder) || minOrder < 0) throw Object.assign(new Error("Minimum order must be 0 or more"), { status: 400 });
    payload.minOrder = minOrder;
  }

  if (body.active !== undefined) payload.active = body.active !== false;
  if (body.expiresAt !== undefined) payload.expiresAt = parseExpiry(body.expiresAt) || null;

  return payload;
}

export async function getActiveCoupons(_req, res, next) {
  try {
    const coupons = await Coupon.find(activeCouponFilter()).sort({ minOrder: 1, code: 1 });
    res.json({ coupons });
  } catch (error) {
    next(error);
  }
}

export async function getCoupons(_req, res, next) {
  try {
    const coupons = await Coupon.find({}).sort({ active: -1, minOrder: 1, code: 1 });
    res.json({ coupons });
  } catch (error) {
    next(error);
  }
}

export async function createCoupon(req, res, next) {
  try {
    const coupon = await Coupon.create(normalizeCouponPayload(req.body));
    res.status(201).json({ coupon });
  } catch (error) {
    next(error);
  }
}

export async function updateCoupon(req, res, next) {
  try {
    const patch = normalizeCouponPayload(req.body, { partial: true });
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, patch, { new: true });
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });
    res.json({ coupon });
  } catch (error) {
    next(error);
  }
}

export async function deleteCoupon(req, res, next) {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, { active: false }, { new: true });
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });
    res.json({ message: "Coupon deactivated" });
  } catch (error) {
    next(error);
  }
}
