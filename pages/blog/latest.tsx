"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function LatestBlogsPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatest = async () => {
      const res = await fetch("/api/blogs");
      const data = await res.json();
      const sorted = data.sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setBlogs(sorted);
      setLoading(false);
    };
    fetchLatest();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading latest blogs...</p>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">🕒 Latest Posts</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {blogs.map((blog) => (
          <div key={blog._id} className="border rounded-lg shadow p-4 bg-white">
            <img src={blog.image} alt={blog.title} className="rounded-lg mb-3" />
            <h2 className="text-xl font-semibold">{blog.title}</h2>
            <p className="text-gray-600 line-clamp-3">{blog.content}</p>
            <Link
              href={`/blog/${blog._id}`}
              className="text-blue-600 mt-2 inline-block hover:underline"
            >
              Read More →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
