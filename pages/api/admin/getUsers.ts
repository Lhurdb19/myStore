import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import User from "@/models/user";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();
  const session = await getServerSession(req, res, authOptions);

  if (session?.user?.role !== "superadmin")
    return res.status(403).json({ message: "Not authorized" });

  try {
    const users = await User.find({ role: { $ne: "superadmin" } }); // exclude superadmin
    return res.status(200).json({ users });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching users", error });
  }
}
