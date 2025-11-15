"use client";

import { useEffect, useState } from "react";
import Hero from "@/components/home/hero";
import CategorySection from "@/components/home/CategoriesSection";
import Testimonials from "@/components/home/Testimonials";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

export default function HomePage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [categoryProducts, setCategoryProducts] = useState<any>({});
  const [categories, setCategories] = useState<{ name: string; slug: string }[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]); // product IDs

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/categories");
      const data = await res.json();

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

  // Fetch user's wishlist
  useEffect(() => {
    if (!session?.user) return;

    const fetchWishlist = async () => {
      try {
        const res = await fetch("/api/user/wishlist");
        const data = await res.json();
        if (data.success) setWishlist(data.wishlist.map((w: any) => w.product._id));
      } catch (err) {
        console.error(err);
      }
    };

    fetchWishlist();
  }, [session]);

  const toggleWishlist = async (productId: string, title: string) => {
    if (!session?.user) {
      toast.error("Please login to manage wishlist");
      return;
    }

    try {
      const isInWishlist = wishlist.includes(productId);
      const res = await fetch("/api/user/wishlist", {
        method: isInWishlist ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();

      if (data.success) {
        setWishlist((prev) =>
          isInWishlist
            ? prev.filter((id) => id !== productId)
            : [...prev, productId]
        );
        toast.success(
          isInWishlist
            ? `${title} removed from wishlist ❤️`
            : `${title} added to wishlist ❤️`
        );
      } else {
        toast.error(data.message || "Failed to update wishlist");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update wishlist");
    }
  };

  return (
    <div>
      <Hero />
      <div className="px-6 lg:px-25 xl:px-25 py-10 max-w-8xl">
        {categories.map((cat) => (
          <CategorySection
            key={cat.slug}
            title={cat.name}
            slug={cat.slug}
            products={categoryProducts[cat.slug]}
            loading={loading}
            wishlist={wishlist}
            toggleWishlist={toggleWishlist}
          />
        ))}
      </div>
      <Testimonials />
    </div>
  );
}
