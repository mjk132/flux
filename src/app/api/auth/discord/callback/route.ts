import { NextRequest, NextResponse } from "next/server";
import {
  exchangeCodeForToken,
  fetchDiscordUser,
  isDiscordConfigured,
  upsertDiscordUser,
} from "@/lib/discord";
import { prisma } from "@/lib/prisma";

const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state") || "/account";

  const safeNext = state.startsWith("/") && !state.startsWith("//") ? state : "/account";

  if (!isDiscordConfigured()) {
    return NextResponse.redirect(
      new URL("/auth/login?error=discord-not-configured", request.url)
    );
  }

  if (searchParams.get("error")) {
    return NextResponse.redirect(
      new URL(`/auth/login?error=discord-denied`, request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL("/auth/login?error=missing-code", request.url)
    );
  }

  try {
    const { access_token } = await exchangeCodeForToken(code);
    const discordUser = await fetchDiscordUser(access_token);

    const { user, token } = await upsertDiscordUser(discordUser);

    await prisma.user.update({
      where: { id: (user as { id: string }).id },
      data: { lastLoginAt: new Date() },
    });

    const safeUser = user as { role?: string };
    const destination =
      safeUser.role === "OWNER" || safeUser.role === "ADMIN"
        ? "/admin"
        : safeNext;

    const response = NextResponse.redirect(
      new URL(`/auth/callback?next=${encodeURIComponent(destination)}`, request.url)
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: MAX_AGE,
    });

    return response;
  } catch (error) {
    console.error("Discord callback error:", error);
    return NextResponse.redirect(
      new URL("/auth/login?error=discord-failed", request.url)
    );
  }
}
