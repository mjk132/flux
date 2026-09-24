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

    const { searchParams } = new URL(req.url);
    const product_id = searchParams.get("product_id");
    const status = searchParams.get("status") as "AVAILABLE" | "USED" | "RESERVED" | null;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));
    const skip = (page - 1) * limit;

    if (!product_id) {
      return json({ success: false, error: "product_id is required" }, 400);
    }

    const where: Record<string, unknown> = { productId: product_id };
    if (status) where.status = status;

    const [items, total, stats] = await Promise.all([
      prisma.inventory.findMany({
        where,
        include: {
          order: {
            select: { id: true, orderNumber: true, customerName: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.inventory.count({ where }),
      prisma.inventory.groupBy({
        by: ["status"],
        where: { productId: product_id },
        _count: { status: true },
      }),
    ]);

    const statusCounts: Record<string, number> = { AVAILABLE: 0, USED: 0, RESERVED: 0 };
    for (const entry of stats) {
      statusCounts[entry.status] = entry._count.status;
    }

    return json({
      success: true,
      data: items,
      stats: statusCounts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Inventory GET error:", error);
    return json({ success: false, error: "Internal server error" }, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return json({ success: false, error: "Unauthorized" }, 401);
    }

    if (session.role !== "ADMIN" && session.role !== "OWNER") {
      return json({ success: false, error: "Forbidden" }, 403);
    }

    const body = await req.json();
    const { product_id, codes } = body;

    if (!product_id) {
      return json({ success: false, error: "product_id is required" }, 400);
    }

    if (!codes || !Array.isArray(codes) || codes.length === 0) {
      return json({ success: false, error: "codes array is required" }, 400);
    }

    const product = await prisma.product.findUnique({ where: { id: product_id } });
    if (!product) {
      return json({ success: false, error: "Product not found" }, 404);
    }

    const normalizedCodes = codes.map((c: string) => c.trim()).filter((c: string) => c.length > 0);

    if (normalizedCodes.length === 0) {
      return json({ success: false, error: "No valid codes provided" }, 400);
    }

    const existingCodes = await prisma.inventory.findMany({
      where: {
        productId: product_id,
        code: { in: normalizedCodes },
      },
      select: { code: true },
    });

    const existingCodeSet = new Set(existingCodes.map((c) => c.code));
    const newCodes = normalizedCodes.filter((c: string) => !existingCodeSet.has(c));
    const duplicateCount = normalizedCodes.length - newCodes.length;

    if (newCodes.length === 0) {
      return json({ success: false, error: "All codes already exist" }, 400);
    }

    const created = await prisma.inventory.createMany({
      data: newCodes.map((code: string) => ({
        productId: product_id,
        code,
        status: "AVAILABLE" as const,
      })),
    });

    await prisma.product.update({
      where: { id: product_id },
      data: { stock: { increment: newCodes.length } },
    });

    return json({
      success: true,
      data: {
        created: created.count,
        duplicates_skipped: duplicateCount,
      },
      message: `${created.count} codes added${duplicateCount > 0 ? `, ${duplicateCount} duplicates skipped` : ""}`,
    }, 201);
  } catch (error) {
    console.error("Inventory POST error:", error);
    return json({ success: false, error: "Internal server error" }, 500);
  }
}
