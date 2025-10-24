"use client";

import Link from "next/link";

export default function SuspendedPage() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-900 text-white p-6">
      <div className="max-w-md text-center bg-gray-800 rounded-xl p-8 shadow-md">
        <h1 className="text-3xl font-bold mb-4">Account Suspended</h1>
        <p className="mb-6">
          Your account has been suspended. Please contact the administrator for more details.
        </p>
        <Link
          href="/auth/login"
          className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded font-medium transition"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
}
