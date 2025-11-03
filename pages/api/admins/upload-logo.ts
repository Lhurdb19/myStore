import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { File } from "formidable";
import fs from "fs";
import path from "path";

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST")
    return res.status(405).json({ success: false, message: "Method not allowed" });

  try {
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const form = formidable({
      multiples: true,
      uploadDir,
      keepExtensions: true,
      filename: (name, ext, part, form) => {
        const timestamp = Date.now();
        const cleanName = name.replace(/\s+/g, "_");
        return `${timestamp}_${cleanName}${ext}`;
      },
    });

    form.parse(req, (err, fields, files) => {
      if (err) {
        console.error("Formidable error:", err);
        return res.status(500).json({ success: false, message: "File upload error" });
      }

      const file = (files.logo as File[] | File | undefined);
      const uploadedFile = Array.isArray(file) ? file[0] : file;

      if (!uploadedFile || !uploadedFile.filepath)
        return res.status(400).json({ success: false, message: "No file uploaded" });

      const filename = path.basename(uploadedFile.filepath);
      const fileUrl = `/uploads/${filename}`;

      return res.status(200).json({ success: true, url: fileUrl });
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ success: false, message: "Unexpected upload error" });
  }
}
