import type { NextApiRequest, NextApiResponse } from "next";
import {connectDB} from "@/lib/db";
import User from "@/models/user";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();
  const { id } = req.query;

  switch (req.method) {
    case "PATCH":
      try {
        const { name, email, role } = req.body;
        const user = await User.findByIdAndUpdate(
          id,
          { name, email, role },
          { new: true }
        );
        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        return res.status(200).json({ success: true, user });
      } catch (error) {
        return res.status(500).json({ success: false, message: "Error updating user" });
      }

    case "DELETE":
      try {
        const user = await User.findByIdAndDelete(id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        return res.status(200).json({ success: true });
      } catch (error) {
        return res.status(500).json({ success: false, message: "Error deleting user" });
      }

    default:
      res.setHeader("Allow", ["PATCH", "DELETE"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
