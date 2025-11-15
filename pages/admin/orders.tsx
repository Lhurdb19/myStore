"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    axios.get("/api/order/all").then((res) => setOrders(res.data.orders));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">All Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order._id} className="p-4 border rounded-xl bg-gray-600 shadow-sm">
            <p className="font-semibold">{order.shipping.name}</p>
            <p>{order.shipping.email}</p>
            <p>Total: ₦{order.total}</p>
            <p>Payment: {order.paymentMethod}</p>
            <p>Status: {order.status}</p>
          </div>
        ))}

      </div>
    </div>
  );
}
