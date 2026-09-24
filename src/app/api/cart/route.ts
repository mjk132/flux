import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function json(data: Record<string, unknown>, status = 200) {
  return NextResponse.json(data, { status });
}

interface CartItem {
  product_id: string;
  quantity: number;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { product_id, quantity } = body as CartItem;

    if (!product_id || !quantity || quantity < 1) {
      return json({ success: false, error: "Invalid product_id or quantity" }, 400);
    }

    const product = await prisma.product.findUnique({
      where: { id: product_id },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        discount: true,
        stock: true,
        status: true,
        productType: true,
        images: { select: { url: true, alt: true }, take: 1, orderBy: { sortOrder: "asc" } },
      },
    });

    if (!product) {
      return json({ success: false, error: "Product not found" }, 404);
    }

    if (product.status !== "PUBLISHED") {
      return json({ success: false, error: "Product is not available" }, 400);
    }

    if (product.stock < quantity) {
      return json({ success: false, error: "Insufficient stock" }, 400);
    }

    const discountedPrice = product.discount > 0
      ? product.price * (1 - product.discount / 100)
      : product.price;

    return json({
      success: true,
      data: {
        product_id: product.id,
        name: product.name,
        slug: product.slug,
        price: discountedPrice,
        original_price: product.price,
        discount: product.discount,
        quantity,
        stock: product.stock,
        image: product.images[0]?.url ?? null,
        product_type: product.productType,
      },
    });
  } catch (error) {
    console.error("Cart POST error:", error);
    return json({ success: false, error: "Internal server error" }, 500);
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const itemsRaw = searchParams.get("items");

    if (!itemsRaw) {
      return json({ success: true, data: { items: [], subtotal: 0 } });
    }

    let items: CartItem[];
    try {
      items = JSON.parse(itemsRaw);
    } catch {
      return json({ success: false, error: "Invalid cart data" }, 400);
    }

    if (!Array.isArray(items) || items.length === 0) {
      return json({ success: true, data: { items: [], subtotal: 0 } });
    }

    const productIds = items.map((i) => i.product_id);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, status: "PUBLISHED" },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        discount: true,
        stock: true,
        productType: true,
        images: { select: { url: true, alt: true }, take: 1, orderBy: { sortOrder: "asc" } },
      },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    const validatedItems = items
      .map((item) => {
        const product = productMap.get(item.product_id);
        if (!product) return null;

        const quantity = Math.max(1, Math.min(item.quantity, product.stock));
        const discountedPrice = product.discount > 0
          ? product.price * (1 - product.discount / 100)
          : product.price;

        return {
          product_id: product.id,
          name: product.name,
          slug: product.slug,
          price: discountedPrice,
          original_price: product.price,
          discount: product.discount,
          quantity,
          stock: product.stock,
          image: product.images[0]?.url ?? null,
          product_type: product.productType,
          line_total: discountedPrice * quantity,
        };
      })
      .filter(Boolean);

    const subtotal = validatedItems.reduce((sum, item) => sum + item!.line_total, 0);

    return json({
      success: true,
      data: {
        items: validatedItems,
        subtotal: Math.round(subtotal * 100) / 100,
      },
    });
  } catch (error) {
    console.error("Cart GET error:", error);
    return json({ success: false, error: "Internal server error" }, 500);
  }
}
