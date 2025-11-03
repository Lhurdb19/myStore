import type { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/db";
import User from "@/models/user";
import bcrypt from "bcryptjs";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST")
    return res.status(405).json({ message: "Method not allowed" });

  try {
    await connectDB();

    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword)
      return res.status(400).json({ message: "All fields are required" });

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.email)
      return res.status(401).json({ message: "Unauthorized" });

    const user = await User.findOne({ email: token.email });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    // ✅ Compare directly if passwords are plain text
    const isMatch =
      user.password === oldPassword ||
      (await bcrypt.compare(oldPassword, user.password)); // still works if old ones are hashed

    if (!isMatch)
      return res.status(400).json({ message: "Old password is incorrect" });

    // ✅ No hashing here
    user.password = newPassword;
    await user.save();

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error: any) {
    console.error("Change password error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
