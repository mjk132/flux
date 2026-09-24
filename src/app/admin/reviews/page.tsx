"use client";

import { useEffect, useState, useCallback } from "react";
import { authFetch } from "@/store/auth";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
import { Star, Check, EyeOff, Trash2 } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  status: string;
  createdAt: string;
  user: { id: string; name: string; avatar: string | null };
  product: { id: string; name: string; slug: string };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const statusLabels: Record<string, { label: string; variant: "success" | "warning" | "danger" | "info" | "default" }> = {
  PENDING: { label: "قيد المراجعة", variant: "warning" },
  APPROVED: { label: "موافق عليه", variant: "success" },
  HIDDEN: { label: "مخفي", variant: "default" },
};

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchReviews = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: "10" });
      const res = await authFetch(`/api/reviews?${params}`);
      const json = await res.json();
      let data = json.data || [];
      if (statusFilter !== "all") {
        data = data.filter((r: Review) => r.status === statusFilter);
      }
      setReviews(data);
      setPagination(json.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 });
    } catch {
      /* empty */
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchReviews(1);
  }, [fetchReviews]);

  async function updateStatus(id: string, status: string) {
    try {
      await authFetch(`/api/reviews/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      fetchReviews(pagination.page);
    } catch {
      /* empty */
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("هل أنت متأكد من حذف هذا التقييم؟")) return;
    try {
      await authFetch(`/api/reviews/${id}`, { method: "DELETE" });
      fetchReviews(pagination.page);
    } catch {
      /* empty */
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">التقييمات</h1>

      <div className="flex items-center gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الحالات</SelectItem>
            <SelectItem value="PENDING">قيد المراجعة</SelectItem>
            <SelectItem value="APPROVED">موافق عليه</SelectItem>
            <SelectItem value="HIDDEN">مخفي</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-right font-medium text-gray-text">المنتج</th>
                <th className="px-4 py-3 text-right font-medium text-gray-text">العميل</th>
                <th className="px-4 py-3 text-right font-medium text-gray-text">التقييم</th>
                <th className="px-4 py-3 text-right font-medium text-gray-text">التعليق</th>
                <th className="px-4 py-3 text-right font-medium text-gray-text">الحالة</th>
                <th className="px-4 py-3 text-right font-medium text-gray-text">التاريخ</th>
                <th className="px-4 py-3 text-right font-medium text-gray-text">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-32" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-5 w-16 rounded-full" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                  </tr>
                ))
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-text">
                    لا توجد تقييمات
                  </td>
                </tr>
              ) : (
                reviews.map((review) => {
                  const st = statusLabels[review.status] || { label: review.status, variant: "default" as const };
                  return (
                    <tr key={review.id} className="border-b border-border transition-colors hover:bg-surface/50">
                      <td className="max-w-[150px] truncate px-4 py-3 font-medium text-white">
                        {review.product?.name || "-"}
                      </td>
                      <td className="px-4 py-3 text-white">{review.user?.name || "-"}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3.5 w-3.5 ${i < review.rating ? "fill-warning text-warning" : "text-gray-text/30"}`}
                            />
                          ))}
                        </div>
                      </td>
                      <td className="max-w-[200px] truncate px-4 py-3 text-gray-text">
                        {review.comment || "-"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={st.variant}>{st.label}</Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-text">{formatDate(review.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {review.status !== "APPROVED" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateStatus(review.id, "APPROVED")}
                              title="موافقة"
                            >
                              <Check className="h-4 w-4 text-success" />
                            </Button>
                          )}
                          {review.status !== "HIDDEN" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateStatus(review.id, "HIDDEN")}
                              title="إخفاء"
                            >
                              <EyeOff className="h-4 w-4 text-gray-text" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(review.id)}
                            title="حذف"
                          >
                            <Trash2 className="h-4 w-4 text-danger" />
                          </Button>
                        </div>
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
        onPageChange={fetchReviews}
      />
    </div>
  );
}
