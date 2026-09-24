import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { generateToken } from "./auth";

const DISCORD_API = "https://discord.com/api/v10";

const CLIENT_ID = process.env.DISCORD_CLIENT_ID?.trim() || "";
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET?.trim() || "";
const REDIRECT_URI = process.env.DISCORD_REDIRECT_URI?.trim() || "";

export function isDiscordConfigured(): boolean {
  return Boolean(CLIENT_ID && CLIENT_SECRET && REDIRECT_URI);
}

export const DISCORD_OAUTH_URL =
  `https://discord.com/oauth2/authorize?client_id=${encodeURIComponent(CLIENT_ID)}` +
  `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
  `&response_type=code&scope=${encodeURIComponent("identify email")}`;

export interface DiscordOAuthUser {
  id: string;
  username: string;
  global_name?: string | null;
  email?: string | null;
  avatar?: string | null;
}

export async function exchangeCodeForToken(
  code: string
): Promise<{ access_token: string }> {
  const res = await fetch(`${DISCORD_API}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URI,
    }),
  });
  if (!res.ok) {
    throw new Error(`Discord token exchange failed: ${res.status}`);
  }
  return res.json();
}

export async function fetchDiscordUser(
  accessToken: string
): Promise<DiscordOAuthUser> {
  const res = await fetch(`${DISCORD_API}/users/@me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new Error(`Discord user fetch failed: ${res.status}`);
  }
  return res.json();
}

export async function upsertDiscordUser(discordUser: DiscordOAuthUser) {
  const ownerId = (process.env.DISCORD_OWNER_ID || "").trim();
  const displayName =
    discordUser.global_name || discordUser.username || "Discord User";
  const avatar = discordUser.avatar
    ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
    : null;

  let user = await prisma.user.findUnique({
    where: { discordId: discordUser.id },
  });

  if (user) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: displayName,
        discordUsername: discordUser.username,
        discordAvatar: avatar,
        ...(discordUser.email && !user.email ? { email: discordUser.email } : {}),
        ...(ownerId && discordUser.id === ownerId ? { role: "OWNER" } : {}),
      },
    });
  } else {
    const email =
      discordUser.email || `${discordUser.id}@discord.local`;
    const existingByEmail = await prisma.user.findUnique({ where: { email } });
    if (existingByEmail) {
      user = await prisma.user.update({
        where: { id: existingByEmail.id },
        data: {
          discordId: discordUser.id,
          discordUsername: discordUser.username,
          discordAvatar: avatar,
          ...(ownerId && discordUser.id === ownerId ? { role: "OWNER" } : {}),
        },
      });
    } else {
      const randomPassword = await bcrypt.hash(
        Math.random().toString(36) + Date.now().toString(36),
        12
      );
      user = await prisma.user.create({
        data: {
          name: displayName,
          email,
          password: randomPassword,
          discordId: discordUser.id,
          discordUsername: discordUser.username,
          discordAvatar: avatar,
          role:
            ownerId && discordUser.id === ownerId ? "OWNER" : "CUSTOMER",
        },
      });
    }
  }

  const token = generateToken(user.id);
  return { user, token };
}

// ─── Product role delivery ──────────────────────────────────────────

export interface RoleAssignResult {
  roleId: string;
  productId: string;
  productName: string;
  status: "granted" | "skipped" | "failed";
  detail?: string;
}

function getBotToken(): string | null {
  return process.env.DISCORD_BOT_TOKEN?.trim() || null;
}

/**
 * Assign Discord guild roles to a member via the Bot REST API.
 * Returns per-role results — never throws. When the bot token or
 * guild id is missing (store owner hasn't configured them yet),
 * every role is reported as "skipped" so order approval still works.
 */
export async function assignDiscordRoles(input: {
  guildId: string | null | undefined;
  userDiscordId: string | null | undefined;
  roles: Array<{ roleId: string; productId: string; productName: string }>;
}): Promise<{ results: RoleAssignResult[]; skipped: boolean }> {
  const { guildId, userDiscordId, roles } = input;
  const token = getBotToken();

  if (!token || !guildId || !userDiscordId || roles.length === 0) {
    return {
      results: roles.map((r) => ({
        ...r,
        status: "skipped" as const,
        detail: !token
          ? "DISCORD_BOT_TOKEN missing"
          : !guildId
            ? "discord_guild_id setting missing"
            : !userDiscordId
              ? "customer has no linked Discord account"
              : "no roles to assign",
      })),
      skipped: true,
    };
  }

  const results: RoleAssignResult[] = [];
  for (const r of roles) {
    try {
      const res = await fetch(
        `${DISCORD_API}/guilds/${guildId}/members/${userDiscordId}/roles/${r.roleId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bot ${token}`,
            "Content-Length": "0",
          },
        }
      );
      if (res.status === 204) {
        results.push({ ...r, status: "granted" });
      } else {
        const text = await res.text().catch(() => "");
        results.push({
          ...r,
          status: "failed",
          detail: `Discord API ${res.status}: ${text.slice(0, 200)}`,
        });
      }
    } catch (error) {
      results.push({
        ...r,
        status: "failed",
        detail: error instanceof Error ? error.message : "network error",
      });
    }
  }
  return { results, skipped: false };
}
