import type { NextApiRequest, NextApiResponse } from "next";
import { sendThankYouEmail } from "@/lib/mailer";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const { email, orderId, provider } = req.body;

  if (!email || !orderId) return res.status(400).json({ message: "Missing fields" });

  try {
    await sendThankYouEmail(email, orderId);
    return res.status(200).json({ success: true, message: `Payment confirmed via ${provider}` });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Failed to send email" });
  }
}
