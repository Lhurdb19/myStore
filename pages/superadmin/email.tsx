"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

type EmailHistory = {
  _id?: string;
  email: string;
  subject: string;
  message: string;
  date: string;
};

export default function EmailPage() {
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<EmailHistory[]>([]);

  // ✅ Fetch previous emails from DB
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch("/api/email-history");
        const data = await res.json();
        if (data.success) setHistory(data.data);
      } catch {
        toast.error("Failed to load email history");
      }
    };
    fetchHistory();
  }, []);

  // ✅ Send email & log to MongoDB
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !subject || !message) {
      toast.error("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      // Send email itself
      const sendRes = await fetch("/api/contact/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, subject, message }),
      });
      if (!sendRes.ok) throw new Error("Email sending failed");

      // Log to database
      const logRes = await fetch("/api/email-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, subject, message }),
      });

      const logData = await logRes.json();
      if (logData.success) {
        setHistory((prev) => [logData.data, ...prev]);
      }

      toast.success("Email sent successfully!");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (error) {
      console.error(error);
      toast.error("Error sending email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-6 md:px-12">
      <div className="bg-white shadow-lg rounded-xl p-8 max-w-5xl mx-auto">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <img
            src="https://res.cloudinary.com/damamkuye/image/upload/v1761740811/image__1_-removebg-preview_exjxtz.png"
            alt="ShopEase Logo"
            className="w-28 mx-auto mb-2"
          />
          <h1 className="text-3xl font-bold text-gray-800">
            ShopEase Email Management
          </h1>
          <p className="text-gray-500 text-sm">
            Send updates or notifications to customers
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSend} className="space-y-4 mb-10">
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Recipient Email"
              className="px-4 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400"
            />
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject"
              className="px-4 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400"
            />
          </div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Message..."
            rows={6}
            className="w-full text-black px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2.5 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            {loading ? "Sending..." : "Send Email"}
          </button>
        </form>

        {/* Email History Table */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Sent Emails History</h2>
          {history.length === 0 ? (
            <p className="text-gray-500 text-sm text-center">
              No emails have been sent yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border border-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-2 px-4 text-left">Date</th>
                    <th className="py-2 px-4 text-left">Recipient</th>
                    <th className="py-2 px-4 text-left">Subject</th>
                    <th className="py-2 px-4 text-left">Message</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border-b">
                        {new Date(item.date).toLocaleString()}
                      </td>
                      <td className="py-2 px-4 border-b">{item.email}</td>
                      <td className="py-2 px-4 border-b font-medium">
                        {item.subject}
                      </td>
                      <td className="py-2 px-4 border-b text-gray-600 truncate max-w-xs">
                        {item.message}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
