// toggle suspended field
import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { connectDB } from "@/lib/db";
import User from "@/models/user";
import AuditLog from "@/models/AuditLog";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const session = await getSession({ req });
  if (!session || (session.user as any).role !== "superadmin") return res.status(403).json({ message: "Forbidden" });

  const { userId, suspend } = req.body;
  await connectDB();
  const user = await User.findByIdAndUpdate(userId, { suspended: !!suspend }, { new: true });
  await AuditLog.create({ actor: session.user.id, action: suspend ? "suspend-user" : "unsuspend-user", target: userId, details: { suspend } });
  res.json({ message: "Updated", user });
}
