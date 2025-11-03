"use client";
import { useState, useEffect } from "react";

export interface WishlistType {
  _id: string;
  product: {
    _id: string;
    title: string;
    slug: string;
    images: string[];
    price: number;
  };
}

export function useWishlist() {
  const [wishlist, setWishlist] = useState<WishlistType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWishlist() {
      try {
        setLoading(true);
        const res = await fetch("/api/user/wishlist");
        const data = await res.json();
        if (data.success) {
          setWishlist(data.wishlist);
        }
      } catch (error) {
        console.error("Failed to fetch wishlist:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchWishlist();
  }, []);

  return { wishlist, loading };
}
