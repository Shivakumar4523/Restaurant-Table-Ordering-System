import "dotenv/config";
import express from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";
import { Server } from "socket.io";
import { connectDB } from "./config/db.js";
import { ensureSampleBarItems } from "./seed/ensureSampleBarItems.js";
import authRoutes from "./routes/authRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import foodRoutes from "./routes/foodRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import reservationRoutes from "./routes/reservationRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import barItemRoutes from "./routes/barItemRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import menuItemRoutes from "./routes/menuItemRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import tableRoutes from "./routes/tableRoutes.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;
const defaultClientUrls = ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173", "http://127.0.0.1:5173"];
const configuredClientUrls = [process.env.CLIENT_URL, process.env.NEXT_PUBLIC_SITE_URL]
  .filter(Boolean)
  .flatMap((value) => value.split(","));
const allowedOrigins = new Set([...defaultClientUrls, ...configuredClientUrls].map(normalizeOrigin).filter(Boolean));
const rateLimitWindowMs = Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000);
const rateLimitMax = Number(process.env.RATE_LIMIT_MAX || (process.env.NODE_ENV === "production" ? 250 : 5000));

function normalizeOrigin(origin) {
  return origin?.trim().replace(/\/$/, "");
}

function isDevLoopbackOrigin(origin) {
  if (process.env.NODE_ENV === "production") return false;

  try {
    const { hostname, protocol } = new URL(origin);
    return ["http:", "https:"].includes(protocol) && ["localhost", "127.0.0.1", "::1"].includes(hostname);
  } catch (_error) {
    return false;
  }
}

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(
  cors({
    origin(origin, callback) {
      const normalizedOrigin = normalizeOrigin(origin);

      if (!origin || allowedOrigins.has(normalizedOrigin) || isDevLoopbackOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    credentials: true
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(
  rateLimit({
    windowMs: rateLimitWindowMs,
    max: rateLimitMax,
    message: { message: "Too many requests. Please try again in a moment." },
    standardHeaders: true,
    legacyHeaders: false
  })
);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "rain-tree-api", time: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/foods", foodRoutes);
app.use("/api/menu-items", menuItemRoutes);
app.use("/api/bar-items", barItemRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/tables", tableRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/admin/analytics", analyticsRoutes);
app.use("/api/notifications", notificationRoutes);

app.use(notFound);
app.use(errorHandler);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin(origin, callback) {
      const normalizedOrigin = normalizeOrigin(origin);

      if (!origin || allowedOrigins.has(normalizedOrigin) || isDevLoopbackOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin ${origin} is not allowed by Socket.IO CORS`));
    },
    credentials: true
  }
});

app.set("io", io);

io.on("connection", (socket) => {
  socket.on("join:kitchen", () => socket.join("kitchen"));
  socket.on("join:bar", () => socket.join("bar"));
  socket.on("join:staff", () => socket.join("staff"));
});

connectDB()
  .then(async () => {
    const seedResult = await ensureSampleBarItems();
    if (seedResult.inserted > 0) {
      console.log(`Seeded ${seedResult.inserted} sample bar items.`);
    }
  })
  .then(() => {
    server.listen(port, () => console.log(`Royal Spice API running on port ${port}`));
  })
  .catch((error) => {
    console.error("Failed to start API", error);
    process.exit(1);
  });
