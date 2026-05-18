import express from "express";
import Order from "../models/Order.js";
import { getRazorpayClient, verifyRazorpaySignature } from "../config/razorpay.js";

const router = express.Router();

router.post("/razorpay/create-order", async (req, res, next) => {
  try {
    const order = await Order.findById(req.body.orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const razorpay = getRazorpayClient();
    if (!razorpay) {
      return res.status(503).json({ message: "Razorpay keys are not configured" });
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: order.total * 100,
      currency: "INR",
      receipt: order._id.toString(),
      notes: {
        orderId: order._id.toString()
      }
    });

    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    res.json({
      key: process.env.RAZORPAY_KEY_ID,
      razorpayOrder,
      amount: order.total
    });
  } catch (error) {
    next(error);
  }
});

router.post("/razorpay/verify", async (req, res, next) => {
  try {
    const {
      orderId,
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: signature
    } = req.body;

    const verified = verifyRazorpaySignature({
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature
    });

    if (!verified) {
      return res.status(400).json({ message: "Payment signature verification failed" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.paymentStatus = "paid";
    order.razorpayOrderId = razorpayOrderId;
    order.razorpayPaymentId = razorpayPaymentId;
    order.status = "confirmed";
    order.tracking.push({
      status: "confirmed",
      message: "Payment received and order confirmed."
    });
    await order.save();

    res.json({ order });
  } catch (error) {
    next(error);
  }
});

router.post("/upi/mark-pending", async (req, res, next) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.body.orderId,
      {
        paymentStatus: "pending",
        status: "confirmed",
        $push: {
          tracking: {
            status: "confirmed",
            message: "UPI payment selected. Payment will be verified by the restaurant."
          }
        }
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ order });
  } catch (error) {
    next(error);
  }
});

export default router;
