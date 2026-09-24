import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

function json(data: Record<string, unknown>, status = 200) {
  return NextResponse.json(data, { status });
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return json({ success: false, error: "Unauthorized" }, 401);
    }

    if (session.role !== "ADMIN" && session.role !== "OWNER") {
      return json({ success: false, error: "Forbidden" }, 403);
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalRevenue,
      todayRevenue,
      weekRevenue,
      monthRevenue,
      lastMonthRevenue,
      totalOrders,
      pendingOrders,
      completedOrders,
      totalCustomers,
      totalProducts,
      lowStockProducts,
      recentOrders,
      salesByCategory,
      recentPaidOrders,
    ] = await Promise.all([
      prisma.order.aggregate({
        where: { status: { in: ["PAID", "PROCESSING", "COMPLETED"] } },
        _sum: { total: true },
      }),
      prisma.order.aggregate({
        where: {
          status: { in: ["PAID", "PROCESSING", "COMPLETED"] },
          createdAt: { gte: todayStart },
        },
        _sum: { total: true },
      }),
      prisma.order.aggregate({
        where: {
          status: { in: ["PAID", "PROCESSING", "COMPLETED"] },
          createdAt: { gte: weekAgo },
        },
        _sum: { total: true },
      }),
      prisma.order.aggregate({
        where: {
          status: { in: ["PAID", "PROCESSING", "COMPLETED"] },
          createdAt: { gte: monthAgo },
        },
        _sum: { total: true },
      }),
      prisma.order.aggregate({
        where: {
          status: { in: ["PAID", "PROCESSING", "COMPLETED"] },
          createdAt: { gte: lastMonthStart, lte: lastMonthEnd },
        },
        _sum: { total: true },
      }),
      prisma.order.count(),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.count({ where: { status: "COMPLETED" } }),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.product.count(),
      prisma.product.findMany({
        where: { status: "PUBLISHED", stock: { lte: 5 } },
        select: { id: true, name: true, slug: true, stock: true, productType: true },
        orderBy: { stock: "asc" },
        take: 10,
      }),
      prisma.order.findMany({
        include: {
          items: {
            include: {
              product: {
                select: { id: true, name: true, slug: true },
              },
            },
          },
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.orderItem.groupBy({
        by: ["productId"],
        where: {
          order: {
            status: { in: ["PAID", "PROCESSING", "COMPLETED"] },
          },
        },
        _sum: { total: true, quantity: true },
        _count: { id: true },
        orderBy: { _sum: { total: "desc" } },
        take: 10,
      }),
      prisma.order.findMany({
        where: {
          status: { in: ["PAID", "PROCESSING", "COMPLETED"] },
          createdAt: { gte: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000) },
        },
        select: { createdAt: true, total: true },
      }),
    ]);

    const lastMonthTotal = lastMonthRevenue._sum.total || 0;
    const currentMonthTotal = monthRevenue._sum.total || 0;
    const revenueGrowth = lastMonthTotal > 0
      ? Math.round(((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100)
      : currentMonthTotal > 0 ? 100 : 0;

    const topProducts = await Promise.all(
      salesByCategory.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { id: true, name: true, slug: true, price: true, productType: true },
        });
        return {
          product,
          totalSold: item._sum.quantity || 0,
          revenue: item._sum.total || 0,
        };
      })
    );

    const categoryRevenue = await prisma.orderItem.groupBy({
      by: ["productId"],
      where: {
        order: { status: { in: ["PAID", "PROCESSING", "COMPLETED"] } },
      },
      _sum: { total: true },
    });

    const productIds = categoryRevenue.map((c) => c.productId);
    const categoryProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, categoryId: true, category: { select: { id: true, name: true } } },
    });

    const categoryIdToName = new Map(
      categoryProducts.map((p) => [p.categoryId, p.category.name])
    );

    const categoryMap = new Map<string, number>();
    for (const item of categoryRevenue) {
      const product = categoryProducts.find((p) => p.id === item.productId);
      if (product) {
        const catName = categoryIdToName.get(product.categoryId) || "Uncategorized";
        categoryMap.set(catName, (categoryMap.get(catName) || 0) + (item._sum.total || 0));
      }
    }

    const salesByCategoryData = Array.from(categoryMap.entries()).map(([name, revenue]) => ({
      category: name,
      revenue: Math.round(revenue * 100) / 100,
    }));

    const revenueTrend: { date: string; revenue: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = day.toLocaleDateString("en-CA");
      const total = recentPaidOrders
        .filter(
          (o) =>
            new Date(o.createdAt).toLocaleDateString("en-CA") === key
        )
        .reduce((sum, o) => sum + o.total, 0);
      revenueTrend.push({
        date: day.toLocaleDateString("ar-EG", { day: "numeric", month: "short" }),
        revenue: Math.round(total * 100) / 100,
      });
    }

    return json({
      success: true,
      data: {
        totalRevenue: totalRevenue._sum.total || 0,
        todayRevenue: todayRevenue._sum.total || 0,
        weekRevenue: weekRevenue._sum.total || 0,
        monthRevenue: monthRevenue._sum.total || 0,
        revenueGrowth,
        totalOrders,
        pendingOrders,
        completedOrders,
        totalCustomers,
        totalProducts,
        lowStockProducts,
        recentOrders,
        topProducts: topProducts.filter((p) => p.product),
        salesByCategory: salesByCategoryData,
        revenueTrend,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return json({ success: false, error: "Internal server error" }, 500);
  }
}
