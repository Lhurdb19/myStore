import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function uploadBase64(base64: string, folder = "mystore/products") {
  const res = await cloudinary.uploader.upload(base64, { folder });
  return res.secure_url;
}
