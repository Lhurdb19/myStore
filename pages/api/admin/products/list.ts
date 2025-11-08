import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ message: "Unauthorized" });
  if (!["admin", "superadmin"].includes((session.user as any)?.role)) 
    return res.status(403).json({ message: "Forbidden" });

  try {
    await connectDB();
    const products = await Product.find().sort({ createdAt: -1 }).lean();
    res.status(200).json({ products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching products" });
  }
}
