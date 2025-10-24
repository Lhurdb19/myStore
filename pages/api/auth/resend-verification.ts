import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import User from "@/models/user";
import crypto from "crypto";
import nodemailer from "nodemailer";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  await connectDB();

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });
  if (user.emailVerified) return res.status(400).json({ message: "Email already verified" });

  // Generate a new token
  const verificationToken = crypto.randomBytes(32).toString("hex");
  user.verificationToken = verificationToken;
  await user.save();

  const verificationLink = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/verify?token=${verificationToken}&email=${email}`;

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"MyStore" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Resend: Verify your email address",
      html: `<h2>Verify your email 🎉</h2>
             <p>Click below to verify your email:</p>
             <a href="${verificationLink}" style="background:#196D1A;color:white;padding:10px 15px;text-decoration:none;border-radius:8px;">Verify Email</a>
             <p>If you didn’t request this, please ignore this message.</p>`,
    });

    return res.status(200).json({ success: true, message: "Verification email resent successfully" });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Failed to resend verification email" });
  }
}
