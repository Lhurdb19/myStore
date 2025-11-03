import { useState, useEffect } from "react";
import axios from "axios";

export function useUserProducts() {
  const [orders, setOrders] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const ordersRes = await axios.get("/api/user/orders");
        const wishlistRes = await axios.get("/api/user/wishlist");

        setOrders(ordersRes.data.orders || []);
        setWishlist(wishlistRes.data.wishlist || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { orders, wishlist, loading };
}
