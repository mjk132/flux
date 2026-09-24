"use client";

import { useEffect, useState, useCallback } from "react";
import { authFetch } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
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

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  isVisible: boolean;
  sortOrder: number;
  _count: { products: number };
  createdAt: string;
}

const emptyForm = {
  name: "",
  description: "",
  image: "",
  isVisible: true,
  sortOrder: 0,
};

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch("/api/categories");
      const json = await res.json();
      setCategories(Array.isArray(json) ? json : json.data || []);
    } catch {
      /* empty */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(cat: Category) {
    setEditing(cat);
    setForm({
      name: cat.name,
      description: cat.description || "",
      image: cat.image || "",
      isVisible: cat.isVisible,
      sortOrder: cat.sortOrder,
    });
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        await authFetch(`/api/categories/${editing.id}`, {
          method: "PUT",
          body: JSON.stringify(form),
        });
      } else {
        await authFetch("/api/categories", {
          method: "POST",
          body: JSON.stringify(form),
        });
      }
      setModalOpen(false);
      fetchCategories();
    } catch {
      /* empty */
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("هل أنت متأكد من حذف هذه الفئة؟")) return;
    try {
      const res = await authFetch(`/api/categories/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) {
        alert(json.error || "فشل الحذف");
        return;
      }
      fetchCategories();
    } catch {
      /* empty */
    }
  }

  async function toggleVisibility(id: string, current: boolean) {
    try {
      await authFetch(`/api/categories/${id}`, {
        method: "PUT",
        body: JSON.stringify({ isVisible: !current }),
      });
      fetchCategories();
    } catch {
      /* empty */
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">الفئات</h1>
        <Button onClick={openCreate}>
          <Plus className="ml-2 h-4 w-4" />
          إضافة فئة
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-right font-medium text-gray-text">الاسم</th>
                <th className="px-4 py-3 text-right font-medium text-gray-text">Slug</th>
                <th className="px-4 py-3 text-right font-medium text-gray-text">الوصف</th>
                <th className="px-4 py-3 text-right font-medium text-gray-text">المنتجات</th>
                <th className="px-4 py-3 text-right font-medium text-gray-text">الظهور</th>
                <th className="px-4 py-3 text-right font-medium text-gray-text">الترتيب</th>
                <th className="px-4 py-3 text-right font-medium text-gray-text">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-32" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-8" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-5 w-10" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-6" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-8" /></td>
                  </tr>
                ))
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-text">
                    لا توجد فئات
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id} className="border-b border-border transition-colors hover:bg-surface/50">
                    <td className="px-4 py-3 font-medium text-white">{cat.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-text">{cat.slug}</td>
                    <td className="max-w-[200px] truncate px-4 py-3 text-gray-text">
                      {cat.description || "-"}
                    </td>
                    <td className="px-4 py-3 text-white">{cat._count?.products || 0}</td>
                    <td className="px-4 py-3">
                      <Switch
                        checked={cat.isVisible}
                        onCheckedChange={() => toggleVisibility(cat.id, cat.isVisible)}
                      />
                    </td>
                    <td className="px-4 py-3 text-white">{cat.sortOrder}</td>
                    <td className="px-4 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(cat)}>
                            <Pencil className="ml-2 h-4 w-4" />
                            تعديل
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(cat.id)}
                            className="text-danger"
                            disabled={(cat._count?.products || 0) > 0}
                          >
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

      {/* Create/Edit Modal */}
      <Modal open={modalOpen} onOpenChange={setModalOpen}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>{editing ? "تعديل الفئة" : "إضافة فئة جديدة"}</ModalTitle>
          </ModalHeader>
          <div className="space-y-4">
            <Input
              label="اسم الفئة"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Textarea
              label="الوصف"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <Input
              label="رابط الصورة"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
            />
            <Input
              label="الترتيب"
              type="number"
              value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
            />
            <div className="flex items-center gap-2">
              <Switch
                checked={form.isVisible}
                onCheckedChange={(v) => setForm({ ...form, isVisible: v })}
              />
              <span className="text-sm text-gray-text">مرئي</span>
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
