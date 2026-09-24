import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

const ROLES_PERMISSIONS = {
  OWNER: ["*"],
  ADMIN: [
    "users:read",
    "users:write",
    "products:read",
    "products:write",
    "orders:read",
    "orders:write",
    "banners:read",
    "banners:write",
    "faq:read",
    "faq:write",
    "settings:read",
    "settings:write",
    "audit:read",
  ],
  SELLER: [
    "products:read",
    "products:write",
    "orders:read",
    "orders:write",
  ],
  CUSTOMER: [
    "orders:read",
  ],
};

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session || (session.role !== "OWNER" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const roles = Object.entries(ROLES_PERMISSIONS).map(([role, permissions]) => ({
      role,
      permissions,
    }));

    return NextResponse.json({ roles });
  } catch (error) {
    console.error("Error fetching roles:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session || session.role !== "OWNER") {
      return NextResponse.json(
        { error: "Only OWNER can change roles" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, role } = body;

    if (!userId || !role) {
      return NextResponse.json(
        { error: "User ID and role are required" },
        { status: 400 }
      );
    }

    if (!["OWNER", "ADMIN", "SELLER", "CUSTOMER"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("Error updating role:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
