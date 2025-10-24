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
  user.resetTokenExpiry = Date.now() + 3600000 // 1 hour
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
    from: `"MyStore" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Password Reset",
    html: `
      <p>Click below to reset your password:</p>
      <a href="${resetUrl}" style="color:green;">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
    `,
  }

  await transporter.sendMail(mailOptions)
  res.status(200).json({ success: true, message: "Password reset link sent to email." })
}
