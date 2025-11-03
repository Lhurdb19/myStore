"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrders } from "@/hooks/useOrders";
import { useWishlist } from "@/hooks/useWishlist";
import { useNotifications } from "@/hooks/useNotifications";
import { ShoppingCart, Heart, Bell } from "lucide-react";

export default function UserDashboardContent() {
  const { orders, loading: loadingOrders } = useOrders();
  const { wishlist, loading: loadingWishlist } = useWishlist();
  const { notifications, loading: loadingNotifications } = useNotifications();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Welcome Back!</h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-blue-500" />
            <CardTitle>Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingOrders ? <Skeleton className="h-6 w-16" /> : <p className="text-2xl font-semibold">{orders.length}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-pink-500" />
            <CardTitle>Wishlist Items</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingWishlist ? <Skeleton className="h-6 w-16" /> : <p className="text-2xl font-semibold">{wishlist.length}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-green-500" />
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingNotifications ? <Skeleton className="h-6 w-16" /> : <p className="text-2xl font-semibold">{notifications.length}</p>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingNotifications ? (
            <Skeleton className="h-6 w-full" />
          ) : notifications.length === 0 ? (
            <p className="text-gray-500">No new notifications.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {notifications.map((n) => (
                <li key={n._id} className="py-2">
                  <p className="font-medium">{n.title}</p>
                  <p className="text-sm text-gray-500">{n.message}</p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
