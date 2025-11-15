"use client";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import Image from "next/image";

export default function CartPage() {
  const { data: cart, isLoading, removeFromCart, updateCart } = useCart();

  if (isLoading) return <p className="text-center py-10">Loading cart...</p>;
  if (!cart || !cart.items?.length) return <p className="text-center py-10">Your cart is empty.</p>;

  const totalPrice = cart.items.reduce(
    (sum: number, item: any) => sum + (item.product?.price || 0) * item.quantity,
    0
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="space-y-6">
        {cart.items.map((item: any) => {
          if (!item.product) return null;

          return (
            <div
              key={item.product._id}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 lg:px-25 xl:px-25 py-10 max-w-8xl border-b pb-4"
            >
              {/* Product Image and Title */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Image
                  src={item.product.images?.[0] || "/placeholder.png"}
                  alt={item.product.title || "Product"}
                  width={60}
                  height={60}
                  className="rounded"
                />
                <div className="text-sm sm:text-base">
                  <h2 className="font-semibold truncate">{item.product.title}</h2>
                  <p className="text-gray-600 sm:hidden">
                    ₦{item.product.price?.toLocaleString() || 0} x {item.quantity} = ₦
                    {(item.product.price * item.quantity).toLocaleString() || 0}
                  </p>
                </div>
              </div>

              {/* Quantity and Remove Buttons */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-2 sm:mt-0">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      updateCart.mutate({ productId: item.product._id, quantity: item.quantity - 1 })
                    }
                    className="px-2 py-1 bg-red-400 rounded cursor-pointer text-xs sm:text-sm"
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <input
                    type="text"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      updateCart.mutate({ productId: item.product._id, quantity: Number(e.target.value) })
                    }
                    className="w-12 sm:w-16 border rounded text-center text-xs sm:text-sm"
                  />
                  <button
                    onClick={() =>
                      updateCart.mutate({ productId: item.product._id, quantity: item.quantity + 1 })
                    }
                    className="px-2 py-1 bg-green-600 rounded cursor-pointer text-xs sm:text-sm"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => removeFromCart.mutate(item.product._id)}
                  className="text-red-500 hover:underline text-xs sm:text-sm mt-1 sm:mt-0"
                >
                  Remove
                </button>
              </div>

              {/* Price for larger screens */}
              <p className="hidden sm:block text-gray-600 text-sm sm:text-base mt-2 sm:mt-0">
                ₦{item.product.price?.toLocaleString() || 0} x {item.quantity} = ₦
                {(item.product.price * item.quantity).toLocaleString() || 0}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-6 text-right font-semibold text-lg sm:text-xl">
        Total: ₦{totalPrice.toLocaleString()}
      </div>
      <Button>
        <a href="/checkout" className="w-full">Proceed to Checkout</a>
      </Button>
    </div>
  );
}
