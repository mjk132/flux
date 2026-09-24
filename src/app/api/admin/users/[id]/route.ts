import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session || (session.role !== "OWNER" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        orders: {
          select: {
            id: true,
            orderNumber: true,
            total: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        _count: {
          select: { orders: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const totalSpent = user.orders.reduce(
      (sum: number, order: { total: number }) => sum + order.total,
      0
    );

    return NextResponse.json({
      user: {
        ...user,
        orderCount: user._count.orders,
        totalSpent,
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session || (session.role !== "OWNER" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { isActive, role } = body;

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};

    if (typeof isActive === "boolean") {
      updateData.isActive = isActive;
    }

    if (role && session.role !== "OWNER") {
      return NextResponse.json(
        { error: "Only OWNER can change roles" },
        { status: 403 }
      );
    }

    if (role) {
      if (!["OWNER", "ADMIN", "MODERATOR", "SUPPORT", "CUSTOMER"].includes(role)) {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 });
      }
      updateData.role = role;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
