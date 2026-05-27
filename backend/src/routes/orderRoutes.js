import express from "express";
import {
  createOrder,
  getAllOrders,
  getMyOrders,
  getOrder,
  quoteOrder,
  updateOrderStatus
} from "../controllers/orderController.js";
import {
  createTableOrder,
  getActiveTableOrders,
  getBill,
  markBilling,
  recordPayment,
  updateTableOrderStatus
} from "../controllers/tableOrderController.js";
import { adminOnly, allowRoles, optionalAuth, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/quote", quoteOrder);
router.post("/table", protect, allowRoles("admin", "waiter"), createTableOrder);
router.get("/active", protect, allowRoles("admin", "waiter", "kitchen", "bar", "cashier"), getActiveTableOrders);
router.post("/payments", protect, allowRoles("admin", "cashier", "waiter"), recordPayment);
router.get("/:id/bill", protect, allowRoles("admin", "waiter", "cashier"), getBill);
router.patch("/:id/billing", protect, allowRoles("admin", "waiter", "cashier"), markBilling);
router.patch("/:id/table-status", protect, allowRoles("admin", "waiter", "kitchen", "bar", "cashier"), updateTableOrderStatus);
router.post("/", optionalAuth, createOrder);
router.get("/mine", protect, getMyOrders);
router.get("/", protect, adminOnly, getAllOrders);
router.get("/:id", getOrder);
router.patch("/:id/status", protect, adminOnly, updateOrderStatus);

export default router;
