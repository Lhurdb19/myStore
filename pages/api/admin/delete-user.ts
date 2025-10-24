import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { connectDB } from "@/lib/db";
import User from "@/models/user";
import AuditLog from "@/models/AuditLog";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") return res.status(405).end();
  const session = await getSession({ req });
  if (!session || (session.user as any).role !== "superadmin") return res.status(403).json({ message: "Forbidden" });

  const { userId } = req.body;
  await connectDB();
  await User.findByIdAndDelete(userId);
  await AuditLog.create({ actor: session.user.id, action: "delete-user", target: userId });
  res.json({ message: "User deleted" });
}
