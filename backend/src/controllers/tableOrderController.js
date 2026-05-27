import BarItem from "../models/BarItem.js";
import MenuItem from "../models/MenuItem.js";
import Order from "../models/Order.js";
import Payment from "../models/Payment.js";
import Table from "../models/Table.js";
import { getDisplayBarItemImage } from "../utils/barItemImages.js";
import { calculateBill } from "../utils/gst.js";

const activeStatuses = ["pending", "preparing", "ready", "served", "billing"];
const stationStatuses = ["pending", "preparing", "ready", "served"];
const stationActiveStatuses = ["pending", "preparing", "ready"];

async function populateOrder(order) {
  return order.populate([
    { path: "table", select: "number section status capacity" },
    { path: "waiter", select: "name role employeeCode" }
  ]);
}

async function buildItems(items) {
  const ids = items.filter((item) => !item.barItem).map((item) => item.menuItem || item.id || item._id);
  const barIds = items.filter((item) => item.barItem).map((item) => item.barItem);
  const menuItems = await MenuItem.find({ _id: { $in: ids }, isAvailable: true });
  const barItems = await BarItem.find({ _id: { $in: barIds }, isAvailable: true });
  const byId = new Map(menuItems.map((item) => [item._id.toString(), item]));
  const barById = new Map(barItems.map((item) => [item._id.toString(), item]));
  const barDeductions = [];

  const normalizedItems = items.map((item) => {
    if (item.barItem) {
      const id = String(item.barItem);
      const barItem = barById.get(id);
      const quantity = Math.max(1, Number(item.quantity || 1));
      const pegSize = normalizePegSize(item.pegSize);

      if (!barItem) throw Object.assign(new Error(`Bar item not found: ${id}`), { status: 400 });
      if (Number(barItem.stock || 0) < quantity) throw Object.assign(new Error(`${barItem.name} is out of stock`), { status: 400 });

      const price = getBarPrice(barItem, pegSize);
      barDeductions.push({ id: barItem._id, quantity });

      return {
        barItem: barItem._id,
        itemType: "barItem",
        name: `${barItem.name} (${formatPegSize(pegSize)})`,
        image: getDisplayBarItemImage(barItem),
        price,
        quantity,
        pegSize,
        gstPercentage: barItem.gstPercentage,
        stationStatus: "pending",
        note: item.note
      };
    }

    const id = String(item.menuItem || item.id || item._id);
    const menuItem = byId.get(id);
    if (!menuItem) throw Object.assign(new Error(`Menu item not found: ${id}`), { status: 400 });

    return {
      menuItem: menuItem._id,
      itemType: "menuItem",
      name: menuItem.name,
      image: menuItem.image,
      price: menuItem.price,
      quantity: Math.max(1, Number(item.quantity || 1)),
      stationStatus: "pending",
      note: item.note
    };
  });

  return { items: normalizedItems, barDeductions };
}

function normalizePegSize(value) {
  if (["largePeg", "60ml", "60 ml"].includes(value)) return "largePeg";
  if (["bottle", "fullBottle", "full bottle"].includes(value)) return "bottle";
  return "smallPeg";
}

function formatPegSize(value) {
  if (value === "largePeg") return "60ml";
  if (value === "bottle") return "Bottle";
  return "30ml";
}

function getBarPrice(barItem, pegSize) {
  const price = Number(barItem.prices?.[pegSize] || 0);
  if (price <= 0) throw Object.assign(new Error(`${barItem.name} is not available for ${formatPegSize(pegSize)}`), { status: 400 });
  return price;
}

function getItems(orderOrItems) {
  return Array.isArray(orderOrItems) ? orderOrItems : orderOrItems.items || [];
}

function isBarItemLine(item) {
  return item.itemType === "barItem" || item.barItem;
}

function getLineStation(item) {
  return isBarItemLine(item) ? "bar" : "kitchen";
}

function getStationItems(orderOrItems, station) {
  const items = getItems(orderOrItems);
  return items.filter((item) => getLineStation(item) === station);
}

function hasKitchenItems(orderOrItems) {
  return getStationItems(orderOrItems, "kitchen").length > 0;
}

function hasBarItems(orderOrItems) {
  return getStationItems(orderOrItems, "bar").length > 0;
}

function getStationField(station) {
  return station === "bar" ? "barStatus" : "kitchenStatus";
}

function getFallbackStationStatus(order, station) {
  const stationStatus = order[getStationField(station)];
  if (stationStatuses.includes(stationStatus)) return stationStatus;
  if (stationStatuses.includes(order.status)) return order.status;
  if (order.status === "billing" || order.status === "delivered") return "served";
  return "pending";
}

