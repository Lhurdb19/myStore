// scripts/seedSuperAdmin.ts
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { connectDB } from "@/lib/db";
import User from "@/models/user";

async function seedSuperAdmin() {
  console.log("Connecting to DB...");
  await connectDB();

  const existingAdmin = await User.findOne({ role: "superadmin" });
  if (existingAdmin) {
    console.log("✅ Super admin already exists:", existingAdmin.email);
    process.exit(0);
  }

  const user = new User({
    name: "Super Admin",
    email: "superadmin@mystore.com",
    password: "SuperAd19!", // plain here, will be hashed by pre('save')
    role: "superadmin",
  });

  await user.save();

  console.log("🎉 Super admin created successfully!");
  console.log("Email:", user.email);
  // console.log("Password: SuperAd19!");
  process.exit(0);
}

seedSuperAdmin().catch((err) => {
  console.error("❌ Error seeding super admin:", err);
  process.exit(1);
});
