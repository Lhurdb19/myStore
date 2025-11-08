import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectDB();

    // Get all unique category names from products
    const categories = await Product.distinct("category");

    // Return cleaned-up array (in case some are null/empty)
    const cleaned = categories
      .filter((c: string) => typeof c === "string" && c.trim() !== "")
      .map((c: string) => c.trim());

    res.status(200).json({ categories: Array.from(new Set(cleaned)) });
  } catch (err: any) {
    console.error("Error loading categories:", err);
    res.status(500).json({ message: "Failed to load categories" });
  }
}
