"use client";

// import Logo from "@/components/logo";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { toast } from "sonner";
import { useSettings } from "@/contexts/SettingsContext";

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const { settings } = useSettings();

  useEffect(() => {
    if (status === "authenticated") {
      const role = session?.user?.role;
      const otpVerified = session?.user?.otpVerified;
      const suspended = (session.user as any)?.suspended;

      // ✅ If suspended, redirect to suspended page
      if (suspended) {
        router.replace("/auth/suspended");
        return;
      }

      if (!otpVerified) {
        router.replace("/auth/verify-otp");
        return;
      }

      if (role === "superadmin") router.replace("/superadmin/dashboard");
      else if (role === "admin") router.replace("/admin/dashboard");
      else router.replace("/");
    }
  }, [status, session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setEmailError("");

    if (!form.email || !form.email.includes("@")) {
      setEmailError("Invalid email format. Please enter a valid email.");
      setLoading(false);
      return;
    }

    try {
      const checkRes = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });

      const data = await checkRes.json();
      if (!checkRes.ok) {
        setEmailError(data.message || "Email does not exist.");
        setLoading(false);
        return;
      }

      const res = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (!res?.ok) {
        toast.error(res?.error || "Invalid email or password.");
        setLoading(false);
        return;
      }

      router.replace(`/auth/verify-otp?email=${form.email}`);
    } catch (err) {
      console.error(err);
      setEmailError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen text-white">
        Checking session...
      </div>
    );
  }

  if (status === "authenticated") return null;

  return (
    <div className="fixed top-0 z-50 w-full h-screen flex flex-col lg:flex-row justify-center items-center gap-6 lg:gap-10 px-4 lg:px-[100px] bg-[rgba(0,0,0,1.0)]">
      <div className="hidden relative lg:block w-[850px] h-[600px] rounded-2xl overflow-hidden">
        <Image
          src="/store.jpg"
          alt="store"
          width={700}
          height={700}
          className="w-[850px] h-[600px] object-cover rounded-2xl"
        />
      </div>

      <div className="w-full lg:w-1/3 flex flex-col text-white">
        <div className="-mb-2 flex items-center justify-between">
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
          <Link href="/auth/register">
            <p className="text-[#196D1A] hover:text-[#fff] font-thin text-sm">
              Not Registered Yet? Signup.
            </p>
          </Link>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 w-full h-[550px] border border-[#196d1a] rounded-xl p-6 bg-gray-900"
        >
          <h2 className="text-2xl font-bold">Welcome Back</h2>

          <input
            type="email"
            name="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="Email"
            className={`w-full p-4 text-[#fff] border rounded focus:outline-none focus:ring-2 ${emailError ? "border-red-500 focus:ring-red-500" : "border-gray-500 focus:ring-[#196D1A]"
              }`}
            required
          />

          {emailError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
              {emailError} <span className="underline cursor-pointer text-blue-700">LEARN MORE</span>
            </div>
          )}

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full text-[#fff] border border-gray-500 px-3 py-4 rounded focus:outline-none focus:ring-2 focus:ring-[#196D1A] pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-300"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <Link href="/auth/forgot-password" className="font-light text-sm text-gray-300">
            Forget Password?
          </Link>

          <button
            type="submit"
            disabled={loading}
            className={`bg-[#196D1A] text-white py-4 rounded hover:bg-green-600 transition ${loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
