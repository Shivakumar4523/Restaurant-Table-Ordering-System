import express from "express";
import {
  createBarItem,
  deleteBarItem,
  getBarCategories,
  getBarItem,
  getBarItems,
  updateBarItem
} from "../controllers/barItemController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.get("/categories", getBarCategories);
router.get("/", getBarItems);
router.get("/:id", getBarItem);
router.post("/", protect, adminOnly, upload.single("imageFile"), createBarItem);
router.put("/:id", protect, adminOnly, upload.single("imageFile"), updateBarItem);
router.delete("/:id", protect, adminOnly, deleteBarItem);

export default router;

