import jwt from "jsonwebtoken";

const DEFAULT_DEV_JWT_SECRET = "royal-spice-local-dev-secret";
let warnedAboutDevSecret = false;

export function getJwtSecret() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;

  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET is required");
  }

  if (!warnedAboutDevSecret) {
    console.warn("JWT_SECRET not set; using a local development secret");
    warnedAboutDevSecret = true;
  }

  return DEFAULT_DEV_JWT_SECRET;
}

export function signToken(user) {
  return jwt.sign(
    {
      id: user._id,
      role: user.role
    },
    getJwtSecret(),
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}
