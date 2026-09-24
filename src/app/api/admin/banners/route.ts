import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET() {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ banners });
  } catch (error) {
    console.error("Error fetching banners:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session || (session.role !== "OWNER" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, image, link, buttonText, status, sortOrder, startsAt, endsAt } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const banner = await prisma.banner.create({
      data: {
        title,
        description,
        image,
        link,
        buttonText,
        status: status || "ACTIVE",
        sortOrder: sortOrder ?? 0,
        startsAt: startsAt ? new Date(startsAt) : null,
        endsAt: endsAt ? new Date(endsAt) : null,
      },
    });

    return NextResponse.json({ banner }, { status: 201 });
  } catch (error) {
    console.error("Error creating banner:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
