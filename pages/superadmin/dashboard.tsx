"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { toast, Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Bell } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton"; // shadcn skeleton
import type { IUser } from "@/models/user";

interface Stats {
  total: number;
  active: number;
  suspended: number;
}

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "critical";
  audience: string;
  createdAt: string;
  readBy?: string[]; // if populated
  createdBy?: { name?: string };
}

const COLORS = ["#4ade80", "#f87171"]; // active, suspended
const NOTIF_COLORS = {
  info: "bg-blue-100 text-blue-700",
  warning: "bg-yellow-100 text-yellow-700",
  critical: "bg-red-100 text-red-700",
};

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, suspended: 0 });
  const [users, setUsers] = useState<IUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingNotifs, setLoadingNotifs] = useState(true);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [pollIntervalMs] = useState<number>(30000); // 30s polling

  const [activityData, setActivityData] = useState<{ label: string; value: number }[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(true);

  // Fetch users and compute stats
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
        const total = data.users.length;
        const suspended = data.users.filter((u: IUser) => u.suspended).length;
        const active = total - suspended;
        setStats({ total, active, suspended });
      } else {
        toast.error("Failed to load users");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error fetching users");
    } finally {
      setLoadingUsers(false);
    }
  };

  // Fetch notifications (latest)
  const fetchNotifications = async () => {
    setLoadingNotifs(true);
    try {
      const res = await axios.get("/api/notifications");
      const notifs: Notification[] = res.data.notifications || [];
      // determine read state locally (if readBy exists)
      setNotifications(notifs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingNotifs(false);
    }
  };

  // Fetch unread count (separate endpoint)
  const fetchUnreadCount = async () => {
    try {
      const res = await axios.get("/api/notifications/unread");
      if (res.data?.success) {
        setUnreadCount(res.data.unreadCount ?? 0);
      } else {
        setUnreadCount(0);
      }
    } catch (err) {
      console.error("Failed to fetch unread count", err);
      setUnreadCount(0);
    }
  };

  // Sample activity: builds mock daily counts from notifications (or you can replace with real metrics)
  const fetchActivity = async () => {
    setLoadingActivity(true);
    try {
      // Example: create last-7-days counts using notifications createdAt dates
      const res = await axios.get("/api/notifications");
      const notifs: Notification[] = res.data.notifications || [];
      const days = 7;
      const counts: Record<string, number> = {};
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = format(d, "MM-dd");
        counts[key] = 0;
      }
      notifs.forEach((n) => {
        const key = format(new Date(n.createdAt), "MM-dd");
        if (counts[key] !== undefined) counts[key] += 1;
      });
      const chartData = Object.keys(counts).map((k) => ({ label: k, value: counts[k] }));
      setActivityData(chartData);
    } catch (err) {
      setActivityData([]);
    } finally {
      setLoadingActivity(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchNotifications();
    fetchUnreadCount();
    fetchActivity();

    // polling for unread & notifications
    const poll = setInterval(() => {
      fetchNotifications();
      fetchUnreadCount();
      fetchActivity();
    }, pollIntervalMs);

    return () => clearInterval(poll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pieData = useMemo(
    () => [
      { name: "Active", value: stats.active },
      { name: "Suspended", value: stats.suspended },
    ],
    [stats]
  );

  // helper to check if notification is read by current user (if populated)
  // we don't have current user id here in client; rely on backend-only unread counts + server-side readBy
  // so in UI we mark as "New" if readBy is empty/undefined (best-effort)
  const isNotifRead = (n: Notification) => {
    if (!n.readBy) return false;
    return n.readBy.length > 0;
  };

  // mark a notification as read
  const markAsRead = async (id: string) => {
    try {
      await axios.post("/api/notifications/mark-read", { id });
      toast.success("Marked as read");
      await fetchNotifications();
      await fetchUnreadCount();
    } catch (err) {
      console.error(err);
      toast.error("Failed to mark as read");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Toaster position="top-center" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Overview of users, notifications and recent activity
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/superadmin/notifications" className="relative">
            <Bell className="w-6 h-6 text-gray-700 dark:text-gray-200" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </Link>

          <Button asChild>
            <Link href="/superadmin/notifications">Go to Notifications</Link>
          </Button>
        </div>
      </div>

      {/* Grid: top cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Stats card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow"
        >
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Users</h3>
          {loadingUsers ? (
            <div className="mt-3 space-y-2">
              <Skeleton className="h-8 w-32" />
              <div className="flex gap-3 mt-2">
                <Skeleton className="h-12 w-20" />
                <Skeleton className="h-12 w-20" />
                <Skeleton className="h-12 w-20" />
              </div>
            </div>
          ) : (
            <div className="mt-3">
              <div className="text-3xl font-bold">{stats.total}</div>
              <div className="flex items-center gap-3 mt-3">
                <div>
                  <div className="text-sm text-gray-500">Active</div>
                  <div className="font-semibold text-green-500">{stats.active}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Suspended</div>
                  <div className="font-semibold text-red-500">{stats.suspended}</div>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Recent notifications card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.35 }}
          className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Recent Notifications</h3>
            <span className="text-xs text-gray-500">{notifications.length} total</span>
          </div>

          {loadingNotifs ? (
            <div className="mt-3 space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : notifications.length === 0 ? (
            <p className="mt-3 text-gray-500">No notifications yet.</p>
          ) : (
            <ul className="mt-3 divide-y divide-gray-100 dark:divide-gray-700">
              {notifications.slice(0, 5).map((n) => (
                <li key={n._id} className="py-3 flex justify-between items-start">
                  <div className="max-w-[70%]">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-800 dark:text-gray-100">{n.title}</h4>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${NOTIF_COLORS[n.type]}`}>
                        {n.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{n.message}</p>
                    <div className="text-xs text-gray-400 mt-1">{format(new Date(n.createdAt), "PP p")}</div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={isNotifRead(n) ? "secondary" : "destructive"}>
                      {isNotifRead(n) ? "Read" : "New"}
                    </Badge>
                    {!isNotifRead(n) && (
                      <button
                        className="text-xs text-blue-600 hover:underline"
                        onClick={() => markAsRead(n._id)}
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="text-right mt-3">
            <Link href="/superadmin/notifications" className="text-sm text-blue-600 hover:underline">
              View all →
            </Link>
          </div>
        </motion.div>

        {/* Activity / charts card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex flex-col gap-3"
        >
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Activity (last 7 days)</h3>

          <div className="flex-1 min-h-[140px]">
            {loadingActivity ? (
              <div className="w-full h-36">
                <Skeleton className="h-36 w-full" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>
      </div>

      {/* Main content area: charts + table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: pie chart */}
        <motion.div
          className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow lg:col-span-1"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">User Status</h3>
          <div style={{ width: "100%", height: 220 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={70} label>
                  <Cell key="active" fill={COLORS[0]} />
                  <Cell key="suspended" fill={COLORS[1]} />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Right: user table (span 2 columns on large) */}
        <motion.div
          className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow lg:col-span-2 overflow-x-auto"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.35 }}
        >
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-3">Users</h3>

          {loadingUsers ? (
            <div className="space-y-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-gray-500 uppercase">
                <tr>
                  <th className="py-2 px-3">Name</th>
                  <th className="py-2 px-3">Email</th>
                  <th className="py-2 px-3">Role</th>
                  <th className="py-2 px-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {users.slice(0, 20).map((u: any) => (
                  <tr key={u._id} className="border-t">
                    <td className="py-3 px-3">{u.name}</td>
                    <td className="py-3 px-3">{u.email}</td>
                    <td className="py-3 px-3">{u.role}</td>
                    <td className="py-3 px-3">
                      <Badge variant={u.suspended ? "destructive" : "default"}>
                        {u.suspended ? "Suspended" : "Active"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </motion.div>
      </div>
    </div>
  );
}
