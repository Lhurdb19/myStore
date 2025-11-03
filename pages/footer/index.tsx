"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import Image from "next/image";
import { useSettings } from "@/contexts/SettingsContext";

export default function Footer() {
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [quickLinksOpen, setQuickLinksOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { settings } = useSettings()


  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    setNewsletterEmail(email);

    // Basic email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError("");
    }
  };

  const handleSubscribe = async () => {
    if (!newsletterEmail.trim() || emailError) {
      toast.error("Please enter a valid email");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newsletterEmail }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message);
        setNewsletterEmail("");
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <footer className="bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 py-10">
      <div className="max-w-full px-3 sm:px-4 lg:px-20">
        <div className="flex justify-between flex-col lg:flex-row gap-10">
          {/* Logo & About */}
          <div className="flex-1 -mt-10 flcex-col justify-start">
            {/* ✅ Dynamic Logo */}
            <Link href="/" className="flex items-start -ml-7 gap-2">
              {settings?.logo ? (
                <Image
                  src={settings.logo}
                  alt={settings.siteName || "Logo"}
                  width={200}
                  height={200}
                  className="rounded-md object-contain"
                />
              ) : (
                <span className="text-xl lg:text-2xl font-extrabold text-gray-800 dark:text-white">
                  <span className="text-green-600">Shop</span>Ease
                </span>
              )}
              {!settings?.logo && <span className="sr-only">{settings?.siteName || "ShopEase"}</span>}
            </Link>
            <p className="mt-0 text-[12px] md:text-sm max-w-sm">
              Your one-stop online store for electronics, fashion, home, and more. Quality products, great deals, and fast delivery.
            </p>
          </div>

          {/* Categories */}
          <div className="flex-1">
            <button
              onClick={() => setCategoriesOpen(!categoriesOpen)}
              className="w-full flex justify-between items-center text-sm lg:text-xl font-semibold mb-1 md:mb-2"
            >
              Categories
            </button>
            <ul className={`space-y-1 text-[12px] ${categoriesOpen ? "block" : "hidden"} md:block`}>
              <li>
                <Link href="/category/electronics" className="hover:text-green-600">Electronics</Link>
              </li>
              <li>
                <Link href="/category/fashion" className="hover:text-green-600">Fashion</Link>
              </li>
              <li>
                <Link href="/category/home" className="hover:text-green-600">Home</Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="flex-1">
            <button
              onClick={() => setQuickLinksOpen(!quickLinksOpen)}
              className="w-full flex justify-between items-center text-sm lg:text-xl font-semibold mb-1 md:mb-2"
            >
              Quick Links
            </button>
            <ul className={`space-y-1 text-[12px] ${quickLinksOpen ? "block" : "hidden"} md:block`}>
              <li>
                <Link href="/products" className="hover:text-green-600">Products</Link>
              </li>
              <li>
                <Link href="/deals" className="hover:text-green-600">Deals / Offers</Link>
              </li>
              <li>
                <Link href="/track-order" className="hover:text-green-600">Track Order</Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-green-600">Support / Contact Us</Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-green-600">FAQ / Help</Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-green-600">Blog</Link>
              </li>
            </ul>
          </div>

          {/* Account Links */}
          <div className="flex-1">
            <button
              onClick={() => setAccountOpen(!accountOpen)}
              className="w-full flex justify-between items-center text-sm lg:text-xl font-semibold mb-1 md:mb-2"
            >
              Account
            </button>
            <ul className={`space-y-1 text-[12px] ${accountOpen ? "block" : "hidden"} md:block`}>
              <li>
                <Link href="/auth/login" className="hover:text-green-600">Login</Link>
              </li>
              <li>
                <Link href="/auth/register" className="hover:text-green-600">Register</Link>
              </li>
              <li>
                <Link href="/user/profile" className="hover:text-green-600">My Profile</Link>
              </li>
              <li>
                <Link href="/user/orders" className="hover:text-green-600">My Orders</Link>
              </li>
            </ul>
          </div>

          {/* Newsletter + Socials */}
          <div className="flex-1 flex flex-col items-start">
            <h3 className="font-semibold mb-2 text-sm lg:text-xl">Newsletter</h3>
            <p className="text-[12px] mb-2">
              Subscribe for exclusive deals, early product launches, and tips! 🎁
            </p>
            <p className="text-xs mb-2 text-green-600 font-medium">
              Get 10% off your first order when you subscribe!
            </p>
            <div className="flex gap-2 w-full mb-4">
              <input
                type="email"
                placeholder="Your email"
                value={newsletterEmail}
                onChange={handleEmailChange}
                className={`flex-1 px-3 py-2 rounded-md border ${emailError ? 'border-red-500' : 'border-gray-300'} dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-600`}
              />
              <button
                onClick={handleSubscribe}
                className="px-2 py-1 lg:px-4 lg:py-2 text-[12px] lg:text-sm bg-green-600  text-white rounded-md hover:bg-green-700 flex items-center justify-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                ) : (
                  "Subscribe"
                )}
              </button>
            </div>
            {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}

            {/* Social Links */}
            <div className="flex items-center gap-4 mt-2 ">
              <Link href="#" className="hover:text-green-600 "><Facebook className="w-4 h-4 lg:w-5 lg:h-5" /></Link>
              <Link href="#" className="hover:text-green-600"><Twitter className="w-4 h-4 lg:w-5 lg:h-5" /></Link>
              <Link href="#" className="hover:text-green-600"><Instagram className="w-4 h-4 lg:w-5 lg:h-5" /></Link>
              <Link href="#" className="hover:text-green-600"><Linkedin className="w-4 h-4 lg:w-5 lg:h-5" /></Link>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-300 dark:border-gray-700 mt-8 pt-4 text-center text-sm">
          &copy; {new Date().getFullYear()} ShopEase. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
