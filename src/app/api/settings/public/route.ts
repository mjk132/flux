import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public checkout info — allowlist only, never leaks secrets.
const PUBLIC_KEYS = [
  "store_name",
  "paypal_email",
  "paypal_qr_image",
  "discord_link",
  "discord_guild_id",
];

export async function GET() {
  try {
    const settings = await prisma.setting.findMany({
      where: { key: { in: PUBLIC_KEYS } },
    });
    const map: Record<string, string> = {};
    for (const s of settings) map[s.key] = s.value;
    return NextResponse.json({ success: true, settings: map });
  } catch (error) {
    console.error("Public settings GET error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
