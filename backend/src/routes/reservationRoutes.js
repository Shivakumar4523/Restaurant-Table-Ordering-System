import express from "express";
import Reservation from "../models/Reservation.js";
import { protect, adminOnly, optionalAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", optionalAuth, async (req, res, next) => {
  try {
    const reservation = await Reservation.create({
      ...req.body,
      user: req.user?._id
    });

    res.status(201).json({ reservation });
  } catch (error) {
    next(error);
  }
});

router.get("/mine", protect, async (req, res, next) => {
  try {
    const reservations = await Reservation.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ reservations });
  } catch (error) {
    next(error);
  }
});

router.get("/", protect, adminOnly, async (_req, res, next) => {
  try {
    const reservations = await Reservation.find({}).sort({ createdAt: -1 });
    res.json({ reservations });
  } catch (error) {
    next(error);
  }
});

router.patch("/:id/status", protect, adminOnly, async (req, res, next) => {
  try {
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    res.json({ reservation });
  } catch (error) {
    next(error);
  }
});

export default router;
