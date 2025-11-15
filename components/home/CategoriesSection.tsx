import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import ProductCard from "@/components/home/ProductCard";

interface Product {
  _id: string;
  title: string;
  price: number;
  images: string[];
  slug: string;
}

interface Props {
  title: string;
  slug: string;
  products?: Product[];
  loading: boolean;
  wishlist: string[];
  toggleWishlist: (productId: string, title: string) => Promise<void>;
}

export default function CategorySection({ title, slug, products, loading }: Props) {
  return (
    <section className="mb-10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl sm:text-2xl font-bold">{title}</h2>
        <Link href={`/category/${slug}`} className="text-blue-600 hover:underline">
          View All →
        </Link>
      </div>

      {loading ? (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="w-full h-[200px] rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 lg:gap-10 xl:gap-10 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {products?.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
