import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import BarItem from "./models/BarItem.js";
import { barItems } from "./seed/sampleBarItems.js";

async function seedBarItems() {
  await connectDB();

  const result = await BarItem.bulkWrite(
    barItems.map((item) => ({
      updateOne: {
        filter: { name: item.name, category: item.category },
        update: { $set: item },
        upsert: true
      }
    })),
    { ordered: false }
  );

  console.log(
    `Bar items ready: ${result.upsertedCount || 0} added, ${result.modifiedCount || 0} updated, ${result.matchedCount || 0} matched.`
  );
  await mongoose.disconnect();
}

seedBarItems().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
