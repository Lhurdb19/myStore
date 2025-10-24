import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import Notification from "@/models/Notification";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import mongoose from "mongoose";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).end("Method Not Allowed");
  }

  await connectDB();
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ success: false, message: "Notification ID required" });

    await Notification.findByIdAndUpdate(id, {
      $addToSet: { readBy: new mongoose.Types.ObjectId(session.user.id) },
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error marking as read" });
  }
}
