"use client";

import { useState } from "react";
import { useRouter } from "next/router";  // ✅ FIXED

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, children }: ModalProps) {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const toast = {
    error: (msg: string) => alert(msg),
  };

  const totalPrice = 0;
  const cart = { items: [] as any[] };

  const handleGoToPayment = () => {
    if (!form.name || !form.email || !form.phone || !form.address) {
      toast.error("Please fill all required fields");
      return;
    }

    router.push({
      pathname: "/payment",
      query: {
        shipping: JSON.stringify(form),
        total: totalPrice.toString(),
        items: JSON.stringify(
          cart.items.map((item: any) => ({
            productId: item.product._id,
            quantity: item.quantity,
          }))
        ),
      },
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-6 relative">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}
