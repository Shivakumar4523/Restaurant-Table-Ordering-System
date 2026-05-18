import express from "express";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

const subscriptions = [];

router.post("/subscribe", protect, (req, res) => {
  subscriptions.push({
    user: req.user._id,
    subscription: req.body,
    createdAt: new Date()
  });

  res.status(201).json({ message: "Push subscription saved", total: subscriptions.length });
});

router.get("/demo", (_req, res) => {
  res.json({
    title: "Order update",
    body: "Your Royal Spice order is being prepared.",
    note: "Wire this endpoint to a Web Push provider in production."
  });
});

export default router;
