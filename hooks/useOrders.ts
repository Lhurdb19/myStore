"use client";
import { useState, useEffect } from "react";

export interface OrderType {
  _id: string;
  product: {
    _id: string;
    title: string;
    slug: string;
    images: string[];
    price: number;
  };
  quantity: number;
  status: string;
  createdAt: string;
}

export function useOrders() {
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true);
        const res = await fetch("/api/user/orders");
        const data = await res.json();
        if (data.success) {
          setOrders(data.orders);
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  return { orders, loading };
}
