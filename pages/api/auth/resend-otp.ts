import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import User from "@/models/user";
import nodemailer from "nodemailer";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST")
    return res.status(405).json({ message: "Method not allowed" });

  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Missing email" });

  try {
    await connectDB();
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.otpVerified) return res.status(400).json({ message: "Account already verified" });

    // ✅ Generate new OTP
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 10); // OTP valid for 10 mins

    user.otpCode = newOtp;
    user.otpExpiry = expiry;
    await user.save();

    // ✅ Send email (example using nodemailer)
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

    await transporter.sendMail({
      from: `"ShopEase" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "🔐 Your New OTP Code - ShopEase",
      html: `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 25px; background-color: #f4f6f9; max-width: 600px; margin: auto; border-radius: 10px; color: #333;">
    <div style="text-align: center; margin-bottom: 20px;">
      <img src="https://res.cloudinary.com/damamkuye/image/upload/v1761740811/image__1_-removebg-preview_exjxtz.png" alt="ShopEase Logo" style="width: 100px; margin-bottom: 10px;" />
      <h2 style="color: #196D1A; margin: 0;">Verify Your Account</h2>
    </div>

    <p style="font-size: 15px;">Hi ${user.name || "there"}, 👋</p>
    <p style="font-size: 15px;">You requested a new OTP to verify your email address with <strong>ShopEase</strong>.</p>
    
    <div style="background:#e9ffe6; padding: 15px 20px; text-align: center; border-radius: 8px; margin: 20px 0; font-size: 20px; letter-spacing: 5px; color: #196D1A; font-weight: bold;">
      ${newOtp}
    </div>

    <p style="font-size: 14px; color: #555;">
      This OTP is valid for the next <strong>10 minutes</strong>.  
      Please do not share it with anyone for your account's security.
    </p>

    <p style="font-size: 14px; margin-top: 25px;">If you did <strong>NOT</strong> request this, please ignore this message or contact our support team.</p>

    <hr style="margin: 30px 0; border-top: 1px solid #ddd;" />

    <p style="font-size: 13px; color: #888; text-align: center;">
      &copy; ${new Date().getFullYear()} ShopEase. All rights reserved.<br/>
      <a href="${process.env.NEXT_PUBLIC_BASE_URL}" style="color:#196D1A; text-decoration:none;">Visit our website</a>
    </p>
  </div>
  `,
    });


    return res.status(200).json({ message: "OTP resent successfully" });
  } catch (error) {
    console.error("Resend OTP error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
