"use client";

import { useEffect, useState, useCallback } from "react";
import { authFetch } from "@/store/auth";
import { formatPrice, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Pagination } from "@/components/ui/pagination";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalFooter,
  ModalClose,
} from "@/components/ui/modal";
import { Search, Eye, Mail, Phone, ShoppingBag } from "lucide-react";

interface Customer {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  orderCount: number;
  totalSpent: number;
}

interface CustomerDetail extends Customer {
  phone: string | null;
  orders: Array<{ id: string; total: number; status: string; createdAt: string }>;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [detailModal, setDetailModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDetail | null>(null);

  const fetchCustomers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: "10" });
      if (search) params.set("search", search);
      const res = await authFetch(`/api/admin/users?${params}`);
      const json = await res.json();
      setCustomers(json.users || []);
      setPagination(json.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 });
    } catch {
      /* empty */
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchCustomers(1);
  }, [fetchCustomers]);

  async function viewCustomer(id: string) {
    try {
      const res = await authFetch(`/api/admin/users/${id}`);
      const json = await res.json();
      setSelectedCustomer(json.user);
      setDetailModal(true);
    } catch {
      /* empty */
    }
  }

  async function toggleActive(id: string, current: boolean) {
    try {
      await authFetch(`/api/admin/users/${id}`, {
        method: "PUT",
        body: JSON.stringify({ isActive: !current }),
      });
      fetchCustomers(pagination.page);
    } catch {
      /* empty */
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">العملاء</h1>

      <div className="relative max-w-sm">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-text" />
        <Input
          placeholder="بحث بالاسم أو البريد..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pr-9"
        />
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-right font-medium text-gray-text">الاسم</th>
                <th className="px-4 py-3 text-right font-medium text-gray-text">البريد</th>
                <th className="px-4 py-3 text-right font-medium text-gray-text">الطلبات</th>
                <th className="px-4 py-3 text-right font-medium text-gray-text">إجمالي المشتريات</th>
                <th className="px-4 py-3 text-right font-medium text-gray-text">الحالة</th>
                <th className="px-4 py-3 text-right font-medium text-gray-text">تاريخ الانضمام</th>
                <th className="px-4 py-3 text-right font-medium text-gray-text">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-32" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-8" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-5 w-10" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-8" /></td>
                  </tr>
                ))
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-text">
                    لا يوجد عملاء
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id} className="border-b border-border transition-colors hover:bg-surface/50">
                    <td className="px-4 py-3 font-medium text-white">{customer.name}</td>
                    <td className="px-4 py-3 text-gray-text">{customer.email}</td>
                    <td className="px-4 py-3 text-white">{customer.orderCount}</td>
                    <td className="px-4 py-3 text-white">{formatPrice(customer.totalSpent)}</td>
                    <td className="px-4 py-3">
                      <Switch
                        checked={customer.isActive}
                        onCheckedChange={() => toggleActive(customer.id, customer.isActive)}
                      />
                    </td>
                    <td className="px-4 py-3 text-gray-text">{formatDate(customer.createdAt)}</td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="sm" onClick={() => viewCustomer(customer.id)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={fetchCustomers}
      />

      {/* Customer Detail Modal */}
      <Modal open={detailModal} onOpenChange={setDetailModal}>
        <ModalContent className="max-w-2xl">
          <ModalHeader>
            <ModalTitle>تفاصيل العميل</ModalTitle>
          </ModalHeader>
          {selectedCustomer && (
            <div className="max-h-[60vh] space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-text">الاسم</p>
                  <p className="text-white">{selectedCustomer.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-text">البريد الإلكتروني</p>
                  <p className="flex items-center gap-2 text-white">
                    <Mail className="h-4 w-4 text-gray-text" />
                    {selectedCustomer.email}
                  </p>
                </div>
                {selectedCustomer.phone && (
                  <div>
                    <p className="text-sm text-gray-text">الهاتف</p>
                    <p className="flex items-center gap-2 text-white">
                      <Phone className="h-4 w-4 text-gray-text" />
                      {selectedCustomer.phone}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-text">إجمالي المشتريات</p>
                  <p className="text-white">{formatPrice(selectedCustomer.totalSpent)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-text">عدد الطلبات</p>
                  <p className="flex items-center gap-2 text-white">
                    <ShoppingBag className="h-4 w-4 text-gray-text" />
                    {selectedCustomer.orderCount}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-text">الدور</p>
                  <Badge>{selectedCustomer.role}</Badge>
                </div>
              </div>

              {selectedCustomer.orders && selectedCustomer.orders.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-medium text-gray-text">الطلبات الأخيرة</p>
                  <div className="space-y-2">
                    {selectedCustomer.orders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between rounded-lg bg-deep-purple/50 p-3">
                        <div>
                          <p className="text-sm text-white">{order.id.slice(0, 8)}...</p>
                          <p className="text-xs text-gray-text">{formatDate(order.createdAt)}</p>
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-medium text-white">{formatPrice(order.total)}</p>
                          <Badge variant={order.status === "COMPLETED" ? "success" : "warning"}>
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
