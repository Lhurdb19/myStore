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
  const validRoles = ["user", "vendor", "admin", "superadmin"];
  const userRole = validRoles.includes(role?.toLowerCase()?.trim()) ? role.toLowerCase() : "user";

  const user = await User.create({
    name,
    email,
    password,
    role: userRole,
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
      from: `"ShopEase" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify Your ShopEase Account ✅",
      html: `
    <div style="font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color:#f4f6f8; padding:40px 0;">
      <div style="max-width:600px; margin:0 auto; background:white; border-radius:12px; box-shadow:0 4px 10px rgba(0,0,0,0.08); overflow:hidden;">
        
        <!-- Header -->
        <div style="background-color:#196D1A; text-align:center; padding:25px;">
          <img src="https://res.cloudinary.com/damamkuye/image/upload/v1761740811/image__1_-removebg-preview_exjxtz.png"
               alt="ShopEase Logo"
               style="width:120px; height:auto; margin-bottom:10px;" />
          <h1 style="color:white; margin:0; font-size:22px;">Welcome to ShopEase</h1>
        </div>

        <!-- Body -->
        <div style="padding:30px;">
          <h2 style="color:#333;">Hi ${name}, 👋</h2>
          <p style="color:#555; font-size:15px; line-height:1.6;">
            Thanks for signing up with <strong>ShopEase</strong>!  
            To complete your registration and activate your account, please verify your email address by clicking the button below:
          </p>

          <div style="text-align:center; margin:30px 0;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/auth/verify?token=${verificationToken}&email=${email}"
              style="background-color:#196D1A; color:white; padding:12px 30px; border-radius:8px; text-decoration:none; font-weight:bold; display:inline-block;">
              Verify My Email
            </a>
          </div>

          <p style="color:#777; font-size:14px;">
            If you didn’t create a ShopEase account, you can safely ignore this message.
          </p>

          <p style="color:#777; font-size:13px; margin-top:25px;">
            With love 💚,<br/>
            <strong>The ShopEase Team</strong>
          </p>
        </div>

        <!-- Footer -->
        <div style="background-color:#f0f0f0; padding:15px; text-align:center; font-size:12px; color:#888;">
          © ${new Date().getFullYear()} ShopEase. All rights reserved.
        </div>
      </div>
    </div>
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
