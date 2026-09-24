import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

function json(data: Record<string, unknown>, status = 200) {
  return NextResponse.json(data, { status });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return json({ success: false, error: "Unauthorized" }, 401);
    }

    const { id } = await params;
    const isAdmin = session.role === "ADMIN" || session.role === "OWNER";

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, slug: true, productType: true, discordRoleId: true },
            },
          },
        },
        user: {
          select: { id: true, name: true, email: true, phone: true, discordId: true, discordUsername: true },
        },
        inventory: {
          select: { id: true, code: true, status: true, usedAt: true },
        },
      },
    });

    if (!order) {
      return json({ success: false, error: "Order not found" }, 404);
    }

    if (!isAdmin && order.userId !== session.id) {
      return json({ success: false, error: "Forbidden" }, 403);
    }

    const responseData = isAdmin
      ? order
      : {
          ...order,
          inventory: order.inventory.map((inv) => ({
            id: inv.id,
            code: inv.code,
            status: inv.status,
            usedAt: inv.usedAt,
          })),
        };

    return json({ success: true, data: responseData });
  } catch (error) {
    console.error("Order GET error:", error);
    return json({ success: false, error: "Internal server error" }, 500);
  }
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
    const { status, paymentStatus, action } = body;

    const validStatuses = ["PENDING", "PAID", "PROCESSING", "COMPLETED", "CANCELLED", "REFUNDED"];
    const validPaymentStatuses = ["PENDING", "PAID", "FAILED", "REFUNDED"];

    if (status && !validStatuses.includes(status)) {
      return json({ success: false, error: "Invalid order status" }, 400);
    }

    if (paymentStatus && !validPaymentStatuses.includes(paymentStatus)) {
      return json({ success: false, error: "Invalid payment status" }, 400);
    }

    if (action && !["approve", "reject"].includes(action)) {
      return json({ success: false, error: "Invalid action" }, 400);
    }

    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, slug: true, productType: true, discordRoleId: true },
            },
          },
        },
        user: {
          select: { id: true, discordId: true, discordUsername: true },
        },
      },
    });
    if (!existingOrder) {
      return json({ success: false, error: "Order not found" }, 404);
    }

    // ─── Approve: confirm payment + grant Discord product roles ───
    if (action === "approve") {
      const guildSetting = await prisma.setting.findUnique({
        where: { key: "discord_guild_id" },
      });

      const { assignDiscordRoles } = await import("@/lib/discord");
      const rolesToGrant = existingOrder.items
        .filter((item) => item.product.discordRoleId)
        .map((item) => ({
          roleId: item.product.discordRoleId as string,
          productId: item.product.id,
          productName: item.product.name,
        }));

      const { results: roleResults } = await assignDiscordRoles({
        guildId: guildSetting?.value || null,
        userDiscordId: existingOrder.user?.discordId || null,
        roles: rolesToGrant,
      });

      const order = await prisma.order.update({
        where: { id },
        data: { paymentStatus: "PAID", status: "PROCESSING" },
        include: {
          items: {
            include: {
              product: {
                select: { id: true, name: true, slug: true, productType: true, discordRoleId: true },
              },
            },
          },
        },
      });

      return json({ success: true, data: order, roleResults });
    }

    // ─── Reject: fail payment, cancel order, release reserved codes ───
    if (action === "reject") {
      await prisma.$transaction([
        prisma.inventory.updateMany({
          where: { orderId: id, status: "USED" },
          data: { status: "AVAILABLE", orderId: null, usedAt: null },
        }),
        prisma.order.update({
          where: { id },
          data: { paymentStatus: "FAILED", status: "CANCELLED" },
        }),
      ]);

      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          items: {
            include: {
              product: {
                select: { id: true, name: true, slug: true, productType: true, discordRoleId: true },
              },
            },
          },
        },
      });

      return json({ success: true, data: order });
    }

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

    const order = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, slug: true, productType: true, discordRoleId: true },
            },
          },
        },
      },
    });

    return json({ success: true, data: order });
  } catch (error) {
    console.error("Order PUT error:", error);
    return json({ success: false, error: "Internal server error" }, 500);
  }
}
