import Link from "next/link";
import Image from "next/image";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface ProductCardProps {
  title: string;
  price: number;
  image: string;
  slug: string;
}

export default function ProductCard({ title, price, image, slug }: ProductCardProps) {
  return (
    <Link href={`/products/${slug}`}>
      <Card className="hover:shadow-lg transition-all cursor-pointer">
        <CardHeader>
          <Image
            src={image || "/placeholder.png"}
            alt={title}
            width={400}
            height={300}
            className="w-full h-48 object-cover rounded-lg"
          />
          <CardTitle className="mt-2 text-lg font-medium truncate">{title}</CardTitle>
        </CardHeader>
        <CardFooter className="flex justify-between items-center">
          <span className="font-semibold text-gray-800">₦{price.toLocaleString()}</span>
          <button className="text-sm bg-black text-white px-3 py-1 rounded-lg hover:bg-gray-800">
            View
          </button>
        </CardFooter>
      </Card>
    </Link>
  );
}
