import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { connectDB } from "@/lib/db";
import Notification from "@/models/Notification";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const session = await getSession({ req });
  if (!session || (session.user as any).role === "user") return res.status(403).json({ message: "Forbidden" });

  await connectDB();
  const { title, message, audience = "all", type = "info" } = req.body;
  const note = await Notification.create({ title, message, audience, type, createdBy: session.user.id });
  // optionally broadcast via websockets / pusher / firebase
  res.status(201).json({ note });
}
