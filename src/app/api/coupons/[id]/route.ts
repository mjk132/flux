import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

function json(data: Record<string, unknown>, status = 200) {
  return NextResponse.json(data, { status });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return json({ success: false, error: "Unauthorized" }, 401);
    }

    if (session.role !== "ADMIN" && session.role !== "OWNER") {
      return json({ success: false, error: "Forbidden" }, 403);
    }

    const { id } = await params;
    const coupon = await prisma.coupon.findUnique({
      where: { id },
      include: {
        products: {
          include: { product: { select: { id: true, name: true, slug: true } } },
        },
        usages: {
          include: { user: { select: { id: true, name: true, email: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!coupon) {
      return json({ success: false, error: "Coupon not found" }, 404);
    }

    return json({ success: true, data: coupon });
  } catch (error) {
    console.error("Coupon GET error:", error);
    return json({ success: false, error: "Internal server error" }, 500);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return json({ success: false, error: "Unauthorized" }, 401);
    }

    if (session.role !== "ADMIN" && session.role !== "OWNER") {
      return json({ success: false, error: "Forbidden" }, 403);
    }

    const { id } = await params;
    const body = await req.json();
    const { code, discount, isPercentage, minimumOrder, maximumUses, isActive, expiresAt, product_ids } = body;

    const existing = await prisma.coupon.findUnique({ where: { id } });
    if (!existing) {
      return json({ success: false, error: "Coupon not found" }, 404);
    }

    if (code && code.toUpperCase() !== existing.code) {
      const duplicate = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
      if (duplicate) {
        return json({ success: false, error: "Coupon code already exists" }, 400);
      }
    }

    if (isPercentage && discount && discount > 100) {
      return json({ success: false, error: "Percentage discount cannot exceed 100" }, 400);
    }

    const coupon = await prisma.$transaction(async (tx) => {
      const updatedCoupon = await tx.coupon.update({
        where: { id },
        data: {
          ...(code && { code: code.toUpperCase() }),
          ...(typeof discount === "number" && { discount }),
          ...(typeof isPercentage === "boolean" && { isPercentage }),
          ...(typeof minimumOrder === "number" && { minimumOrder }),
          ...(typeof maximumUses === "number" && { maximumUses }),
          ...(typeof isActive === "boolean" && { isActive }),
          ...(expiresAt !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null }),
        },
      });

      if (Array.isArray(product_ids)) {
        await tx.couponProduct.deleteMany({ where: { couponId: id } });
        if (product_ids.length > 0) {
          await tx.couponProduct.createMany({
            data: product_ids.map((productId: string) => ({
              couponId: id,
              productId,
            })),
          });
        }
      }

      return updatedCoupon;
    });

    return json({ success: true, data: coupon });
  } catch (error) {
    console.error("Coupon PUT error:", error);
    return json({ success: false, error: "Internal server error" }, 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return json({ success: false, error: "Unauthorized" }, 401);
    }

    if (session.role !== "ADMIN" && session.role !== "OWNER") {
      return json({ success: false, error: "Forbidden" }, 403);
    }

    const { id } = await params;
    const coupon = await prisma.coupon.findUnique({ where: { id } });
    if (!coupon) {
      return json({ success: false, error: "Coupon not found" }, 404);
    }

    await prisma.coupon.delete({ where: { id } });

    return json({ success: true, message: "Coupon deleted successfully" });
  } catch (error) {
    console.error("Coupon DELETE error:", error);
    return json({ success: false, error: "Internal server error" }, 500);
  }
}
