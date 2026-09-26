import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { revalidateStorefront } from "@/lib/storefront-cache";
import { queryCatalog } from "@/lib/catalog";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // All catalogue query logic lives in lib/catalog.ts — shared with
    // the server-rendered /store page so filters and sorts can never drift.
    const result = await queryCatalog({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      category: searchParams.get("category"),
      minPrice: searchParams.get("minPrice"),
      maxPrice: searchParams.get("maxPrice"),
      productType: searchParams.get("productType"),
      status: searchParams.get("status"),
      search: searchParams.get("search"),
      sort: searchParams.get("sort"),
    });

    return Response.json(result);
  } catch (error) {
    console.error("GET /api/products error:", error);
    return Response.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session || !["OWNER", "ADMIN"].includes(session.role)) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      nameAr,
      description,
      descriptionAr,
      shortDescription,
      price,
      comparePrice,
      discount,
      productType,
      status,
      categoryId,
      isFeatured,
      isBestSeller,
      stock,
      sku,
      features,
      requirements,
      deliveryInfo,
      warranty,
      tags,
      metaTitle,
      metaDescription,
      images,
      discordRoleId,
    } = body;

    if (!name || !description || price === undefined || !categoryId) {
      return Response.json(
        { error: "Name, description, price, and categoryId are required" },
        { status: 400 }
      );
    }

    if (typeof price !== "number" || price < 0) {
      return Response.json(
        { error: "Price must be a non-negative number" },
        { status: 400 }
      );
    }

    const categoryExists = await prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!categoryExists) {
      return Response.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    let slug = slugify(name);
    const existingSlug = await prisma.product.findUnique({
      where: { slug },
    });
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    const product = await prisma.product.create({
      data: {
        name,
        nameAr,
        slug,
        description,
        descriptionAr,
        shortDescription,
        price: parseFloat(price.toFixed(2)),
        comparePrice: comparePrice ? parseFloat(comparePrice.toFixed(2)) : null,
        discount: discount ? parseFloat(discount.toFixed(2)) : 0,
        productType: productType || "DIGITAL",
        status: status || "DRAFT",
        categoryId,
        isFeatured: isFeatured || false,
        isBestSeller: isBestSeller || false,
        stock: stock || 0,
        sku,
        features: features ? JSON.stringify(features) : "[]",
        requirements: requirements ? JSON.stringify(requirements) : "[]",
        deliveryInfo,
        warranty,
        tags: tags ? JSON.stringify(tags) : "[]",
        metaTitle,
        metaDescription,
        discordRoleId: discordRoleId || null,
        images: images
          ? {
              create: images.map(
                (img: { url: string; alt?: string }, index: number) => ({
                  url: img.url,
                  alt: img.alt,
                  sortOrder: index,
                })
              ),
            }
          : undefined,
      },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    revalidateStorefront();

    return Response.json(product, { status: 201 });
  } catch (error) {
    console.error("POST /api/products error:", error);
    return Response.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
