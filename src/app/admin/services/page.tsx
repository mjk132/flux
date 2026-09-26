"use client";

import { useEffect, useState, useCallback } from "react";
import { authFetch } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { SERVICES } from "@/config/services";
import { formatDate } from "@/lib/utils";
import { Check, MessageCircle, Archive } from "lucide-react";

interface ServiceRequest {
  id: string;
  name: string;
  contact: string;
  serviceType: string;
  description: string;
  status: string;
  createdAt: string;
}

const statusLabels: Record<
  string,
  { label: string; variant: "info" | "warning" | "success" | "default" }
> = {
  NEW: { label: "جديد", variant: "info" },
  CONTACTED: { label: "تم التواصل", variant: "warning" },
  CLOSED: { label: "مغلق", variant: "success" },
};

const serviceTitles: Record<string, string> = Object.fromEntries(
  SERVICES.map((service) => [service.slug, service.title])
);

export default function AdminServiceRequests() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { success, error } = useToast();

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch("/api/services");
      const json = await res.json();
      setRequests(json.requests || []);
    } catch {
      /* empty */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  async function updateStatus(id: string, status: string) {
    setUpdatingId(id);
    try {
      const res = await authFetch(`/api/services/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        error("فشل تحديث الحالة", json.error || "تعذّر حفظ الحالة الجديدة");
        return;
      }
      setRequests((prev) =>
        prev.map((request) =>
          request.id === id ? { ...request, status: json.request.status } : request
        )
      );
      success("تم تحديث الحالة", statusLabels[status]?.label || status);
    } catch {
      error("فشل تحديث الحالة", "تعذّر الاتصال بالخادم");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">طلبات الخدمات</h1>
        <Button variant="secondary" onClick={fetchRequests} disabled={loading}>
          تحديث القائمة
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-right font-medium text-gray-text">التاريخ</th>
                <th className="px-4 py-3 text-right font-medium text-gray-text">الاسم</th>
                <th className="px-4 py-3 text-right font-medium text-gray-text">التواصل</th>
                <th className="px-4 py-3 text-right font-medium text-gray-text">نوع الخدمة</th>
                <th className="px-4 py-3 text-right font-medium text-gray-text">الحالة</th>
                <th className="px-4 py-3 text-right font-medium text-gray-text">الوصف</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-32" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-36" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-28" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-5 w-20" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-48" /></td>
                  </tr>
                ))
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-text">
                    لا توجد طلبات خدمات بعد
                  </td>
                </tr>
              ) : (
                requests.map((request) => {
                  const status = statusLabels[request.status] || {
                    label: request.status,
                    variant: "default" as const,
                  };
                  return (
                    <tr
                      key={request.id}
                      className="border-b border-border transition-colors hover:bg-surface/50"
                    >
                      <td className="px-4 py-3 text-gray-text">
                        {formatDate(request.createdAt)}
                      </td>
                      <td className="px-4 py-3 font-medium text-white">{request.name}</td>
                      <td className="px-4 py-3 text-gray-text" dir="auto">
                        {request.contact}
                      </td>
                      <td className="px-4 py-3 text-gray-text">
                        {serviceTitles[request.serviceType] || request.serviceType}
                      </td>
                      <td className="px-4 py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              disabled={updatingId === request.id}
                              aria-label={`تغيير حالة طلب ${request.name}`}
                              className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-purple-accent/50 disabled:opacity-50"
                            >
                              <Badge variant={status.variant}>{status.label}</Badge>
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => updateStatus(request.id, "NEW")}
                            >
                              <Check className="ml-2 h-4 w-4" />
                              جديد
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => updateStatus(request.id, "CONTACTED")}
                            >
                              <MessageCircle className="ml-2 h-4 w-4" />
                              تم التواصل
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => updateStatus(request.id, "CLOSED")}
                            >
                              <Archive className="ml-2 h-4 w-4" />
                              مغلق
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                      <td
                        className="max-w-[280px] truncate px-4 py-3 text-gray-text"
                        title={request.description}
                      >
                        {request.description}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
