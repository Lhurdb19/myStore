import { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import Wishlist from "@/models/Wishlist";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  // 🔒 Get user session
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const userId = session.user.id;

  try {
    switch (req.method) {
      // 🟢 GET: Get user wishlist
      case "GET": {
        const wishlist = await Wishlist.find({ user: userId })
          .populate("product", "title slug images price stock")
          .sort({ createdAt: -1 });

        return res.status(200).json({
          success: true,
          wishlist: wishlist.map((item) => ({
            _id: item.product._id,
            title: item.product.title,
            slug: item.product.slug,
            price: item.product.price,
            stock: item.product.stock,
            images: item.product.images,
          })),
        });
      }

      // 🟡 POST: Add product to wishlist
      case "POST": {
        const { productId } = req.body;
        if (!productId)
          return res.status(400).json({ success: false, message: "Product ID required" });

        const exists = await Wishlist.findOne({ user: userId, product: productId });
        if (exists)
          return res.status(400).json({ success: false, message: "Already in wishlist" });

        const newItem = await Wishlist.create({ user: userId, product: productId });
        return res.status(201).json({ success: true, wishlist: newItem });
      }

      // 🔴 DELETE: Remove product from wishlist
      case "DELETE": {
        const { productId } = req.body;
        if (!productId)
          return res.status(400).json({ success: false, message: "Product ID required" });

        await Wishlist.findOneAndDelete({ user: userId, product: productId });
        return res.status(200).json({ success: true, message: "Removed from wishlist" });
      }

      default:
        return res.status(405).json({ success: false, message: "Method not allowed" });
    }
  } catch (err) {
    console.error("Wishlist API error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
