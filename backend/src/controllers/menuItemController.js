import Category from "../models/Category.js";
import MenuItem from "../models/MenuItem.js";

async function resolveCategory(categoryId, categoryName) {
  if (categoryId) {
    const category = await Category.findById(categoryId);
    if (!category) throw Object.assign(new Error("Category not found"), { status: 400 });
    return category;
  }

  if (categoryName) {
    const category = await Category.findOne({ name: categoryName, isActive: true });
    if (!category) throw Object.assign(new Error("Category not found"), { status: 400 });
    return category;
  }

  throw Object.assign(new Error("Category is required"), { status: 400 });
}

export async function getMenuItems(req, res, next) {
  try {
    const { q, category, foodType, available } = req.query;
    const filter = {};

    if (available !== "false") filter.isAvailable = true;
    if (category && category !== "All") filter.categoryName = category;
    if (foodType && foodType !== "all") filter.foodType = foodType;
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { categoryName: { $regex: q, $options: "i" } },
        { tags: { $regex: q, $options: "i" } }
      ];
    }

    const menuItems = await MenuItem.find(filter).populate("category").sort({ isFeatured: -1, categoryName: 1, name: 1 });
    res.json({ menuItems });
  } catch (error) {
    next(error);
  }
}

export async function createMenuItem(req, res, next) {
  try {
    const category = await resolveCategory(req.body.category, req.body.categoryName);
    const menuItem = await MenuItem.create({
      ...req.body,
      category: category._id,
      categoryName: category.name,
      price: Number(req.body.price),
      prepTime: Number(req.body.prepTime || 15),
      isAvailable: req.body.isAvailable !== false,
      isFeatured: Boolean(req.body.isFeatured)
    });
    req.app.get("io")?.emit("menu-item:updated", menuItem);
    res.status(201).json({ menuItem });
  } catch (error) {
    next(error);
  }
}

export async function updateMenuItem(req, res, next) {
  try {
    const patch = { ...req.body };

    if (req.body.category || req.body.categoryName) {
      const category = await resolveCategory(req.body.category, req.body.categoryName);
      patch.category = category._id;
      patch.categoryName = category.name;
    }

    if (patch.price !== undefined) patch.price = Number(patch.price);
    if (patch.prepTime !== undefined) patch.prepTime = Number(patch.prepTime);

    const menuItem = await MenuItem.findByIdAndUpdate(req.params.id, patch, { new: true }).populate("category");
    if (!menuItem) return res.status(404).json({ message: "Menu item not found" });
    req.app.get("io")?.emit("menu-item:updated", menuItem);
    res.json({ menuItem });
  } catch (error) {
    next(error);
  }
}

export async function deleteMenuItem(req, res, next) {
  try {
    const menuItem = await MenuItem.findByIdAndUpdate(req.params.id, { isAvailable: false }, { new: true });
    if (!menuItem) return res.status(404).json({ message: "Menu item not found" });
    req.app.get("io")?.emit("menu-item:updated", menuItem);
    res.json({ message: "Menu item archived" });
  } catch (error) {
    next(error);
  }
}
