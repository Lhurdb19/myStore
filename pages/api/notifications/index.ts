// pages/api/notifications/index.ts
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Notification from "@/models/Notification";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const { user } = session;
  const userId = user.id;
  const role = user.role;

  try {
    // ✅ FETCH NOTIFICATIONS
    if (req.method === "GET") {
      let audienceFilter = [];

      if (role === "superadmin") {
        // Superadmin sees all notifications
        audienceFilter = ["all", "admins", "users", `user:${userId}`];
      } else if (role === "admin") {
        // Admin sees all, admins, and admin-specific notifications
        audienceFilter = ["all", "admins", `user:${userId}`];
      } else {
        // Regular users
        audienceFilter = ["all", "users", `user:${userId}`];
      }

      const notifications = await Notification.find({
        audience: { $in: audienceFilter },
      })
        .sort({ createdAt: -1 })
        .lean();

      return res.status(200).json({ success: true, notifications });
    }

    // ✅ CREATE NOTIFICATION
    if (req.method === "POST") {
      const { title, message, type, audience, scheduledAt } = req.body;

      // Restrict who can create notifications
      if (role !== "superadmin" && role !== "admin") {
        return res
          .status(403)
          .json({ success: false, message: "Not authorized to create notifications" });
      }

      // Admins can only send to users, not other admins
      if (role === "admin" && audience === "admins") {
        return res
          .status(403)
          .json({ success: false, message: "Admins cannot send to other admins" });
      }

      // Normalize
      const normalizedAudience =
        audience === "user"
          ? "users"
          : audience === "admin"
          ? "admins"
          : audience;

      const newNotification = await Notification.create({
        title,
        message,
        type,
        audience: normalizedAudience,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
        createdBy: new mongoose.Types.ObjectId(userId),
        sent: !scheduledAt,
      });

      return res.status(201).json({ success: true, notification: newNotification });
    }

    return res.status(405).json({ success: false, message: "Method not allowed" });
  } catch (error: any) {
    console.error("Notification API error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
