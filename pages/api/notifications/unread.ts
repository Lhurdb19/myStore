import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import Notification from "@/models/Notification";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import mongoose from "mongoose";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const userId = session.user.id;
    const unreadCount = await Notification.countDocuments({
      sent: true,
      readBy: { $ne: new mongoose.Types.ObjectId(userId) },
      $or: [
        { audience: "all" },
        { audience: `user:${userId}` },
        { audience: "users" },
      ],
    });

    res.status(200).json({ success: true, unreadCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error counting unread notifications" });
  }
}
