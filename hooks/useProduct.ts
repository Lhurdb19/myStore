"use client";
import { useState, useEffect } from "react";
import axios from "axios";

export interface Product {
  _id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  createdBy: {
    _id: string;
    name?: string;
    email: string;
  };
}

export default function useProduct(slug?: string | string[]) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`/api/admin/products/${slug}`);
        setProduct(data.product);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  return { product, loading };
}
