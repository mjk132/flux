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

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        products: {
          where: { status: "PUBLISHED" },
          orderBy: { createdAt: "desc" },
          include: {
            images: { orderBy: { sortOrder: "asc" }, take: 1 },
            reviews: {
              where: { status: "APPROVED" },
              select: { rating: true },
            },
          },
        },
      },
    });

    if (!category) {
      return Response.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    const productsWithRating = category.products.map((product) => {
      const ratings = product.reviews.map((r) => r.rating);
      const averageRating =
        ratings.length > 0
          ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
          : 0;

      const { reviews: _, ...rest } = product;
      return { ...rest, averageRating: Math.round(averageRating * 10) / 10 };
    });

    return Response.json({
      ...category,
      products: productsWithRating,
    });
  } catch (error) {
    console.error("GET /api/categories/[id] error:", error);
    return Response.json(
      { error: "Failed to fetch category" },
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
    const { name, nameAr, description, image, isVisible, sortOrder } = body;

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return Response.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    let slug = existing.slug;
    if (name && name !== existing.name) {
      slug = slugify(name);
      const slugConflict = await prisma.category.findFirst({
        where: { slug, id: { not: id } },
      });
      if (slugConflict) {
        slug = `${slug}-${Date.now()}`;
      }
    }

    const updateData: Record<string, unknown> = { slug };

    if (name !== undefined) updateData.name = name;
    if (nameAr !== undefined) updateData.nameAr = nameAr;
    if (description !== undefined) updateData.description = description;
    if (image !== undefined) updateData.image = image;
    if (isVisible !== undefined) updateData.isVisible = isVisible;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

    const category = await prisma.category.update({
      where: { id },
      data: updateData,
    });

    return Response.json(category);
  } catch (error) {
    console.error("PUT /api/categories/[id] error:", error);
    return Response.json(
      { error: "Failed to update category" },
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

    const existing = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });
    if (!existing) {
      return Response.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    if (existing._count.products > 0) {
      return Response.json(
        {
          error:
            "Cannot delete category with existing products. Remove or reassign products first.",
        },
        { status: 400 }
      );
    }

    await prisma.category.delete({ where: { id } });

    return Response.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/categories/[id] error:", error);
    return Response.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
