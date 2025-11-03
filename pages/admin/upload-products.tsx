"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { X } from "lucide-react";

export default function UploadProduct() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [form, setForm] = useState({ title: "", description: "", price: "", stock: "" });
  const [imagesBase64, setImagesBase64] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Redirect if not authorized
  useEffect(() => {
    if (status === "loading") return;
    if (!session || !["admin", "superadmin"].includes((session.user as any)?.role)) {
      toast.error("You are not authorized to access this page.");
      router.push("/auth/login");
    }
  }, [session, status, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const promises = Array.from(files).map(
      (file) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        })
    );

    Promise.all(promises)
      .then((res) => setImagesBase64((prev) => [...prev, ...res]))
      .catch(() => toast.error("Failed to read selected files."));
  };

  const removeImage = (index: number) => setImagesBase64((prev) => prev.filter((_, i) => i !== index));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagesBase64.length) return toast.error("Please select at least 1 image.");
    if (!session) return toast.error("Session expired. Please log in again.");

    setLoading(true);
    try {
      const res = await axios.post("/api/admin/products/create", {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        imagesBase64,
      });

      toast.success("Product uploaded successfully!");
      setForm({ title: "", description: "", price: "", stock: "" });
      setImagesBase64([]);
    } catch (err: any) {
      console.error("Upload error:", err);
      const msg = err?.response?.data?.message || "Error uploading product.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") return <p className="p-6">Loading session...</p>;

  return (
    <div className="p-6">
      <Card className="max-w-7xl mx-auto">
        <CardHeader>
          <CardTitle>Upload New Product</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 w-full">
            <Input name="title" placeholder="Product Title" value={form.title} onChange={handleChange} required />
            <Textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} />
            <Input type="number" name="price" placeholder="Price" value={form.price} onChange={handleChange} required />
            <Input type="number" name="stock" placeholder="Stock quantity" value={form.stock} onChange={handleChange} />

            <Input type="file" multiple accept="image/*" onChange={handleImageChange} required />

            {imagesBase64.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {imagesBase64.map((img, idx) => (
                  <div key={idx} className="relative">
                    <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-24 object-cover rounded border" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-700"
                      title="Remove image"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <Button type="submit" disabled={loading || status !== "authenticated"}>
              {loading ? "Uploading..." : "Upload Product"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
