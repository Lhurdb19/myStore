"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { GetServerSideProps } from "next";
import Image from "next/image";
import { Toaster, toast } from "sonner";
import { useCart } from "@/hooks/useCart";
import { Heart, ShoppingCart } from "lucide-react";
import { useSession } from "next-auth/react";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { useWishlist } from "@/contexts/WishlistContext";
import { motion } from "framer-motion";

interface ProductsPageProps {
  products: any[];
}

export default function ProductsPage({ products }: ProductsPageProps) {
  const { data: session } = useSession();
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState(products || []);

  // Simulated load
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Filter logic
  useEffect(() => {
    if (!Array.isArray(products)) return;
    const filtered = products.filter((p) =>
      p.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchQuery, products]);

  // Add to cart
  const handleAddToCart = async (product: any) => {
    if (product.stock <= 0) {
      toast.error("This product is out of stock.");
      return;
    }
    try {
      await addToCart.mutateAsync({ productId: product._id, quantity: 1 });
      toast.success(`${product.title} added to cart 🛒`);
    } catch {
      toast.error("Failed to add to cart.");
    }
  };

  // Wishlist
  const handleToggleWishlist = async (product: any) => {
    if (!session) {
      toast.info("Please log in to use wishlist ❤️");
      return (window.location.href = "/login");
    }

    try {
      if (isInWishlist(product._id)) {
        await removeFromWishlist(product._id);
      } else {
        await addToWishlist(product);
      }
    } catch {
      toast.error("Wishlist update failed");
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen px-6 lg:px-25 xl:px-25 py-10 max-w-8xl">
      <Toaster position="top-center" richColors />
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-10">
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
          🛍️ Our Products
        </h1>
        <input
          type="text"
          placeholder="Search for products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-1/2 lg:w-1/3 border border-gray-300 rounded-full py-2 px-5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm text-sm sm:text-base transition"
        />
      </div>

      {/* Product Grid */}
      {loading ? (
        <p className="text-gray-500 text-center">Loading products...</p>
      ) : filteredProducts.length === 0 ? (
        <p className="text-gray-500 text-center">No products found.</p>
      ) : (
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: 0.08 },
            },
          }}
        >
          {filteredProducts.map((p) => (
            <motion.div
              key={p._id}
              className="relative bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden group"
              whileHover={{ scale: 1.02 }}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              {/* Wishlist Icon */}
              {session && (
                <button
                  onClick={() => handleToggleWishlist(p)}
                  className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-md hover:scale-110 transition-transform z-10"
                >
                  <Heart
                    size={20}
                    className={`${
                      isInWishlist(p._id) ? "text-red-500" : "text-gray-400"
                    } transition-colors`}
                    fill={isInWishlist(p._id) ? "currentColor" : "none"}
                  />
                </button>
              )}

              {/* Product Image */}
              <Link href={`/products/${p.slug}`}>
                <div className="relative w-full h-35 md:h-50 lg:h-64 xl:h-65 overflow-hidden">
                  <Image
                    width={500}
                    height={500}
                    src={p.images?.[0] || "/placeholder.png"}
                    alt={p.title}
                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              </Link>

              {/* Product Details */}
              <div className="p-2 flex flex-col gap-1 md:gap-2 lg:gap-2 xl:gap-2">
                <h3 className="text-gray-800 font-semibold text-[12px] md:text-sm lg:text-sm xl:text-sm sm:text-base line-clamp-1">
                  {p.title}
                </h3>
                <p className="text-[10px] md:text-sm lg:text-sm xl:text-sm font-medium text-gray-600 line-clamp-2">
                  {p.description?.slice(0, 30) || "High quality product available now."}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-[11px] md:text-sm lg:text-lg xl:text-lg font-semibold text-gray-600">
                    ₦{p.price.toLocaleString()}
                  </p>
                  <span
                    className={`text-[8px] md:text-xs lg:text-xs xl:text-xs px-2 py-0.5 rounded-full ${
                      p.stock > 0
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {p.stock > 0 ? "In Stock" : "Out of Stock"}
                  </span>
                </div>

                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => handleAddToCart(p)}
                    disabled={p.stock <= 0}
                    className={`flex items-center justify-center gap-2 w-full py-1.5 md:py-2 lg:py-2 xl:py-2 rounded-lg text-[10px] md:text-sm lg:text-sm xl:text-sm font-medium transition-all duration-300 ${
                      p.stock > 0
                        ? "bg-green-600 text-white hover:bg-blue-700"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    <ShoppingCart size={16} />
                    {p.stock > 0 ? "Add to Cart" : "Out of Stock"}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

// ✅ Server-side data
export const getServerSideProps: GetServerSideProps = async (context) => {
  await connectDB();
  const q = context.query.search ? String(context.query.search).trim() : "";
  let products;

  if (!q) {
    products = await Product.find({ active: true }).sort({ createdAt: -1 }).lean();
  } else {
    const slugCandidate = q.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
    products = await Product.find({
      active: true,
      $or: [
        { slug: slugCandidate },
        { title: { $regex: q, $options: "i" } },
        { title: q },
      ],
    })
      .sort({ createdAt: -1 })
      .lean();
  }

  return {
    props: {
      products: JSON.parse(JSON.stringify(products || [])),
    },
  };
};
