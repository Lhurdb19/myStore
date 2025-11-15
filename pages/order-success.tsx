"use client";

import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function OrderSuccess() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md bg-white shadow-lg rounded-2xl p-8 text-center">
        <CheckCircle className="w-20 h-20 text-green-600 mx-auto" />

        <h1 className="text-3xl font-bold mt-4 text-gray-800">
          Order Successful 🎉
        </h1>

        <p className="text-gray-600 mt-2">
          Thank you for shopping with us! Your order has been received and is being processed.
        </p>

        <Link
          href="/"
          className="mt-6 block w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
