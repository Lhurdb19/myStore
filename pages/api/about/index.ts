import { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import About from "@/models/About";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  try {
    if (req.method === "GET") {
      // 🟢 Sort: oldest first → newest last (bottom)
      const abouts = await About.find().sort({ createdAt: 1 });
      return res.status(200).json(abouts);
    }

    if (req.method === "POST") {
      const { title, content, imageUrl } = req.body;
      const about = await About.create({ title, content, imageUrl });
      return res.status(201).json(about);
    }

    if (req.method === "PUT") {
      const { id, title, content, imageUrl } = req.body;
      const updated = await About.findByIdAndUpdate(
        id,
        { title, content, imageUrl },
        { new: true }
      );
      return res.status(200).json(updated);
    }

    if (req.method === "DELETE") {
      const { id } = req.query;
      await About.findByIdAndDelete(id);
      return res.status(200).json({ message: "Deleted successfully" });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    console.error("❌ Error in About API:", error);
    res.status(500).json({ message: "Server error" });
  }
}
