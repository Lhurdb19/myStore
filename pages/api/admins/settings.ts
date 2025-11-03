import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import Settings from "@/models/settings";
import { uploadBase64 } from "@/lib/cloudinary"; // ✅ Use your existing helper

export const config = {
  api: { bodyParser: { sizeLimit: "10mb" } }, // to allow image uploads
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method === "GET") {
    try {
      let settings = await Settings.findOne();
      if (!settings) settings = await Settings.create({});
      return res.status(200).json({ success: true, settings });
    } catch {
      return res.status(500).json({ success: false, message: "Failed to fetch settings" });
    }
  }

  if (req.method === "PATCH") {
    try {
      let { siteName, logo, emailServer, security } = req.body;

      // 🖼️ Upload to Cloudinary if it's base64
      if (logo?.startsWith("data:image")) {
        const uploadedUrl = await uploadBase64(logo, "mystore/settings");
        logo = uploadedUrl;
      }

      const updatedSettings = await Settings.findOneAndUpdate(
        {},
        { siteName, logo, emailServer, security },
        { new: true, upsert: true }
      );

      return res.status(200).json({ success: true, settings: updatedSettings });
    } catch (err) {
      console.error("Settings update error:", err);
      return res.status(500).json({ success: false, message: "Failed to update settings" });
    }
  }

  res.setHeader("Allow", ["GET", "PATCH"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
