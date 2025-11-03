// pages/api/admin/overview.ts
import { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import User from "@/models/user";
import Notification from "@/models/Notification";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await connectDB();

    const users = await User.find().sort({ createdAt: -1 }).limit(5).lean({ virtuals: true });
    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(5).lean({ virtuals: true });
    const totalUsers = await User.countDocuments();
    const totalNotifications = await Notification.countDocuments();
    const totalOrders = 42;   // Replace with real Orders collection
    const totalPackages = 18; // Replace with real Packages collection

    return res.status(200).json({
        recentUsers: users,
        recentNotifications: notifications,
        stats: { totalUsers, totalNotifications, totalOrders, totalPackages },
    });
}
