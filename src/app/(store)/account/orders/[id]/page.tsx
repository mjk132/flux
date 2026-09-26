"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Package, Clock, CheckCircle, XCircle } from "lucide-react";
import { authFetch } from "@/store/auth";
import { formatPrice, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface OrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  subtotal: number;
  discount: number;
  total: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  couponCode: string | null;
  notes: string | null;
  createdAt: string;
  items: {
    id: string;
    quantity: number;
    price: number;
    total: number;
    product: { name: string; slug: string; productType: string };
  }[];
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

const timeline = ["PENDING", "PAID", "PROCESSING", "COMPLETED"];

export default function OrderDetailPage() {
  const params = useParams();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await authFetch(`/api/orders/${params.id}`);
        const data = await res.json();
        setOrder(data.data || data);
      } catch {
        setOrder(null);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [params.id]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-deep-purple" />
        <div className="h-64 animate-pulse rounded-2xl bg-deep-purple" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-8 text-center">
        <p className="text-gray-text">الطلب غير موجود</p>
      </div>
    );
  }

  const status = statusLabels[order.status] || {
    label: order.status,
    variant: "default" as const,
  };

  const currentStep = timeline.indexOf(order.status);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/account/orders"
          className="text-gray-text hover:text-white transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">
            طلب {order.orderNumber}
          </h1>
          <p className="text-sm text-gray-text">
            {formatDate(order.createdAt)}
          </p>
        </div>
      </div>

      {/* Status */}
      <div className="rounded-2xl border border-border bg-surface p-4">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-sm text-gray-text">الحالة:</span>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>

        {/* Timeline */}
        <div className="flex items-center gap-2">
          {timeline.map((step, i) => {
            const isActive = i <= currentStep;
            const isCurrent = i === currentStep;
            return (
              <div key={step} className="flex flex-1 items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                    isCurrent
                      ? "bg-purple-accent text-white"
                      : isActive
                      ? "bg-success text-white"
                      : "bg-deep-purple text-gray-text"
                  }`}
                >
                  {isActive && !isCurrent ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    i + 1
                  )}
                </div>
                {i < timeline.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 ${
                      i < currentStep ? "bg-success" : "bg-deep-purple"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Order Items */}
      <div className="rounded-2xl border border-border bg-surface p-4">
        <h2 className="mb-4 text-lg font-semibold text-white">المنتجات</h2>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-lg bg-deep-purple p-3"
            >
              <div>
                <p className="text-sm font-medium text-white">
                  {item.product.name}
                </p>
                <p className="text-xs text-gray-text">
                  الكمية: {item.quantity} × {formatPrice(item.price)}
                </p>
              </div>
              <span className="text-sm font-bold text-purple-accent">
                {formatPrice(item.total)}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-2 border-t border-border pt-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-text">المجموع الفرعي</span>
            <span className="text-white">{formatPrice(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-success">خصم</span>
              <span className="text-success">
                -{formatPrice(order.discount)}
              </span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold">
            <span className="text-white">الإجمالي</span>
            <span className="text-purple-accent">
              {formatPrice(order.total)}
            </span>
          </div>
        </div>
      </div>

      {/* Delivery Info */}
      <div className="rounded-2xl border border-border bg-surface p-4">
        <h2 className="mb-3 text-lg font-semibold text-white">
          معلومات التسليم
        </h2>
        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <span className="text-gray-text">الاسم: </span>
            <span className="text-white">{order.customerName}</span>
          </div>
          <div>
            <span className="text-gray-text">البريد: </span>
            <span className="text-white">{order.customerEmail}</span>
          </div>
          {order.customerPhone && (
            <div>
              <span className="text-gray-text">الهاتف: </span>
              <span className="text-white">{order.customerPhone}</span>
            </div>
          )}
          {order.couponCode && (
            <div>
              <span className="text-gray-text">كود الخصم: </span>
              <span className="text-purple-accent">{order.couponCode}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
