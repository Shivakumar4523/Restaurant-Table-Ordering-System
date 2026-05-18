import Food from "../models/Food.js";

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export async function getFoods(req, res, next) {
  try {
    const { category, q, featured } = req.query;
    const filter = { isAvailable: true };

    if (category && category !== "All") filter.category = category;
    if (featured === "true") filter.isFeatured = true;
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { tags: { $regex: q, $options: "i" } }
      ];
    }

    const foods = await Food.find(filter).sort({ isFeatured: -1, rating: -1, createdAt: -1 });
    res.json({ foods });
  } catch (error) {
    next(error);
  }
}

export async function getFood(req, res, next) {
  try {
    const food = await Food.findOne({ slug: req.params.slug });
    if (!food) return res.status(404).json({ message: "Food not found" });
    res.json({ food });
  } catch (error) {
    next(error);
  }
}

export async function createFood(req, res, next) {
  try {
    const image = req.file ? `/uploads/${req.file.filename}` : req.body.image;
    const food = await Food.create({
      ...req.body,
      price: Number(req.body.price),
      rating: Number(req.body.rating || 4.5),
      prepTime: Number(req.body.prepTime || 20),
      isFeatured: req.body.isFeatured === "true" || req.body.isFeatured === true,
      isAvailable: req.body.isAvailable !== "false",
      slug: req.body.slug || slugify(req.body.name),
      image
    });

    res.status(201).json({ food });
  } catch (error) {
    next(error);
  }
}

export async function updateFood(req, res, next) {
  try {
    const patch = {
      ...req.body,
      price: req.body.price === undefined ? undefined : Number(req.body.price),
      rating: req.body.rating === undefined ? undefined : Number(req.body.rating),
      prepTime: req.body.prepTime === undefined ? undefined : Number(req.body.prepTime)
    };

    if (req.file) patch.image = `/uploads/${req.file.filename}`;
    if (req.body.name && !req.body.slug) patch.slug = slugify(req.body.name);
    Object.keys(patch).forEach((key) => patch[key] === undefined && delete patch[key]);

    const food = await Food.findByIdAndUpdate(req.params.id, patch, { new: true });
    if (!food) return res.status(404).json({ message: "Food not found" });
    res.json({ food });
  } catch (error) {
    next(error);
  }
}

export async function deleteFood(req, res, next) {
  try {
    const food = await Food.findByIdAndDelete(req.params.id);
    if (!food) return res.status(404).json({ message: "Food not found" });
    res.json({ message: "Food deleted" });
  } catch (error) {
    next(error);
  }
}
