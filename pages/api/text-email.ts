// /pages/api/test-email.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { sendAboutUsEmail } from "@/lib/mailer";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const testEmail = "hejidev19@gmail.com"; // Change this to your inbox
    await sendAboutUsEmail(testEmail);
    res.status(200).json({ message: "Email sent successfully!" });
  } catch (error: any) {
    console.error("❌ Email test failed:", error);
    res.status(500).json({ error: error.message });
  }
}
