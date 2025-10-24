import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import AdminNavbar from "./admin-navbar";
import AdminOverview from "./admin-overview";
import { AppSidebar } from "@/components/app-sidebar";
import ManageUsers from "./users";

export default function AdminDashboard() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.user.role !== "admin") router.push("/");
  }, [session]);

  if (!session) return null;

  return (
    <div className="flex h-screen">
      <AppSidebar />
      <div className="flex-1 flex flex-col bg-gray-100">
        <AdminNavbar />
        <AdminOverview />
        <ManageUsers/>
      </div>
    </div>
  );
}
