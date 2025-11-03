import type { NextApiRequest, NextApiResponse } from "next";
import { v2 as cloudinary } from "cloudinary";
import formidable from "formidable";
import fs from "fs/promises";

// Disable Next.js body parser (only for multipart forms)
export const config = {
  api: { bodyParser: false },
};

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
  secure: true,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // ✅ Case 1: Base64 JSON Upload
    if (req.headers["content-type"]?.includes("application/json")) {
      const buffers: Buffer[] = [];

      for await (const chunk of req) buffers.push(chunk);
      const bodyStr = Buffer.concat(buffers).toString();
      const body = JSON.parse(bodyStr);

      const { base64, folder = "mystore/about" } = body;

      if (!base64) return res.status(400).json({ message: "No image provided" });

      const result = await cloudinary.uploader.upload(base64, {
        folder,
        resource_type: "image",
      });

      return res.status(200).json({ url: result.secure_url });
    }

    // ✅ Case 2: Multipart Form Upload (FormData)
    const form = formidable({ multiples: false });
    const [fields, files] = await form.parse(req);

    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    if (!file?.filepath)
      return res.status(400).json({ message: "No file uploaded" });

    const result = await cloudinary.uploader.upload(file.filepath, {
      folder: "mystore/uploads",
      resource_type: "image",
    });

    await fs.unlink(file.filepath).catch(() => {});

    return res.status(200).json({ url: result.secure_url });
  } catch (error: any) {
    console.error("❌ Cloudinary Upload Error:", error);
    return res
      .status(500)
      .json({ message: "Upload failed", error: error.message });
  }
}
