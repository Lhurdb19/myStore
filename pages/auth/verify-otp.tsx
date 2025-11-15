"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSession, signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";
import { toast } from "sonner";

export default function VerifyOTPPage() {
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(15);

  useEffect(() => {
    if (!router.isReady || status === "loading") return;
    const queryEmail = router.query.email;
    if (typeof queryEmail === "string") setEmail(queryEmail);
    else if (session?.user?.email) setEmail(session.user.email);
  }, [router.isReady, status, session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error("Email not found. Please log in again.");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otpCode: otp }),
      });
      const data = await res.json();

      if (!res.ok && data.message !== "Your account is already verified. You can now log in.") {
        toast.error(data.message || "Invalid or expired OTP.");
        return;
      }

      toast.success(data.message || "OTP verified successfully!");
      await signIn("credentials", { email, otpLogin: "true", redirect: false });
      await updateSession?.();
      localStorage.setItem("otpVerified", "true");

      const role = data.user?.role || session?.user?.role;
      if (role === "superadmin") router.replace("/superadmin/dashboard");
      else if (role === "admin") router.replace("/admin/dashboard");
      else if (role === "vendor") router.replace("/vendor/dashboard");
      else router.replace("/");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleResend = async () => {
    if (!email) return toast.error("Email not found.");
    setResending(true);
    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) toast.error(data.message || "Failed to resend OTP.");
      else {
        toast.success("OTP resent successfully. Check your email.");
        setCountdown(30); // reset countdown
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong while resending OTP.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-50 dark:bg-background z-50">
      <div className="bg-white dark:bg-card rounded-2xl shadow-lg p-8 w-full max-w-md text-center mx-4">
        <h1 className="text-2xl font-semibold mb-4">Verify Your OTP</h1>
        <p className="text-sm text-gray-500 mb-6">
          Enter the 6-digit code sent to <span className="font-medium">{email || "your email"}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={setOtp}
            containerClassName="justify-center"
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Verifying..." : "Verify OTP"}
          </Button>
        </form>

        <div className="mt-4 text-sm text-gray-500">
          Didn't receive the code?{" "}
          <button
            type="button"
            className="text-green-600 hover:underline"
            onClick={handleResend}
            disabled={resending || countdown > 0}
          >
            {resending
              ? "Resending..."
              : countdown > 0
                ? `Resend in ${countdown}s`
                : "Resend OTP"}
          </button>
        </div>
      </div>
    </div>
  );
}
