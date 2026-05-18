import express from "express";
import Order from "../models/Order.js";
import Food from "../models/Food.js";
import Reservation from "../models/Reservation.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, adminOnly, async (_req, res, next) => {
  try {
    const [orders, foodsCount, reservationsCount, revenueAgg, recentOrders] = await Promise.all([
      Order.countDocuments(),
      Food.countDocuments(),
      Reservation.countDocuments(),
      Order.aggregate([{ $group: { _id: null, revenue: { $sum: "$total" } } }]),
      Order.find({}).sort({ createdAt: -1 }).limit(8)
    ]);

    const statusBreakdown = await Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      summary: {
        orders,
        foods: foodsCount,
        reservations: reservationsCount,
        revenue: revenueAgg[0]?.revenue || 0
      },
      statusBreakdown,
      recentOrders
    });
  } catch (error) {
    next(error);
  }
});

export default router;
