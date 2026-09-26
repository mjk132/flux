"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, DollarSign, Calendar, ArrowLeft, ShoppingBag } from "lucide-react";
import { useAuthStore, authFetch } from "@/store/auth";
import { formatPrice, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  items: { quantity: number }[];
}

interface UserData {
  user: {
    name: string;
    email: string;
    createdAt: string;
  };
  stats: {
    totalOrders: number;
    totalSpent: number;
  };
}

const statusLabels: Record<string, { label: string; variant: "default" | "success" | "warning" | "danger" | "info" }> = {
  PENDING: { label: "قيد الانتظار", variant: "warning" },
  PAID: { label: "مدفوع", variant: "success" },
  PROCESSING: { label: "قيد المعالجة", variant: "info" },
  COMPLETED: { label: "مكتمل", variant: "success" },
  CANCELLED: { label: "ملغي", variant: "danger" },
  REFUNDED: { label: "مسترجع", variant: "default" },
};

export default function AccountOverviewPage() {
  const { user } = useAuthStore();
  const [data, setData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [ordersRes, meRes] = await Promise.all([
          authFetch("/api/orders?limit=5"),
          authFetch("/api/auth/me"),
        ]);

        const ordersData = await ordersRes.json();
        const meData = await meRes.json();

        const orders = ordersData.data || [];
        const totalSpent = orders.reduce(
          (sum: number, o: Order) => sum + o.total,
          0
        );

        setData({
          user: meData.user,
          stats: {
            totalOrders: ordersData.pagination?.total || orders.length,
            totalSpent,
          },
        });
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-2xl bg-deep-purple" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">
          مرحباً، {user?.name || data?.user?.name}
        </h1>
        <p className="text-sm text-gray-text">
          نظرة عامة على حسابك وطلباتك الأخيرة
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-surface p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-accent/10">
              <Package className="h-5 w-5 text-purple-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {data?.stats.totalOrders || 0}
              </p>
              <p className="text-xs text-gray-text">إجمالي الطلبات</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <DollarSign className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {formatPrice(data?.stats.totalSpent || 0)}
              </p>
              <p className="text-xs text-gray-text">إجمالي المشتريات</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
              <Calendar className="h-5 w-5 text-info" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">
                {data?.user?.createdAt
                  ? formatDate(data.user.createdAt)
                  : "غير محدد"}
              </p>
              <p className="text-xs text-gray-text">عضو منذ</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href="/account/orders"
          className="flex items-center justify-between rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-purple-accent/30"
        >
          <div className="flex items-center gap-3">
            <Package className="h-5 w-5 text-purple-accent" />
            <span className="text-sm font-medium text-white">طلباتي</span>
          </div>
          <ArrowLeft className="h-4 w-4 text-gray-text" />
        </Link>
        <Link
          href="/account/purchases"
          className="flex items-center justify-between rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-purple-accent/30"
        >
          <div className="flex items-center gap-3">
            <ShoppingBag className="h-5 w-5 text-purple-accent" />
            <span className="text-sm font-medium text-white">
              منتجاتي المشتراة
            </span>
          </div>
          <ArrowLeft className="h-4 w-4 text-gray-text" />
        </Link>
      </div>
    </div>
  );
}
