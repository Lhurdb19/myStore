"use client";
import { useEffect, useState } from "react";
import { Toaster, toast } from "sonner";
import { saveAs } from "file-saver"; // for PDF/CSV downloads
import { jsPDF } from "jspdf"; // for PDF export

interface Actor {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface AuditLog {
  _id: string;
  actor?: Actor;
  action: string;
  target?: string;
  details?: any;
  ip?: string;
  category?: string;
  createdAt: string;
}

export default function SuperAdminLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    user: "",
    action: "",
    startDate: "",
    endDate: "",
    category: "",
  });
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        ...(filters.user && { user: filters.user }),
        ...(filters.action && { action: filters.action }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.category && { category: filters.category }),
        page: page.toString(),
      });

      const res = await fetch(`/api/admins/logs?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setLogs(data.logs);
      } else {
        toast.error("Failed to fetch logs");
      }
    } catch (err) {
      toast.error("Error fetching logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs();
  };

  // Export as CSV
  const exportCSV = () => {
    if (!logs.length) return toast.warning("No logs to export");
    const header = ["Date", "User", "Email", "Action", "Category", "IP"];
    const rows = logs.map((log) => [
      new Date(log.createdAt).toLocaleString(),
      log.actor?.name || "System",
      log.actor?.email || "",
      log.action,
      log.category,
      log.ip || "N/A",
    ]);
    const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    saveAs(blob, "audit_logs.csv");
    toast.success("Logs exported as CSV");
  };

  // Export as PDF
  const exportPDF = () => {
    if (!logs.length) return toast.warning("No logs to export");
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Audit Logs Report", 14, 16);
    doc.setFontSize(10);

    let y = 28;
    logs.forEach((log, index) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(
        `${index + 1}. ${log.actor?.name || "System"} - ${log.action} (${log.category})`,
        14,
        y
      );
      y += 6;
      doc.text(`IP: ${log.ip || "N/A"} | ${new Date(log.createdAt).toLocaleString()}`, 14, y);
      y += 8;
    });

    doc.save("audit_logs.pdf");
    toast.success("Logs exported as PDF");
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Toaster richColors position="top-right" />
      <h1 className="text-2xl font-semibold mb-4">SuperAdmin Audit Logs</h1>

      {/* Filters */}
      <form
        onSubmit={handleSearch}
        className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm"
      >
        <input
          type="text"
          placeholder="User ID"
          value={filters.user}
          onChange={(e) => setFilters({ ...filters, user: e.target.value })}
          className="border p-2 rounded-md"
        />
        <input
          type="text"
          placeholder="Action"
          value={filters.action}
          onChange={(e) => setFilters({ ...filters, action: e.target.value })}
          className="border p-2 rounded-md"
        />
        <select
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          className="border p-2 rounded-md"
        >
          <option value="">All Categories</option>
          <option value="auth">Auth</option>
          <option value="payment">Payment</option>
          <option value="user">User</option>
          <option value="system">System</option>
          <option value="admin">Admin</option>
          <option value="other">Other</option>
        </select>
        <input
          type="date"
          value={filters.startDate}
          onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
          className="border p-2 rounded-md"
        />
        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
          className="border p-2 rounded-md"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
        >
          Apply
        </button>
      </form>

      {/* Export Buttons */}
      <div className="flex justify-end gap-3 mb-4">
        <button
          onClick={exportCSV}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
        >
          Export CSV
        </button>
        <button
          onClick={exportPDF}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
        >
          Export PDF
        </button>
      </div>

      {/* Logs Table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow-sm">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-700 uppercase">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">User</th>
              <th className="p-3">Action</th>
              <th className="p-3">Category</th>
              <th className="p-3">IP</th>
              <th className="p-3">Details</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="p-4 text-center">
                  Loading...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-500">
                  No logs found
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log._id} className="border-t hover:bg-gray-50 transition">
                  <td className="p-3">{new Date(log.createdAt).toLocaleString()}</td>
                  <td className="p-3">{log.actor ? log.actor.name : "System"}</td>
                  <td className="p-3">{log.action}</td>
                  <td className="p-3 capitalize">{log.category}</td>
                  <td className="p-3">{log.ip || "N/A"}</td>
                  <td className="p-3">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-6">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-gray-700">Page {page}</span>
        <button
          disabled={logs.length < 20}
          onClick={() => setPage((p) => p + 1)}
          className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-lg w-full p-6 relative">
            <h2 className="text-xl font-semibold mb-3">Log Details</h2>
            <p><strong>User:</strong> {selectedLog.actor?.name || "System"}</p>
            <p><strong>Action:</strong> {selectedLog.action}</p>
            <p><strong>Category:</strong> {selectedLog.category}</p>
            <p><strong>Target:</strong> {selectedLog.target || "N/A"}</p>
            <p><strong>IP:</strong> {selectedLog.ip || "N/A"}</p>
            <p><strong>Time:</strong> {new Date(selectedLog.createdAt).toLocaleString()}</p>
            <p className="mt-2">
              <strong>Details:</strong>{" "}
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40">
                {JSON.stringify(selectedLog.details, null, 2) || "No details"}
              </pre>
            </p>

            <button
              onClick={() => setSelectedLog(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
