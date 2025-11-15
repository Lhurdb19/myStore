import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Order from "@/models/Order";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const session = await getServerSession( req, res, authOptions );
  if (!session?.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { items, shipping } = req.body;

  if (!items || !items.length) {
    return res.status(400).json({ message: "Cart is empty" });
  }

  if (!shipping || !shipping.name || !shipping.email || !shipping.phone || !shipping.address) {
    return res.status(400).json({ message: "Shipping information is incomplete" });
  }

  try {
    await connectDB();

    // Validate stock
    const productIds = items.map((i: any) => i.productId);
    const products = await Product.find({ _id: { $in: productIds } });

    const outOfStock: string[] = [];

    const orderItems = items.map((item: any) => {
      const product = products.find(p => p._id.toString() === item.productId);
      if (!product) throw new Error(`Product ${item.productId} not found`);

      if (product.stock < item.quantity) {
        outOfStock.push(product.title);
      }

      return {
        product: product._id,
        quantity: item.quantity,
        price: product.price,
      };
    });

    if (outOfStock.length > 0) {
      return res.status(400).json({ message: `Out of stock: ${outOfStock.join(", ")}` });
    }

    // Decrease stock
    for (const item of items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity },
      });
    }

    // Calculate total
    const total = orderItems.reduce((sum: number, i: { price: number; quantity: number }) => sum + i.price * i.quantity, 0);

    // Create order
    const order = await Order.create({
      user: session.user.id,
      items: orderItems,
      total,
      shipping,
      status: "pending",
    });

    return res.status(201).json({ success: true, order });
  } catch (error: any) {
    console.error("Checkout error:", error);
    return res.status(500).json({ message: error.message || "Server error" });
  }
}
