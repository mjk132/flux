import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        category: { select: { id: true, name: true, slug: true } },
        reviews: {
          where: { status: "APPROVED" },
          include: {
            user: { select: { id: true, name: true, avatar: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!product) {
      return Response.json({ error: "Product not found" }, { status: 404 });
    }

    const ratings = product.reviews.map((r) => r.rating);
    const averageRating =
      ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
        : 0;

    return Response.json({
      ...product,
      averageRating: Math.round(averageRating * 10) / 10,
      reviewCount: ratings.length,
    });
  } catch (error) {
    console.error("GET /api/products/[id] error:", error);
    return Response.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session || !["OWNER", "ADMIN"].includes(session.role)) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
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

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return Response.json({ error: "Product not found" }, { status: 404 });
    }

    if (categoryId) {
      const categoryExists = await prisma.category.findUnique({
        where: { id: categoryId },
      });
      if (!categoryExists) {
        return Response.json(
          { error: "Category not found" },
          { status: 404 }
        );
      }
    }

    let slug = existing.slug;
    if (name && name !== existing.name) {
      slug = slugify(name);
      const slugConflict = await prisma.product.findFirst({
        where: { slug, id: { not: id } },
      });
      if (slugConflict) {
        slug = `${slug}-${Date.now()}`;
      }
    }

    const updateData: Record<string, unknown> = {
      slug,
    };

    if (name !== undefined) updateData.name = name;
    if (nameAr !== undefined) updateData.nameAr = nameAr;
    if (description !== undefined) updateData.description = description;
    if (descriptionAr !== undefined) updateData.descriptionAr = descriptionAr;
    if (shortDescription !== undefined) updateData.shortDescription = shortDescription;
    if (price !== undefined) {
      if (typeof price !== "number" || price < 0) {
        return Response.json(
          { error: "Price must be a non-negative number" },
          { status: 400 }
        );
      }
      updateData.price = parseFloat(price.toFixed(2));
    }
    if (comparePrice !== undefined)
      updateData.comparePrice = comparePrice ? parseFloat(comparePrice.toFixed(2)) : null;
    if (discount !== undefined)
      updateData.discount = parseFloat(discount.toFixed(2));
    if (productType !== undefined) updateData.productType = productType;
    if (status !== undefined) updateData.status = status;
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured;
    if (isBestSeller !== undefined) updateData.isBestSeller = isBestSeller;
    if (stock !== undefined) updateData.stock = stock;
    if (sku !== undefined) updateData.sku = sku;
    if (features !== undefined) updateData.features = features;
    if (requirements !== undefined) updateData.requirements = requirements;
    if (deliveryInfo !== undefined) updateData.deliveryInfo = deliveryInfo;
    if (warranty !== undefined) updateData.warranty = warranty;
    if (tags !== undefined) updateData.tags = tags;
    if (metaTitle !== undefined) updateData.metaTitle = metaTitle;
    if (metaDescription !== undefined) updateData.metaDescription = metaDescription;
    if (discordRoleId !== undefined) updateData.discordRoleId = discordRoleId || null;

    if (images !== undefined) {
      await prisma.productImage.deleteMany({ where: { productId: id } });
      updateData.images = {
        create: images.map(
          (img: { url: string; alt?: string }, index: number) => ({
            url: img.url,
            alt: img.alt,
            sortOrder: index,
          })
        ),
      };
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    return Response.json(product);
  } catch (error) {
    console.error("PUT /api/products/[id] error:", error);
    return Response.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session || !["OWNER", "ADMIN"].includes(session.role)) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return Response.json({ error: "Product not found" }, { status: 404 });
    }

    await prisma.product.update({
      where: { id },
      data: { status: "ARCHIVED" },
    });

    return Response.json({ message: "Product archived successfully" });
  } catch (error) {
    console.error("DELETE /api/products/[id] error:", error);
    return Response.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
