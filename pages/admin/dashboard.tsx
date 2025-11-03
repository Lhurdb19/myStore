import { useEffect, useState } from "react";
import { connectDB } from "@/lib/db";
import User, { IUser } from "@/models/user";
import Notification, { INotification } from "@/models/Notification";
import { BarChart3, Users, Bell, Package, ClipboardList } from "lucide-react";
import { toast, Toaster } from "sonner";

// Stats interface
interface OverviewStats {
  totalUsers: number;
  totalNotifications: number;
  totalOrders: number;
  totalPackages: number;
}

export default function AdminOverview() {
  const [stats, setStats] = useState<OverviewStats>({
    totalUsers: 0,
    totalNotifications: 0,
    totalOrders: 0,
    totalPackages: 0,
  });

  const [recentUsers, setRecentUsers] = useState<IUser[]>([]);
  const [recentNotifications, setRecentNotifications] = useState<INotification[]>([]);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
  const fetchData = async () => {
    try {
      const res = await fetch("/api/admin/admin-overview");
      const data = await res.json();
      setStats(data.stats);
      setRecentUsers(data.recentUsers);
      setRecentNotifications(data.recentNotifications);
    } catch (err) {
      toast.error("Failed to load admin overview data");
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);

  if (loading)
    return <p className="text-gray-600 dark:text-gray-300">Loading dashboard...</p>;

  return (
    <div className="p-6 max-w-full bg-gray-950">
      <Toaster richColors position="top-right" />

      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
        Admin Overview
      </h1>

      {/* ===== Stats Cards ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-5 flex items-center space-x-4">
          <Users className="w-8 h-8 text-green-600" />
          <div>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              {stats.totalUsers}
            </p>
            <p className="text-gray-500 dark:text-gray-300">Users</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-5 flex items-center space-x-4">
          <Bell className="w-8 h-8 text-yellow-500" />
          <div>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              {stats.totalNotifications}
            </p>
            <p className="text-gray-500 dark:text-gray-300">Notifications</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-5 flex items-center space-x-4">
          <ClipboardList className="w-8 h-8 text-blue-500" />
          <div>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              {stats.totalOrders}
            </p>
            <p className="text-gray-500 dark:text-gray-300">Orders</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-5 flex items-center space-x-4">
          <Package className="w-8 h-8 text-purple-500" />
          <div>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              {stats.totalPackages}
            </p>
            <p className="text-gray-500 dark:text-gray-300">Packages</p>
          </div>
        </div>
      </div>

      {/* ===== Recent Users & Notifications ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-5">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Recent Users
          </h2>
          <ul className="space-y-2">
            {recentUsers.map((user) => (
              <li
                key={user.id}
                className="flex justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition"
              >
                <span>{user.name}</span>
                <span className="text-gray-500 dark:text-gray-300">{user.email}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recent Notifications */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-5">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Recent Notifications
          </h2>
          <ul className="space-y-2">
            {recentNotifications.map((note) => (
              <li
                key={note.id}
                className="p-2 bg-gray-50 dark:bg-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition"
              >
                <p className="font-semibold text-gray-800 dark:text-white">{note.title}</p>
                <p className="text-gray-500 dark:text-gray-300 text-sm truncate">
                  {note.message}
                </p>
                <p className="text-gray-400 dark:text-gray-400 text-xs mt-1">
                  {new Date(note.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ===== Quick Actions ===== */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button className="bg-green-600 text-white rounded-lg p-4 hover:bg-green-700 transition shadow flex flex-col items-center justify-center">
            <Users className="w-6 h-6 mb-2" />
            Add User
          </button>
          <button className="bg-blue-600 text-white rounded-lg p-4 hover:bg-blue-700 transition shadow flex flex-col items-center justify-center">
            <Package className="w-6 h-6 mb-2" />
            Track Packages
          </button>
          <button className="bg-yellow-500 text-white rounded-lg p-4 hover:bg-yellow-600 transition shadow flex flex-col items-center justify-center">
            <ClipboardList className="w-6 h-6 mb-2" />
            View Orders
          </button>
          <button className="bg-purple-600 text-white rounded-lg p-4 hover:bg-purple-700 transition shadow flex flex-col items-center justify-center">
            <BarChart3 className="w-6 h-6 mb-2" />
            Reports
          </button>
        </div>
      </div>
    </div>
  );
}
