import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ message: "Unauthorized" });

  const userRole = (session.user as any).role;
  if (!["admin", "superadmin"].includes(userRole)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const { id } = req.query;
  if (!id || Array.isArray(id)) return res.status(400).json({ message: "Invalid product ID" });

  if (req.method !== "PUT") return res.status(405).json({ message: "Method not allowed" });

  const { title, description, price, stock, category, existingImages, newImages } = req.body;

  try {
    await connectDB();

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // 1️⃣ Remove deleted images from Cloudinary
    const imagesToDelete = product.images.filter((img: string) => !existingImages.includes(img));
    for (const imgUrl of imagesToDelete) {
      const publicId = imgUrl.split("/").pop()?.split(".")[0]; // extract public_id
      if (publicId) {
        await cloudinary.uploader.destroy(`mystore/products/${publicId}`);
      }
    }

    // 2️⃣ Upload new images
    const uploadedImages: string[] = [];
    if (newImages?.length) {
      for (const b64 of newImages) {
        const upload = await cloudinary.uploader.upload(b64, { folder: "mystore/products" });
        uploadedImages.push(upload.secure_url);
      }
    }

    // 3️⃣ Update product in DB
    product.title = title;
    product.description = description;
    product.price = price;
    product.stock = stock;
    product.category = category.toLowerCase().replace(/\s+/g, "-");
    product.images = [...existingImages, ...uploadedImages];

    await product.save();

    res.status(200).json({ message: "Product updated successfully", product });
  } catch (err: any) {
    console.error("Update error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
}
