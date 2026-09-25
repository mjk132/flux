import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { revalidateStorefront } from "@/lib/storefront-cache";

function json(data: Record<string, unknown>, status = 200) {
  return NextResponse.json(data, { status });
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
    const { status: reviewStatus } = body;

    const validStatuses = ["PENDING", "APPROVED", "HIDDEN"];
    if (!reviewStatus || !validStatuses.includes(reviewStatus)) {
      return json({ success: false, error: "Invalid status. Must be PENDING, APPROVED, or HIDDEN" }, 400);
    }

    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) {
      return json({ success: false, error: "Review not found" }, 404);
    }

    const updated = await prisma.review.update({
      where: { id },
      data: { status: reviewStatus },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        product: { select: { id: true, name: true, slug: true } },
      },
    });

    revalidateStorefront();

    return json({ success: true, data: updated });
  } catch (error) {
    console.error("Review PUT error:", error);
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
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) {
      return json({ success: false, error: "Review not found" }, 404);
    }

    await prisma.review.delete({ where: { id } });

    revalidateStorefront();

    return json({ success: true, message: "Review deleted successfully" });
  } catch (error) {
    console.error("Review DELETE error:", error);
    return json({ success: false, error: "Internal server error" }, 500);
  }
}
