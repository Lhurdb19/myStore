import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import User from "@/models/user";

// ✅ Define the user shape for clarity
interface IUser {
  email: string;
  role: string;
  emailVerified: boolean;
  suspended: boolean;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    await connectDB();

    // ✅ Tell TS what type `.lean()` will return
    const user = await User.findOne({ email })
      .select("email role emailVerified suspended")
      .lean<IUser | null>();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.suspended) {
      return res.status(403).json({ message: "Account suspended. Contact support." });
    }

    return res.status(200).json({
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
    });
  } catch (error) {
    console.error("Get user error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
