"use client";
import { useOrders } from "@/hooks/useOrders";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

export default function UserOrders() {
  const { orders, loading } = useOrders();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Your Orders</h1>
      {loading ? (
        <Skeleton className="h-6 w-full" />
      ) : orders.length === 0 ? (
        <p className="text-gray-500">You have no orders yet.</p>
      ) : (
        <ul className="space-y-4">
          {orders.map((o) => (
            <li key={o._id} className="border p-4 rounded-md flex justify-between items-center">
              <div>
                <p className="font-medium">{o.product.title}</p>
                <p className="text-sm text-gray-500">Quantity: {o.quantity}</p>
                <p className="text-sm text-gray-500">Status: {o.status}</p>
              </div>
              <Link href={`/product/${o.product.slug}`} className="text-blue-600 hover:underline">
                View Product
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
