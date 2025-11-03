// hooks/useNotifications.ts
"use client";
import { useEffect, useState } from "react";

export function useNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const res = await fetch("/api/notifications");

        // check if response is JSON
        const contentType = res.headers.get("content-type");
        if (!res.ok) {
          const text = await res.text();
          console.error("API returned error:", text);
          setNotifications([]);
          setLoading(false);
          return;
        }

        if (!contentType || !contentType.includes("application/json")) {
          const text = await res.text();
          console.error("API did not return JSON:", text);
          setNotifications([]);
          setLoading(false);
          return;
        }

        const data = await res.json();
        setNotifications(data.notifications || []);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    }

    fetchNotifications();
  }, []);

  return { notifications, loading };
}
