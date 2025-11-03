"use client";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import useProduct from "@/hooks/useProduct";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { Toaster, toast } from "sonner";
import Image from "next/image";

export default function ProductPage() {
  const router = useRouter();
  const { slug } = router.query;
  const { product, loading } = useProduct(slug);
  const [mainImage, setMainImage] = useState<string | null>(null);

  useEffect(() => {
    if (product && product.images && product.images.length > 0) {
      setMainImage(product.images[0]);
    }
  }, [product]);

  if (loading) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (!product) {
    return <p className="p-6 text-red-500">Product not found.</p>;
  }

  const handleAddToCart = () => {
    if (product.stock <= 0) {
      toast.error("This product is currently out of stock.");
    } else {
      toast.success(`${product.title} added to cart!`);
    }
  };

  return (
    <div className="bg-white min-h-screen p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto">
      <Toaster position="top-center" richColors />

      {/* Back Button */}
      <button
        onClick={() => router.push("/products")}
        className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors text-sm sm:text-base font-medium mb-6"
      >
        <ArrowLeft size={18} />
        Back to Products
      </button>

      {/* Main Product Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        {/* Left: Image Gallery */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="w-full h-80 sm:h-96 lg:h-[420px] overflow-hidden rounded-xl shadow-md">
            <Image width={800} height={800}
              src={mainImage || "/placeholder.png"}
              alt={product.title}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>

          {/* Small Thumbnails */}
          <div className="grid grid-cols-3 sm:grid-cols-7 gap-0">
            {product.images?.map((img: string, idx: number) => (
              <div
                key={idx}
                onClick={() => setMainImage(img)}
                className={`w-20 h-10 sm:h-10 lg:h-18 overflow-hidden rounded-lg shadow-md cursor-pointer border-2 transition-all duration-300 ${
                  mainImage === img ? "border-blue-600" : "border-transparent"
                }`}
              >
                <Image width={200} height={200}
                  src={img}
                  alt={`${product.title} ${idx + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right: Product Details */}
        <div className="flex flex-col justify-center space-y-5">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {product.title}
          </h1>

          <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
            {product.description}
          </p>

          <div className="space-y-2">
            <p className="text-2xl font-semibold text-blue-600">
              ₦{product.price.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">
              Stock:{" "}
              <span
                className={
                  product.stock > 0 ? "text-green-600" : "text-red-600"
                }
              >
                {product.stock > 0
                  ? `${product.stock} available`
                  : "Out of stock"}
              </span>
            </p>
            <p className="text-sm text-gray-500">
              Seller: {product.createdBy.name || product.createdBy.email}
            </p>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className={`mt-4 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
              product.stock > 0
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-300 text-gray-600 cursor-not-allowed"
            }`}
          >
            {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
          </button>
        </div>
      </div>
    </div>
  );
}
