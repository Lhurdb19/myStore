"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { GetServerSideProps } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster, toast } from "sonner";

export default function ProductsPage({ products }: any) {
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState(products);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const filtered = products.filter((p: any) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchQuery, products]);

  const handleAddToCart = (product: any) => {
    if (product.stock <= 0) {
      toast.error("This product is currently out of stock.");
    } else {
      toast.success(`${product.title} added to cart!`);
    }
  };

  return (
    <div className="bg-white min-h-screen px-3 sm:px-6 lg:px-10 py-8">
      <Toaster position="top-center" richColors />

      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center sm:text-left">
          Available Products
        </h1>

        <input
          type="text"
          placeholder="Search for products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-1/2 lg:w-1/3 border border-gray-300 focus:ring-2 focus:ring-blue-500 rounded-lg py-2 px-4 text-sm sm:text-base"
        />
      </div>

      {loading ? (
        // Skeleton Loading
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <Card
              key={i}
              className="rounded-xl border border-gray-100 overflow-hidden"
            >
              <Skeleton className="w-full h-[140px] sm:h-[200px] md:h-[240px] lg:h-[250px]" />
              <CardContent className="p-3 space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-full rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <p className="text-gray-500 text-center">No products found.</p>
      ) : (
        // Product Grid
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5">
          {filteredProducts.map((p: any) => (
            <Card
              key={p._id}
              className="flex flex-col hover:shadow-lg transition-all duration-300 rounded-xl border border-gray-200 overflow-hidden group pt-0 pb-2 gap-1"
            >
              {/* Product Image */}
              <CardHeader className="p-0 m-0">
                <Link href={`/products/${p.slug}`}>
                  <div className="relative w-full h-[130px] sm:h-[200px] md:h-[240px] lg:h-[250px] overflow-hidden">
                    <Image
                      width={600}
                      height={600}
                      src={p.images?.[0] || "/placeholder.png"}
                      alt={p.title}
                      className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                </Link>
              </CardHeader>

              {/* Product Content */}
              <CardContent className="flex flex-col justify-between px-2 sm:px-3 pt-0 pb-2 sm:pb-3 gap-1 sm:gap-2">
                <div>
                  <CardTitle className="text-[12px] lg:text-lg sm:text-base font-semibold text-gray-800 group-hover:text-blue-600 line-clamp-1">
                    {p.title}
                  </CardTitle>

                  <div className="flex items-center mt-0.5 sm:mt-1 justify-between">
                    <p className="font-semibold text-black text-[10px] lg:text-sm sm:text-base">
                      ₦{p.price.toLocaleString()}
                    </p>
                    <span
                      className={`text-[8px] sm:text-xs px-2 py-0.5 rounded-full ${
                        p.stock > 0
                          ? "bg-green-50 text-green-500"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      {p.stock > 0 ? "In Stock" : "Out of Stock"}
                    </span>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={() => handleAddToCart(p)}
                  disabled={p.stock <= 0}
                  className={`mt-2 w-full py-1 lg:py-2 rounded-md font-medium text-[10px] lg:text-sm transition-all duration-300 ${
                    p.stock > 0
                      ? "bg-green-500 text-white hover:bg-blue-700"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {p.stock > 0 ? "Add to Cart" : "Out of Stock"}
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  await connectDB();
  const q = context.query.search ? String(context.query.search).trim() : "";
  let products;

  if (!q) {
    // no search -> return all active products
    products = await Product.find({ active: true }).sort({ createdAt: -1 }).lean();
  } else {
    // try slug-first (normalize search -> slug form)
    const slugCandidate = q.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
    products = await Product.find({
      active: true,
      $or: [
        { slug: slugCandidate }, // exact slug match
        { title: { $regex: q, $options: "i" } }, // case-insensitive title partial match
        { "title": q } // exact title match as fallback
      ],
    })
      .sort({ createdAt: -1 })
      .lean();
  }

  return {
    props: {
      products: JSON.parse(JSON.stringify(products || [])),
    },
  };
};
