import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import AuditLog from "@/models/AuditLog";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const session = await getSession({ req });
  if (!session || !["admin","superadmin"].includes((session.user as any).role)) return res.status(403).json({ message: "Forbidden" });

  const { title, description, price, stock, imagesBase64 } = req.body;
  await connectDB();

  // upload images sequentially (or parallel)
  const uploaded: string[] = [];
  if (imagesBase64 && imagesBase64.length) {
    for (const b64 of imagesBase64) {
      const upload = await cloudinary.uploader.upload(b64, { folder: "mystore/products" });
      uploaded.push(upload.secure_url);
    }
  }

  const slug = title.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now().toString().slice(-4);
  const product = await Product.create({
    title, slug, description, price, stock: stock || 0, images: uploaded, createdBy: session.user.id
  });

  await AuditLog.create({ actor: session.user.id, action: "create-product", target: String(product._id), details: { title, price } });
  res.status(201).json({ product });
}
