import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendVerificationEmail = async (email: string, token: string) => {
  const verificationLink = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/verify?token=${token}`;

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
};
