import Link from "next/link";

export default function Unauthorized() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-red-50">
      <h1 className="text-3xl font-bold text-red-600 mb-4">Access Denied 🚫</h1>
      <p className="text-gray-700">You don’t have permission to view this page.</p>
      <Link
        href="/"
        className="mt-6 px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
      >
        Go to Login
      </Link>
    </div>
  );
}
