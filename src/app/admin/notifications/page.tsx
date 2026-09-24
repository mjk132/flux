"use client";

import { useEffect, useState, useCallback } from "react";
import { authFetch } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bell,
  Check,
  CheckCheck,
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "INFO" | "SUCCESS" | "WARNING" | "ERROR";
  isRead: boolean;
  createdAt: string;
}

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  INFO: Info,
  SUCCESS: CheckCircle,
  WARNING: AlertTriangle,
  ERROR: XCircle,
};

const typeColors: Record<string, string> = {
  INFO: "text-info",
  SUCCESS: "text-success",
  WARNING: "text-warning",
  ERROR: "text-danger",
};

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch("/api/admin/notifications");
      const json = await res.json();
      setNotifications(json.notifications || []);
    } catch {
      /* empty */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  async function markAsRead(id: string) {
    try {
      await authFetch("/api/admin/notifications", {
        method: "PUT",
        body: JSON.stringify({ notificationId: id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch {
      /* empty */
    }
  }

  async function markAllAsRead() {
    try {
      await authFetch("/api/admin/notifications", { method: "POST" });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      /* empty */
    }
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  function formatTime(date: string) {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "الآن";
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `منذ ${hours} ساعة`;
    const days = Math.floor(hours / 24);
    return `منذ ${days} يوم`;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">الإشعارات</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-text">{unreadCount} إشعار غير مقروء</p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="secondary" onClick={markAllAsRead}>
            <CheckCheck className="ml-2 h-4 w-4" />
            تحديد الكل كمقروء
          </Button>
        )}
      </div>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="space-y-4 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-64" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <Bell className="mx-auto h-12 w-12 text-gray-text/30" />
              <p className="mt-4 text-gray-text">لا توجد إشعارات</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {notifications.map((notification) => {
              const Icon = typeIcons[notification.type] || Info;
              const iconColor = typeColors[notification.type] || "text-gray-text";
              return (
                <div
                  key={notification.id}
                  className={`flex items-start gap-3 p-4 transition-colors hover:bg-surface/50 ${!notification.isRead ? "bg-purple-accent/5" : ""}`}
                >
                  <div className={`mt-0.5 rounded-full p-2 ${!notification.isRead ? "bg-purple-accent/10" : "bg-deep-purple"}`}>
                    <Icon className={`h-4 w-4 ${iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-medium ${!notification.isRead ? "text-white" : "text-gray-text"}`}>
                        {notification.title}
                      </p>
                      {!notification.isRead && (
                        <span className="h-2 w-2 rounded-full bg-purple-accent" />
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-gray-text">{notification.message}</p>
                    <p className="mt-1 text-xs text-gray-text/60">
                      {formatTime(notification.createdAt)}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAsRead(notification.id)}
                      title="تحديد كمقروء"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
