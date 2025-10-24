// /pages/api/admin/payment-methods.ts
import {connectDB} from "@/lib/db";
import PaymentMethod from "@/models/paymentMethod";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method === "GET") {
    try {
      const methods = await PaymentMethod.find({ active: true }); // only active
      return res.status(200).json({ methods });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to fetch payment methods" });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}
