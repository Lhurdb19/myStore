"use client";
import { useEffect, useState } from "react";

interface PaymentMethod {
  _id: string;
  name: string;
  provider: string;
  active: boolean;
}

export default function AdminPaymentMethods() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);

  useEffect(() => {
    fetch("/api/admin/payment-methods")
      .then(res => res.json())
      .then(data => setMethods(data.methods?.filter((m: PaymentMethod) => m.active) || []))
      .catch(console.error);
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Available Payment Methods</h2>
      <ul className="space-y-3">
        {methods.map(m => (
          <li key={m._id} className="p-4 border rounded-md">
            <p className="font-semibold">{m.name}</p>
            <p className="text-sm text-gray-500">{m.provider}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
