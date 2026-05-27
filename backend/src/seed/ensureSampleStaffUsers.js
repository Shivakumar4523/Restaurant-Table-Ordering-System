import User from "../models/User.js";
import { employees } from "./sampleMenu.js";

export async function ensureSampleStaffUsers() {
  let created = 0;
  let updated = 0;
  let unchanged = 0;

  for (const employeeData of employees) {
    const user = await User.findOne({ email: employeeData.email });

    if (!user) {
      await User.create({ ...employeeData, isActive: true });
      created += 1;
      continue;
    }

    const passwordMatches = await user.comparePassword(employeeData.password);
    const nextFields = {
      name: employeeData.name,
      phone: employeeData.phone,
      role: employeeData.role,
      employeeCode: employeeData.employeeCode,
      isActive: true
    };
    let changed = !passwordMatches;

    for (const [field, value] of Object.entries(nextFields)) {
      if (user[field] !== value) {
        user[field] = value;
        changed = true;
      }
    }

    if (!passwordMatches) {
      user.password = employeeData.password;
    }

    if (changed) {
      await user.save();
      updated += 1;
    } else {
      unchanged += 1;
    }
  }

  return { created, updated, unchanged };
}
