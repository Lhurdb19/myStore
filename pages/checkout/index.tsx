"use client";

import { useState } from "react";
import { useCart } from "@/hooks/useCart";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router"
import Image from "next/image";
import { toast, Toaster } from "sonner";

export default function CheckoutPage() {
  const { data: cart, isLoading, removeFromCart, updateCart, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
  });

  if (isLoading) return <p className="text-center py-10">Loading cart...</p>;
  if (!cart || !cart.items?.length) return <p className="text-center py-10">Your cart is empty.</p>;

  if (status === "loading") return <p>Loading...</p>;
  if (!session) {
    router.push("/auth/login");
    return null;
  }

  const totalPrice = cart.items.reduce(
    (sum: number, item: any) => sum + (item.product?.price || 0) * item.quantity,
    0
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleGoToPayment = () => {
    // Validate shipping form
    if (!form.name || !form.email || !form.phone || !form.address) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Navigate to Payment page with query
    router.push({
      pathname: "/payment",
      query: {
        shipping: JSON.stringify(form),
        total: totalPrice.toString(),
        items: JSON.stringify(
          cart.items.map((i: any) => ({
            productId: i.product._id,
            quantity: i.quantity,
            price: i.product.price,
          }))
        ),
      },
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Toaster position="top-center" richColors />

      <h1 className="text-2xl sm:text-3xl font-bold mb-6">Checkout</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Cart Items */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Your Cart</h2>
          <div className="space-y-4">
            {cart.items.map((item: any) => {
              if (!item.product) return null;

              return (
                <div key={item.product._id} className="flex items-center gap-3 border-b pb-2">
                  <Image
                    src={item.product.images?.[0] || "/placeholder.png"}
                    alt={item.product.title}
                    width={60}
                    height={60}
                    className="rounded"
                  />
                  <div className="flex-1">
                    <p className="font-semibold">{item.product.title}</p>
                    <p className="text-gray-600 text-sm">
                      ₦{item.product.price?.toLocaleString()} x {item.quantity} = ₦
                      {(item.product.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() =>
                        updateCart.mutate({ productId: item.product._id, quantity: item.quantity - 1 })
                      }
                      disabled={item.quantity <= 1}
                      className="px-2 py-1 bg-red-400 rounded text-xs"
                    >
                      -
                    </button>
                    <span className="px-2 py-1 border rounded text-xs">{item.quantity}</span>
                    <button
                      onClick={() =>
                        updateCart.mutate({ productId: item.product._id, quantity: item.quantity + 1 })
                      }
                      className="px-2 py-1 bg-green-600 rounded text-xs"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeFromCart.mutate(item.product._id)}
                      className="text-red-500 hover:underline text-xs ml-2"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-4 font-semibold text-lg">Total: ₦{totalPrice.toLocaleString()}</p>
        </div>

        {/* Shipping Form */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
          <div className="space-y-4">
            <input type="text" name="name" value={form.name} onChange={handleInputChange} placeholder="Full Name" className="w-full border rounded px-3 py-2" />
            <input type="email" name="email" value={form.email} onChange={handleInputChange} placeholder="Email Address" className="w-full border rounded px-3 py-2" />
            <input type="tel" name="phone" value={form.phone} onChange={handleInputChange} placeholder="Phone Number" className="w-full border rounded px-3 py-2" />
            <input type="text" name="address" value={form.address} onChange={handleInputChange} placeholder="Address" className="w-full border rounded px-3 py-2" />
            <input type="text" name="city" value={form.city} onChange={handleInputChange} placeholder="City" className="w-full border rounded px-3 py-2" />
            <input type="text" name="postalCode" value={form.postalCode} onChange={handleInputChange} placeholder="Postal Code" className="w-full border rounded px-3 py-2" />

            <button
              onClick={handleGoToPayment}
              className="w-full bg-green-600 text-white p-2 rounded hover:bg-blue-700 transition"
            >
              Place Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
