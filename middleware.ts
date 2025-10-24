import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = req.nextUrl;

  // ✅ Public routes
  const publicPaths = [
    "/",
    "/auth/login",
    "/auth/register",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/auth/verify",
    "/auth/suspended", // allow suspended page
    "/api/auth",
  ];

  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // ❌ No token = redirect to login
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  // 🚫 Suspended check
  if (token.suspended) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/suspended";
    return NextResponse.redirect(url);
  }

  // 👑 Super Admin only pages
  if (pathname.startsWith("/superadmin")) {
    if (token.role === "superadmin" && !token.otpVerified) {
      const url = req.nextUrl.clone();
      url.pathname = "/auth/verify-otp";
      return NextResponse.redirect(url);
    }
    if (token.role !== "superadmin") {
      const url = req.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  // 👨‍💼 Admin only pages
  if (pathname.startsWith("/admin")) {
    if ((token.role === "admin" || token.role === "superadmin") && !token.otpVerified) {
      const url = req.nextUrl.clone();
      url.pathname = "/auth/verify-otp";
      return NextResponse.redirect(url);
    }
    if (token.role !== "admin" && token.role !== "superadmin") {
      const url = req.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  // 👤 User routes
  if (pathname.startsWith("/user")) {
    if (token.role !== "user" && token.role !== "superadmin") {
      const url = req.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
    if (token.role === "user" && !token.otpVerified) {
      const url = req.nextUrl.clone();
      url.pathname = "/auth/verify-otp";
      return NextResponse.redirect(url);
    }
  }

  // Redirect authenticated users away from login/register
  if (token && ["/auth/login", "/auth/register"].includes(pathname)) {
    const url = req.nextUrl.clone();

    if (token.role === "superadmin") url.pathname = "/superadmin/dashboard";
    else if (token.role === "admin") url.pathname = "/admin/dashboard";
    else url.pathname = "/user/dashboard";

    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// ✅ Protected routes matcher
export const config = {
  matcher: [
    "/superadmin/:path*",
    "/admin/:path*",
    "/user/:path*",
    "/auth/:path*",
  ],
};
