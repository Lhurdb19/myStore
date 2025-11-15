"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { toast, Toaster } from "sonner";
import { useCart } from "@/hooks/useCart";

export default function PaymentPage() {
  const router = useRouter();
  const { clearCart } = useCart();

  const [selected, setSelected] = useState("");
  const [shipping, setShipping] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load Flutterwave script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.flutterwave.com/v3.js";
    document.body.appendChild(script);
  }, []);

  // Load query params
  useEffect(() => {
    if (!router.isReady) return;

    const { shipping, items, total } = router.query;

    if (shipping && items && total) {
      try {
        setShipping(JSON.parse(shipping as string));
        setItems(JSON.parse(items as string));
        setTotal(Number(total));
      } catch (err) {
        console.error("Parsing error:", err);
        toast.error("Failed to load payment details");
      }
    }
  }, [router.isReady]);

  const paymentMethods = [
    { id: "paystack", label: "Paystack" },
    { id: "flutterwave", label: "Flutterwave" },
    { id: "cod", label: "Cash on Delivery" },
  ];

  // PAYSTACK
  const handlePaystackPayment = async () => {
    if (!shipping) return toast.error("Shipping details missing");

    const PaystackPop = (await import("@paystack/inline-js")).default;
    const paystack = new PaystackPop();

    paystack.newTransaction({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
      email: shipping.email,
      amount: total * 100,
      currency: "NGN",
      onSuccess: async () => {
        toast.success("Payment successful!");
        await clearCart.mutateAsync();
        setIsProcessing(false);
        router.push("/order-success");
      },
      onCancel: () => {
        toast.warning("Payment cancelled.");
        setIsProcessing(false);
      },
    });
  };

  // FLUTTERWAVE
  const payWithFlutterwave = () => {
    if (!shipping) return;

    // @ts-ignore
    window.FlutterwaveCheckout({
      public_key: process.env.NEXT_PUBLIC_FLW_PUBLIC_KEY!,
      tx_ref: `tx-${Date.now()}`,
      amount: total,
      currency: "NGN",
      payment_options: "card, ussd, banktransfer",
      customer: {
        email: shipping.email,
        phone_number: shipping.phone,
        name: shipping.name,
      },
      callback: async function (response: any) {
        if (response.status === "successful") {
          await clearCart.mutateAsync();
          router.push("/order-success");
        }
      },
      onclose: () => toast.error("Payment closed."),
    });
  };

  // COD
  const handleCOD = async () => {
    toast.success("Order placed successfully!");
    await clearCart.mutateAsync();
    setIsProcessing(false);
    router.push("/order-success");
  };

  const handlePayment = () => {
    if (!selected) return toast.error("Select a payment method");

    setIsProcessing(true);

    if (selected === "paystack") handlePaystackPayment();
    else if (selected === "flutterwave") payWithFlutterwave();
    else handleCOD();
  };

  if (!shipping) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <p className="text-gray-600">Loading payment details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 rounded-2xl shadow-md border bg-white">
      <Toaster richColors />
      <h1 className="text-2xl font-bold mb-4 text-center">Select Payment Method</h1>

      <div className="space-y-3">
        {paymentMethods.map((method) => (
          <label
            key={method.id}
            className={`flex items-center text-black p-3 border rounded-xl cursor-pointer hover:bg-gray-100 ${
              selected === method.id ? "border-blue-600" : ""
            }`}
          >
            <input
              type="radio"
              checked={selected === method.id}
              onChange={() => setSelected(method.id)}
              className="mr-3"
            />
            <span>{method.label}</span>
          </label>
        ))}
      </div>

      <button
        onClick={handlePayment}
        disabled={isProcessing}
        className="w-full mt-6 py-3 bg-blue-600 text-white rounded-xl"
      >
        {isProcessing ? "Processing..." : "Continue"}
      </button>
    </div>
  );
}
