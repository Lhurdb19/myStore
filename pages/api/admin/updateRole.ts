import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import User from "@/models/user";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PUT") return res.status(405).json({ message: "Method not allowed" });

  await connectDB();
  const session = await getServerSession(req, res, authOptions);

  // Only superadmins can promote/demote
  if (session?.user?.role !== "superadmin")
    return res.status(403).json({ message: "Not authorized" });

  const { userId, newRole } = req.body;
  if (!userId || !newRole) return res.status(400).json({ message: "Missing fields" });

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role: newRole },
      { new: true }
    );

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({ message: "Role updated successfully", user: updatedUser });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
}
