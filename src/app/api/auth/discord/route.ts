import { NextRequest, NextResponse } from "next/server";
import { DISCORD_OAUTH_URL, isDiscordConfigured } from "@/lib/discord";

export async function GET(request: NextRequest) {
  if (!isDiscordConfigured()) {
    return NextResponse.redirect(
      new URL("/auth/login?error=discord-not-configured", request.url)
    );
  }

  const url = new URL(DISCORD_OAUTH_URL);

  const next = request.nextUrl.searchParams.get("next") || "/account";
  url.searchParams.set("state", next);

  return NextResponse.redirect(url);
}
