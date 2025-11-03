import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import Settings from "@/models/settings";
import fs from "fs";
import path from "path";
import { v2 as cloudinary } from "cloudinary";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  await connectDB();

  try {
    const settings = await Settings.findOne();
    if (!settings || !settings.logo)
      return res.status(404).json({ success: false, message: "No logo found" });

    const logoPath = settings.logo;

    // Check if it's local or cloudinary
    if (logoPath.startsWith("/uploads/")) {
      // local file
      const localPath = path.join(process.cwd(), "public", logoPath);
      if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
    } else {
      // cloudinary logo
      const publicId = logoPath.split("/").pop()?.split(".")[0];
      if (publicId) await cloudinary.uploader.destroy(`mystore/settings/${publicId}`);
    }

    settings.logo = "";
    await settings.save();

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Delete logo error:", err);
    return res.status(500).json({ success: false, message: "Failed to delete logo" });
  }
}
