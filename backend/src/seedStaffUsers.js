import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import { ensureSampleStaffUsers } from "./seed/ensureSampleStaffUsers.js";

async function seedStaffUsers() {
  await connectDB();
  const result = await ensureSampleStaffUsers();
  console.log(`Sample staff users ready: ${result.created} created, ${result.updated} updated, ${result.unchanged} unchanged.`);
  await mongoose.disconnect();
}

seedStaffUsers().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
