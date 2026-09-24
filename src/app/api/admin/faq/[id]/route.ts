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
    const { question, answer, isActive, sortOrder } = body;

    const faq = await prisma.fAQ.findUnique({ where: { id } });
    if (!faq) {
      return NextResponse.json({ error: "FAQ not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (question !== undefined) updateData.question = question;
    if (answer !== undefined) updateData.answer = answer;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

    const updatedFaq = await prisma.fAQ.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ faq: updatedFaq });
  } catch (error) {
    console.error("Error updating FAQ:", error);
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
    const faq = await prisma.fAQ.findUnique({ where: { id } });
    if (!faq) {
      return NextResponse.json({ error: "FAQ not found" }, { status: 404 });
    }

    await prisma.fAQ.delete({ where: { id } });
    return NextResponse.json({ message: "FAQ deleted successfully" });
  } catch (error) {
    console.error("Error deleting FAQ:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
