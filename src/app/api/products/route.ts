import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "20", 10))
    );
    const skip = (page - 1) * limit;

    const category = searchParams.get("category");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const productType = searchParams.get("productType");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "newest";

    const where: Record<string, unknown> = {};

    if (category) {
      where.category = { slug: category };
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) (where.price as Record<string, number>).gte = parseFloat(minPrice);
      if (maxPrice) (where.price as Record<string, number>).lte = parseFloat(maxPrice);
    }

    if (productType) {
      where.productType = productType;
    }

    if (status) {
      where.status = status;
    } else {
      where.status = "PUBLISHED";
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { nameAr: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { tags: { contains: search, mode: "insensitive" } },
      ];
    }

    let orderBy: Record<string, string>;
    switch (sort) {
      case "price-asc":
        orderBy = { price: "asc" };
        break;
      case "price-desc":
        orderBy = { price: "desc" };
        break;
      case "best-selling":
        orderBy = { createdAt: "desc" };
        break;
      case "newest":
      default:
        orderBy = { createdAt: "desc" };
        break;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          images: { orderBy: { sortOrder: "asc" }, take: 1 },
          category: { select: { id: true, name: true, slug: true } },
          reviews: {
            where: { status: "APPROVED" },
            select: { rating: true },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    const productsWithRating = products.map((product) => {
      const ratings = product.reviews.map((r) => r.rating);
      const averageRating =
        ratings.length > 0
          ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
          : 0;

      const { reviews: _, ...rest } = product;
      return { ...rest, averageRating: Math.round(averageRating * 10) / 10 };
    });

    return Response.json({
      products: productsWithRating,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
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

    return Response.json(product, { status: 201 });
  } catch (error) {
    console.error("POST /api/products error:", error);
    return Response.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
