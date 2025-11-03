"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AllBlogsPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      const res = await fetch("/api/blogs");
      const data = await res.json();
      setBlogs(data);
      setFiltered(data);
      setLoading(false);
    };
    fetchBlogs();
  }, []);

  const handleFilter = (value: string) => {
    setCategory(value);
    if (value === "All") setFiltered(blogs);
    else setFiltered(blogs.filter((b) => b.category === value));
  };

  if (loading) return <p className="text-center mt-10">Loading blogs...</p>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">📰 All Blog Posts</h1>

      <div className="flex justify-center mb-6">
        <select
          value={category}
          onChange={(e) => handleFilter(e.target.value)}
          className="border px-4 py-2 rounded"
        >
          <option value="All">All Categories</option>
          <option value="News">News</option>
          <option value="Tips">Tips</option>
          <option value="Announcements">Announcements</option>
          <option value="Tutorials">Tutorials</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {filtered.map((blog) => (
          <div key={blog._id} className="border rounded-lg shadow p-4 bg-white">
            <img src={blog.image} alt={blog.title} className="rounded-lg mb-3" />
            <p className="text-sm text-gray-500">{blog.category}</p>
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
