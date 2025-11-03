"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingCart, Heart, Bell, User, LockKeyhole } from "lucide-react";

const sidebarItems = [
  { name: "Dashboard", href: "/user/dashboard", icon: Home },
  { name: "Orders", href: "/user/orders", icon: ShoppingCart },
  { name: "Wishlist", href: "/user/wishlist", icon: Heart },
  { name: "Notifications", href: "/user/notifications", icon: Bell },
  { name: "Profile", href: "/user/profile", icon: User },
  { name: "Update Password", href: "/changepassword-form", icon: LockKeyhole },
];

export default function UserSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 h-screen bg-white shadow-md p-6 flex flex-col">
      <h2 className="text-2xl font-bold mb-6">My Account</h2>
      <nav className="flex flex-col space-y-2">
        {sidebarItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 transition ${
                isActive ? "bg-gray-200 font-semibold" : ""
              }`}
            >
              <item.icon className="h-5 w-5 text-gray-600" />
              <span className="text-gray-800">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
