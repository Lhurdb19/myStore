"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "sonner";

export default function VerifyEmailPage() {
  const router = useRouter();
  const { token, email } = router.query;

  const [statusMessage, setStatusMessage] = useState("Verifying your email...");
  const [progress, setProgress] = useState(0);
  const [redirectPath, setRedirectPath] = useState("/auth/login");
  const [countdown, setCountdown] = useState(3);

  const getProgressColor = (progress: number) => {
    if (progress < 50) return "#16a34a"; // green
    if (progress < 80) return "#eab308"; // yellow
    return "#dc2626"; // red
  };

  useEffect(() => {
    if (!token || !email) return;

    const verifyEmail = async () => {
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, token }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          setStatusMessage(data.message || "Email verification failed");
          toast.error(data.message || "Email verification failed");
          setRedirectPath("/auth/register");
        } else {
          setStatusMessage(data.alreadyVerified ? "Email already verified!" : "Email verified successfully!");
          toast.success(data.message);
          setRedirectPath("/auth/login");
        }

        let step = 0;
        const totalSteps = 30;
        const interval = setInterval(() => {
          step += 1;
          const currentProgress = (step / totalSteps) * 100;
          setProgress(currentProgress);

          if (step % 10 === 0) setCountdown((prev) => prev - 1);

          if (step >= totalSteps) {
            clearInterval(interval);
            router.replace(redirectPath);
          }
        }, 100);
      } catch (error) {
        console.error("Verify email error:", error);
        setStatusMessage("Something went wrong. Please try again.");
        toast.error("Something went wrong. Please try again.");
        setRedirectPath("/auth/register");
        setTimeout(() => router.replace("/auth/register"), 3000);
      }
    };

    verifyEmail();
  }, [token, email, router]);

  // Inside the component
  const handleResend = async () => {
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || "Failed to resend verification email");
        return;
      }
      toast.success(data.message);
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    }
  };


  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="bg-white shadow rounded p-6 sm:p-8 md:p-10 lg:p-12 xl:p-16 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl text-center">
        <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-semibold">{statusMessage}</h2>
        <p className="mt-2 text-xs sm:text-sm md:text-base lg:text-lg text-gray-600">
          Redirecting in {countdown} second{countdown > 1 ? "s" : ""}...
        </p>

        {/* Progress Bar */}
        <div className="mt-4 w-full h-2 sm:h-3 md:h-3 lg:h-4 xl:h-5 bg-gray-200 rounded">
          <div
            className="h-2 sm:h-3 md:h-3 lg:h-4 xl:h-5 rounded"
            style={{
              width: `${progress}%`,
              transition: "width 0.1s linear",
              backgroundColor: getProgressColor(progress),
            }}
          ></div>
        </div>

      <div className="mt-6">
        <p className="text-sm text-gray-500 mb-2">
          Didn't receive the email?
        </p>
        <button
          onClick={handleResend}
          className="bg-[#196D1A] cursor-pointer text-white px-4 py-2 rounded hover:bg-green-600 transition"
          >
          Resend Verification Email
        </button>
          </div>
      </div>
    </div>
  );
}
