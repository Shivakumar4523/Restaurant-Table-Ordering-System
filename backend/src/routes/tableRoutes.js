import express from "express";
import { createTable, deleteTable, getTables, updateTable } from "../controllers/tableController.js";
import { allowRoles, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, allowRoles("admin", "waiter", "cashier"), getTables);
router.post("/", protect, allowRoles("admin"), createTable);
router.patch("/:id", protect, allowRoles("admin", "cashier"), updateTable);
router.delete("/:id", protect, allowRoles("admin"), deleteTable);

export default router;
