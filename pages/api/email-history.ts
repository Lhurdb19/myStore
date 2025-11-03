import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import EmailHistory from "@/models/EmailHistory";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  try {
    if (req.method === "POST") {
      const { email, subject, message } = req.body;

      if (!email || !subject || !message) {
        return res.status(400).json({ error: "All fields are required" });
      }

      const newEmail = new EmailHistory({ email, subject, message });
      await newEmail.save();

      return res.status(201).json({ success: true, data: newEmail });
    }

    if (req.method === "GET") {
      const emails = await EmailHistory.find().sort({ createdAt: -1 });
      return res.status(200).json({ success: true, data: emails });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    console.error("❌ Email history API error:", error);
    return res.status(500).json({ error: error.message || "Server error" });
  }
}