function ensureLineStatuses(order) {
  for (const item of order.items || []) {
    if (stationStatuses.includes(item.stationStatus)) continue;
    item.stationStatus = getFallbackStationStatus(order, getLineStation(item));
  }
}

function getLineStatus(item, fallback = "pending") {
  return stationStatuses.includes(item.stationStatus) ? item.stationStatus : fallback;
}

function aggregateStationStatuses(statuses) {
  if (!statuses.length) return undefined;
  if (statuses.every((status) => status === "served")) return "served";
  if (statuses.every((status) => status === "ready" || status === "served")) return "ready";
  if (statuses.some((status) => status === "preparing")) return "preparing";
  return "pending";
}

function getAggregateStationStatus(order, station) {
  const fallback = getFallbackStationStatus(order, station);
  const statuses = getStationItems(order, station).map((item) => getLineStatus(item, fallback));
  return aggregateStationStatuses(statuses);
}

function shouldMoveLineStatus(currentStatus, requestedStatus) {
  if (requestedStatus === "served") return currentStatus !== "served";
  if (requestedStatus === "ready") return currentStatus === "pending" || currentStatus === "preparing";
  if (requestedStatus === "preparing") return currentStatus === "pending";
  if (requestedStatus === "pending") return currentStatus !== "served";
  return false;
}

function setStationLineStatuses(order, station, status) {
  ensureLineStatuses(order);
  const fallback = getFallbackStationStatus(order, station);

  for (const item of getStationItems(order, station)) {
    const currentStatus = getLineStatus(item, fallback);
    if (shouldMoveLineStatus(currentStatus, status)) item.stationStatus = status;
  }

  order[getStationField(station)] = getAggregateStationStatus(order, station);
}

function setAllStationLineStatuses(order, status) {
  if (hasKitchenItems(order)) setStationLineStatuses(order, "kitchen", status);
  if (hasBarItems(order)) setStationLineStatuses(order, "bar", status);
}

function syncStationStatusFields(order) {
  ensureLineStatuses(order);
  order.kitchenStatus = hasKitchenItems(order) ? getAggregateStationStatus(order, "kitchen") : undefined;
  order.barStatus = hasBarItems(order) ? getAggregateStationStatus(order, "bar") : undefined;
  order.status = deriveOrderStatus(order);
}

function syncOrderBill(order, discount = order.discount) {
  const bill = calculateBill(order.items || [], discount);
  order.subtotal = bill.subtotal;
  order.discount = bill.discount;
  order.deliveryFee = 0;
  order.tax = bill.gst;
  order.gst = bill.gst;
  order.gstRate = bill.gstRate;
  order.total = bill.total;
  return bill;
}

function toPlainOrderItem(item) {
  return typeof item.toObject === "function" ? item.toObject() : { ...item };
}

function mergeText(existing, incoming) {
  const existingText = String(existing || "").trim();
  const incomingText = String(incoming || "").trim();

  if (!incomingText) return existingText;
  if (!existingText) return incomingText;
  if (existingText.includes(incomingText)) return existingText;
  return `${existingText}\n${incomingText}`;
}

async function getOpenTableOrders(tableId) {
  return Order.find({
    orderType: "table",
    table: tableId,
    status: { $in: activeStatuses },
    paymentStatus: { $ne: "paid" }
  }).sort({ createdAt: 1 });
}

function pickPrimaryOrder(orders, preferredId) {
  const preferred = preferredId ? orders.find((order) => order._id.equals(preferredId)) : null;
  if (preferred) return preferred;
  return orders.find((order) => order.status === "billing") || orders[0] || null;
}

async function populateAndEmitOrder(io, order) {
  const populated = await populateOrder(order);
  io?.emit("order:updated", populated);
  return populated;
}

async function mergeOpenOrdersForTable(tableId, preferredId, io) {
  const openOrders = await getOpenTableOrders(tableId);
  const primary = pickPrimaryOrder(openOrders, preferredId);
  const mergedOrders = [];

  if (!primary) return { primary: null, mergedOrders };

  ensureLineStatuses(primary);

  for (const order of openOrders) {
    if (order._id.equals(primary._id)) continue;

    ensureLineStatuses(order);
    primary.items.push(...order.items.map(toPlainOrderItem));
    primary.discount = Number(primary.discount || 0) + Number(order.discount || 0);
    primary.customerNotes = mergeText(primary.customerNotes, order.customerNotes);
    primary.notes = mergeText(primary.notes, order.notes);
    primary.tracking.push({
      status: "merged",
      message: `Order ${order._id.toString().slice(-6).toUpperCase()} merged into this table bill.`
    });

    order.status = "merged";
    order.mergedInto = primary._id;
    order.tracking.push({
      status: "merged",
      message: `Merged into bill ${primary.billNumber || `RT-${primary._id.toString().slice(-6).toUpperCase()}`}.`
    });
    await order.save();
    mergedOrders.push(order);
  }

  syncStationStatusFields(primary);
  syncOrderBill(primary);
  await primary.save();

  for (const order of mergedOrders) {
    await populateAndEmitOrder(io, order);
  }

  return { primary, mergedOrders };
}

