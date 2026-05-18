import User from "../models/User.js";
import { signToken } from "../utils/token.js";

export function userPayload(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    employeeCode: user.employeeCode,
    isActive: user.isActive,
    language: user.language,
    addresses: user.addresses
  };
}

export async function register(req, res, next) {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const user = await User.create({ name, email, phone, password });
    res.status(201).json({ user: userPayload(user), token: signToken(user) });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.isActive === false) {
      return res.status(403).json({ message: "This employee account is inactive" });
    }

    res.json({ user: userPayload(user), token: signToken(user) });
  } catch (error) {
    next(error);
  }
}

export function me(req, res) {
  res.json({ user: userPayload(req.user) });
}
