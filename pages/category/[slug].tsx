import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import CategoryHeader from "@/components/home/CategoryHeader";
import ProductGrid from "@/components/home/ProductGrid";
import { fetchProductsByCategory } from "@/lib/fetchProductsByCategory";

export default function CategoryPage() {
  const router = useRouter();
  const { slug } = router.query;

  const { data: products, isLoading, isError } = useQuery({
    queryKey: ["products", slug],
    queryFn: () => fetchProductsByCategory(slug as string),
    enabled: !!slug,
  });

  if (isLoading) return <p className="text-center py-20">Loading products...</p>;
  if (isError) return <p className="text-center py-20">Error fetching products.</p>;

  return (
    <div className="container mx-auto px-4 py-10">
      <CategoryHeader
        title={`Category: ${slug}`}
        description="Browse through our collection of carefully selected items"
      />

      {products?.length ? (
        <ProductGrid products={products} />
      ) : (
        <p className="text-center text-gray-500 py-10">No products found in this category.</p>
      )}
    </div>
  );
}
