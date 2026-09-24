import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

function json(data: Record<string, unknown>, status = 200) {
  return NextResponse.json(data, { status });
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
    const item = await prisma.inventory.findUnique({ where: { id } });

    if (!item) {
      return json({ success: false, error: "Inventory item not found" }, 404);
    }

    if (item.status !== "AVAILABLE") {
      return json({ success: false, error: "Only AVAILABLE inventory items can be deleted" }, 400);
    }

    await prisma.$transaction(async (tx) => {
      await tx.inventory.delete({ where: { id } });
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: 1 } },
      });
    });

    return json({ success: true, message: "Inventory item deleted successfully" });
  } catch (error) {
    console.error("Inventory DELETE error:", error);
    return json({ success: false, error: "Internal server error" }, 500);
  }
}
