// pages/api/auth/check-email.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import User from "@/models/user";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const { email } = req.body;
  if (!email || !email.includes("@")) {
    return res.status(400).json({ message: "Please enter a valid email address" });
  }

  try {
    await connectDB();
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "Email does not exist" });
    }

    return res.status(200).json({ message: "Email exists", emailVerified: user.emailVerified });
  } catch (err) {
    console.error("Check email error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
