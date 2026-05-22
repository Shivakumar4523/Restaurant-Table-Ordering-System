import express from "express";
import { createCoupon, deleteCoupon, getActiveCoupons, getCoupons, updateCoupon } from "../controllers/couponController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getActiveCoupons);
router.get("/admin", protect, adminOnly, getCoupons);
router.post("/", protect, adminOnly, createCoupon);
router.patch("/:id", protect, adminOnly, updateCoupon);
router.delete("/:id", protect, adminOnly, deleteCoupon);

export default router;
