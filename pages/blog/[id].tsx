"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function BlogDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [blog, setBlog] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    const fetchBlog = async () => {
      const res = await fetch(`/api/blogs/${id}`);
      const data = await res.json();
      setBlog(data);

      // Increment view count
      await fetch(`/api/blogs/${id}`, { method: "PATCH" });
    };
    fetchBlog();
  }, [id]);

  if (!blog) return <p className="text-center mt-10">Loading post...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <img src={blog.image} alt={blog.title} className="rounded-lg mb-4" />
      <h1 className="text-3xl font-bold mb-2">{blog.title}</h1>
      <p className="text-gray-500 text-sm mb-4">
        Posted by {blog.author} • {new Date(blog.createdAt).toLocaleDateString()}
      </p>
      <div
        className="prose"
        dangerouslySetInnerHTML={{ __html: blog.content }}
      />
    </div>
  );
}
