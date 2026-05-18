import express from "express";
import { createMenuItem, deleteMenuItem, getMenuItems, updateMenuItem } from "../controllers/menuItemController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getMenuItems);
router.post("/", protect, adminOnly, createMenuItem);
router.patch("/:id", protect, adminOnly, updateMenuItem);
router.delete("/:id", protect, adminOnly, deleteMenuItem);

export default router;
