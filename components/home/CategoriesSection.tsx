import Link from "next/link";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

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
}

export default function CategorySection({ title, slug, products, loading }: Props) {
  return (
    <section className="mb-10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl sm:text-2xl font-bold">{title}</h2>
        <Link href={`/products?category=${slug}`} className="text-blue-600 hover:underline">
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
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {products?.map((product) => (
            <Link href={`/products/${product.slug}`} key={product._id}>
              <div className="border rounded-lg overflow-hidden hover:shadow-md transition-all">
                <Image
                  src={product.images?.[0] || "/placeholder.png"}
                  alt={product.title}
                  width={300}
                  height={200}
                  className="w-full h-[180px] object-cover"
                />
                <div className="p-3">
                  <h3 className="text-sm font-medium truncate">{product.title}</h3>
                  <p className="text-blue-600 font-semibold mt-1">
                    ₦{product.price.toLocaleString()}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
