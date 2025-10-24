import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import User from "@/models/user";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  const { id } = req.query;

  if (req.method === "PATCH") {
    try {
      const { suspend } = req.body;
      const user = await User.findByIdAndUpdate(
        id,
        { suspended: suspend },
        { new: true }
      );

      if (!user) return res.status(404).json({ success: false, message: "User not found" });

      return res.status(200).json({
        success: true,
        message: suspend ? "User suspended" : "User activated",
        user,
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: "Error updating suspension" });
    }
  }

  res.setHeader("Allow", ["PATCH"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
