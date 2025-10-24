"use client";

import { ReactNode, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { AppSidebar } from "@/components/app-sidebar";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "admin") {
      router.push("/"); // redirect non-admins
    }
  }, [session, status, router]);

  if (status === "loading") return <p>Loading...</p>;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar stays visible */}
      <div className="w-64 bg-gray-900 text-white">
        <AppSidebar />
      </div>

      {/* Main content area */}
      <div className="flex-1 p-6 bg-gray-50 dark:bg-gray-950">
        {children}
      </div>
    </div>
  );
}
