import User from "../models/User.js";
import { STAFF_ROLES } from "../constants/roles.js";
import { userPayload } from "./authController.js";

const employeeProjection = "-password -addresses";

export async function getEmployees(_req, res, next) {
  try {
    const employees = await User.find({ role: { $in: STAFF_ROLES }, isActive: true }).select(employeeProjection).sort({ role: 1, name: 1 });
    res.json({ employees: employees.map(userPayload) });
  } catch (error) {
    next(error);
  }
}

export async function createEmployee(req, res, next) {
  try {
    if (!STAFF_ROLES.includes(req.body.role)) {
      return res.status(400).json({ message: "Invalid employee role" });
    }

    const employee = await User.create({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      password: req.body.password || "staff123",
      role: req.body.role,
      employeeCode: req.body.employeeCode,
      isActive: req.body.isActive !== false
    });

    res.status(201).json({ employee: userPayload(employee) });
  } catch (error) {
    next(error);
  }
}

export async function updateEmployee(req, res, next) {
  try {
    const employee = await User.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    ["name", "phone", "role", "employeeCode", "isActive"].forEach((field) => {
      if (req.body[field] !== undefined) employee[field] = req.body[field];
    });
    if (req.body.password) employee.password = req.body.password;

    await employee.save();
    res.json({ employee: userPayload(employee) });
  } catch (error) {
    next(error);
  }
}

export async function deleteEmployee(req, res, next) {
  try {
    const employee = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    res.json({ message: "Employee deactivated" });
  } catch (error) {
    next(error);
  }
}
