"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";

export default function FeaturedProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios("https://fakestoreapi.com/products?limit=4")
      .then((res) => {
        setProducts(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="px-8 py-16 bg-white">
      <h2 className="text-3xl font-bold mb-6">🔥 Featured Products</h2>

      {loading ? (
        <p>Loading products...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="bg-gray-50 shadow rounded-lg p-4 hover:shadow-md transition"
            >
              <Image
                src={product.image}
                alt={product.title}
                width={200}
                height={200}
                className="object-contain mx-auto"
              />
              <h3 className="mt-4 text-lg font-medium">{product.title}</h3>
              <p className="text-blue-600 font-semibold mt-2">${product.price}</p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
