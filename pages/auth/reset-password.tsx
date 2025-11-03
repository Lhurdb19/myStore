"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { useSettings } from "@/contexts/SettingsContext";

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { settings } = useSettings();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Password reset successful! Redirecting...");
        setTimeout(() => router.push("/auth/login"), 2000);
      } else {
        toast.error(data.message || "Something went wrong. Please try again.");
      }

    } catch (err) {
      console.error(err);
      setError("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen flex flex-col lg:flex-row justify-center items-center gap-6 lg:gap-10 px-4 lg:px-[100px] bg-[rgba(0,0,0,1.0)] fixed z-100">
      {/* Left Image */}
      <div className="hidden relative lg:block w-[850px] h-[600px] rounded-2xl overflow-hidden">
        <Image
          src="/store.jpg"
          alt="store"
          width={700}
          height={700}
          className="w-[850px] h-[600px] object-cover rounded-2xl"
        />
      </div>

      {/* Right Form */}
      <div className="w-full lg:w-1/3 flex flex-col text-white">
        <div className="mb-5 flex items-center justify-between">
          {/* ✅ Dynamic Logo */}
          <Link href="/" className="flex items-center gap-2">
            {settings?.logo ? (
              <Image
                src={settings.logo}
                alt={settings.siteName || "Logo"}
                width={200}
                height={200}
                className="rounded-md object-contain"
              />
            ) : (
              <span className="text-2xl font-extrabold text-gray-800 dark:text-white">
                <span className="text-green-600">Shop</span>Ease
              </span>
            )}
            {!settings?.logo && <span className="sr-only">{settings?.siteName || "ShopEase"}</span>}
          </Link>

          <Link href="/auth/login">
            <p className="text-[#196D1A] hover:text-[#fff] font-thin text-sm">
              Back to Login
            </p>
          </Link>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 w-full border border-[#196d1a] rounded-xl p-6 bg-gray-900"
        >
          <h2 className="text-2xl font-bold">Reset Password</h2>
          <p className="text-gray-400 text-sm mb-2">
            Enter your new password below to regain access.
          </p>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New Password"
            className="w-full text-[#fff] border border-gray-500 px-3 py-4 rounded focus:outline-none focus:ring-2 focus:ring-[#196D1A]"
            required
          />

          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm Password"
            className="w-full text-[#fff] border border-gray-500 px-3 py-4 rounded focus:outline-none focus:ring-2 focus:ring-[#196D1A]"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className={`bg-[#196D1A] text-white py-4 rounded hover:bg-green-600 transition ${loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>

          {message && <p className="text-green-500 text-sm text-center">{message}</p>}
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        </form>
      </div>
    </div>
  );
}
