import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import Settings, { ISettings } from "@/models/settings";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method === "GET") {
    try {
      let settings = await Settings.findOne();
      if (!settings) {
        // create default if not exists
        settings = await Settings.create({});
      }
      return res.status(200).json({ success: true, settings });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Failed to fetch settings" });
    }
  }

  if (req.method === "PATCH") {
    try {
      const { siteName, logoUrl, emailServer, security } = req.body;
      const updatedSettings = await Settings.findOneAndUpdate(
        {},
        { siteName, logoUrl, emailServer, security },
        { new: true, upsert: true }
      );
      return res.status(200).json({ success: true, settings: updatedSettings });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Failed to update settings" });
    }
  }

  res.setHeader("Allow", ["GET", "PATCH"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
