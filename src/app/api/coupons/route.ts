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
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;
    const search = searchParams.get("search") || "";

    const where = search
      ? { code: { contains: search, mode: "insensitive" as const } }
      : {};

    const [coupons, total] = await Promise.all([
      prisma.coupon.findMany({
        where,
        include: {
          products: {
            include: { product: { select: { id: true, name: true, slug: true } } },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.coupon.count({ where }),
    ]);

    return json({
      success: true,
      data: coupons,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Coupons GET error:", error);
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
    const {
      code,
      discount,
      isPercentage,
      minimumOrder,
      maximumUses,
      isActive,
      expiresAt,
      product_ids,
    } = body;

    if (!code || typeof discount !== "number" || discount <= 0) {
      return json({ success: false, error: "Invalid coupon data" }, 400);
    }

    if (isPercentage && discount > 100) {
      return json({ success: false, error: "Percentage discount cannot exceed 100" }, 400);
    }

    const existing = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
    if (existing) {
      return json({ success: false, error: "Coupon code already exists" }, 400);
    }

    const coupon = await prisma.$transaction(async (tx) => {
      const newCoupon = await tx.coupon.create({
        data: {
          code: code.toUpperCase(),
          discount,
          isPercentage: isPercentage !== false,
          minimumOrder: minimumOrder || null,
          maximumUses: maximumUses || null,
          isActive: isActive !== false,
          expiresAt: expiresAt ? new Date(expiresAt) : null,
        },
      });

      if (product_ids && Array.isArray(product_ids) && product_ids.length > 0) {
        await tx.couponProduct.createMany({
          data: product_ids.map((productId: string) => ({
            couponId: newCoupon.id,
            productId,
          })),
        });
      }

      return newCoupon;
    });

    return json({ success: true, data: coupon }, 201);
  } catch (error) {
    console.error("Coupon POST error:", error);
    return json({ success: false, error: "Internal server error" }, 500);
  }
}
