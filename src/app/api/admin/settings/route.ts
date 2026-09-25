import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { revalidateStorefront } from "@/lib/storefront-cache";

const PUBLIC_KEYS = [
  "store_name",
  "store_description",
  "hero_title",
  "hero_subtitle",
  "contact_email",
  "contact_phone",
  "social_instagram",
  "social_facebook",
  "social_twitter",
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    let settings;

    if (key) {
      const setting = await prisma.setting.findUnique({
        where: { key },
      });

      if (!setting) {
        return NextResponse.json({ error: "Setting not found" }, { status: 404 });
      }

      settings = setting;
    } else {
      settings = await prisma.setting.findMany({
        orderBy: { key: "asc" },
      });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session || (session.role !== "OWNER" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { settings } = body;

    if (!settings || typeof settings !== "object") {
      return NextResponse.json(
        { error: "Settings object is required" },
        { status: 400 }
      );
    }

    const upsertPromises = Object.entries(settings).map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      })
    );

    await Promise.all(upsertPromises);

    const updatedSettings = await prisma.setting.findMany({
      where: {
        key: { in: Object.keys(settings) },
      },
      orderBy: { key: "asc" },
    });

    // The homepage reads settings (e.g. the Discord invite link) at render
    // time, so it has to be regenerated after a settings save.
    revalidateStorefront();

    return NextResponse.json({ settings: updatedSettings });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
