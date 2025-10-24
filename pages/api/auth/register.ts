// pages/api/auth/register.ts
import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import User from "@/models/user";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST")
    return res.status(405).json({ message: "Method not allowed" });

  const { name, email, password, role } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: "All fields are required" });

  await connectDB();

  const existingUser = await User.findOne({ email });
  if (existingUser)
    return res.status(409).json({ message: "Email already registered" });

  const hashedPassword = await bcrypt.hash(password, 10);
  const verificationToken = crypto.randomBytes(32).toString("hex");

  // Create user temporarily
  const user = await User.create({
    name,
    email,
    password,
    role: role || "user",
    emailVerified: false,
    verificationToken,
  });

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const verificationLink = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/verify?token=${verificationToken}&email=${email}`;

    await transporter.sendMail({
      from: `"MyStore" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify your email address",
      html: `
        <h2>Welcome to MyStore 🎉</h2>
        <p>Click below to verify your email:</p>
        <a href="${verificationLink}" style="background:#196D1A;color:white;padding:10px 15px;text-decoration:none;border-radius:8px;">Verify Email</a>
        <p>If you didn’t request this, please ignore this message.</p>
      `,
    });

    return res.status(201).json({
      message: "Registration successful! Please verify your email.",
    });
  } catch (err: any) {
    console.error("Email error:", err);
    await User.deleteOne({ _id: user._id });

    const raw = err?.response || err?.message || "";
    if (raw.includes("550") || raw.includes("5.1.1") || raw.includes("does not exist")) {
      return res.status(400).json({
        message: `Your message wasn't delivered to ${email} because the address couldn't be found, or is unable to receive mail.`,
        learnMore: "https://support.google.com/mail/answer/6596?hl=en",
      });
    }

    return res.status(500).json({
      message: "Failed to send verification email. Please try again later.",
    });
  }
}
