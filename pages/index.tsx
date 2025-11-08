"use client";

import { useEffect, useState } from "react";
import Hero from "@/components/home/hero";
import CategorySection from "@/components/home/CategoriesSection";

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [categoryProducts, setCategoryProducts] = useState<any>({});
  const [categories, setCategories] = useState<{ name: string; slug: string }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/categories");
      const data = await res.json();

      // Assume your API returns { categories: ["wears", "accessories", ...] }
      const categoryList = data.categories.map((cat: string) => ({
        name: cat,
        slug: cat.toLowerCase(),
      }));

      setCategories(categoryList);

      const results: any = {};
      for (const category of categoryList) {
        const res = await fetch(`/api/products?category=${category.slug}&limit=4`);
        const data = await res.json();
        results[category.slug] = data.products;
      }

      setCategoryProducts(results);
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div>
      <Hero />
      <div className="px-4 sm:px-8 lg:px-16 py-8">
        {categories.map((cat) => (
          <CategorySection
            key={cat.slug}
            title={cat.name}
            slug={cat.slug}
            products={categoryProducts[cat.slug]}
            loading={loading}
          />
        ))}
      </div>
    </div>
  );
}
