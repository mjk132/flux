// Discord Bot — يمنح صلاحية الأدمن لأعضاء السيرفر
// التشغيل: npm run bot
//
// الأوامر:
//   !grant <@mention | discord-id>   منح صلاحية أدمن
//   !revoke <@mention | discord-id>  إزالة صلاحية الأدمن
//   !admins                          عرض قائمة الأدمن المسجلين
//   !whoami                          إظهار الـ Discord ID الخاص بك
//   !help                            عرض الأوامر
//
// ملاحظة: صاحب المتجر (OWNER) يُحدد من DISCORD_OWNER_ID في ملف .env ولا يتأثر بهذه الأوامر.

import "dotenv/config";
import { Client, Events, GatewayIntentBits } from "discord.js";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const ADMINS_SETTING_KEY = "discord_admin_ids";

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL || "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

const TOKEN = process.env.DISCORD_BOT_TOKEN;

if (!TOKEN) {
  console.error("[bot] DISCORD_BOT_TOKEN غير موجود في ملف .env");
  process.exit(1);
}

async function getAdminIds(): Promise<string[]> {
  const setting = await prisma.setting.findUnique({
    where: { key: ADMINS_SETTING_KEY },
  });
  if (!setting?.value) return [];
  return setting.value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

async function setAdminIds(ids: string[]) {
  await prisma.setting.upsert({
    where: { key: ADMINS_SETTING_KEY },
    create: { key: ADMINS_SETTING_KEY, value: ids.join(","), type: "text" },
    update: { value: ids.join(",") },
  });
}

function parseTargetId(arg: string): string | null {
  const trimmed = arg.trim();
  const mention = trimmed.match(/^<@!?(\d+)>$/);
  if (mention) return mention[1];
  if (/^\d{15,20}$/.test(trimmed)) return trimmed;
  return null;
}

async function syncUserRole(discordId: string, isAdmin: boolean) {
  const user = await prisma.user.findUnique({ where: { discordId } });
  if (!user) return null;
  const ownerId = (process.env.DISCORD_OWNER_ID || "").trim();
  const newRole =
    (ownerId && discordId === ownerId) || isAdmin ? "ADMIN" : "CUSTOMER";
  if (newRole === "ADMIN" && ownerId && discordId === ownerId) {
    await prisma.user.update({ where: { id: user.id }, data: { role: "OWNER" } });
    return "OWNER";
  }
  if (user.role === newRole) return user.role;
  await prisma.user.update({ where: { id: user.id }, data: { role: newRole } });
  return newRole;
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once(Events.ClientReady, () => {
  console.log(`[bot] تم التشغيل كـ ${client.user?.tag}`);
  const ownerId = (process.env.DISCORD_OWNER_ID || "").trim();
  console.log(
    ownerId
      ? `[bot] OWNER ID مضبوط: ${ownerId}`
      : "[bot] تنبيه: DISCORD_OWNER_ID فارغ — حدد صاحب المتجر في .env"
  );
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith("!")) return;

  const [cmd, ...args] = message.content.slice(1).split(/\s+/);
  const lower = cmd.toLowerCase();

  try {
    switch (lower) {
      case "help": {
        await message.reply(
          "**أوامر البوت**\n" +
            "`!grant @user` — منح صلاحية أدمن\n" +
            "`!revoke @user` — إزالة صلاحية الأدمن\n" +
            "`!admins` — عرض قائمة الأدمن\n" +
            "`!whoami` — إظهار الـ Discord ID الخاص بك"
        );
        break;
      }

      case "whoami": {
        await message.reply(`الـ ID الخاص بك: \`${message.author.id}\``);
        break;
      }

      case "grant":
      case "revoke": {
        const targetId = parseTargetId(args[0] || "");
        if (!targetId) {
          await message.reply(
            `استخدام: \`!${lower} <@mention أو discord-id>\``
          );
          return;
        }

        const ids = await getAdminIds();
        if (lower === "grant") {
          if (ids.includes(targetId)) {
            await message.reply("هذا المستخدم أدمن بالفعل.");
            return;
          }
          ids.push(targetId);
          await setAdminIds(ids);
          const role = await syncUserRole(targetId, true);
          await message.reply(
            role === "OWNER"
              ? "تم الترقية لصاحب المتجر (OWNER)."
              : `تم منح صلاحية الأدمن لـ \`${targetId}\`${role ? " وتحديث حسابه." : " (لم يسجل الدخول بعد)."}`
          );
        } else {
          if (!ids.includes(targetId)) {
            await message.reply("هذا المستخدم ليس أدمن.");
            return;
          }
          const newIds = ids.filter((id) => id !== targetId);
          await setAdminIds(newIds);
          const role = await syncUserRole(targetId, false);
          await message.reply(
            role === "OWNER"
              ? "هذا المستخدم هو صاحب المتجر (OWNER) ولا يمكن إزالة صلاحيته."
              : `تمت إزالة صلاحية الأدمن من \`${targetId}\`.`
          );
        }
        break;
      }

      case "admins": {
        const ids = await getAdminIds();
        const ownerId = (process.env.DISCORD_OWNER_ID || "").trim();
        const lines = ids.map((id) => `- \`${id}\``);
        await message.reply(
          `**الأدمن الحاليون**\n${ownerId ? `صاحب المتجر (OWNER): \`${ownerId}\`\n` : ""}${lines.length ? lines.join("\n") : "لا يوجد أدمن بعد."}`
        );
        break;
      }

      default:
        break;
    }
  } catch (error) {
    console.error("[bot] خطأ:", error);
    await message.reply("حدث خطأ أثناء تنفيذ الأمر.");
  }
});

client.login(TOKEN);
