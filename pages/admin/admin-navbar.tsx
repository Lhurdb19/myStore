import { signOut } from "next-auth/react";

export default function AdminNavbar() {
  return (
    <header className="w-full bg-gray-800 text-white p-4 flex justify-between items-center">
      <h2 className="text-xl font-semibold">Admin Dashboard</h2>
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="bg-red-500 px-3 py-1 rounded-md hover:bg-red-600"
      >
        Logout
      </button>
    </header>
  );
}
