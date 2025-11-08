import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import AuditLog from "@/models/AuditLog";
import Notification from "@/models/Notification";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: "Unauthorized. Please log in." });
  }

  const userRole = (session.user as any).role;
  if (!["admin", "superadmin"].includes(userRole)) {
    return res.status(403).json({ message: "Forbidden. You do not have access." });
  }

  const { title, description, price, stock, category, imagesBase64 } = req.body;

  try {
    await connectDB();

    const uploaded: string[] = [];
    if (imagesBase64?.length) {
      for (const b64 of imagesBase64) {
        const upload = await cloudinary.uploader.upload(b64, { folder: "mystore/products" });
        uploaded.push(upload.secure_url);
      }
    }

    const slug = title.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now().toString().slice(-4);

    const categorySlug = category.toLowerCase().replace(/\s+/g, "-");
    
    const product = await Product.create({
      title,
      slug,
      description,
      price,
      stock: stock || 0,
      category: categorySlug,  // ✅ Save as slug
      images: uploaded,
      createdBy: session.user.id,
    });

    await AuditLog.create({
      actor: session.user.id,
      action: "create-product",
      target: String(product._id),
      details: { title, price },
    });

    await Notification.create({
      title: "New Product Added",
      message: `New product "${title}" has been added.`,
      audience: "all",
      type: "info",
      createdBy: session.user.id,
      sent: true,
    });

    res.status(201).json({ product });
  } catch (err: any) {
    console.error("Upload error:", err);
    res.status(500).json({ message: err.message || "Error uploading product" });
  }
}
