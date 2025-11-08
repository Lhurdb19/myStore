import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ message: "Method not allowed" });

  const { category, limit } = req.query;
  const max = parseInt(limit as string) || 4;

  if (!category) return res.status(400).json({ message: "Category is required" });

  try {
    await connectDB();
    const products = await Product.find({ active: true, category: { $regex: `^${category}$`, $options: "i" } })
      .limit(max)
      .select("title slug images price")
      .lean();

    res.status(200).json({ products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error fetching products" });
  }
}
