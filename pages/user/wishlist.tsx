"use client";
import { useWishlist } from "@/hooks/useWishlist";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

export default function UserWishlist() {
  const { wishlist, loading } = useWishlist();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Your Wishlist</h1>
      {loading ? (
        <Skeleton className="h-6 w-full" />
      ) : wishlist.length === 0 ? (
        <p className="text-gray-500">Your wishlist is empty.</p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {wishlist.map((w) => (
            <li key={w._id} className="border p-4 rounded-md">
              <img src={w.product.images[0]} alt={w.product.title} className="w-full h-40 object-cover rounded" />
              <p className="font-medium mt-2">{w.product.title}</p>
              <p className="text-sm text-gray-500">${w.product.price}</p>
              <Link href={`/product/${w.product.slug}`} className="text-blue-600 hover:underline mt-2 inline-block">
                View Product
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
