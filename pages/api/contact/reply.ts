// pages/api/reply.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getTransporter } from "@/lib/mailer"; // Path to your mailer file
import { connectDB } from "@/lib/db";
import Settings from "@/models/settings";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST")
    return res.status(405).json({ message: "Method not allowed" });

  const { email, subject, message } = req.body;

  if (!email || !subject || !message) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // Ensure DB is connected
    await connectDB();

    // Get the transporter based on DB settings
    const transporter = await getTransporter();

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; padding: 20px;">
        <div style="text-align: center;">
          <img src="https://res.cloudinary.com/damamkuye/image/upload/v1761740811/image__1_-removebg-preview_exjxtz.png"
            alt="ShopEase Logo"
            style="width: 120px; height: auto; margin-bottom: 15px;" />
        </div>
        <h2 style="color: #333;">${subject}</h2>
        <p style="color: #555;">${message}</p>
        <hr />
        <footer style="text-align: center; color: #999; font-size: 13px;">
          <p>© ${new Date().getFullYear()} ShopEase. All rights reserved.</p>
        </footer>
      </div>
    `;

    await transporter.sendMail({
      from: `"ShopEase Admin" <${process.env.EMAIL_USER}>`, // Sender
      to: email, // Recipient
      subject,
      html: htmlContent,
    });

    return res.status(200).json({ message: "Email sent successfully!" });
  } catch (error) {
    console.error("Email send error:", error);
    return res.status(500).json({ message: "Failed to send email" });
  }
}
