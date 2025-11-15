import { getSession } from "next-auth/react";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  if (!session) return res.status(401).json({ message: "Unauthorized" });

  await connectDB();

  try {
    // Try both id and _id for safety
    const userId = session.user.id || session.user._id;

    const orders = await Order.find({ user: userId })
      .populate("items.product", "name image")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json(orders); // 👈 return array directly
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
