import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import User from "@/models/user";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST")
    return res.status(405).json({ message: "Method not allowed" });

  const { email, otpCode } = req.body;
  if (!email || !otpCode)
    return res.status(400).json({ message: "Missing email or OTP" });

  try {
    await connectDB();
    const user = await User.findOne({ email });

    if (!user)
      return res.status(404).json({ message: "User not found" });

    if (user.otpVerified)
      return res.status(400).json({ message: "Your account is already verified. You can now log in." });

    if (user.otpCode !== otpCode)
      return res.status(400).json({ message: "Invalid OTP code" });

    if (user.otpExpiry && user.otpExpiry < new Date())
      return res.status(400).json({ message: "OTP expired, please request a new one" });

    // ✅ Update user verification status
    user.otpVerified = true;
    user.otpCode = undefined;
    user.otpExpiry = undefined;
    await user.save();

    console.log("✅ OTP verified for:", user.email);

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully. You can now log in.",
      user: {
        email: user.email,
        role: user.role,
        otpVerified: true,
      },
    });

  } catch (error) {
    console.error("❌ OTP verification error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
