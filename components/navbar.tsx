"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import {
  ShoppingCart,
  Heart,
  Menu,
  User,
  Search,
  ChevronDown,
} from "lucide-react";
import { toast, Toaster } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSettings } from "@/contexts/SettingsContext";
import Image from "next/image";

export default function Navbar() {
  const { data: session } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [pagesOpen, setPagesOpen] = useState(false);
  const [blogOpen, setBlogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [cartCount] = useState(2);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { settings } = useSettings();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node))
        setDropdownOpen(false);
      if (searchRef.current && !searchRef.current.contains(event.target as Node))
        setShowSuggestions(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await fetch(`/api/products/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        setSuggestions(data);
        setShowSuggestions(true);
      } catch {
        toast.error("Failed to fetch suggestions");
      }
    };
    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      toast.warning("Please enter a product name");
      return;
    }
    router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    setShowSuggestions(false);
    setSearchQuery("");
    setShowMobileSearch(false);
  };

  const handleSuggestionClick = (slug: string) => {
    router.push(`/products/${slug}`);
    setSearchQuery("");
    setShowSuggestions(false);
    setShowMobileSearch(false);
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
    toast.success("You have been logged out successfully");
  };

  return (
    <>
      <Toaster richColors position="top-right" />
      <nav className="bg-white/80 backdrop-blur-md shadow-sm dark:bg-gray-900 sticky top-0 z-50 border-b border-gray-100 dark:border-gray-800 transition">
        <div className="w-full max-w-8xl mx-auto px-2 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* ✅ Logo */}
            <Link href="/" className="flex items-center gap-2">
              {settings?.logo ? (
                <Image
                  src={settings.logo}
                  alt={settings.siteName || "Logo"}
                  width={200}
                  height={200}
                  className="rounded-md object-contain"
                />
              ) : (
                <span className="text-2xl font-extrabold text-gray-800 dark:text-white">
                  <span className="text-green-600">Shop</span>Ease
                </span>
              )}
            </Link>

            {/* Search Bar */}
            <div className="relative hidden md:flex flex-1 mx-6 max-w-md" ref={searchRef}>
              <form onSubmit={handleSubmit} className="w-full">
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for products..."
                  className="rounded-full px-4"
                />
              </form>

              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 w-full bg-white dark:bg-gray-800 rounded-lg shadow-md mt-1 z-50">
                  {suggestions.map((item) => (
                    <button
                      key={item._id}
                      onClick={() => handleSuggestionClick(item.slug)}
                      className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <span>{item.title}</span>
                      <span className="text-green-600 font-semibold text-sm">₦{item.price}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-5">
                <Link href="/products" className="hover:text-green-600">
                  Products
                </Link>

                {/* Categories */}
                <div className="relative">
                  <button
                    onClick={() => setCategoriesOpen(!categoriesOpen)}
                    className="flex items-center gap-1 hover:text-green-600"
                  >
                    Categories <ChevronDown className="w-4 h-4" />
                  </button>
                  {categoriesOpen && (
                    <div className="absolute mt-2 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-lg py-2 z-50">
                      <Link href="/category/electronics" className="block px-4 py-2 hover:bg-gray-100">
                        Electronics
                      </Link>
                      <Link href="/category/fashion" className="block px-4 py-2 hover:bg-gray-100">
                        Fashion
                      </Link>
                      <Link href="/category/home" className="block px-4 py-2 hover:bg-gray-100">
                        Home
                      </Link>
                    </div>
                  )}
                </div>

                {/* Pages Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setPagesOpen(!pagesOpen)}
                    className="flex items-center gap-1 hover:text-green-600"
                  >
                    Pages <ChevronDown className="w-4 h-4" />
                  </button>
                  {pagesOpen && (
                    <div className="absolute mt-2 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-lg py-2 z-50">
                      <Link href="/about" className="block px-4 py-2 hover:bg-gray-100">About Us</Link>
                      <Link href="/contact" className="block px-4 py-2 hover:bg-gray-100">Contact Us</Link>
                      <Link href="/faq" className="block px-4 py-2 hover:bg-gray-100">FAQ / Help</Link>
                    </div>
                  )}
                </div>

                {/* Blog Dropdown */}
                <div className="relative">
                  <button
                    className="flex items-center gap-1 hover:text-green-600"
                    onClick={() => setBlogOpen((prev) => !prev)}
                  >
                    Blog <ChevronDown className="w-4 h-4" />
                  </button>
                  {blogOpen && (
                    <div className="absolute mt-2 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-lg py-2 z-50">
                      <Link href="/blog" className="block px-4 py-2 hover:bg-gray-100">All Posts</Link>
                      <Link href="/blog/latest" className="block px-4 py-2 hover:bg-gray-100">Latest</Link>
                      <Link href="/blog/popular" className="block px-4 py-2 hover:bg-gray-100">Popular</Link>
                    </div>
                  )}
                </div>

                {/* Icons */}
                <Link href="/wishlist" className="hover:text-green-600">
                  <Heart className="w-6 h-6" />
                </Link>
                <Link href="/user/cart" className="relative hover:text-green-600">
                  <ShoppingCart className="w-6 h-6" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </div>

              {/* User Menu */}
              <div className="relative" ref={dropdownRef}>
                {session?.user ? (
                  <>
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center space-x-2 hover:text-green-600"
                    >
                      <User className="w-5 h-5" />
                      <span className="hidden sm:block">{session.user.name}</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    {dropdownOpen && (
                      <div className="absolute right-0 mt-3 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 z-50">
                        <Link href="/user/profile" className="block px-4 py-2 hover:bg-gray-100">
                          My Profile
                        </Link>
                        <Link href="/user/orders" className="block px-4 py-2 hover:bg-gray-100">
                          My Orders
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <Link href="/auth/login" className="hover:text-green-600 hidden md:block">
                    Login
                  </Link>
                )}
              </div>

              {/* Mobile Sheet */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>

                <SheetContent side="right" className="w-[100%] bg-white dark:bg-gray-900 flex flex-col">
                  <SheetHeader className="p-4 border-b">
                    <SheetTitle className="text-xl font-semibold">Menu</SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col p-4 space-y-4">
                    <SheetClose asChild><Link href="/products">Products</Link></SheetClose>
                    <SheetClose asChild><Link href="/about">About Us</Link></SheetClose>
                    <SheetClose asChild><Link href="/contact">Contact Us</Link></SheetClose>
                    <SheetClose asChild><Link href="/faq">FAQ / Help</Link></SheetClose>
                    <SheetClose asChild><Link href="/blog">Blog</Link></SheetClose>
                    {session?.user ? (
                      <>
                        <SheetClose asChild><Link href="/user/profile">My Profile</Link></SheetClose>
                        <SheetClose asChild><Link href="/user/orders">My Orders</Link></SheetClose>
                        <SheetClose asChild>
                          <button onClick={handleLogout} className="text-red-600 text-left">Logout</button>
                        </SheetClose>
                      </>
                    ) : (
                      <SheetClose asChild><Link href="/auth/login">Login</Link></SheetClose>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
