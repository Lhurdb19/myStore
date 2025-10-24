import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import PaymentMethod from "@/models/paymentMethod";
import { logAction } from "@/lib/logAction";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();
  const { id } = req.query;
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  if (req.method === "PATCH") {
    try {
      const { active, actor } = req.body;
      const updated = await PaymentMethod.findByIdAndUpdate(id, { active }, { new: true });
      if (!updated)
        return res.status(404).json({ success: false, message: "Payment method not found" });

      await logAction({
        actor,
        action: `${active ? "Activated" : "Deactivated"} payment method: ${updated.name}`,
        target: updated._id.toString(),
        ip: String(ip),
      });

      return res.status(200).json({ success: true, method: updated });
    } catch (error: any) {
      console.error("Toggle Error:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  res.setHeader("Allow", ["PATCH"]);
  return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
}
