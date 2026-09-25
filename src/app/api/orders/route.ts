import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { revalidateStorefront } from "@/lib/storefront-cache";
import { generateOrderNumber } from "@/lib/utils";
import {
  storeImage,
  MAX_IMAGE_BYTES,
  ALLOWED_IMAGE_TYPES,
} from "@/lib/upload";

function json(data: Record<string, unknown>, status = 200) {
  return NextResponse.json(data, { status });
}

async function saveProofFile(file: File, orderNumber: string): Promise<string> {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Proof must be a JPG, PNG or WEBP image");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Proof image must be smaller than 5MB");
  }
  // Stores to Vercel Blob when deployed, or public/uploads/proofs locally.
  return storeImage(file, "proofs", `${orderNumber}-`);
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return json({ success: false, error: "Unauthorized" }, 401);
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));
    const skip = (page - 1) * limit;

    const isAdmin = session.role === "ADMIN" || session.role === "OWNER";

    const where = isAdmin ? {} : { userId: session.id };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: {
                select: { id: true, name: true, slug: true, productType: true },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Orders GET error:", error);
    return json({ success: false, error: "Internal server error" }, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return json({ success: false, error: "Unauthorized" }, 401);
    }

    const form = await req.formData();
    const itemsRaw = form.get("items");
    const customerName = String(form.get("customerName") || "").trim();
    const customerEmail = String(form.get("customerEmail") || "").trim();
    const customerPhone = String(form.get("customerPhone") || "").trim();
    const notes = String(form.get("notes") || "").trim();
    const couponCode = String(form.get("couponCode") || "").trim();
    const paymentMethod = String(form.get("paymentMethod") || "paypal").trim();
    const proof = form.get("proof");

    let items: Array<{ product_id: string; quantity: number }>;
    try {
      items = JSON.parse(String(itemsRaw || "[]"));
    } catch {
      return json({ success: false, error: "Invalid items" }, 400);
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return json({ success: false, error: "No items provided" }, 400);
    }

    if (!customerName || !customerEmail) {
      return json({ success: false, error: "Name and email are required" }, 400);
    }

    if (paymentMethod !== "paypal") {
      return json({ success: false, error: "Unsupported payment method" }, 400);
    }

    if (!(proof instanceof File) || proof.size === 0) {
      return json({ success: false, error: "Payment proof screenshot is required" }, 400);
    }

    const productIds = items.map((item) => item.product_id);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, status: "PUBLISHED" },
      include: {
        images: { select: { url: true }, take: 1, orderBy: { sortOrder: "asc" } },
      },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    let subtotal = 0;
    const orderItemsData: Array<{
      productId: string;
      quantity: number;
      price: number;
      total: number;
    }> = [];

    for (const item of items) {
      const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));
      const product = productMap.get(item.product_id);
      if (!product) {
        return json({ success: false, error: `Product ${item.product_id} not found or unavailable` }, 400);
      }

      if (product.stock < quantity) {
        return json({ success: false, error: `Insufficient stock for ${product.name}` }, 400);
      }

      const price = product.discount > 0
        ? product.price * (1 - product.discount / 100)
        : product.price;
      const total = Math.round(price * quantity * 100) / 100;
      subtotal += total;

      orderItemsData.push({
        productId: product.id,
        quantity,
        price: Math.round(price * 100) / 100,
        total,
      });
    }

    subtotal = Math.round(subtotal * 100) / 100;

    let discount = 0;
    let couponCodeUsed: string | null = null;

    if (couponCode) {
      const coupon = await prisma.coupon.findFirst({
        where: {
          code: couponCode.toUpperCase(),
          isActive: true,
        },
      });

      if (!coupon) {
        return json({ success: false, error: "Invalid coupon code" }, 400);
      }

      if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
        return json({ success: false, error: "Coupon has expired" }, 400);
      }

      if (coupon.maximumUses && coupon.usedCount >= coupon.maximumUses) {
        return json({ success: false, error: "Coupon usage limit reached" }, 400);
      }

      if (coupon.minimumOrder && subtotal < coupon.minimumOrder) {
        return json({ success: false, error: `Minimum order amount is $${coupon.minimumOrder}` }, 400);
      }

      if (coupon.isPercentage) {
        discount = Math.round((subtotal * coupon.discount / 100) * 100) / 100;
      } else {
        discount = Math.min(coupon.discount, subtotal);
      }

      discount = Math.round(discount * 100) / 100;
      couponCodeUsed = coupon.code;
    }

    const total = Math.round((subtotal - discount) * 100) / 100;
    const orderNumber = generateOrderNumber();
    const paymentProofUrl = await saveProofFile(proof, orderNumber);

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: session.id,
          subtotal,
          discount,
          total,
          couponCode: couponCodeUsed,
          customerName,
          customerEmail,
          customerPhone: customerPhone || null,
          paymentMethod,
          paymentProofUrl,
          notes: notes || null,
          status: "PENDING",
          paymentStatus: "PENDING",
        },
      });

      for (const item of orderItemsData) {
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            total: item.total,
          },
        });
      }

      for (const item of orderItemsData) {
        const product = productMap.get(item.productId)!;
        const updatedProduct = await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
          select: { stock: true },
        });

        if (updatedProduct.stock < 0) {
          throw new Error(`Insufficient stock for ${product.name}`);
        }

        if (product.productType === "DIGITAL") {
          const inventoryItems = await tx.$queryRaw<
            Array<{ id: string }>
          >`UPDATE "Inventory" SET "status" = 'USED', "orderId" = ${newOrder.id}, "usedAt" = NOW() WHERE "id" IN (SELECT "id" FROM "Inventory" WHERE "productId" = ${item.productId} AND "status" = 'AVAILABLE' LIMIT ${item.quantity} FOR UPDATE SKIP LOCKED) RETURNING "id"`;

          if (inventoryItems.length < item.quantity) {
            throw new Error(`Not enough digital codes available for ${product.name}`);
          }
        }
      }

      if (couponCode) {
        await tx.coupon.update({
          where: { code: couponCode.toUpperCase() },
          data: { usedCount: { increment: 1 } },
        });

        await tx.couponUsage.create({
          data: {
            couponId: (await tx.coupon.findFirst({ where: { code: couponCode.toUpperCase() } }))!.id,
            userId: session.id,
            orderId: newOrder.id,
          },
        });
      }

      return newOrder;
    });

    const fullOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, slug: true, productType: true },
            },
          },
        },
      },
    });

    // Stock dropped inside the transaction above, so the product pages must
    // stop showing the sold-out quantity on the next visit.
    revalidateStorefront();

    return json({ success: true, data: fullOrder }, 201);
  } catch (error) {
    console.error("Order POST error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return json({ success: false, error: message }, 500);
  }
}
