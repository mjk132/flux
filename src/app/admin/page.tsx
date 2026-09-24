"use client";

import { useEffect, useState } from "react";
import { authFetch } from "@/store/auth";
import { formatPrice, formatDate } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertTriangle,
  CalendarDays,
  Zap,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface DashboardData {
  totalRevenue: number;
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  revenueGrowth: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalCustomers: number;
  totalProducts: number;
  lowStockProducts: Array<{ id: string; name: string; stock: number }>;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    customerName: string;
    total: number;
    status: string;
    createdAt: string;
  }>;
  topProducts: Array<{
    product: { id: string; name: string; price: number };
    totalSold: number;
    revenue: number;
  }>;
  salesByCategory: Array<{ category: string; revenue: number }>;
  revenueTrend: Array<{ date: string; revenue: number }>;
}

const CHART_COLORS = ["#8b5cf6", "#a78bfa", "#c4b5fd", "#7c3aed", "#6d28d9"];

function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  color,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: number;
  color: string;
}) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-text">{title}</p>
          <p className="mt-1 text-2xl font-bold text-white">{value}</p>
          {trend !== undefined && (
            <div
              className={`mt-1 flex items-center gap-1 text-xs ${trend >= 0 ? "text-success" : "text-danger"}`}
            >
              {trend >= 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <span>{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
        <div className={`rounded-lg p-3 ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </Card>
  );
}

function StatsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i}>
          <Skeleton className="h-20 w-full" />
        </Card>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await authFetch("/api/dashboard/stats");
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        } else {
          setError(json.error || "Failed to load dashboard");
        }
      } catch {
        setError("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">لوحة التحكم</h1>
        <StatsSkeleton />
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <Skeleton className="h-80 w-full" />
          </Card>
          <Card>
            <Skeleton className="h-80 w-full" />
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-danger">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  const statusMap: Record<string, { label: string; variant: "success" | "warning" | "danger" | "info" | "default" }> = {
    PENDING: { label: "قيد الانتظار", variant: "warning" },
    PAID: { label: "مدفوع", variant: "info" },
    PROCESSING: { label: "قيد المعالجة", variant: "info" },
    COMPLETED: { label: "مكتمل", variant: "success" },
    CANCELLED: { label: "ملغي", variant: "danger" },
    REFUNDED: { label: "مسترد", variant: "default" },
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">لوحة التحكم</h1>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="إجمالي الإيرادات"
          value={formatPrice(data.totalRevenue)}
          icon={DollarSign}
          trend={data.revenueGrowth}
          color="bg-purple-accent"
        />
        <StatsCard
          title="إيرادات اليوم"
          value={formatPrice(data.todayRevenue)}
          icon={Zap}
          color="bg-violet-600"
        />
        <StatsCard
          title="إيرادات الأسبوع"
          value={formatPrice(data.weekRevenue)}
          icon={CalendarDays}
          color="bg-indigo-600"
        />
        <StatsCard
          title="إيرادات الشهر"
          value={formatPrice(data.monthRevenue)}
          icon={TrendingUp}
          color="bg-blue-600"
        />
        <StatsCard
          title="إجمالي الطلبات"
          value={data.totalOrders.toString()}
          icon={ShoppingBag}
          color="bg-emerald-600"
        />
        <StatsCard
          title="طلبات معلقة"
          value={data.pendingOrders.toString()}
          icon={Clock}
          color="bg-amber-600"
        />
        <StatsCard
          title="العملاء"
          value={data.totalCustomers.toString()}
          icon={Users}
          color="bg-cyan-600"
        />
        <StatsCard
          title="المنتجات"
          value={data.totalProducts.toString()}
          icon={Package}
          color="bg-rose-600"
        />
      </div>

      {/* Low stock alert */}
      {data.lowStockProducts.length > 0 && (
        <Card className="border-warning/30 bg-warning/5">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <div>
              <p className="font-medium text-warning">تنبيه: مخزون منخفض</p>
              <p className="text-sm text-gray-text">
                {data.lowStockProducts.length} منتجات بمخزون منخفض
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>الإيرادات - آخر 7 أيام</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.revenueTrend || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1c1330" />
                  <XAxis dataKey="date" stroke="#6f6394" fontSize={12} />
                  <YAxis stroke="#6f6394" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#160e26",
                      border: "1px solid #1c1330",
                      borderRadius: "10px",
                      color: "#fff",
                    }}
                    labelStyle={{ color: "#a293c4" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Sales by Category */}
        <Card>
          <CardHeader>
            <CardTitle>المبيعات حسب الفئة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              {data.salesByCategory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.salesByCategory}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="revenue"
                      nameKey="category"
                    >
                      {data.salesByCategory.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#160e26",
                        border: "1px solid #1c1330",
                        borderRadius: "10px",
                        color: "#fff",
                      }}
                      labelStyle={{ color: "#a293c4" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-gray-text">
                  لا توجد بيانات مبيعات
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Products & Recent Orders */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>المنتجات الأكثر مبيعاً</CardTitle>
          </CardHeader>
          <CardContent>
            {data.topProducts.length > 0 ? (
              <div className="space-y-3">
                {data.topProducts.slice(0, 5).map((item, i) => (
                  <div
                    key={item.product.id}
                    className="flex items-center justify-between rounded-lg bg-deep-purple/50 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-accent/20 text-xs font-bold text-purple-accent">
                        {i + 1}
                      </span>
                      <span className="text-sm text-white">
                        {item.product.name}
                      </span>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-white">
                        {formatPrice(item.revenue)}
                      </p>
                      <p className="text-xs text-gray-text">
                        {item.totalSold} مبيعة
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-gray-text">
                لا توجد بيانات منتجات
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>الطلبات الأخيرة</CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentOrders.length > 0 ? (
              <div className="space-y-3">
                {data.recentOrders.slice(0, 5).map((order) => {
                  const st = statusMap[order.status] || {
                    label: order.status,
                    variant: "default" as const,
                  };
                  return (
                    <div
                      key={order.id}
                      className="flex items-center justify-between rounded-lg bg-deep-purple/50 p-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-white">
                          {order.orderNumber}
                        </p>
                        <p className="text-xs text-gray-text">
                          {order.customerName}
                        </p>
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-white">
                          {formatPrice(order.total)}
                        </p>
                        <Badge variant={st.variant}>{st.label}</Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="py-8 text-center text-gray-text">
                لا توجد طلبات بعد
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
