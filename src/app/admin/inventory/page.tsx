"use client";

import { useEffect, useState, useCallback } from "react";
import { authFetch } from "@/store/auth";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
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
import { Database, Plus, Trash2, Search } from "lucide-react";

interface Product {
  id: string;
  name: string;
}

interface InventoryItem {
  id: string;
  code: string;
  status: string;
  usedAt: string | null;
  createdAt: string;
  order?: { id: string; orderNumber: string; customerName: string } | null;
}

interface InventoryStats {
  AVAILABLE: number;
  USED: number;
  RESERVED: number;
}

const statusLabels: Record<string, { label: string; variant: "success" | "warning" | "danger" | "info" | "default" }> = {
  AVAILABLE: { label: "متاح", variant: "success" },
  USED: { label: "مستخدم", variant: "info" },
  RESERVED: { label: "محجوز", variant: "warning" },
};

export default function AdminInventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<InventoryStats>({ AVAILABLE: 0, USED: 0, RESERVED: 0 });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [addModal, setAddModal] = useState(false);
  const [codes, setCodes] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await authFetch("/api/products?limit=100&status=PUBLISHED");
        const json = await res.json();
        setProducts((json.products || []).map((p: { id: string; name: string }) => ({ id: p.id, name: p.name })));
      } catch {
        /* empty */
      }
    }
    fetchProducts();
  }, []);

  const fetchInventory = useCallback(async () => {
    if (!selectedProduct) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ product_id: selectedProduct });
      if (search) params.set("search", search);
      const res = await authFetch(`/api/inventory?${params}`);
      const json = await res.json();
      setItems(json.data || []);
      setStats(json.stats || { AVAILABLE: 0, USED: 0, RESERVED: 0 });
    } catch {
      /* empty */
    } finally {
      setLoading(false);
    }
  }, [selectedProduct, search]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  async function handleAddCodes() {
    if (!selectedProduct || !codes.trim()) return;
    setAdding(true);
    try {
      const codeList = codes
        .split("\n")
        .map((c) => c.trim())
        .filter((c) => c.length > 0);
      await authFetch("/api/inventory", {
        method: "POST",
        body: JSON.stringify({ product_id: selectedProduct, codes: codeList }),
      });
      setCodes("");
      setAddModal(false);
      fetchInventory();
    } catch {
      /* empty */
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("هل أنت متأكد من حذف هذا الكود؟")) return;
    try {
      await authFetch(`/api/inventory/${id}`, { method: "DELETE" });
      fetchInventory();
    } catch {
      /* empty */
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">المخزون الرقمي</h1>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 sm:max-w-xs">
          <Select value={selectedProduct} onValueChange={setSelectedProduct}>
            <SelectTrigger>
              <SelectValue placeholder="اختر منتج" />
            </SelectTrigger>
            <SelectContent>
              {products.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {selectedProduct && (
          <Button onClick={() => setAddModal(true)}>
            <Plus className="ml-2 h-4 w-4" />
            إضافة أكواد
          </Button>
        )}
      </div>

      {selectedProduct && (
        <>
          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-success/10 p-3">
                  <Database className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-gray-text">متاح</p>
                  <p className="text-2xl font-bold text-white">{stats.AVAILABLE}</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-info/10 p-3">
                  <Database className="h-6 w-6 text-info" />
                </div>
                <div>
                  <p className="text-sm text-gray-text">مستخدم</p>
                  <p className="text-2xl font-bold text-white">{stats.USED}</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-purple-accent/10 p-3">
                  <Database className="h-6 w-6 text-purple-accent" />
                </div>
                <div>
                  <p className="text-sm text-gray-text">الإجمالي</p>
                  <p className="text-2xl font-bold text-white">{stats.AVAILABLE + stats.USED + stats.RESERVED}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Search */}
          <div className="relative max-w-xs">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-text" />
            <Input
              placeholder="بحث في الأكواد..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-9"
            />
          </div>

          {/* Codes Table */}
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-right font-medium text-gray-text">الكود</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-text">الحالة</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-text">الطلب</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-text">التاريخ</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-text">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b border-border">
                        <td className="px-4 py-3"><Skeleton className="h-4 w-32" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-5 w-16 rounded-full" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-4 w-8" /></td>
                      </tr>
                    ))
                  ) : items.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-gray-text">
                        لا توجد أكواد لهذا المنتج
                      </td>
                    </tr>
                  ) : (
                    items.map((item) => {
                      const st = statusLabels[item.status] || { label: item.status, variant: "default" as const };
                      return (
                        <tr key={item.id} className="border-b border-border transition-colors hover:bg-surface/50">
                          <td className="px-4 py-3 font-mono text-xs text-white">{item.code}</td>
                          <td className="px-4 py-3">
                            <Badge variant={st.variant}>{st.label}</Badge>
                          </td>
                          <td className="px-4 py-3 text-gray-text">
                            {item.order ? `${item.order.orderNumber} - ${item.order.customerName}` : "-"}
                          </td>
                          <td className="px-4 py-3 text-gray-text">{formatDate(item.createdAt)}</td>
                          <td className="px-4 py-3">
                            {item.status === "AVAILABLE" && (
                              <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>
                                <Trash2 className="h-4 w-4 text-danger" />
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {!selectedProduct && (
        <Card className="flex h-64 items-center justify-center">
          <p className="text-gray-text">اختر منتج لعرض المخزون الرقمي</p>
        </Card>
      )}

      {/* Add Codes Modal */}
      <Modal open={addModal} onOpenChange={setAddModal}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>إضافة أكواد رقمية</ModalTitle>
          </ModalHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-text">أدخل كود واحد في كل سطر</p>
            <Textarea
              placeholder="CODE1&#10;CODE2&#10;CODE3"
              value={codes}
              onChange={(e) => setCodes(e.target.value)}
              className="min-h-[200px] font-mono text-sm"
            />
            <p className="text-xs text-gray-text">
              {codes.split("\n").filter((c) => c.trim()).length} كود جاهز للإضافة
            </p>
          </div>
          <ModalFooter>
            <ModalClose asChild>
              <Button variant="secondary">إلغاء</Button>
            </ModalClose>
            <Button onClick={handleAddCodes} loading={adding} disabled={!codes.trim()}>
              إضافة الأكواد
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
