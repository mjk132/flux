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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

interface Coupon {
  id: string;
  code: string;
  discount: number;
  isPercentage: boolean;
  minimumOrder: number | null;
  maximumUses: number | null;
  usedCount: number;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const emptyForm = {
  code: "",
  discount: 0,
  isPercentage: true,
  minimumOrder: 0,
  maximumUses: 0,
  isActive: true,
  expiresAt: "",
};

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchCoupons = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: "20" });
      const res = await authFetch(`/api/coupons?${params}`);
      const json = await res.json();
      setCoupons(json.data || []);
      setPagination(json.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 });
    } catch {
      /* empty */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons(1);
  }, [fetchCoupons]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(coupon: Coupon) {
    setEditing(coupon);
    setForm({
      code: coupon.code,
      discount: coupon.discount,
      isPercentage: coupon.isPercentage,
      minimumOrder: coupon.minimumOrder || 0,
      maximumUses: coupon.maximumUses || 0,
      isActive: coupon.isActive,
      expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().split("T")[0] : "",
    });
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.code.trim() || form.discount <= 0) return;
    setSaving(true);
    try {
      const body = {
        ...form,
        code: form.code.toUpperCase(),
        minimumOrder: form.minimumOrder || null,
        maximumUses: form.maximumUses || null,
        expiresAt: form.expiresAt || null,
      };
      if (editing) {
        await authFetch(`/api/coupons/${editing.id}`, {
          method: "PUT",
          body: JSON.stringify(body),
        });
      } else {
        await authFetch("/api/coupons", {
          method: "POST",
          body: JSON.stringify(body),
        });
      }
      setModalOpen(false);
      fetchCoupons(pagination.page);
    } catch {
      /* empty */
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("هل أنت متأكد من حذف هذا الكوبون؟")) return;
    try {
      await authFetch(`/api/coupons/${id}`, { method: "DELETE" });
      fetchCoupons(pagination.page);
    } catch {
      /* empty */
    }
  }

  async function toggleActive(id: string, current: boolean) {
    try {
      await authFetch(`/api/coupons/${id}`, {
        method: "PUT",
        body: JSON.stringify({ isActive: !current }),
      });
      fetchCoupons(pagination.page);
    } catch {
      /* empty */
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">الكوبونات</h1>
        <Button onClick={openCreate}>
          <Plus className="ml-2 h-4 w-4" />
          إضافة كوبون
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-right font-medium text-gray-text">الكود</th>
                <th className="px-4 py-3 text-right font-medium text-gray-text">الخصم</th>
                <th className="px-4 py-3 text-right font-medium text-gray-text">الحد الأدنى</th>
                <th className="px-4 py-3 text-right font-medium text-gray-text">الاستخدامات</th>
                <th className="px-4 py-3 text-right font-medium text-gray-text">الحالة</th>
                <th className="px-4 py-3 text-right font-medium text-gray-text">تاريخ الانتهاء</th>
                <th className="px-4 py-3 text-right font-medium text-gray-text">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-12" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-10" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-5 w-10" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-8" /></td>
                  </tr>
                ))
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-text">
                    لا توجد كوبونات
                  </td>
                </tr>
              ) : (
                coupons.map((coupon) => (
                  <tr key={coupon.id} className="border-b border-border transition-colors hover:bg-surface/50">
                    <td className="px-4 py-3 font-mono font-bold text-purple-accent">{coupon.code}</td>
                    <td className="px-4 py-3 text-white">
                      {coupon.isPercentage ? `${coupon.discount}%` : formatPrice(coupon.discount)}
                    </td>
                    <td className="px-4 py-3 text-gray-text">
                      {coupon.minimumOrder ? formatPrice(coupon.minimumOrder) : "-"}
                    </td>
                    <td className="px-4 py-3 text-white">
                      {coupon.usedCount}
                      {coupon.maximumUses ? ` / ${coupon.maximumUses}` : ""}
                    </td>
                    <td className="px-4 py-3">
                      <Switch
                        checked={coupon.isActive}
                        onCheckedChange={() => toggleActive(coupon.id, coupon.isActive)}
                      />
                    </td>
                    <td className="px-4 py-3 text-gray-text">
                      {coupon.expiresAt ? formatDate(coupon.expiresAt) : "بلا انتهاء"}
                    </td>
                    <td className="px-4 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(coupon)}>
                            <Pencil className="ml-2 h-4 w-4" />
                            تعديل
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDelete(coupon.id)} className="text-danger">
                            <Trash2 className="ml-2 h-4 w-4" />
                            حذف
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
        onPageChange={fetchCoupons}
      />

      {/* Create/Edit Modal */}
      <Modal open={modalOpen} onOpenChange={setModalOpen}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>{editing ? "تعديل الكوبون" : "إضافة كوبون جديد"}</ModalTitle>
          </ModalHeader>
          <div className="space-y-4">
            <Input
              label="كود الكوبون"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              placeholder="FLUX20"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="قيمة الخصم"
                type="number"
                value={form.discount}
                onChange={(e) => setForm({ ...form, discount: parseFloat(e.target.value) || 0 })}
              />
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-text">نوع الخصم</label>
                <Select
                  value={form.isPercentage ? "percentage" : "fixed"}
                  onValueChange={(v) => setForm({ ...form, isPercentage: v === "percentage" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">نسبة مئوية %</SelectItem>
                    <SelectItem value="fixed">مبلغ ثابت</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="الحد الأدنى للطلب"
                type="number"
                value={form.minimumOrder}
                onChange={(e) => setForm({ ...form, minimumOrder: parseFloat(e.target.value) || 0 })}
              />
              <Input
                label="حد الاستخدام الأقصى"
                type="number"
                value={form.maximumUses}
                onChange={(e) => setForm({ ...form, maximumUses: parseInt(e.target.value) || 0 })}
              />
            </div>
            <Input
              label="تاريخ الانتهاء"
              type="date"
              value={form.expiresAt}
              onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
            />
            <div className="flex items-center gap-2">
              <Switch
                checked={form.isActive}
                onCheckedChange={(v) => setForm({ ...form, isActive: v })}
              />
              <span className="text-sm text-gray-text">نشط</span>
            </div>
          </div>
          <ModalFooter>
            <ModalClose asChild>
              <Button variant="secondary">إلغاء</Button>
            </ModalClose>
            <Button onClick={handleSave} loading={saving}>
              {editing ? "حفظ التعديلات" : "إضافة"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
