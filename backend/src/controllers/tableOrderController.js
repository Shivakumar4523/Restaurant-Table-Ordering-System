import MenuItem from "../models/MenuItem.js";
import Order from "../models/Order.js";
import Payment from "../models/Payment.js";
import Table from "../models/Table.js";
import { calculateBill } from "../utils/gst.js";

const activeStatuses = ["pending", "preparing", "ready", "served", "billing"];

async function populateOrder(order) {
  return order.populate([
    { path: "table", select: "number section status capacity" },
    { path: "waiter", select: "name role employeeCode" }
  ]);
}

async function buildItems(items) {
  const ids = items.map((item) => item.menuItem || item.id || item._id);
  const menuItems = await MenuItem.find({ _id: { $in: ids }, isAvailable: true });
  const byId = new Map(menuItems.map((item) => [item._id.toString(), item]));

  return items.map((item) => {
    const id = String(item.menuItem || item.id || item._id);
    const menuItem = byId.get(id);
    if (!menuItem) throw Object.assign(new Error(`Menu item not found: ${id}`), { status: 400 });

    return {
      menuItem: menuItem._id,
      name: menuItem.name,
      image: menuItem.image,
      price: menuItem.price,
      quantity: Math.max(1, Number(item.quantity || 1)),
      note: item.note
    };
  });
}

export async function createTableOrder(req, res, next) {
  try {
    const table = await Table.findById(req.body.tableId);
    if (!table || !table.isActive) return res.status(404).json({ message: "Table not found" });

    const items = await buildItems(req.body.items || []);
    if (!items.length) return res.status(400).json({ message: "Add at least one menu item" });

    const bill = calculateBill(items, req.body.discount);
    const order = await Order.create({
      orderType: "table",
      table: table._id,
      tableNumber: table.number,
      waiter: req.user._id,
      items,
      subtotal: bill.subtotal,
      discount: bill.discount,
      deliveryFee: 0,
      tax: bill.gst,
      gst: bill.gst,
      gstRate: bill.gstRate,
      total: bill.total,
      paymentMethod: "cash",
      paymentStatus: "pending",
      status: "pending",
      customerNotes: req.body.customerNotes,
      notes: req.body.customerNotes,
      tracking: [{ status: "pending", message: `Table ${table.number} order sent to kitchen.` }]
    });

    table.status = "ordered";
    table.currentOrder = order._id;
    await table.save();

    const populated = await populateOrder(order);
    const io = req.app.get("io");
    io?.emit("order:created", populated);
    io?.emit("table:updated", table);

    res.status(201).json({ order: populated });
  } catch (error) {
    next(error);
  }
}

export async function getActiveTableOrders(_req, res, next) {
  try {
    const orders = await Order.find({ orderType: "table", status: { $in: activeStatuses }, paymentStatus: { $ne: "paid" } })
      .populate("table", "number section status capacity")
      .populate("waiter", "name role employeeCode")
      .sort({ createdAt: -1 });
    res.json({ orders });
  } catch (error) {
    next(error);
  }
}

export async function updateTableOrderStatus(req, res, next) {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = req.body.status;
    order.tracking.push({ status: req.body.status, message: req.body.message || `Order marked as ${req.body.status}` });
    await order.save();

    const table = order.table ? await Table.findById(order.table) : null;
    if (table) {
      if (req.body.status === "pending") table.status = "ordered";
      if (req.body.status === "preparing" || req.body.status === "ready" || req.body.status === "served") table.status = "busy";
      if (req.body.status === "billing") table.status = "billing";
      if (req.body.status === "cancelled") {
        table.status = "empty";
        table.currentOrder = null;
      }
      await table.save();
      req.app.get("io")?.emit("table:updated", table);
    }

    const populated = await populateOrder(order);
    req.app.get("io")?.emit("order:updated", populated);
    res.json({ order: populated });
  } catch (error) {
    next(error);
  }
}

export async function getBill(req, res, next) {
  try {
    const order = await Order.findById(req.params.id).populate("table", "number section").populate("waiter", "name");
    if (!order) return res.status(404).json({ message: "Order not found" });

    const bill = calculateBill(order.items, order.discount);
    res.json({ bill: { order, ...bill, billNumber: order.billNumber || `RT-${order._id.toString().slice(-6).toUpperCase()}` } });
  } catch (error) {
    next(error);
  }
}

export async function markBilling(req, res, next) {
  try {
    req.body.status = "billing";
    return updateTableOrderStatus(req, res, next);
  } catch (error) {
    next(error);
  }
}

export async function recordPayment(req, res, next) {
  try {
    const order = await Order.findById(req.body.orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const bill = calculateBill(order.items, order.discount);
    const payment = await Payment.create({
      order: order._id,
      table: order.table,
      method: req.body.method || "cash",
      subtotal: bill.subtotal,
      gst: bill.gst,
      total: bill.total,
      receivedBy: req.user._id
    });

    order.paymentStatus = "paid";
    order.paymentMethod = payment.method;
    order.status = "served";
    order.billNumber = order.billNumber || `RT-${order._id.toString().slice(-6).toUpperCase()}`;
    order.tracking.push({ status: "served", message: `Bill paid by ${payment.method}.` });
    await order.save();

    const table = order.table ? await Table.findById(order.table) : null;
    if (table) {
      table.status = "empty";
      table.currentOrder = null;
      await table.save();
      req.app.get("io")?.emit("table:updated", table);
    }

    const populated = await populateOrder(order);
    req.app.get("io")?.emit("order:updated", populated);
    res.status(201).json({ payment, order: populated });
  } catch (error) {
    next(error);
  }
}
