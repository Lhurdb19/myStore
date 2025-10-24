import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import Notification from "@/models/Notification";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import mongoose from "mongoose";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();
  const session = await getServerSession(req, res, authOptions);

  switch (req.method) {
    // 🟢 GET — fetch notifications
    case "GET":
      try {
        const { onlyUnread } = req.query;
        let query: any = { sent: true };

        if (!session?.user) {
          query.audience = "all";
        } else {
          const userId = session.user.id;
          const role = (session.user as any).role;

          query.$or = [
            { audience: "all" },
            { audience: `user:${userId}` },
          ];

          if (role === "admin" || role === "superadmin") {
            query.$or.push({ audience: "admins" });
          } else {
            query.$or.push({ audience: "users" });
          }

          if (onlyUnread === "true") {
            query.readBy = { $ne: new mongoose.Types.ObjectId(userId) };
          }
        }

        const notifications = await Notification.find(query)
          .populate("createdBy", "name email role")
          .sort({ createdAt: -1 })
          .limit(150);

        return res.status(200).json({ success: true, notifications });
      } catch (err) {
        console.error("Fetch notifications error:", err);
        return res.status(500).json({ success: false, message: "Error fetching notifications" });
      }

    // 🟠 POST — create notification
    case "POST":
      try {
        if (!session?.user) {
          return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const role = (session.user as any).role;
        if (!["admin", "superadmin"].includes(role)) {
          return res.status(403).json({ success: false, message: "Forbidden" });
        }

        const { title, message, type, audience, scheduledAt } = req.body;

        if (!title || !message || !type || !audience) {
          return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const isScheduled = !!scheduledAt;

        const newNotification = await Notification.create({
          title,
          message,
          type,
          audience,
          scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
          createdBy: session.user.id,
          sent: !isScheduled,
        });

        return res.status(201).json({ success: true, notification: newNotification });
      } catch (err) {
        console.error("Notification creation error:", err);
        return res.status(500).json({ success: false, message: "Error creating notification" });
      }

    default:
      res.setHeader("Allow", ["GET", "POST"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
