import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { revalidateStorefront } from "@/lib/storefront-cache";

export async function GET(_request: NextRequest) {
  try {
    const categories = await prisma.category.findMany({
      where: { isVisible: true },
      orderBy: { sortOrder: "asc" },
      include: {
        _count: {
          select: {
            products: { where: { status: "PUBLISHED" } },
          },
        },
      },
    });

    return Response.json(categories);
  } catch (error) {
    console.error("GET /api/categories error:", error);
    return Response.json(
      { error: "Failed to fetch categories" },
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
    const { name, nameAr, description, image, isVisible, sortOrder } = body;

    if (!name) {
      return Response.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    let slug = slugify(name);
    const existingSlug = await prisma.category.findUnique({
      where: { slug },
    });
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    const category = await prisma.category.create({
      data: {
        name,
        nameAr,
        slug,
        description,
        image,
        isVisible: isVisible !== false,
        sortOrder: sortOrder || 0,
      },
    });

    revalidateStorefront();

    return Response.json(category, { status: 201 });
  } catch (error) {
    console.error("POST /api/categories error:", error);
    return Response.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
