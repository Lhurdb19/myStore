// pages/api/admins/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import User from "@/models/user";
import bcrypt from "bcryptjs";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method === "GET") {
    try {
      const admins = await User.find({ role: { $in: ["admin", "superadmin"] } }).sort({ createdAt: -1 });
      return res.status(200).json({ success: true, admins });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: "Error fetching admins" });
    }
  }

  if (req.method === "POST") {
    const { name, email, password, role, phone, address } = req.body;

    if (!name || !email || !password || !role || !phone || !address) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const phoneRegex = /^(?:\+234|0)[789]\d{9}$/; // Nigerian phone format
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ success: false, message: "Invalid phone number" });
    }

    try {
      const exists = await User.findOne({ email });
      if (exists) return res.status(400).json({ success: false, message: "Email already exists" });

      const hashedPassword = await bcrypt.hash(password, 10);

      const newAdmin = await User.create({
        name,
        email,
        password: hashedPassword,
        role,            // "admin" or "superadmin"
        phone,
        address,
        suspended: false,
        emailVerified: true, // ✅ auto-verify
        otpVerified: true,   // ✅ auto-verify
      });

      return res.status(201).json({ success: true, admin: newAdmin });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: "Error creating admin" });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
