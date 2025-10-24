import type { NextApiRequest, NextApiResponse } from "next";
import {connectDB} from "@/lib/db"; // your MongoDB connection helper
import User from "@/models/user"; // your User mongoose model

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method === "GET") {
    try {
      const users = await User.find().sort({ createdAt: -1 });
      return res.status(200).json({ success: true, users });
    } catch (error) {
      return res.status(500).json({ success: false, message: "Failed to fetch users" });
    }
  }

  res.setHeader("Allow", ["GET"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
