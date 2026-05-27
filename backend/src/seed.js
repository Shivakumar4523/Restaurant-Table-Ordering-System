import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import Food from "./models/Food.js";
import Coupon from "./models/Coupon.js";
import User from "./models/User.js";
import Category from "./models/Category.js";
import MenuItem from "./models/MenuItem.js";
import BarItem from "./models/BarItem.js";
import Order from "./models/Order.js";
import Payment from "./models/Payment.js";
import Table from "./models/Table.js";
import { foods, coupons } from "./data/sampleData.js";
import { categories, employees, menuItems, tables } from "./seed/sampleMenu.js";
import { barItems } from "./seed/sampleBarItems.js";

async function seed() {
  await connectDB();

  await Food.deleteMany({});
  await Coupon.deleteMany({});
  await Category.deleteMany({});
  await MenuItem.deleteMany({});
  await BarItem.deleteMany({});
  await Order.deleteMany({});
  await Payment.deleteMany({});
  await Table.deleteMany({});

  await Food.insertMany(foods);
  await Coupon.insertMany(coupons);
  const createdCategories = await Category.insertMany(categories);
  const categoriesByName = new Map(createdCategories.map((category) => [category.name, category]));

  await MenuItem.insertMany(
    menuItems.map((item) => {
      const category = categoriesByName.get(item.categoryName);
      return {
        ...item,
        category: category._id,
        categoryName: category.name
      };
    })
  );
  await BarItem.insertMany(barItems);
  await Table.insertMany(tables);

  for (const employeeData of employees) {
    const employee = await User.findOne({ email: employeeData.email });

    if (!employee) {
      await User.create({ ...employeeData, isActive: true });
    } else {
      employee.name = employeeData.name;
      employee.phone = employeeData.phone;
      employee.password = employeeData.password;
      employee.role = employeeData.role;
      employee.employeeCode = employeeData.employeeCode;
      employee.isActive = true;
      await employee.save();
    }
  }

  console.log("Seed complete");
  console.log("Royal Spice owner login: owner@royalspice.test / owner16655");
  console.log("Waiter login: waiter@royalspice.test / waiter6655");
  console.log("Chef login: chef@royalspice.test / chef6655");
  console.log("Bar login: bar@royalspice.test / bar6655");
  console.log("Cashier login: cashier@royalspice.test / cash6655");
  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
