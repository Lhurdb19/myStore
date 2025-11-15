"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/hooks/useCart";

export default function ProductCard({ product }: { product: any }) {
  const { data: session } = useSession();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { isInCart, addToCart } = useCart();

  // Wishlist toggle
  const toggleWishlist = async () => {
    if (!session) {
      toast.info("Please log in to use wishlist ❤️");
      return (window.location.href = "/login");
    }

    const productId = product._id;

    if (isInWishlist(productId)) {
      await removeFromWishlist(productId);
    } else {
      await addToWishlist(product);
    }
  };

  // Add to Cart
  const handleAddToCart = async () => {
    try {
      await addToCart.mutateAsync({ productId: product._id, quantity: 1 });
      toast.success(`${product.title} added to your cart 🛒`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to add to cart");
    }
  };

  return (
    <div className="relative border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 bg-white">
      {/* ❤️ Wishlist Icon */}
      {session && (
        <button
          onClick={toggleWishlist}
          className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:scale-110 transition-transform z-10"
        >
          <Heart
            size={20}
            className={`transition-colors duration-200 ${
              isInWishlist(product._id) ? "text-red-500" : "text-gray-400"
            }`}
            fill={isInWishlist(product._id) ? "currentColor" : "none"}
          />
        </button>
      )}

      {/* Wrap Image + Info in Link */}
      <Link href={`/products/${product.slug}`} className="block cursor-pointer">
        <div>
          <Image
            src={product.images?.[0] || "/placeholder.png"}
            alt={product.title}
            width={400}
            height={400}
            className="w-full h-40 md:h-50 lg:h-56 xl:h-56 object-cover"
          />
          <div className="p-3">
            <h3 className="text-sm sm:text-base text-black font-semibold truncate">
              {product.title}
            </h3>
            <p className="text-gray-700 text-sm sm:text-base font-medium mb-2">
              ₦{product.price.toLocaleString()}
            </p>
          </div>
        </div>
      </Link>

      {/* Add to Cart Button */}
      <div className="p-3 pt-0">
        <button
          onClick={handleAddToCart}
          className={`w-full text-center py-1 md:py-2 lg:py-2 xl:py-2 rounded-md text-white transition ${
            isInCart(product._id)
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-blue-700"
          }`}
          disabled={isInCart(product._id)}
        >
          {isInCart(product._id) ? "In Cart" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
