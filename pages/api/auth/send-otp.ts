import { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, otpCode } = req.body;
  if (!email || !otpCode)
    return res.status(400).json({ message: "Missing email or OTP code" });

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"ShopEase" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "🔐 Your ShopEase OTP Code",
      html: `
        <div style="font-family: 'Arial', sans-serif; background-color: #f9f9f9; padding: 30px; border-radius: 10px; max-width: 600px; margin: auto; color: #333;">
          
          <div style="text-align: center;">
            <img src="https://res.cloudinary.com/damamkuye/image/upload/v1761740811/image__1_-removebg-preview_exjxtz.png" 
              alt="ShopEase Logo" 
              style="width: 120px; height: auto; margin-bottom: 15px;" />
          </div>
          
          <h2 style="text-align:center; color: #196D1A;">Your One-Time Password (OTP)</h2>
          
          <p style="font-size: 15px; text-align:center;">
            Use the code below to complete your verification process.
          </p>

          <div style="background: #196D1A; color: white; text-align: center; font-size: 26px; font-weight: bold; letter-spacing: 5px; padding: 15px 0; border-radius: 8px; margin: 25px auto; max-width: 250px;">
            ${otpCode}
          </div>

          <p style="font-size: 14px; text-align:center; color: #555;">
            This code will expire in <strong>5 minutes</strong>.<br/>
            If you didn’t request this code, please ignore this email.
          </p>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;" />

          <p style="font-size: 13px; text-align: center; color: #888;">
            &copy; ${new Date().getFullYear()} <strong>ShopEase</strong> &nbsp;|&nbsp; 
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}" style="color: #196D1A; text-decoration: none;">Visit our website</a>
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
