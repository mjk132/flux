"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { authFetch } from "@/store/auth";
import { formatPrice, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  total: number;
  product: { name: string; slug: string };
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  items: OrderItem[];
}

const statusLabels: Record<
  string,
  { label: string; variant: "default" | "success" | "warning" | "danger" | "info" }
> = {
  PENDING: { label: "قيد الانتظار", variant: "warning" },
  PAID: { label: "مدفوع", variant: "success" },
  PROCESSING: { label: "قيد المعالجة", variant: "info" },
  COMPLETED: { label: "مكتمل", variant: "success" },
  CANCELLED: { label: "ملغي", variant: "danger" },
  REFUNDED: { label: "مسترجع", variant: "default" },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      try {
        const res = await authFetch(`/api/orders?page=${page}&limit=10`);
        const data = await res.json();
        setOrders(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [page]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">طلباتي</h1>
        <p className="text-sm text-gray-text">قائمة بجميع طلباتك</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-deep-purple" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface p-8 text-center">
          <p className="mb-4 text-gray-text">لا توجد طلبات بعد</p>
          <Link
            href="/store"
            className="text-sm text-purple-accent hover:underline"
          >
            تصفح المتجر
          </Link>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface">
                  <th className="px-4 py-3 text-right font-medium text-gray-text">
                    رقم الطلب
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-gray-text">
                    التاريخ
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-gray-text">
                    المنتجات
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-gray-text">
                    الحالة
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-gray-text">
                    الإجمالي
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const status = statusLabels[order.status] || {
                    label: order.status,
                    variant: "default" as const,
                  };
                  return (
                    <tr
                      key={order.id}
                      className="border-b border-border transition-colors hover:bg-surface/50"
                    >
                      <td className="px-4 py-3 font-medium text-white">
                        {order.orderNumber}
                      </td>
                      <td className="px-4 py-3 text-gray-text">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-gray-text">
                        {order.items.length} منتج
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </td>
                      <td className="px-4 py-3 font-medium text-purple-accent">
                        {formatPrice(order.total)}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/account/orders/${order.id}`}
                          className="inline-flex items-center gap-1 text-xs text-purple-accent hover:underline"
                        >
                          التفاصيل
                          <ChevronLeft className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors ${
                    page === p
                      ? "bg-purple-accent text-white"
                      : "text-gray-text hover:bg-surface hover:text-white"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
