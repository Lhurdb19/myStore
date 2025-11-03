"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sidebar } from "./ui/sidebar";
import { Home, LockKeyhole, Package, ShoppingCart, User } from "lucide-react";
import { signOut } from "next-auth/react";

export function VendorSidebar() {
  const pathname = usePathname();

  const handleLogout = async () => {
    await signOut({redirect: false});
    window.location.href = "/";
    // Implement logout functionality here
    console.log("Logout clicked");
  }

  const menuItems = [
    { label: "Dashboard", href: "/vendor/dashboard", icon: <Home className="w-5 h-5" /> },
    { label: "Products", href: "/vendor/products", icon: <Package className="w-5 h-5" /> },
    { label: "Orders", href: "/vendor/orders", icon: <ShoppingCart className="w-5 h-5" /> },
    { label: "Profile", href: "/vendor/profile", icon: <User className="w-5 h-5" /> },
    { label: "Update Password", href: "/changepassword-form", icon: <LockKeyhole className="w-5 h-5" /> },
  ];

  return (
    <Sidebar className="w-64 bg-gray-900 text-black min-h-screen p-4 " collapsible="icon">
      <div className="my-5 text-xl font-bold flex items-center justify-center">Vendor Panel</div>
      <ul className="space-y-2">
        {menuItems.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`flex items-center gap-2 p-2 rounded hover:bg-gray-800 ${
                pathname === item.href ? "bg-gray-800 font-semibold" : ""
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
      <button onClick={handleLogout}> Logout </button>
    </Sidebar>
  );
}
