import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import Role from "@/models/Role"; // we will create this
import { logAction } from "@/lib/logAction";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  try {
    switch (req.method) {
      case "GET":
        const roles = await Role.find().sort({ createdAt: -1 }).lean();
        return res.status(200).json({ success: true, roles });

      case "POST": {
        const { name, description, permissions, users, actor } = req.body;
        if (!name || !permissions) {
          return res.status(400).json({ success: false, message: "Name and permissions are required" });
        }

        const newRole = await Role.create({ name, description, permissions, users });

        await logAction({
          actor,
          action: `Created role: ${name}`,
          target: newRole._id.toString(),
        });

        return res.status(201).json({ success: true, role: newRole });
      }

      case "PUT": {
        const { id, name, description, permissions, users, actor } = req.body;
        if (!id) return res.status(400).json({ success: false, message: "Role ID required" });

        const updated = await Role.findByIdAndUpdate(
          id,
          { name, description, permissions, users },
          { new: true }
        );

        await logAction({
          actor,
          action: `Updated role: ${name}`,
          target: id,
        });

        return res.status(200).json({ success: true, role: updated });
      }

      default:
        return res.status(405).json({ success: false, message: `Method ${req.method} not allowed` });
    }
  } catch (err: any) {
    console.error("Roles API Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}