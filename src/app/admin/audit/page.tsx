"use client";

import { useEffect, useState, useCallback } from "react";
import { authFetch } from "@/store/auth";
import { formatDate } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { FileText, Search } from "lucide-react";

interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  ip_address: string | null;
  createdAt: string;
  user: { id: string; name: string; email: string } | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const actionLabels: Record<string, string> = {
  CREATE: "إنشاء",
  UPDATE: "تحديث",
  DELETE: "حذف",
  LOGIN: "تسجيل دخول",
  LOGOUT: "تسجيل خروج",
};

const entityLabels: Record<string, string> = {
  Product: "منتج",
  Order: "طلب",
  User: "مستخدم",
  Category: "فئة",
  Coupon: "كوبون",
  Review: "تقييم",
  Banner: "بانر",
  FAQ: "سؤال شائع",
  Setting: "إعداد",
  Notification: "إشعار",
};

export default function AdminAudit() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [entityFilter, setEntityFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchLogs = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: "20" });
      if (entityFilter !== "all") params.set("entity", entityFilter);
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      const res = await authFetch(`/api/admin/audit?${params}`);
      const json = await res.json();
      setLogs(json.logs || []);
      setPagination(json.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 });
    } catch {
      /* empty */
    } finally {
      setLoading(false);
    }
  }, [entityFilter, startDate, endDate]);

  useEffect(() => {
    fetchLogs(1);
  }, [fetchLogs]);

  const entities = [...new Set(logs.map((l) => l.entity))];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">سجل التدقيق</h1>

      <div className="flex flex-wrap items-center gap-3">
        <Select value={entityFilter} onValueChange={setEntityFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="الكيان" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الكيانات</SelectItem>
            {entities.map((e) => (
              <SelectItem key={e} value={e}>
                {entityLabels[e] || e}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-40"
        />
        <Input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-40"
        />
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-right font-medium text-gray-text">المستخدم</th>
                <th className="px-4 py-3 text-right font-medium text-gray-text">العملية</th>
                <th className="px-4 py-3 text-right font-medium text-gray-text">الكيان</th>
                <th className="px-4 py-3 text-right font-medium text-gray-text">التفاصيل</th>
                <th className="px-4 py-3 text-right font-medium text-gray-text">الوقت</th>
                <th className="px-4 py-3 text-right font-medium text-gray-text">IP</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-12" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-32" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-text">
                    <FileText className="mx-auto mb-2 h-8 w-8 text-gray-text/30" />
                    لا توجد سجلات تدقيق
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="border-b border-border transition-colors hover:bg-surface/50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">{log.user?.name || "غير معروف"}</p>
                      <p className="text-xs text-gray-text">{log.user?.email || ""}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        log.action === "CREATE"
                          ? "bg-success/10 text-success"
                          : log.action === "DELETE"
                            ? "bg-danger/10 text-danger"
                            : "bg-info/10 text-info"
                      }`}>
                        {actionLabels[log.action] || log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white">{entityLabels[log.entity] || log.entity}</td>
                    <td className="max-w-[200px] truncate px-4 py-3 font-mono text-xs text-gray-text">
                      {log.entityId?.slice(0, 8)}...
                    </td>
                    <td className="px-4 py-3 text-gray-text">{formatDate(log.createdAt)}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-text">
                      {log.ip_address || "-"}
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
        onPageChange={fetchLogs}
      />
    </div>
  );
}
