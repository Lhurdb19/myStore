import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Order from "@/models/Order"; // you can create an Order model

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  if (!session) return res.status(401).json({ message: "Unauthorized" });

  await connectDB();

  // Fetch orders for the logged-in user
  const orders = await Order.find({ user: session.user.id })
    .populate("product")
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json({ success: true, orders });
}
