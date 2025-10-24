"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface IPaymentMethod {
  _id: string;
  name: string;
  provider: string;
  publicKey: string;
  secretKey: string;
  active: boolean;
}

export default function PaymentCheckout() {
  const [methods, setMethods] = useState<IPaymentMethod[]>([]);
  const [selected, setSelected] = useState<IPaymentMethod | null>(null);
  const [amount, setAmount] = useState(1000); // Example amount (₦1,000)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveMethods();
  }, []);

  const fetchActiveMethods = async () => {
    try {
      const res = await fetch("/api/admins/payment-methods");
      const data = await res.json();
      const active = (data.methods || []).filter((m: IPaymentMethod) => m.active);
      setMethods(active);
    } catch {
      toast.error("Failed to load payment methods");
    } finally {
      setLoading(false);
    }
  };

  const handlePay = () => {
    if (!selected) {
      toast.error("Please select a payment method");
      return;
    }

    switch (selected.provider) {
      case "paystack":
        payWithPaystack(selected);
        break;
      case "flutterwave":
        payWithFlutterwave(selected);
        break;
      case "stripe":
        payWithStripe(selected);
        break;
      default:
        toast.error("Unsupported payment method");
    }
  };

  const payWithPaystack = (method: IPaymentMethod) => {
    const handler = (window as any).PaystackPop.setup({
      key: method.publicKey,
      email: "user@example.com",
      amount: amount * 100, // kobo
      currency: "NGN",
      ref: "ref-" + Date.now(),
      callback: function (response: any) {
        toast.success("Payment successful: " + response.reference);
      },
      onClose: function () {
        toast.error("Payment window closed");
      },
    });
    handler.openIframe();
  };

  const payWithFlutterwave = (method: IPaymentMethod) => {
    (window as any).FlutterwaveCheckout({
      public_key: method.publicKey,
      tx_ref: "tx-" + Date.now(),
      amount,
      currency: "NGN",
      payment_options: "card, banktransfer, ussd",
      customer: { email: "user@example.com", name: "John Doe" },
      callback: function (data: any) {
        toast.success("Payment successful: " + data.tx_ref);
      },
      onclose: function () {
        toast.error("Payment closed");
      },
    });
  };

  const payWithStripe = (method: IPaymentMethod) => {
    toast.info("Stripe checkout will redirect...");
    // Example: redirect to Stripe checkout page
    // window.location.href = "/stripe-checkout?amount=" + amount;
  };

  if (loading) return <p>Loading payment methods...</p>;

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <h2 className="text-xl font-bold text-center">Choose a Payment Method</h2>

      <div className="grid gap-3">
        {methods.length > 0 ? (
          methods.map((m) => (
            <Button
              key={m._id}
              variant={selected?._id === m._id ? "default" : "outline"}
              onClick={() => setSelected(m)}
              className="w-full"
            >
              {m.name}
            </Button>
          ))
        ) : (
          <p className="text-center text-gray-500">No active methods available.</p>
        )}
      </div>

      <div className="text-center">
        <Button onClick={handlePay} className="w-full bg-blue-600 text-white hover:bg-blue-700">
          Pay ₦{amount.toLocaleString()}
        </Button>
      </div>
    </div>
  );
}
