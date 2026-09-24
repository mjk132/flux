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
import { Plus, MoreHorizontal, Pencil, Trash2, ChevronUp, ChevronDown } from "lucide-react";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  isActive: boolean;
  order: number;
  createdAt: string;
}

const emptyForm = {
  question: "",
  answer: "",
  category: "",
  isActive: true,
  order: 0,
};

export default function AdminFAQ() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<FAQ | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchFaqs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch("/api/admin/faq");
      const json = await res.json();
      setFaqs(json.faqs || []);
    } catch {
      /* empty */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(faq: FAQ) {
    setEditing(faq);
    setForm({
      question: faq.question,
      answer: faq.answer,
      category: faq.category || "",
      isActive: faq.isActive,
      order: faq.order,
    });
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.question.trim() || !form.answer.trim()) return;
    setSaving(true);
    try {
      const body = { ...form, category: form.category || null };
      if (editing) {
        await authFetch(`/api/admin/faq/${editing.id}`, {
          method: "PUT",
          body: JSON.stringify(body),
        });
      } else {
        await authFetch("/api/admin/faq", {
          method: "POST",
          body: JSON.stringify(body),
        });
      }
      setModalOpen(false);
      fetchFaqs();
    } catch {
      /* empty */
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("هل أنت متأكد من حذف هذا السؤال؟")) return;
    try {
      await authFetch(`/api/admin/faq/${id}`, { method: "DELETE" });
      fetchFaqs();
    } catch {
      /* empty */
    }
  }

  async function toggleActive(id: string, current: boolean) {
    try {
      await authFetch(`/api/admin/faq/${id}`, {
        method: "PUT",
        body: JSON.stringify({ isActive: !current }),
      });
      fetchFaqs();
    } catch {
      /* empty */
    }
  }

  async function moveOrder(id: string, currentOrder: number, direction: "up" | "down") {
    const newOrder = direction === "up" ? currentOrder - 1 : currentOrder + 1;
    if (newOrder < 0) return;
    try {
      await authFetch(`/api/admin/faq/${id}`, {
        method: "PUT",
        body: JSON.stringify({ order: newOrder }),
      });
      fetchFaqs();
    } catch {
      /* empty */
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">الأسئلة الشائعة</h1>
        <Button onClick={openCreate}>
          <Plus className="ml-2 h-4 w-4" />
          إضافة سؤال
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-right font-medium text-gray-text"></th>
                <th className="px-4 py-3 text-right font-medium text-gray-text">السؤال</th>
                <th className="px-4 py-3 text-right font-medium text-gray-text">الإجابة</th>
                <th className="px-4 py-3 text-right font-medium text-gray-text">الترتيب</th>
                <th className="px-4 py-3 text-right font-medium text-gray-text">الحالة</th>
                <th className="px-4 py-3 text-right font-medium text-gray-text">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    <td className="px-4 py-3"><Skeleton className="h-4 w-8" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-40" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-48" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-6" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-5 w-10" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-8" /></td>
                  </tr>
                ))
              ) : faqs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-text">
                    لا توجد أسئلة شائعة
                  </td>
                </tr>
              ) : (
                faqs.map((faq, index) => (
                  <tr key={faq.id} className="border-b border-border transition-colors hover:bg-surface/50">
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <button
                          onClick={() => moveOrder(faq.id, faq.order, "up")}
                          disabled={index === 0}
                          className="text-gray-text hover:text-white disabled:opacity-30"
                        >
                          <ChevronUp className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => moveOrder(faq.id, faq.order, "down")}
                          disabled={index === faqs.length - 1}
                          className="text-gray-text hover:text-white disabled:opacity-30"
                        >
                          <ChevronDown className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                    <td className="max-w-[200px] truncate px-4 py-3 font-medium text-white">
                      {faq.question}
                    </td>
                    <td className="max-w-[250px] truncate px-4 py-3 text-gray-text">
                      {faq.answer}
                    </td>
                    <td className="px-4 py-3 text-white">{faq.order}</td>
                    <td className="px-4 py-3">
                      <Switch
                        checked={faq.isActive}
                        onCheckedChange={() => toggleActive(faq.id, faq.isActive)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(faq)}>
                            <Pencil className="ml-2 h-4 w-4" />
                            تعديل
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDelete(faq.id)} className="text-danger">
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
            <ModalTitle>{editing ? "تعديل السؤال" : "إضافة سؤال جديد"}</ModalTitle>
          </ModalHeader>
          <div className="space-y-4">
            <Input
              label="السؤال"
              value={form.question}
              onChange={(e) => setForm({ ...form, question: e.target.value })}
            />
            <Textarea
              label="الإجابة"
              value={form.answer}
              onChange={(e) => setForm({ ...form, answer: e.target.value })}
            />
            <Input
              label="الفئة (اختياري)"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="مثال: الدفع والشحن"
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
