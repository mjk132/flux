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

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  image: string;
  link: string | null;
  isActive: boolean;
  order: number;
  createdAt: string;
}

const emptyForm = {
  title: "",
  subtitle: "",
  image: "",
  link: "",
  isActive: true,
  order: 0,
};

export default function AdminBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchBanners = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch("/api/admin/banners");
      const json = await res.json();
      setBanners(json.banners || []);
    } catch {
      /* empty */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(banner: Banner) {
    setEditing(banner);
    setForm({
      title: banner.title,
      subtitle: banner.subtitle || "",
      image: banner.image,
      link: banner.link || "",
      isActive: banner.isActive,
      order: banner.order,
    });
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.title.trim() || !form.image.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        await authFetch(`/api/admin/banners/${editing.id}`, {
          method: "PUT",
          body: JSON.stringify(form),
        });
      } else {
        await authFetch("/api/admin/banners", {
          method: "POST",
          body: JSON.stringify(form),
        });
      }
      setModalOpen(false);
      fetchBanners();
    } catch {
      /* empty */
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("هل أنت متأكد من حذف هذا البانر؟")) return;
    try {
      await authFetch(`/api/admin/banners/${id}`, { method: "DELETE" });
      fetchBanners();
    } catch {
      /* empty */
    }
  }

  async function toggleActive(id: string, current: boolean) {
    try {
      await authFetch(`/api/admin/banners/${id}`, {
        method: "PUT",
        body: JSON.stringify({ isActive: !current }),
      });
      fetchBanners();
    } catch {
      /* empty */
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">البانرات</h1>
        <Button onClick={openCreate}>
          <Plus className="ml-2 h-4 w-4" />
          إضافة بانر
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-right font-medium text-gray-text">العنوان</th>
                <th className="px-4 py-3 text-right font-medium text-gray-text">الوصف</th>
                <th className="px-4 py-3 text-right font-medium text-gray-text">الصورة</th>
                <th className="px-4 py-3 text-right font-medium text-gray-text">الحالة</th>
                <th className="px-4 py-3 text-right font-medium text-gray-text">الترتيب</th>
                <th className="px-4 py-3 text-right font-medium text-gray-text">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-32" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-10 w-20 rounded" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-5 w-10" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-6" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-8" /></td>
                  </tr>
                ))
              ) : banners.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-text">
                    لا توجد بانرات
                  </td>
                </tr>
              ) : (
                banners.map((banner) => (
                  <tr key={banner.id} className="border-b border-border transition-colors hover:bg-surface/50">
                    <td className="px-4 py-3 font-medium text-white">{banner.title}</td>
                    <td className="max-w-[200px] truncate px-4 py-3 text-gray-text">
                      {banner.subtitle || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <img src={banner.image} alt="" className="h-10 w-20 rounded object-cover" />
                    </td>
                    <td className="px-4 py-3">
                      <Switch
                        checked={banner.isActive}
                        onCheckedChange={() => toggleActive(banner.id, banner.isActive)}
                      />
                    </td>
                    <td className="px-4 py-3 text-white">{banner.order}</td>
                    <td className="px-4 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(banner)}>
                            <Pencil className="ml-2 h-4 w-4" />
                            تعديل
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDelete(banner.id)} className="text-danger">
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
            <ModalTitle>{editing ? "تعديل البانر" : "إضافة بانر جديد"}</ModalTitle>
          </ModalHeader>
          <div className="space-y-4">
            <Input
              label="العنوان"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <Textarea
              label="الوصف"
              value={form.subtitle}
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
            />
            <Input
              label="رابط الصورة"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
            />
            <Input
              label="الرابط"
              value={form.link}
              onChange={(e) => setForm({ ...form, link: e.target.value })}
            />
            <Input
              label="الترتيب"
              type="number"
              value={form.order}
              onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
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
