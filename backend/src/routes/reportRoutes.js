import express from "express";
import { getSalesReport } from "../controllers/reportController.js";
import { allowRoles, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/sales", protect, allowRoles("admin", "cashier"), getSalesReport);

export default router;
