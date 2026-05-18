import Table from "../models/Table.js";

export async function getTables(_req, res, next) {
  try {
    const tables = await Table.find({ isActive: true }).populate("currentOrder").sort({ number: 1 });
    res.json({ tables });
  } catch (error) {
    next(error);
  }
}

export async function createTable(req, res, next) {
  try {
    const table = await Table.create(req.body);
    res.status(201).json({ table });
  } catch (error) {
    next(error);
  }
}

export async function updateTable(req, res, next) {
  try {
    const table = await Table.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!table) return res.status(404).json({ message: "Table not found" });
    req.app.get("io")?.emit("table:updated", table);
    res.json({ table });
  } catch (error) {
    next(error);
  }
}

export async function deleteTable(req, res, next) {
  try {
    const table = await Table.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!table) return res.status(404).json({ message: "Table not found" });
    req.app.get("io")?.emit("table:updated", table);
    res.json({ message: "Table archived" });
  } catch (error) {
    next(error);
  }
}
