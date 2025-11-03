"use client";

import { useEffect, useState } from "react";
import { toast, Toaster } from "sonner";
import { IProduct } from "@/models/Product";
import { Loader2, Edit, Trash2, PackagePlus } from "lucide-react";

export default function VendorDashboard() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: 0,
    images: [] as string[],
    stock: 0,
    category: "",
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/vendor/products");
      const data = await res.json();
      setProducts(data);
    } catch {
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await fetch("/api/vendor/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      toast.success("Product deleted");
      fetchProducts();
    } catch {
      toast.error("Failed to delete product");
    }
  };

  const handleEdit = (product: IProduct) => {
    setEditingId(product.id);
    setForm({
      title: product.title,
      description: product.description,
      price: product.price,
      images: product.images,
      stock: product.stock,
      category: product.category || "",
    });
  };

  const handleSubmit = async () => {
    try {
      const method = editingId ? "PUT" : "POST";
      const body = editingId ? { id: editingId, ...form } : form;

      await fetch("/api/vendor/products", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      toast.success(editingId ? "Product updated" : "Product created");
      setEditingId(null);
      setForm({ title: "", description: "", price: 0, images: [], stock: 0, category: "" });
      fetchProducts();
    } catch {
      toast.error("Failed to save product");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-blue-600 w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Toaster richColors position="top-right" />
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Vendor Dashboard</h1>
          <button
            onClick={() => {
              setEditingId(null);
              setForm({ title: "", description: "", price: 0, images: [], stock: 0, category: "" });
            }}
            className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            <PackagePlus className="w-5 h-5 mr-2" />
            New Product
          </button>
        </div>

        {/* ===== Product Form ===== */}
        <div className="mb-6 bg-white shadow-md rounded-lg p-5">
          <h2 className="font-semibold text-gray-700 mb-3">
            {editingId ? "Edit Product" : "Add Product"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              className="border rounded p-2 w-full"
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <input
              className="border rounded p-2 w-full"
              placeholder="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
            <input
              type="number"
              className="border rounded p-2 w-full"
              placeholder="Price"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
            />
            <input
              type="number"
              className="border rounded p-2 w-full"
              placeholder="Stock"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
            />
          </div>

          <textarea
            className="border rounded p-2 w-full mt-3"
            placeholder="Description"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <button
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            onClick={handleSubmit}
          >
            {editingId ? "Update Product" : "Add Product"}
          </button>
        </div>

        {/* ===== Products List ===== */}
        <div className="bg-white shadow-md rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3 text-gray-800">Your Products</h2>
          {products.length === 0 ? (
            <p className="text-gray-500">No products added yet.</p>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products.map((product) => (
                <li
                  key={product.id}
                  className="p-4 border rounded-lg flex flex-col justify-between hover:shadow-lg transition bg-gray-50"
                >
                  <div>
                    <h3 className="font-bold text-lg">{product.title}</h3>
                    <p className="text-gray-600 text-sm">{product.description}</p>
                    <p className="text-green-600 font-semibold mt-2">${product.price}</p>
                    <p className="text-sm text-gray-500">Stock: {product.stock}</p>
                  </div>
                  <div className="flex mt-3 space-x-2">
                    <button
                      className="flex items-center bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                      onClick={() => handleEdit(product)}
                    >
                      <Edit className="w-4 h-4 mr-1" /> Edit
                    </button>
                    <button
                      className="flex items-center bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                      onClick={() => handleDelete(product.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" /> Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
