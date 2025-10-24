import { NextApiRequest, NextApiResponse } from "next";
import formidable, { File, Files, Fields } from "formidable";
import fs from "fs";
import path from "path";

export const config = {
  api: { bodyParser: false }, // ⚠️ important for file uploads
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  // set upload directory
  const uploadDir = path.join(process.cwd(), "/public/uploads");
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const form = formidable({
    uploadDir,
    keepExtensions: true,
    multiples: false,
  });

  form.parse(req, (err: any, fields: Fields, files: Files) => {
    if (err) return res.status(500).json({ success: false, message: "File upload error", err });

    const file = files.logo as File | undefined;
    if (!file) return res.status(400).json({ success: false, message: "No file uploaded" });

    const filePath = `/uploads/${file.newFilename}`;
    return res.status(200).json({ success: true, url: filePath });
  });
}
