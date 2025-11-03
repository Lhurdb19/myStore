import mongoose from "mongoose";
import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      _id: mongoose.Types.ObjectId; // MongoDB _id
      id: string;
      role: "user" | "vendor" | "admin" | "superadmin";
      name: string;
      email: string;
      otpVerified?: boolean;
      emailVerified?: boolean;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    _id: mongoose.Types.ObjectId; // MongoDB _id
    id: string;
    otpVerified?: boolean;
    role: "user" | "admin" | "superadmin";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    _id: mongoose.Types.ObjectId; // MongoDB _id
    id?: string;
    role?: string;
    otpVerified?: boolean;
  }
}
