import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { serviceRequestStatusSchema } from "@/lib/validations";

function json(data: Record<string, unknown>, status = 200) {
  return NextResponse.json(data, { status });
}

/** PATCH /api/services/[id] — admin only. Updates the request status. */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session || (session.role !== "OWNER" && session.role !== "ADMIN")) {
      return json({ success: false, error: "Unauthorized" }, 401);
    }

    const { id } = await params;
    const body = await request.json().catch(() => null);
    const parsed = serviceRequestStatusSchema.safeParse(body);
    if (!parsed.success) {
      return json(
        { success: false, error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" },
        400
      );
    }

    const existing = await prisma.serviceRequest.findUnique({ where: { id } });
    if (!existing) {
      return json({ success: false, error: "Request not found" }, 404);
    }

    const updated = await prisma.serviceRequest.update({
      where: { id },
      data: { status: parsed.data.status },
    });

    return json({ success: true, request: updated });
  } catch (error) {
    console.error("Error updating service request:", error);
    return json({ success: false, error: "Internal server error" }, 500);
  }
}
