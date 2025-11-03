"use client";
import { ReactNode } from "react";
import UserSidebar from "@/pages/user/usersidebar";

interface UserLayoutProps {
  children: ReactNode;
}

export default function UserLayout({ children }: UserLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <UserSidebar />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
