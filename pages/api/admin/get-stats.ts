import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { connectDB } from "@/lib/db";
import User from "@/models/user";
import Product from "@/models/Product";
// import Order from "@/models/Order"; // if you have order model

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  if (!session || (session.user as any).role !== "superadmin") return res.status(403).json({ message: "Forbidden" });

  await connectDB();
  const totalUsers = await User.countDocuments();
  const totalAdmins = await User.countDocuments({ role: { $in: ["admin","superadmin"] } });
  const activeProducts = await Product.countDocuments({ active: true });
  // const totalOrders = await Order.countDocuments();

  res.json({ totalUsers, totalAdmins, activeProducts });
}
