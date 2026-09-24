"use client";

import { useEffect, useState, useCallback } from "react";
import { authFetch } from "@/store/auth";
import { formatPrice, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalFooter,
  ModalClose,
} from "@/components/ui/modal";
import { Search, Eye, ChevronDown, ChevronUp } from "lucide-react";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  total: number;
  product: { id: string; name: string; slug: string; discordRoleId?: string | null };
}

interface RoleResult {
  roleId: string;
  productId: string;
  productName: string;
  status: "granted" | "skipped" | "failed";
  detail?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string | null;
  paymentProofUrl: string | null;
  createdAt: string;
  items: OrderItem[];
  notes: string | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const statusLabels: Record<string, { label: string; variant: "success" | "warning" | "danger" | "info" | "default" }> = {
  PENDING: { label: "قيد الانتظار", variant: "warning" },
  PAID: { label: "مدفوع", variant: "info" },
  PROCESSING: { label: "قيد المعالجة", variant: "info" },
  COMPLETED: { label: "مكتمل", variant: "success" },
  CANCELLED: { label: "ملغي", variant: "danger" },
  REFUNDED: { label: "مسترد", variant: "default" },
};

const paymentLabels: Record<string, { label: string; variant: "success" | "warning" | "danger" | "info" | "default" }> = {
  PENDING: { label: "قيد الانتظار", variant: "warning" },
  PAID: { label: "مدفوع", variant: "success" },
  FAILED: { label: "فشل", variant: "danger" },
  REFUNDED: { label: "مسترد", variant: "default" },
};

const allStatuses = ["PENDING", "PAID", "PROCESSING", "COMPLETED", "CANCELLED", "REFUNDED"];

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [detailModal, setDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchOrders = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: "10" });
      const res = await authFetch(`/api/orders?${params}`);
      const json = await res.json();
      let data = json.data || [];
      if (statusFilter !== "all") {
        data = data.filter((o: Order) => o.status === statusFilter);
      }
      if (search) {
        const q = search.toLowerCase();
        data = data.filter(
          (o: Order) =>
            o.orderNumber.toLowerCase().includes(q) ||
            o.customerName?.toLowerCase().includes(q) ||
            o.customerEmail?.toLowerCase().includes(q)
        );
      }
      setOrders(data);
      setPagination(json.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 });
    } catch {
      /* empty */
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchOrders(1);
  }, [fetchOrders]);

  function toggleRow(id: string) {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function viewOrder(order: Order) {
    setActionMessage(null);
    try {
      const res = await authFetch(`/api/orders/${order.id}`);
      const json = await res.json();
      if (json.success) {
        setSelectedOrder(json.data);
      } else {
        setSelectedOrder(order);
      }
    } catch {
      setSelectedOrder(order);
    }
    setDetailModal(true);
  }

  async function handleAction(orderId: string, action: "approve" | "reject") {
    if (
      action === "reject" &&
      !confirm("رفض الطلب؟ سيتم إلغاؤه وإرجاع الأكواد المحجوزة.")
    )
      return;
    setActionLoading(true);
    setActionMessage(null);
    try {
      const res = await authFetch(`/api/orders/${orderId}`, {
        method: "PUT",
        body: JSON.stringify({ action }),
      });
      const json = await res.json();
      if (!json.success) {
        setActionMessage(json.error || "فشل تنفيذ الإجراء");
        return;
      }
      if (action === "approve") {
        const results: RoleResult[] = json.roleResults || [];
        const granted = results.filter((r) => r.status === "granted").length;
        const skipped = results.filter((r) => r.status === "skipped");
        const failed = results.filter((r) => r.status === "failed");
        if (results.length === 0) {
          setActionMessage("تم تأكيد الدفع. لا توجد رتب ديسكورد مربوطة بهذه المنتجات.");
        } else {
          const parts = [`تم تأكيد الدفع ومنح ${granted} من ${results.length} رتبة.`];
          if (skipped.length > 0)
            parts.push(`تُخطي ${skipped.length}: ${skipped[0].detail || ""}`);
          if (failed.length > 0)
            parts.push(`فشل ${failed.length}: ${failed[0].detail || ""}`);
          setActionMessage(parts.join(" "));
        }
      } else {
        setActionMessage("تم رفض الطلب وإلغاؤه.");
      }
      fetchOrders(pagination.page);
      if (selectedOrder?.id === orderId && json.data) {
        setSelectedOrder((prev) =>
          prev ? { ...prev, status: json.data.status, paymentStatus: json.data.paymentStatus } : null
        );
      }
    } catch {
      setActionMessage("حدث خطأ أثناء تنفيذ الإجراء");
    } finally {
      setActionLoading(false);
    }
  }
  async function updateStatus(orderId: string, status: string) {
    try {
      await authFetch(`/api/orders/${orderId}`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      fetchOrders(pagination.page);
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status } : null));
      }
    } catch {
      /* empty */
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">الطلبات</h1>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-text" />
          <Input
            placeholder="بحث برقم الطلب أو البريد..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الحالات</SelectItem>
            {allStatuses.map((s) => (
              <SelectItem key={s} value={s}>
                {statusLabels[s]?.label || s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-right font-medium text-gray-text"></th>
                <th className="px-4 py-3 text-right font-medium text-gray-text">رقم الطلب</th>
                <th className="px-4 py-3 text-right font-medium text-gray-text">العميل</th>
                <th className="px-4 py-3 text-right font-medium text-gray-text">المبلغ</th>
                <th className="px-4 py-3 text-right font-medium text-gray-text">الحالة</th>
                <th className="px-4 py-3 text-right font-medium text-gray-text">الدفع</th>
                <th className="px-4 py-3 text-right font-medium text-gray-text">التاريخ</th>
                <th className="px-4 py-3 text-right font-medium text-gray-text">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    <td className="px-4 py-3"><Skeleton className="h-4 w-4" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-5 w-16 rounded-full" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-5 w-16 rounded-full" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-8" /></td>
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-text">
                    لا توجد طلبات
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const st = statusLabels[order.status] || { label: order.status, variant: "default" as const };
                  const ps = paymentLabels[order.paymentStatus] || { label: order.paymentStatus, variant: "default" as const };
                  const expanded = expandedRows.has(order.id);
                  return (
                    <tr key={order.id} className="border-b border-border transition-colors hover:bg-surface/50">
                      <td className="px-4 py-3">
                        <button onClick={() => toggleRow(order.id)} className="text-gray-text hover:text-white">
                          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                      </td>
                      <td className="px-4 py-3 font-medium text-purple-accent">{order.orderNumber}</td>
                      <td className="px-4 py-3 text-white">{order.customerName || "-"}</td>
                      <td className="px-4 py-3 text-white">{formatPrice(order.total)}</td>
                      <td className="px-4 py-3">
                        <Badge variant={st.variant}>{st.label}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={ps.variant}>{ps.label}</Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-text">{formatDate(order.createdAt)}</td>
                      <td className="px-4 py-3">
                        <Button variant="ghost" size="sm" onClick={() => viewOrder(order)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={fetchOrders}
      />

      {/* Order Detail Modal */}
      <Modal open={detailModal} onOpenChange={setDetailModal}>
        <ModalContent className="max-w-2xl">
          <ModalHeader>
            <ModalTitle>تفاصيل الطلب {selectedOrder?.orderNumber}</ModalTitle>
          </ModalHeader>
          {selectedOrder && (
            <div className="max-h-[60vh] space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-text">العميل</p>
                  <p className="text-white">{selectedOrder.customerName || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-text">البريد الإلكتروني</p>
                  <p className="text-white">{selectedOrder.customerEmail || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-text">المبلغ الإجمالي</p>
                  <p className="text-white">{formatPrice(selectedOrder.total)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-text">طريقة الدفع</p>
                  <p className="text-white">
                    {selectedOrder.paymentMethod === "paypal"
                      ? "PayPal (تحويل يدوي)"
                      : selectedOrder.paymentMethod || "-"}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-text">ملاحظات</p>
                  <p className="text-white">{selectedOrder.notes || "لا توجد ملاحظات"}</p>
                </div>
              </div>

              {selectedOrder.paymentProofUrl && (
                <div>
                  <p className="mb-2 text-sm font-medium text-gray-text">
                    إثبات الدفع
                  </p>
                  <a
                    href={selectedOrder.paymentProofUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src={selectedOrder.paymentProofUrl}
                      alt="إثبات الدفع"
                      className="max-h-72 rounded-xl border border-border object-contain transition-opacity hover:opacity-90"
                    />
                  </a>
                  <p className="mt-1 text-[11px] text-gray-muted">
                    اضغط على الصورة لعرضها بحجم كامل
                  </p>
                </div>
              )}

              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-medium text-gray-text">المنتجات</p>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between rounded-lg bg-deep-purple/50 p-3">
                        <div>
                          <p className="text-sm text-white">{item.product?.name || "منتج"}</p>
                          <p className="text-xs text-gray-text">
                            الكمية: {item.quantity}
                            {item.product?.discordRoleId && (
                              <span className="mr-2 rounded-full bg-purple-accent/15 px-2 py-0.5 text-[10px] font-bold text-purple-accent" dir="ltr">
                                Role: {item.product.discordRoleId}
                              </span>
                            )}
                          </p>
                        </div>
                        <p className="text-sm font-medium text-white">{formatPrice(item.total)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(selectedOrder.status === "PENDING" || selectedOrder.paymentStatus === "PENDING") && (
                <div className="rounded-xl border border-border bg-deep-purple/40 p-4">
                  <p className="mb-3 text-sm font-medium text-white">
                    مراجعة الدفع
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleAction(selectedOrder.id, "approve")}
                      loading={actionLoading}
                    >
                      تأكيد الدفع ومنح رتب ديسكورد
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAction(selectedOrder.id, "reject")}
                      loading={actionLoading}
                    >
                      رفض الطلب
                    </Button>
                  </div>
                  {actionMessage && (
                    <p className="mt-3 text-[12.5px] leading-relaxed text-gray-text">
                      {actionMessage}
                    </p>
                  )}
                </div>
              )}

              <div>
                <p className="mb-2 text-sm font-medium text-gray-text">تحديث الحالة</p>
                <div className="flex flex-wrap gap-2">
                  {allStatuses.map((s) => (
                    <Button
                      key={s}
                      size="sm"
                      variant={selectedOrder.status === s ? "primary" : "outline"}
                      onClick={() => updateStatus(selectedOrder.id, s)}
                    >
                      {statusLabels[s]?.label || s}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
          <ModalFooter>
            <ModalClose asChild>
              <Button variant="secondary">إغلاق</Button>
            </ModalClose>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
