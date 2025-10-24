"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Logo from "@/components/logo";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || "Reset link sent to your email.");
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
          <Logo />
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
          <h2 className="text-2xl font-bold">Forgot Password</h2>
          <p className="text-gray-400 text-sm mb-2">
            Enter your registered email address. We’ll send you a reset link.
          </p>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full text-[#fff] border border-gray-500 px-3 py-4 rounded focus:outline-none focus:ring-2 focus:ring-[#196D1A]"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className={`bg-[#196D1A] text-white py-4 rounded hover:bg-green-600 transition ${loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>

          {message && <p className="text-green-500 text-sm text-center">{message}</p>}
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        </form>
      </div>
    </div>
  );
}
