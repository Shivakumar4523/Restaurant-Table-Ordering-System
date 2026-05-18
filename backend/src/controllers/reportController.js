import Order from "../models/Order.js";
import Payment from "../models/Payment.js";

export async function getSalesReport(req, res, next) {
  try {
    const from = req.query.from ? new Date(req.query.from) : new Date(new Date().setHours(0, 0, 0, 0));
    const to = req.query.to ? new Date(req.query.to) : new Date();

    const payments = await Payment.find({ paidAt: { $gte: from, $lte: to } }).populate("table", "number section").sort({ paidAt: -1 });
    const orders = await Order.find({ createdAt: { $gte: from, $lte: to } });
    const revenue = payments.reduce((sum, payment) => sum + payment.total, 0);
    const gst = payments.reduce((sum, payment) => sum + payment.gst, 0);

    res.json({
      report: {
        from,
        to,
        revenue,
        gst,
        paidBills: payments.length,
        orderCount: orders.length,
        averageBill: payments.length ? Math.round(revenue / payments.length) : 0,
        payments
      }
    });
  } catch (error) {
    next(error);
  }
}
