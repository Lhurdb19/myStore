import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import PaymentMethod from "@/models/paymentMethod";
import { logAction } from "@/lib/logAction";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  try {
    switch (req.method) {
      case "GET": {
        const methods = await PaymentMethod.find().sort({ createdAt: -1 });
        return res.status(200).json({ success: true, methods });
      }

      case "POST": {
        const { name, provider, publicKey, secretKey, active, feePercent, currency, actor } = req.body;
        if (!name || !provider || !publicKey || !secretKey)
          return res.status(400).json({ success: false, message: "All required fields must be filled" });

        const newMethod = await PaymentMethod.create({ name, provider, publicKey, secretKey, active, feePercent, currency });

        await logAction({
          actor,
          action: `Created payment method: ${name}`,
          target: newMethod._id.toString(),
          details: newMethod,
          ip: String(ip),
          category: "payment",
        });

        return res.status(201).json({ success: true, method: newMethod });
      }

      case "PUT": {
        const { id, actor, ...updateFields } = req.body;
        if (!id) return res.status(400).json({ success: false, message: "Payment method ID is required" });

        const updated = await PaymentMethod.findByIdAndUpdate(id, updateFields, { new: true });
        if (!updated) return res.status(404).json({ success: false, message: "Payment method not found" });

        await logAction({
          actor,
          action: `Updated payment method: ${updated.name}`,
          target: updated._id.toString(),
          details: updateFields,
          ip: String(ip),
          category: "payment",
        });

        return res.status(200).json({ success: true, method: updated });
      }

      case "DELETE": {
        const { id, actor } = req.body;
        if (!id) return res.status(400).json({ success: false, message: "ID required" });

        const deleted = await PaymentMethod.findByIdAndDelete(id);
        if (deleted) {
          await logAction({
            actor,
            action: `Deleted payment method: ${deleted.name}`,
            target: id,
            ip: String(ip),
            category: "payment",
          });
        }

        return res.status(200).json({ success: true, message: "Payment method deleted" });
      }

      default:
        return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error("Error in payment methods API:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
