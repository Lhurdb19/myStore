import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/user";
import AuditLog from "@/models/AuditLog";
import { getSession } from "next-auth/react";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const session = await getSession({ req });
  if (!session || (session.user as any).role !== "superadmin") return res.status(403).json({ message: "Forbidden" });

  try {
    await connectDB();
    const { name, email, password, role = "admin" } = req.body;
    if (!email || !password || !name) return res.status(400).json({ message: "Missing fields" });

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: "User exists" });

    const hashed = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, email, password: hashed, role });

    await AuditLog.create({ actor: session.user.id, action: "create-admin", target: String(newUser._id), details: { email } });

    res.status(201).json({ message: "Admin created", user: { id: newUser._id, email: newUser.email, role: newUser.role } });
  } catch (err:any) {
    res.status(500).json({ message: err.message });
  }
}
