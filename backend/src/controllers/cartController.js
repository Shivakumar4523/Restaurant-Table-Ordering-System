import Cart from "../models/Cart.js";
import Food from "../models/Food.js";

async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ user: userId }).populate("items.food");
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return cart.populate("items.food");
}

export async function getCart(req, res, next) {
  try {
    const cart = await getOrCreateCart(req.user._id);
    res.json({ cart });
  } catch (error) {
    next(error);
  }
}

export async function addToCart(req, res, next) {
  try {
    const { foodId, quantity = 1 } = req.body;
    const food = await Food.findById(foodId);
    if (!food) return res.status(404).json({ message: "Food not found" });

    const cart = await getOrCreateCart(req.user._id);
    const existing = cart.items.find((item) => item.food._id.toString() === foodId);

    if (existing) existing.quantity += Number(quantity);
    else cart.items.push({ food: foodId, quantity: Number(quantity) });

    await cart.save();
    await cart.populate("items.food");
    res.status(201).json({ cart });
  } catch (error) {
    next(error);
  }
}

export async function updateCartItem(req, res, next) {
  try {
    const { quantity } = req.body;
    const cart = await getOrCreateCart(req.user._id);
    const item = cart.items.find((entry) => entry.food._id.toString() === req.params.foodId);

    if (!item) return res.status(404).json({ message: "Cart item not found" });

    item.quantity = Math.max(1, Number(quantity || 1));
    await cart.save();
    await cart.populate("items.food");
    res.json({ cart });
  } catch (error) {
    next(error);
  }
}

export async function removeCartItem(req, res, next) {
  try {
    const cart = await getOrCreateCart(req.user._id);
    cart.items = cart.items.filter((item) => item.food._id.toString() !== req.params.foodId);
    await cart.save();
    res.json({ cart });
  } catch (error) {
    next(error);
  }
}

export async function clearCart(req, res, next) {
  try {
    const cart = await getOrCreateCart(req.user._id);
    cart.items = [];
    await cart.save();
    res.json({ cart });
  } catch (error) {
    next(error);
  }
}
