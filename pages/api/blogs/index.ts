import { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import Blog from "@/models/Blog";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  try {
    if (req.method === "GET") {
      const blogs = await Blog.find().sort({ createdAt: -1 });
      return res.status(200).json(blogs);
    }

    if (req.method === "POST") {
      const { title, content, image, category, author } = req.body;

      // ✅ Ensure image is provided
      const blog = await Blog.create({
        title,
        content,
        image: image || "",
        category: category || "Other",
        author: author || "Admin",
      });

      return res.status(201).json(blog);
    }

    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error: any) {
    console.error("Blog API Error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}
