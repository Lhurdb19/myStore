// // pages/api/auth/send-otp.ts
// import { NextApiRequest, NextApiResponse } from "next";
// import nodemailer from "nodemailer";

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== "POST") return res.status(405).end();

//   const { email, otpCode } = req.body;
//   if (!email || !otpCode)
//     return res.status(400).json({ message: "Missing email or OTP code" });

//   try {
//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//       },
//     });

//     await transporter.sendMail({
//       from: `"Your App" <${process.env.EMAIL_USER}>`,
//       to: email,
//       subject: "Your OTP Code",
//       html: `<p>Your OTP code is <b>${otpCode}</b>. It expires in 5 minutes.</p>`,
//     });

//     return res.status(200).json({ message: "OTP sent successfully!" });
//   } catch (error) {
//     console.error("Email send error:", error);
//     return res.status(500).json({ error: "Failed to send OTP" });
//   }
// }

// pages/api/auth/send-otp.ts
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
      from: `"MyStore" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP Code",
      html: `
        <div style="font-family:Arial,sans-serif;padding:20px;">
          <h2>🔐 Your Verification Code</h2>
          <p>Your one-time code is:</p>
          <h1 style="letter-spacing:5px;color:#196D1A;">${otpCode}</h1>
          <p>This code expires in <strong>5 minutes</strong>.</p>
        </div>
      `,
    });

    console.log("✅ Email sent:", info.messageId);
    return res.status(200).json({ message: "OTP sent successfully!" });
  } catch (error: any) {
    console.error("❌ Email send error:", error);

    // Gmail invalid address error
    if (error.response && error.response.includes("550-5.1.1")) {
      return res.status(400).json({
        error: `Your message wasn't delivered to ${email} because the address couldn't be found, or is unable to receive mail.`,
      });
    }

    return res.status(500).json({ error: "Failed to send OTP. Please try again later." });
  }
}
