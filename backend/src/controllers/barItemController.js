import { BAR_CATEGORIES } from "../constants/barCategories.js";
import BarItem from "../models/BarItem.js";
import { getDisplayBarItemImage } from "../utils/barItemImages.js";

const numberFields = new Set([
  "price30ml",
  "price60ml",
  "fullBottlePrice",
  "stockQuantity",
  "stock",
  "preparationTime",
  "mlSize",
  "gstPercentage"
]);

function toNumber(value, fallback = 0) {
  if (value === undefined || value === null || value === "") return fallback;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function toBoolean(value, fallback = false) {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "boolean") return value;
  return ["true", "1", "yes", "on"].includes(String(value).toLowerCase());
}

function cleanString(value) {
  return typeof value === "string" ? value.trim() : value;
}

function readNestedPrice(body, key) {
  if (body.prices?.[key] !== undefined) return body.prices[key];
  if (body[`prices.${key}`] !== undefined) return body[`prices.${key}`];
  return undefined;
}

function normalizeBarItemPayload(body, file, { partial = false } = {}) {
  const payload = {};
  const name = body.itemName ?? body.name;
  const category = body.category;
  const image = file ? `/uploads/${file.filename}` : body.image;
  const smallPeg = body.price30ml ?? readNestedPrice(body, "smallPeg");
  const largePeg = body.price60ml ?? readNestedPrice(body, "largePeg");
  const bottle = body.fullBottlePrice ?? readNestedPrice(body, "bottle");
  const stock = body.stockQuantity ?? body.stock;

  if (!partial || name !== undefined) payload.name = cleanString(name);
  if (!partial || category !== undefined) payload.category = cleanString(category);
  if (!partial || body.description !== undefined) payload.description = cleanString(body.description || "");
  if (image !== undefined) payload.image = cleanString(image || "");
  if (!partial || body.alcoholType !== undefined) payload.alcoholType = cleanString(body.alcoholType || "");
  if (!partial || body.brand !== undefined) payload.brand = cleanString(body.brand || "");

  if (!partial || smallPeg !== undefined || largePeg !== undefined || bottle !== undefined) {
    payload.prices = {};
    if (!partial || smallPeg !== undefined) payload.prices.smallPeg = toNumber(smallPeg, 0);
    if (!partial || largePeg !== undefined) payload.prices.largePeg = toNumber(largePeg, 0);
    if (!partial || bottle !== undefined) payload.prices.bottle = toNumber(bottle, 0);
  }

  if (!partial || stock !== undefined) payload.stock = toNumber(stock, 0);
  if (!partial || body.preparationTime !== undefined) payload.preparationTime = toNumber(body.preparationTime, 5);
  if (!partial || body.mlSize !== undefined) payload.mlSize = toNumber(body.mlSize, 0);
  if (!partial || body.gstPercentage !== undefined) payload.gstPercentage = toNumber(body.gstPercentage, 18);
  if (!partial || body.isAvailable !== undefined) payload.isAvailable = toBoolean(body.isAvailable, true);
  if (!partial || body.isAlcoholic !== undefined) payload.isAlcoholic = toBoolean(body.isAlcoholic, true);

  if (!partial) {
    if (!payload.name) throw Object.assign(new Error("Drink name is required"), { status: 400 });
    if (!payload.category) throw Object.assign(new Error("Category is required"), { status: 400 });
  }

  if (payload.category && !BAR_CATEGORIES.includes(payload.category)) {
    throw Object.assign(new Error("Invalid bar category"), { status: 400 });
  }

  for (const field of numberFields) {
    if (body[field] !== undefined && Number.isNaN(Number(body[field]))) {
      throw Object.assign(new Error(`${field} must be a valid number`), { status: 400 });
    }
  }

  if (!partial && payload.prices && Object.values(payload.prices).every((price) => Number(price || 0) <= 0)) {
    throw Object.assign(new Error("Add at least one drink price"), { status: 400 });
  }

  return payload;
}

function flattenPricePatch(payload) {
  if (!payload.prices) return payload;

  const patch = { ...payload };
  const prices = payload.prices;
  delete patch.prices;

  for (const [key, value] of Object.entries(prices)) {
    patch[`prices.${key}`] = value;
  }

  return patch;
}

function withDisplayImage(item) {
  const data = typeof item?.toObject === "function" ? item.toObject() : { ...item };

  data.image = getDisplayBarItemImage(data);

  return data;
}

function buildBarItemFilter(query) {
  const { q, category, available, stockStatus } = query;
  const filter = {};

  if (category && category !== "All") filter.category = category;
  if (available === "true") filter.isAvailable = true;
  if (available === "false") filter.isAvailable = false;
  if (stockStatus === "out") filter.stock = { $lte: 0 };
  if (stockStatus === "low") filter.stock = { $gt: 0, $lte: 5 };
  if (stockStatus === "in") filter.stock = { $gt: 5 };
  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
      { category: { $regex: q, $options: "i" } },
      { brand: { $regex: q, $options: "i" } },
      { alcoholType: { $regex: q, $options: "i" } }
    ];
  }

  return filter;
}

export async function getBarCategories(_req, res) {
  res.json({ categories: BAR_CATEGORIES });
}

export async function getBarItems(req, res, next) {
  try {
    const page = Math.max(1, toNumber(req.query.page, 1));
    const limit = Math.min(240, Math.max(1, toNumber(req.query.limit, 12)));
    const skip = (page - 1) * limit;
    const filter = buildBarItemFilter(req.query);

    const [barItems, total] = await Promise.all([
      BarItem.find(filter).sort({ category: 1, name: 1 }).skip(skip).limit(limit),
      BarItem.countDocuments(filter)
    ]);

    res.json({
      barItems: barItems.map(withDisplayImage),
      categories: BAR_CATEGORIES,
      pagination: {
        page,
        limit,
        total,
        pages: Math.max(1, Math.ceil(total / limit))
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getBarItem(req, res, next) {
  try {
    const barItem = await BarItem.findById(req.params.id);
    if (!barItem) return res.status(404).json({ message: "Bar item not found" });
    res.json({ barItem: withDisplayImage(barItem) });
  } catch (error) {
    next(error);
  }
}

export async function createBarItem(req, res, next) {
  try {
    const payload = normalizeBarItemPayload(req.body, req.file);
    payload.image = getDisplayBarItemImage(payload);
    const barItem = await BarItem.create(payload);
    const responseBarItem = withDisplayImage(barItem);
    req.app.get("io")?.emit("bar-item:updated", responseBarItem);
    res.status(201).json({ barItem: responseBarItem });
  } catch (error) {
    next(error);
  }
}

export async function updateBarItem(req, res, next) {
  try {
    const payload = normalizeBarItemPayload(req.body, req.file, { partial: true });
    const barItem = await BarItem.findByIdAndUpdate(req.params.id, flattenPricePatch(payload), { new: true, runValidators: true });

    if (!barItem) return res.status(404).json({ message: "Bar item not found" });

    const responseBarItem = withDisplayImage(barItem);
    req.app.get("io")?.emit("bar-item:updated", responseBarItem);
    res.json({ barItem: responseBarItem });
  } catch (error) {
    next(error);
  }
}

export async function deleteBarItem(req, res, next) {
  try {
    const barItem = await BarItem.findByIdAndDelete(req.params.id);
    if (!barItem) return res.status(404).json({ message: "Bar item not found" });
    req.app.get("io")?.emit("bar-item:deleted", { _id: req.params.id });
    res.json({ message: "Bar item deleted" });
  } catch (error) {
    next(error);
  }
}