async function resolveBillOrder(orderId, io) {
  let order = await Order.findById(orderId);
  if (!order) return null;

  if (order.mergedInto) {
    order = await Order.findById(order.mergedInto);
    if (!order) return null;
  }

  if (order.table) {
    const { primary } = await mergeOpenOrdersForTable(order.table, order._id, io);
    return primary || order;
  }

  return order;
}

function getRequestedStation(req) {
  if (["kitchen", "bar"].includes(req.body.station)) return req.body.station;
  if (req.user?.role === "kitchen") return "kitchen";
  if (req.user?.role === "bar") return "bar";
  return null;
}

function ensureStationAccess(req, station) {
  if (req.user?.role === "admin") return;
  if (req.user?.role === station) return;
  throw Object.assign(new Error(`Only ${station} staff can update ${station} tickets`), { status: 403 });
}

function ensureStationHasItems(order, station) {
  if (station === "bar" && hasBarItems(order)) return;
  if (station === "kitchen" && hasKitchenItems(order)) return;
  throw Object.assign(new Error(`This order has no ${station} items`), { status: 400 });
}

function getRequiredStationStatuses(order) {
  const statuses = [];
  if (hasKitchenItems(order)) statuses.push(getAggregateStationStatus(order, "kitchen") || order.kitchenStatus || "pending");
  if (hasBarItems(order)) statuses.push(getAggregateStationStatus(order, "bar") || order.barStatus || "pending");
  return statuses;
}

function deriveOrderStatus(order) {
  const statuses = getRequiredStationStatuses(order);
  if (!statuses.length) return order.status;
  if (statuses.every((status) => status === "served")) return "billing";
  if (statuses.every((status) => status === "ready" || status === "served")) return "ready";
  if (statuses.some((status) => status === "preparing")) return "preparing";
  return "pending";
}

function updateTableStateForOrder(table, order) {
  if (order.status === "cancelled" || order.status === "merged") {
    table.status = "empty";
    table.currentOrder = null;
    return;
  }

  if (order.status === "billing") {
    table.status = "billing";
    return;
  }

  const stationStatuses = getRequiredStationStatuses(order);
  table.status = stationStatuses.some((status) => status !== "pending") ? "busy" : "ordered";
}

export async function createTableOrder(req, res, next) {
  try {
    const table = await Table.findById(req.body.tableId);
    if (!table || !table.isActive) return res.status(404).json({ message: "Table not found" });

    const { items, barDeductions } = await buildItems(req.body.items || []);
    if (!items.length) return res.status(400).json({ message: "Add at least one item" });
    const hasKitchenWork = hasKitchenItems(items);
    const hasBarWork = hasBarItems(items);
    const io = req.app.get("io");

    const { primary } = await mergeOpenOrdersForTable(table._id, table.currentOrder, io);
    const destination = hasKitchenWork && hasBarWork ? "kitchen and bar" : hasBarWork ? "bar" : "kitchen";
    let order = primary;
    let eventName = "order:updated";

    if (order) {
      ensureLineStatuses(order);
      order.items.push(...items);
      order.discount = Number(order.discount || 0) + Math.max(0, Number(req.body.discount || 0));
      order.customerNotes = mergeText(order.customerNotes, req.body.customerNotes);
      order.notes = mergeText(order.notes, req.body.customerNotes);
      order.tracking.push({
        status: "pending",
        message: `Additional table ${table.number} items sent to ${destination} and added to one bill.`
      });
      syncStationStatusFields(order);
      syncOrderBill(order);
      await order.save();
    } else {
      const bill = calculateBill(items, req.body.discount);
      order = await Order.create({
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
        kitchenStatus: hasKitchenWork ? "pending" : undefined,
        barStatus: hasBarWork ? "pending" : undefined,
        customerNotes: req.body.customerNotes,
        notes: req.body.customerNotes,
        tracking: [
          {
            status: "pending",
            message: `Table ${table.number} order sent to ${destination}.`
          }
        ]
      });
      eventName = "order:created";
    }

    updateTableStateForOrder(table, order);
    table.currentOrder = order._id;
    await table.save();
    await Promise.all(
      barDeductions.map((deduction) =>
        BarItem.findByIdAndUpdate(deduction.id, { $inc: { stock: -deduction.quantity } }, { new: true }).then((barItem) => {
          if (barItem) io?.emit("bar-item:updated", { ...barItem.toObject(), image: getDisplayBarItemImage(barItem) });
        })
      )
    );

    const populated = await populateOrder(order);
    io?.emit(eventName, populated);
    io?.emit("table:updated", table);

    res.status(201).json({ order: populated });
  } catch (error) {
    next(error);
  }
}

