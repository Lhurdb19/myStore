// import NextAuth, { NextAuthOptions } from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
// import bcrypt from "bcryptjs";
// import { connectDB } from "@/lib/db";
// import User from "@/models/user";

// export const authOptions: NextAuthOptions = {
//   providers: [
//     CredentialsProvider({
//       name: "Credentials",
//       credentials: {
//         email: { label: "Email", type: "email" },
//         password: { label: "Password", type: "password" },
//         otpLogin: { label: "OTP Login", type: "text" },
//       },

//       async authorize(credentials) {
//         await connectDB();

//         const email = credentials?.email?.trim();
//         const password = credentials?.password;
//         const otpLogin = credentials?.otpLogin === "true";

//         if (!email) throw new Error("Email is required");
//         const user = await User.findOne({ email });
//         if (!user) throw new Error("User not found");

//         // ✅ Suspended check
//         if (user.suspended) {
//           throw new Error("Your account has been suspended. Please contact support.");
//         }

//         // Handle OTP login
//         if (otpLogin) {
//           await User.updateOne({ email }, { $set: { otpVerified: true } });

//           return {
//             id: user._id.toString(),
//             name: user.name,
//             email: user.email,
//             role: user.role,
//             otpVerified: false,
//           };
//         }

//         // Handle Password login
//         if (!password) throw new Error("Password required");

//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) throw new Error("Invalid credentials");

//         // Generate OTP
//         const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
//         const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

//         await User.updateOne(
//           { _id: user._id },
//           { $set: { otpCode, otpExpiry, otpVerified: false } }
//         );

//         // Send OTP email
//         try {
//           await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/send-otp`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ email, otpCode }),
//           });
//         } catch (e) {
//           console.error("Failed to send OTP:", e);
//         }

//         return {
//           id: user._id.toString(),
//           name: user.name,
//           email: user.email,
//           role: user.role,
//           otpVerified: false,
//         };
//       },
//     }),
//   ],

//   callbacks: {
//     async jwt({ token, user }) {
//       if (user) {
//         token.role = (user as any).role;
//         token.otpVerified = (user as any).otpVerified;
//         token.emailVerified = (user as any).emailVerified;
//       token.suspended = (user as any).suspended || false; // ✅ add suspended
//       } else if (token.email) {
//         const dbUser = await User.findOne({ email: token.email }).select(
//           "emailVerified suspended otpVerified"
//         );
//         if (dbUser) {
//           token.emailVerified = dbUser.emailVerified;
//           token.otpVerified = dbUser.otpVerified;
//           token.suspended = dbUser.suspended || false;
//         }
//       }
//       return token;
//     },

//     async session({ session, token }) {
//       if (session.user) {
//         (session.user as any).role = token.role;
//         (session.user as any).otpVerified = token.otpVerified;
//         (session.user as any).emailVerified = token.emailVerified;
//         (session.user as any).suspended = token.suspended;
//       }
//       return session;
//     },
//   },

//   pages: {
//     signIn: "/auth/login",
//   },

//   secret: process.env.NEXTAUTH_SECRET,
// };

// const handler = NextAuth(authOptions);
// export { handler as GET, handler as POST };
// export default handler;


import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/user";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        otpLogin: { label: "OTP Login", type: "text" },
      },

      async authorize(credentials) {
        await connectDB();

        const email = credentials?.email?.trim();
        const password = credentials?.password;
        const otpLogin = credentials?.otpLogin === "true";

        if (!email) throw new Error("Email is required");
        const user = await User.findOne({ email });
        if (!user) throw new Error("User not found");

        // ✅ Suspended check
        if (user.suspended) {
          throw new Error("Your account has been suspended. Please contact support.");
        }

        // ✅ Handle OTP login
        if (otpLogin) {
          await User.updateOne({ email }, { $set: { otpVerified: true } });

          return {
            id: user._id.toString(), // ✅ ensure id is always returned
            name: user.name,
            email: user.email,
            role: user.role,
            otpVerified: false,
          };
        }

        // ✅ Handle Password login
        if (!password) throw new Error("Password required");

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new Error("Invalid credentials");

        // Generate OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

        await User.updateOne(
          { _id: user._id },
          { $set: { otpCode, otpExpiry, otpVerified: false } }
        );

        // Send OTP email
        try {
          await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/send-otp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, otpCode }),
          });
        } catch (e) {
          console.error("Failed to send OTP:", e);
        }

        return {
          id: user._id.toString(), // ✅ make sure to always include user id
          name: user.name,
          email: user.email,
          role: user.role,
          otpVerified: false,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // 🧠 Attach user info to the token (including id)
      if (user) {
        token.id = (user as any).id; // ✅ <-- Add this line
        token.role = (user as any).role;
        token.otpVerified = (user as any).otpVerified;
        token.emailVerified = (user as any).emailVerified;
        token.suspended = (user as any).suspended || false;
      } else if (token.email) {
        const dbUser = await User.findOne({ email: token.email }).select(
          "emailVerified suspended otpVerified"
        );
        if (dbUser) {
          token.emailVerified = dbUser.emailVerified;
          token.otpVerified = dbUser.otpVerified;
          token.suspended = dbUser.suspended || false;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id; // ✅ make id available to frontend + API
        (session.user as any).role = token.role;
        (session.user as any).otpVerified = token.otpVerified;
        (session.user as any).emailVerified = token.emailVerified;
        (session.user as any).suspended = token.suspended;
      }
      return session;
    },
  },

  pages: {
    signIn: "/auth/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
export default handler;
