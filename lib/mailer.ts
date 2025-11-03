import nodemailer from "nodemailer";
import { connectDB } from "@/lib/db";
import Settings from "@/models/settings";

export const getTransporter = async () => {
  await connectDB();
  const settings = await Settings.findOne();

  if (!settings || !settings.emailServer) {
    throw new Error("SMTP settings not configured in database");
  }

  const { host, port, user } = settings.emailServer;
  const pass = process.env.EMAIL_PASS; // stored securely in .env

  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // TLS will be used automatically
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// ✅ ShopEase logo
const shopEaseLogo = `
  <div style="text-align: center;">
    <img src="https://res.cloudinary.com/damamkuye/image/upload/v1761740811/image__1_-removebg-preview_exjxtz.png" 
      alt="ShopEase Logo" 
      style="width: 150px; height: auto; margin-bottom: 15px;" />
  </div>
`;

// ✅ 1. Verification Email
export const sendVerificationEmail = async (email: string, token: string) => {
  const verificationLink = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/verify?token=${token}`;
  const transporter = await getTransporter();

  const html = `
    <div style="font-family:sans-serif;padding:20px;">
      ${shopEaseLogo}
      <h2 style="color:#196D1A;text-align:center;">Verify Your Email Address</h2>
      <p>Click the button below to verify your email and activate your ShopEase account:</p>
      <div style="text-align:center;margin:20px 0;">
        <a href="${verificationLink}" style="background:#196D1A;color:white;padding:10px 20px;text-decoration:none;border-radius:8px;">Verify Email</a>
      </div>
      <p>If you didn’t request this, please ignore this message.</p>
      <p style="text-align:center;font-size:12px;color:#888;">© ${new Date().getFullYear()} ShopEase. All rights reserved.</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"ShopEase" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify your ShopEase account",
    html,
  });
};

// ✅ 2. About Us / Welcome Email
export const sendAboutUsEmail = async (email: string) => {
  const transporter = await getTransporter();

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 24px; background: #f9fafb; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.05);">
        <div style="background-color: #196D1A; padding: 20px; text-align: center;">
          ${shopEaseLogo}
          <h1 style="color: #ffffff; margin: 0;">Welcome to ShopEase 🛍️</h1>
        </div>
        <div style="padding: 24px;">
          <p>Hi there 👋,</p>
          <p>
            Welcome to <strong>ShopEase</strong> — your trusted online shopping platform
            that delivers comfort, reliability, and satisfaction at every checkout.
          </p>
          <p>
            From trendy fashion to smart gadgets, ShopEase offers a smooth, secure, and fast
            experience designed for the modern shopper.
          </p>
          <h3 style="color: #196D1A;">Why ShopEase?</h3>
          <ul>
            <li>✅ Wide variety of quality products</li>
            <li>✅ Fast and secure checkout</li>
            <li>✅ Great discounts and promotions</li>
            <li>✅ Dedicated support team</li>
          </ul>
          <p>
            Start shopping now at 
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}" style="color: #196D1A; font-weight: bold; text-decoration: none;">
              ShopEase.com
            </a>
          </p>
          <p style="margin-top: 20px;">With love,</p>
          <p style="font-weight: bold;">💚 The ShopEase Team</p>
        </div>
      </div>
      <p style="text-align: center; font-size: 12px; color: #777; margin-top: 20px;">
        © ${new Date().getFullYear()} ShopEase. All rights reserved.
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"ShopEase" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Welcome to ShopEase — Start Shopping Smarter!",
    html,
  });
};

// ✅ 3. Thank You for Shopping Email
export const sendThankYouEmail = async (email: string, orderId: string) => {
  const transporter = await getTransporter();

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 24px; background: #f9fafb; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.05);">
        <div style="background-color: #196D1A; padding: 20px; text-align: center;">
          ${shopEaseLogo}
          <h1 style="color: #ffffff; margin: 0;">Thank You for Shopping with Us 💚</h1>
        </div>
        <div style="padding: 24px;">
          <p>Dear valued customer,</p>
          <p>
            Your order <strong>#${orderId}</strong> has been successfully received. 🎉
          </p>
          <p>
            We’re preparing your items for shipment and will notify you once they’re on the way.
          </p>
          <p>
            You can track your order anytime by visiting:
          </p>
          <div style="text-align:center;margin:20px 0;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/orders" style="background:#196D1A;color:white;padding:10px 15px;text-decoration:none;border-radius:8px;">
              View My Orders
            </a>
          </div>
          <p>
            Thank you for trusting <strong>ShopEase</strong> — we look forward to serving you again!
          </p>
          <p style="margin-top: 20px;">Warm regards,</p>
          <p style="font-weight: bold;">💚 The ShopEase Team</p>
        </div>
      </div>
      <p style="text-align: center; font-size: 12px; color: #777; margin-top: 20px;">
        © ${new Date().getFullYear()} ShopEase. All rights reserved.
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"ShopEase" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Thank You for Shopping with ShopEase!",
    html,
  });
};
