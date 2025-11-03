import nodemailer from "nodemailer"
import crypto from "crypto"
import { NextApiRequest, NextApiResponse } from "next"
import { connectDB } from "@/lib/db"
import User from "@/models/user"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end()

  const { email } = req.body
  await connectDB()
  const user = await User.findOne({ email })
  if (!user) return res.status(400).json({ message: "No account with that email" })

  const token = crypto.randomBytes(32).toString("hex")
  user.resetToken = token
  user.resetTokenExpiry = Date.now() + 30 * 60 * 1000; // 30 minutes
  await user.save()

  const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password?token=${token}`

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })

  const mailOptions = {
    from: `"ShopEase" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "🔐 Reset Your Password - ShopEase",
    html: `
      <div style="font-family: 'Arial', sans-serif; padding: 30px; background: #f7f9fb; border-radius: 10px; max-width: 600px; margin: auto; color: #333;">
      <div style="text-align: center;">
        <img src="https://res.cloudinary.com/damamkuye/image/upload/v1761740811/image__1_-removebg-preview_exjxtz.png" alt="ShopEase Logo" style="width: 120px; height: auto; margin-bottom: 15px;" />
        <h2 style="color: #196D1A;">Password Reset Request</h2>
      </div>
      <p style="font-size: 15px;">Hello,</p>
      <p style="font-size: 15px;">We received a request to reset your password. Click the button below to set a new one:</p>
      
      <div style="text-align: center; margin: 25px 0;">
        <a href="${resetUrl}" style="background: #196D1A; color: #fff; padding: 12px 25px; border-radius: 8px; text-decoration: none; font-weight: bold;">
          Reset Password
        </a>
      </div>

      <p style="font-size: 14px; color: #555;">
        This link will expire in <strong>30 minutes</strong>.  
        If you didn’t request this, please ignore this email.
      </p>

      <hr style="margin-top: 30px; border: none; border-top: 1px solid #ddd;" />
      <p style="font-size: 13px; color: #888; text-align: center;">
        &copy; ${new Date().getFullYear()} ShopEase. All rights reserved.<br/>
        <a href="${process.env.NEXT_PUBLIC_BASE_URL}" style="color:#196D1A; text-decoration:none;">Visit our website</a>
      </p>
    </div>
    `,
  }

  await transporter.sendMail(mailOptions)
  res.status(200).json({ success: true, message: "Password reset link sent to email." })
}
