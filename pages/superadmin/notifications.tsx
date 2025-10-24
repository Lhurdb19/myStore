// pages/superadmin/notifications.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { format } from "date-fns";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: "",
    message: "",
    type: "info",
    audience: "all",
  });

  // ✅ Fetch notifications
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/notifications");
      setNotifications(res.data.notifications);
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

  // ✅ Create new notification
  const handleSubmit = async (e: any) => {
  e.preventDefault();
  try {
    const res = await axios.post("/api/notifications", form);
    if (res.data.success) {
      toast.success("Notification created!");
      setForm({ title: "", message: "", type: "info", audience: "all" });
      setShowModal(false);
      fetchNotifications();
    }
  } catch (err: any) {
    console.error(err);
    toast.error("Error creating notification");
  }
};


  // ✅ Filter and search logic
  const filteredNotifications = notifications.filter((n) => {
    const matchesFilter = filter === "all" || n.type === filter;
    const matchesSearch =
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.message.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">System Notifications</h1>

      {/* 🔍 Search + Filter + New */}
      <div className="flex flex-wrap gap-3 mb-4 items-center justify-between">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search notifications..."
            className="border p-2 rounded-md w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="border p-2 rounded-md"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          + New Notification
        </button>
      </div>

      {/* 📋 Notifications List */}
      {loading ? (
        <p>Loading...</p>
      ) : filteredNotifications.length === 0 ? (
        <p className="text-gray-500">No notifications found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Title</th>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-left">Audience</th>
                <th className="p-3 text-left">Message</th>
              </tr>
            </thead>
            <tbody>
              {filteredNotifications.map((n) => (
                <tr key={n._id} className="border-b hover:bg-gray-50">
                  <td className="p-3 text-sm text-gray-600">
                    {format(new Date(n.createdAt), "PPpp")}
                  </td>
                  <td className="p-3 font-medium">{n.title}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        n.type === "info"
                          ? "bg-blue-100 text-blue-700"
                          : n.type === "warning"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {n.type}
                    </span>
                  </td>
                  <td className="p-3 text-sm">{n.audience}</td>
                  <td className="p-3 text-sm text-gray-700">{n.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 🧩 Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-green-600 rounded-lg shadow-lg w-full max-w-lg p-6 relative">
            <h2 className="text-xl font-semibold mb-4">New Notification</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="border border-gray-300 p-2 w-full rounded-md"
                required
              />
              <textarea
                placeholder="Message"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="border border-gray-300 p-2 w-full rounded-md"
                rows={3}
                required
              />
              <div className="flex gap-3">
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="border bg-green-600 border-gray-300 p-2 rounded-md w-1/2"
                >
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="critical">Critical</option>
                </select>
                <select
                  value={form.audience}
                  onChange={(e) => setForm({ ...form, audience: e.target.value })}
                  className="border border-gray-300 bg-green-600 p-2 rounded-md w-1/2"
                >
                  <option value="all">All</option>
                  <option value="users">Users</option>
                  <option value="admins">Admins</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                  Send Notification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