export async function getActiveTableOrders(req, res, next) {
  try {
    const filter = { orderType: "table", status: { $in: activeStatuses }, paymentStatus: { $ne: "paid" } };
    if (req.user?.role === "kitchen") filter.kitchenStatus = { $in: stationActiveStatuses };
    if (req.user?.role === "bar") filter.barStatus = { $in: stationActiveStatuses };

    const orders = await Order.find(filter)
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
    const io = req.app.get("io");
    const order = await resolveBillOrder(req.params.id, io);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const requestedStatus = String(req.body.status || "");
    const station = getRequestedStation(req);

    if (station) {
      if (!stationStatuses.includes(requestedStatus)) {
        return res.status(400).json({ message: "Invalid station status" });
      }

      ensureStationAccess(req, station);
      ensureStationHasItems(order, station);
      setStationLineStatuses(order, station, requestedStatus);
      order.tracking.push({
        status: requestedStatus,
        message: req.body.message || `${station === "bar" ? "Bar" : "Kitchen"} marked as ${requestedStatus}.`
      });
      order.status = deriveOrderStatus(order);
    } else {
      const nextStatus = requestedStatus;
      order.status = nextStatus;

      if (requestedStatus === "served") {
        setAllStationLineStatuses(order, "served");
        order.status = "billing";
        order.tracking.push({ status: "served", message: req.body.message || "Order served." });
      } else {
        if (nextStatus === "billing") {
          setAllStationLineStatuses(order, "served");
        }
        syncStationStatusFields(order);
        if (nextStatus === "billing") order.status = "billing";
        order.tracking.push({ status: nextStatus, message: req.body.message || `Order marked as ${nextStatus}` });
      }
    }

    if (order.status === "billing") {
      order.billNumber = order.billNumber || `RT-${order._id.toString().slice(-6).toUpperCase()}`;
      order.tracking.push({ status: "billing", message: "Order sent to cashier for billing." });
    }

    syncOrderBill(order);
    await order.save();

    const table = order.table ? await Table.findById(order.table) : null;
    if (table) {
      updateTableStateForOrder(table, order);
      if (order.status !== "cancelled" && order.status !== "merged") table.currentOrder = order._id;
      await table.save();
      io?.emit("table:updated", table);
    }

    const populated = await populateOrder(order);
    io?.emit("order:updated", populated);
    res.json({ order: populated });
  } catch (error) {
    next(error);
  }
}

export async function getBill(req, res, next) {
  try {
    const io = req.app.get("io");
    const order = await resolveBillOrder(req.params.id, io);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const bill = syncOrderBill(order);
    const populated = await order.populate([{ path: "table", select: "number section" }, { path: "waiter", select: "name" }]);
    res.json({ bill: { order: populated, ...bill, billNumber: order.billNumber || `RT-${order._id.toString().slice(-6).toUpperCase()}` } });
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
    const io = req.app.get("io");
    const order = await resolveBillOrder(req.body.orderId, io);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const bill = syncOrderBill(order);
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
    setAllStationLineStatuses(order, "served");
    order.billNumber = order.billNumber || `RT-${order._id.toString().slice(-6).toUpperCase()}`;
    order.tracking.push({ status: "served", message: `Bill paid by ${payment.method}.` });
    await order.save();
    await Order.updateMany(
      { mergedInto: order._id },
      {
        $set: { paymentStatus: "paid", paymentMethod: payment.method },
        $push: { tracking: { status: "served", message: `Paid on combined bill ${order.billNumber}.` } }
      }
    );

    const table = order.table ? await Table.findById(order.table) : null;
    if (table) {
      table.status = "empty";
      table.currentOrder = null;
      await table.save();
      io?.emit("table:updated", table);
    }

    const populated = await populateOrder(order);
    io?.emit("order:updated", populated);
    res.status(201).json({ payment, order: populated });
  } catch (error) {
    next(error);
  }
}
