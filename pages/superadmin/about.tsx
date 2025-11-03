"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { NextPage } from "next";
import "react-quill-new/dist/quill.snow.css";

// ✅ Dynamically import ReactQuill with type safety
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

interface AboutSection {
  _id: string;
  title: string;
  content: string;
  imageUrl?: string;
  createdAt?: string;
}

const AdminAboutPage: NextPage = () => {
  const [abouts, setAbouts] = useState<AboutSection[]>([]);
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [image, setImage] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch all about sections
  const fetchAbouts = async () => {
    try {
      const res = await fetch("/api/about");
      if (!res.ok) throw new Error("Failed to fetch About content");
      const data = await res.json();
      setAbouts(data);
    } catch {
      toast.error("Error loading About content");
    }
  };

  useEffect(() => {
    fetchAbouts();
  }, []);

  // ✅ Convert image file to base64 for Cloudinary
  const toBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });

  // ✅ Save or update About section
  const handleSave = async () => {
    if (!title || !content) {
      toast.error("All fields are required");
      return;
    }

    if (title.trim() === "" || content.trim() === "") {
      toast.error("All fields are required");
      return;
    }

    setLoading(true);
    try {
      let imageUrl = "";

      if (image) {
        const base64 = await toBase64(image);
        const uploadRes = await fetch("/api/cloudinary-upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ base64 }),
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.message);
        imageUrl = uploadData.url;
      }

      const method = editingId ? "PUT" : "POST";
      const body = editingId
        ? { id: editingId, title, content, imageUrl }
        : { title, content, imageUrl };

      const res = await fetch("/api/about", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Error saving About section");

      toast.success(editingId ? "Updated successfully!" : "Added successfully!");
      setTitle("");
      setContent("");
      setImage(null);
      setEditingId(null);
      fetchAbouts();
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Edit existing section
  const handleEdit = (item: AboutSection) => {
    setTitle(item.title || "");
    setContent(item.content || "");
    setEditingId(item._id);
  };

  // ✅ Delete section
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this section?")) return;
    try {
      const res = await fetch(`/api/about?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Deleted successfully");
      fetchAbouts();
    } catch {
      toast.error("Error deleting section");
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-5xl mx-auto">
        <CardHeader>
          <CardTitle>
            {editingId ? "Edit About Section" : "Add About Section"}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <Input
            placeholder="Section Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className="border rounded-md">
            <ReactQuill
              theme="snow"
              value={content}
              onChange={setContent}
              placeholder="Write about your company..."
            />
          </div>

          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
          />

          <Button onClick={handleSave} disabled={loading} className="w-full">
            {loading ? "Saving..." : editingId ? "Update Section" : "Add Section"}
          </Button>

          <div className="mt-10 space-y-4">
            <h2 className="text-lg font-semibold">All About Sections</h2>
            {abouts.length === 0 && (
              <p className="text-sm text-muted-foreground">No sections added yet.</p>
            )}

            {abouts.map((item) => (
              <Card key={item._id}>
                <CardContent className="p-4">
                  <h3 className="font-bold text-xl mb-2">{item.title}</h3>

                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="rounded-lg mb-3 w-full h-64 object-cover"
                    />
                  )}

                  <div
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: item.content }}
                  />

                  <div className="flex gap-3 mt-4">
                    <Button variant="secondary" onClick={() => handleEdit(item)}>
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDelete(item._id)}
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAboutPage;
