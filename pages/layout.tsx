"use client";
import Script from "next/script";

import { ReactNode, useEffect, useState } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import Navbar from "@/components/navbar";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { useSession } from "next-auth/react";
import SuperAdminLayout from "@/components/SuperAdminLayout";
import { useRouter } from "next/router";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();
  const [localVerified, setLocalVerified] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedVerified = localStorage.getItem("otpVerified") === "true";
      if (storedVerified) setLocalVerified(true);
    }
  }, []);

  useEffect(() => {
    if (status === "loading") return;

    const otpVerified = session?.user?.otpVerified || localVerified;

    if (session?.user && !otpVerified && router.pathname !== "/auth/verify-otp") {
      router.replace("/auth/verify-otp");
    }

    const blockNavigation = (e: PopStateEvent) => {
      if (session?.user && !otpVerified) {
        e.preventDefault();
        router.replace("/auth/verify-otp");
      }
    };
    window.addEventListener("popstate", blockNavigation);

    return () => {
      window.removeEventListener("popstate", blockNavigation);
    };
  }, [session, router, status, localVerified]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen text-white">
        <p>Loading...</p>
      </div>
    );
  }

  const role = session?.user?.role ?? "guest";
  const otpVerified = session?.user?.otpVerified || localStorage.getItem("otpVerified") === "true";

  if (!otpVerified && router.pathname === "/auth/verify-otp") {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <SidebarProvider>
          <main className="flex-1">{children}</main>
          <Toaster position="top-center" />
        </SidebarProvider>
      </ThemeProvider>
    );
  }

  if (role === "superadmin" && otpVerified) {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <SuperAdminLayout userName={session?.user?.name ?? "Super Admin"} userEmail={session?.user?.email ?? ""}>
          {children}
          <Toaster position="top-center" />
        </SuperAdminLayout>
      </ThemeProvider>
    );
  }

  if (role === "admin") {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <SidebarProvider>
          <div className="flex">
            {otpVerified && <AppSidebar />}
            {otpVerified && <SidebarTrigger />}
            <main className="flex-1 p-6">{children}</main>
          </div>
          <Toaster position="top-center" />
        </SidebarProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Toaster position="top-center" />
         {/* ✅ Add Payment SDKs Globally */}
      <Script src="https://js.paystack.co/v1/inline.js" strategy="beforeInteractive" />
      <Script src="https://checkout.flutterwave.com/v3.js" strategy="beforeInteractive" />
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="beforeInteractive" />
      </div>
    </ThemeProvider>
  );
}
