import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

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
    const { title, description, image, link, buttonText, status, sortOrder, startsAt, endsAt } = body;

    const banner = await prisma.banner.findUnique({ where: { id } });
    if (!banner) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (image !== undefined) updateData.image = image;
    if (link !== undefined) updateData.link = link;
    if (buttonText !== undefined) updateData.buttonText = buttonText;
    if (status !== undefined) updateData.status = status;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;
    if (startsAt !== undefined) updateData.startsAt = startsAt ? new Date(startsAt) : null;
    if (endsAt !== undefined) updateData.endsAt = endsAt ? new Date(endsAt) : null;

    const updatedBanner = await prisma.banner.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ banner: updatedBanner });
  } catch (error) {
    console.error("Error updating banner:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session || (session.role !== "OWNER" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const banner = await prisma.banner.findUnique({ where: { id } });
    if (!banner) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 });
    }

    await prisma.banner.delete({ where: { id } });
    return NextResponse.json({ message: "Banner deleted successfully" });
  } catch (error) {
    console.error("Error deleting banner:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
