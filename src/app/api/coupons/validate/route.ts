import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function json(data: Record<string, unknown>, status = 200) {
  return NextResponse.json(data, { status });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, subtotal } = body;

    if (!code || typeof code !== "string") {
      return json({ success: false, error: "Coupon code is required" }, 400);
    }

    if (typeof subtotal !== "number" || subtotal < 0) {
      return json({ success: false, error: "Valid subtotal is required" }, 400);
    }

    const coupon = await prisma.coupon.findFirst({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      return json({ success: false, error: "Invalid coupon code" }, 404);
    }

    if (!coupon.isActive) {
      return json({ success: false, error: "Coupon is not active" }, 400);
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return json({ success: false, error: "Coupon has expired" }, 400);
    }

    if (coupon.maximumUses && coupon.usedCount >= coupon.maximumUses) {
      return json({ success: false, error: "Coupon usage limit reached" }, 400);
    }

    if (coupon.minimumOrder && subtotal < coupon.minimumOrder) {
      return json({
        success: false,
        error: `Minimum order amount is $${coupon.minimumOrder}`,
      }, 400);
    }

    let discount = 0;
    if (coupon.isPercentage) {
      discount = Math.round((subtotal * coupon.discount / 100) * 100) / 100;
    } else {
      discount = Math.min(coupon.discount, subtotal);
    }

    return json({
      success: true,
      data: {
        coupon_id: coupon.id,
        code: coupon.code,
        discount_type: coupon.isPercentage ? "PERCENTAGE" : "FIXED",
        discount_value: coupon.discount,
        discount_amount: discount,
        total_after_discount: Math.round((subtotal - discount) * 100) / 100,
      },
    });
  } catch (error) {
    console.error("Coupon validate error:", error);
    return json({ success: false, error: "Internal server error" }, 500);
  }
}
