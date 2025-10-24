import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "user" | "admin" | "superadmin";
      name: string;
      email: string;
      otpVerified?: boolean;
       emailVerified?: boolean;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
      otpVerified?: boolean;
    role: "user" | "admin" | "superadmin";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    otpVerified?: boolean;
  }
}