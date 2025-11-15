"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { toast, Toaster } from "sonner";
import { useFlutterwave, closePaymentModal } from "flutterwave-react-v3";
import { useCart } from "@/hooks/useCart";

export default function PaymentPage() {
  const router = useRouter();
  const { clearCart } = useCart(); // ✅ properly typed clearCart
  const [selected, setSelected] = useState("");
  const [shipping, setShipping] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);

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

  // ✅ Paystack
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
        try {
          await clearCart.mutateAsync(); // ✅ Clear cart after payment
        } catch (err) {
          console.error("Failed to clear cart:", err);
        }
        setIsProcessing(false);
        router.push("/order-success");
      },
      onCancel: () => {
        toast.warning("Payment cancelled.");
        setIsProcessing(false);
      },
    });
  };

  // ✅ Flutterwave
  const flutterwaveConfig = {
    public_key: process.env.NEXT_PUBLIC_FLW_PUBLIC_KEY!,
    tx_ref: `tx-${Date.now()}`,
    amount: total,
    currency: "NGN",
    payment_options: "card,ussd,qr",
    customer: {
      email: shipping?.email,
      phone_number: shipping?.phone,
      name: shipping?.name,
    },
    customizations: {
      title: "ShopEase Checkout",
      description: "Order Payment",
      logo: "/store.jpg",
    },
  };
  const triggerFlutter = useFlutterwave(flutterwaveConfig);

  const handleFlutterwavePay = async () => {
    triggerFlutter({
      callback: async (response) => {
        if (response.status === "successful") {
          toast.success("Payment successful!");
          try {
            await clearCart.mutateAsync(); // ✅ Clear cart
          } catch (err) {
            console.error("Failed to clear cart:", err);
          }
          router.push("/order-success");
        }
        setIsProcessing(false);
        closePaymentModal();
      },
      onClose: () => {
        toast.warning("Payment closed.");
        setIsProcessing(false);
      },
    });
  };

  // ✅ COD
  const handleCOD = async () => {
    toast.success("Order placed successfully!");
    try {
      await clearCart.mutateAsync(); // ✅ Clear cart for COD too
    } catch (err) {
      console.error("Failed to clear cart:", err);
    }
    setIsProcessing(false);
    router.push("/order-success");
  };

  const handlePayment = () => {
    if (!selected) return toast.error("Select a payment method");
    if (!shipping) return toast.error("Shipping details not loaded yet");

    setIsProcessing(true);

    if (selected === "paystack") handlePaystackPayment();
    else if (selected === "flutterwave") handleFlutterwavePay();
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
