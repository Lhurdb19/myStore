"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface WishlistItem {
  product: {
    _id: string;
  };
}

export function useWishlist() {
  const { data: session, status } = useSession();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchWishlist() {
    try {
      const res = await fetch("/api/user/wishlist");
      if (res.status === 401) return setWishlist([]); // not logged in
      const data = await res.json();
      if (data.success) setWishlist(data.wishlist);
    } catch (error) {
      console.error("Failed to fetch wishlist:", error);
    } finally {
      setLoading(false);
    }
  }

  async function removeFromWishlist(productId: string) {
    try {
      await fetch("/api/user/wishlist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      setWishlist((prev) => prev.filter((w) => w.product._id !== productId));
    } catch (error) {
      console.error("Error removing from wishlist:", error);
    }
  }

  useEffect(() => {
    if (status === "authenticated") {
      fetchWishlist();
    } else if (status === "unauthenticated") {
      setLoading(false);
      setWishlist([]);
    }
  }, [status]);

  return { wishlist, loading, session, removeFromWishlist };
}
