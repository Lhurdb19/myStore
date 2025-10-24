// ✅ pages/api/auth/verify-email.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import User from "@/models/user";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectDB();
    const { email, token } = req.method === "POST" ? req.body : req.query;

    if (!token || !email) {
      return res.status(400).json({ success: false, message: "Invalid verification link" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.emailVerified) {
      return res.status(200).json({ success: true, alreadyVerified: true, message: "Email already verified" });
    }

    if (user.verificationToken !== token) {
      return res.status(400).json({ success: false, message: "Invalid or expired verification link" });
    }

    // ✅ Mark email as verified
    user.emailVerified = true;
    user.verificationToken = undefined;
    await user.save();

    console.log(`✅ Email verified for: ${user.email}`);

    // ✅ Return JSON with redirect URL
    return res.status(200).json({
      success: true,
      message: "Email verified successfully!",
      redirect: "/auth/login"
    });
  } catch (error) {
    console.error("❌ Email verification error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}
