import { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, otpCode } = req.body;
  if (!email || !otpCode)
    return res.status(400).json({ message: "Missing email or OTP code" });

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: false, // true for 465, false for 587
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false, // allow self-signed certificates for dev
      },
    });

    const info = await transporter.sendMail({
      from: `"ShopEase" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "🔐 Your ShopEase OTP Code",
      html: `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 25px; background-color: #f4f6f9; max-width: 600px; margin: auto; border-radius: 10px; color: #333;">
    <div style="text-align: center; margin-bottom: 20px;">
      <img src="https://res.cloudinary.com/damamkuye/image/upload/v1761740811/image__1_-removebg-preview_exjxtz.png" alt="ShopEase Logo" style="width: 100px; margin-bottom: 10px;" />
      <h2 style="color: #196D1A; margin: 0;">Verify Your Account</h2>
    </div>
    
    <p style="font-size: 15px;">Hi ${email || "there"}, 👋</p>
    <p style="font-size: 15px;">Welcome to <strong>ShopEase</strong>! Please use the OTP below to complete your login verification.</p>
    
    <div style="background:#e9ffe6; padding: 15px 20px; text-align: center; border-radius: 8px; margin: 20px 0; font-size: 26px; letter-spacing: 5px; color: #196D1A; font-weight: bold;">
      ${otpCode}
    </div>

    <p style="font-size: 14px; color: #555;">
      This OTP is valid for the next <strong>5 minutes</strong>.  
      Do not share this code with anyone.
    </p>

    <hr style="margin: 30px 0; border-top: 1px solid #ddd;" />

    <p style="font-size: 13px; color: #888; text-align: center;">
      &copy; ${new Date().getFullYear()} ShopEase. All rights reserved.<br/>
      <a href="${process.env.NEXT_PUBLIC_BASE_URL}" style="color:#196D1A; text-decoration:none;">Visit our website</a>
    </p>
  </div>
`,

    });

    console.log("✅ OTP email sent:", info.messageId);
    return res.status(200).json({ message: "OTP sent successfully!" });

  } catch (error: any) {
    console.error("❌ Email send error:", error);

    if (error.response && error.response.includes("550-5.1.1")) {
      return res.status(400).json({
        error: `Your message wasn't delivered to ${email} because the address couldn't be found or is unable to receive mail.`,
      });
    }

    return res.status(500).json({ error: "Failed to send OTP. Please try again later." });
  }
}
