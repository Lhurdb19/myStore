import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import AuditLog from "@/models/AuditLog";

interface ApiResponse {
  success: boolean;
  message?: string;
  logs?: any[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  try {
    await connectDB();

    if (req.method === "GET") {
      const { user, action, startDate, endDate } = req.query;
      const filter: Record<string, any> = {};

      if (user) filter.actor = user;
      if (action) filter.action = { $regex: action as string, $options: "i" };
      if (startDate && endDate) {
        const start = new Date(startDate as string);
        const end = new Date(endDate as string);
        if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
          filter.createdAt = { $gte: start, $lte: end };
        }
      }

      const logs = await AuditLog.find(filter)
        .populate("actor", "name email role")
        .sort({ createdAt: -1 })
        .lean();

      return res.status(200).json({ success: true, logs: logs || [] });
    }

    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
  } catch (error: any) {
    console.error("Audit Log Fetch Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error: " + error.message });
  }
}
