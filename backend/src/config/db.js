import mongoose from "mongoose";

const DEFAULT_DEV_MONGO_URI = "mongodb://127.0.0.1:27017/royal-spice";

export async function connectDB() {
  const uri = process.env.MONGO_URI || (process.env.NODE_ENV === "production" ? "" : DEFAULT_DEV_MONGO_URI);

  if (!uri) {
    throw new Error("MONGO_URI is required");
  }

  if (!process.env.MONGO_URI) {
    console.warn(`MONGO_URI not set; using ${DEFAULT_DEV_MONGO_URI} for local development`);
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);
  console.log("MongoDB connected");
}
