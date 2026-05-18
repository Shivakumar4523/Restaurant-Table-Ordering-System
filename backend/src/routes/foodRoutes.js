import express from "express";
import { createFood, deleteFood, getFood, getFoods, updateFood } from "../controllers/foodController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.get("/", getFoods);
router.get("/:slug", getFood);
router.post("/", protect, adminOnly, upload.single("imageFile"), createFood);
router.put("/:id", protect, adminOnly, upload.single("imageFile"), updateFood);
router.delete("/:id", protect, adminOnly, deleteFood);

export default router;
