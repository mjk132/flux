import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { serviceRequestCreateSchema } from "@/lib/validations";
import { SERVICES } from "@/config/services";

function json(data: Record<string, unknown>, status = 200) {
  return NextResponse.json(data, { status });
}

/**
 * POST /api/services — public. Creates a service request from the storefront
 * form and raises a notification for every OWNER so the request is visible in
 * the admin notifications page.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = serviceRequestCreateSchema.safeParse(body);
    if (!parsed.success) {
      return json(
        { success: false, error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" },
        400
      );
    }

    const { name, contact, serviceType, description } = parsed.data;

    const serviceRequest = await prisma.serviceRequest.create({
      data: { name, contact, serviceType, description },
    });

    // Best-effort: the request itself is already saved if notification
    // creation fails, so never fail the customer-facing POST over it.
    try {
      const owners = await prisma.user.findMany({
        where: { role: "OWNER" },
        select: { id: true },
      });
      const serviceTitle =
        SERVICES.find((service) => service.slug === serviceType)?.title ?? serviceType;

      for (const owner of owners) {
        await prisma.notification.create({
          data: {
            userId: owner.id,
            type: "INFO",
            title: "طلب خدمة جديد",
            message: `${name} طلب خدمة: ${serviceTitle} — وسيلة التواصل: ${contact}`,
            link: "/admin/services",
          },
        });
      }
    } catch (notifyError) {
      console.error("Failed to notify owners about service request:", notifyError);
    }

    return json({ success: true, request: serviceRequest }, 201);
  } catch (error) {
    console.error("Error creating service request:", error);
    return json({ success: false, error: "Internal server error" }, 500);
  }
}

/** GET /api/services — admin only. Latest 100 requests. */
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session || (session.role !== "OWNER" && session.role !== "ADMIN")) {
      return json({ success: false, error: "Unauthorized" }, 401);
    }

    const requests = await prisma.serviceRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return json({ success: true, requests });
  } catch (error) {
    console.error("Error fetching service requests:", error);
    return json({ success: false, error: "Internal server error" }, 500);
  }
}
