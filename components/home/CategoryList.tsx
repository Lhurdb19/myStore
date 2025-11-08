import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { fetchCategories } from "@/lib/fetchCategories";

export default function CategoryList() {
  const { data: categories, isLoading, isError } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  if (isLoading) return <p>Loading categories...</p>;
  if (isError) return <p>Error loading categories.</p>;

  return (
    <ul className="space-y-2">
      {categories.map((cat: string) => (
        <li key={cat}>
          <Link href={`/category/${cat}`}>
            <a className="block px-4 py-2 hover:bg-gray-100 rounded-lg">{cat}</a>
          </Link>
        </li>
      ))}
    </ul>
  );
}
