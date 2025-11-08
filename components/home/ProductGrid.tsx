import ProductCard from "./ProductCard";

interface Product {
  _id: string;
  title: string;
  price: number;
  images: string[];
  slug: string;
}

interface ProductGridProps {
  products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  return (
    <section className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product._id}
          title={product.title}
          price={product.price}
          image={product.images?.[0] || "/placeholder.png"}
          slug={product.slug}
        />
      ))}
    </section>
  );
}