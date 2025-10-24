import { getSession } from "next-auth/react";
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import User from "@/models/user";
import AuditLog from "@/models/AuditLog";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const session = await getSession({ req });
  if (!session || (session.user as any).role !== "superadmin") return res.status(403).json({ message: "Forbidden" });

  const { userId, role } = req.body; // role: "admin" | "user"
  if (!userId || !role) return res.status(400).json({ message: "Missing data" });

  await connectDB();
  const user = await User.findByIdAndUpdate(userId, { role }, { new: true });
  await AuditLog.create({ actor: session.user.id, action: "change-role", target: userId, details: { role } });
  res.json({ message: "Role updated", user: { id: user._id, role: user.role } });
}
