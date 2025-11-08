"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get("/api/categories");
        setCategories(data.categories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen px-4 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-8">
        Shop by Category
      </h1>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-4 shadow">
              <Skeleton className="h-10 w-3/4 mx-auto" />
            </Card>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <p className="text-center text-gray-500">No categories available.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {categories.map((category, idx) => (
            <Link key={idx} href={`/category/${category.toLowerCase()}`}>
              <Card className="p-6 cursor-pointer hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-center capitalize text-gray-700">
                    {category}
                  </CardTitle>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
