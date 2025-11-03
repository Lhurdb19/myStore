import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"general" | "product">("general");
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    title: "",
    message: "",
    type: "info",
    audience: "users",
    category: "product",
  });

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/notifications");
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await axios.post("/api/notifications", form);
      if (res.data.success) {
        toast.success("Product post created!");
        setForm({ title: "", message: "", type: "info", audience: "users", category: "product" });
        setShowModal(false);
        fetchNotifications();
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Error creating product post");
    } finally {
      setCreating(false);
    }
  };

  const filtered = notifications.filter((n) => n.category === tab);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Admin Notifications</h1>
        <Button onClick={() => setShowModal(true)}>+ New Product Post</Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 mb-6 border-b">
        {["general", "product"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t as "general" | "product")}
            className={`pb-2 px-3 ${
              tab === t ? "border-b-2 border-blue-600 text-blue-600 font-semibold" : "text-gray-500"
            }`}
          >
            {t === "general" ? "General Notifications" : "Product Posts"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-gray-500 text-sm">No {tab} found.</p>
      ) : (
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Title</th>
                <th className="p-3 text-left">Message</th>
                <th className="p-3 text-left">Type</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((n) => (
                <tr key={n._id} className="border-b hover:bg-gray-50">
                  <td className="p-3 text-gray-600">{format(new Date(n.createdAt), "PPpp")}</td>
                  <td className="p-3 font-medium">{n.title}</td>
                  <td className="p-3 text-gray-700">{n.message}</td>
                  <td className="p-3">{n.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Post New Product Update</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
            <textarea
              placeholder="Message"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full border rounded-md p-2 h-24"
              required
            />

            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={creating}>
                {creating ? "Posting..." : "Post Update"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
