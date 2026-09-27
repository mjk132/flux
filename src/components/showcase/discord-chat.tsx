import { cn } from "@/lib/utils";

/**
 * Discord interface preview — shows what "تطوير ديسكورد" actually produces:
 * a member opens a ticket, the bot answers with a structured embed.
 *
 * Purpose-built HTML/CSS (no stock imagery, no fabricated screenshots).
 * The sequence is one-shot CSS: typing dots → reply fades in → settles.
 * The "نموذج توضيحي" tag keeps the panel honest — it is an illustration
 * of the service, not a capture of a customer server.
 */
export function DiscordChat({ className }: { className?: string }) {
  return (
    <div
      dir="ltr"
      role="img"
      aria-label="نموذج توضيحي: معاينة واجهة سيرفر ديسكورد يظهر فيها رد بوت على طلب فتح تذكرة"
      className={cn(
        "flux-showcase relative flex h-full min-h-[168px] overflow-hidden rounded-xl border border-white/10 bg-[#313338] shadow-[0_18px_44px_-22px_rgba(0,0,0,0.7)]",
        className
      )}
    >
      {/* Server rail */}
      <div className="flex w-10 shrink-0 flex-col items-center gap-2 bg-[#1e1f22] py-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-[10px] bg-accent-solid text-[11px] font-extrabold text-white">
          F
        </span>
        <span className="h-px w-5 bg-white/10" />
        <span className="h-7 w-7 rounded-full bg-white/10" />
        <span className="h-7 w-7 rounded-full bg-white/[0.07]" />
      </div>

      {/* Channel list — hidden below sm where every pixel is chat */}
      <div className="hidden w-28 shrink-0 flex-col gap-0.5 bg-[#2b2d31] px-2 py-3 sm:flex">
        <p className="px-1.5 pb-2 text-[10px] font-bold uppercase tracking-wide text-white/85">
          FLUX Server
        </p>
        <span className="rounded bg-white/[0.08] px-1.5 py-1 text-[11px] font-medium text-white">
          # general
        </span>
        <span className="px-1.5 py-1 text-[11px] text-white/70"># bots</span>
        <span className="px-1.5 py-1 text-[11px] text-white/70"># support</span>
      </div>

      {/* Chat */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-1.5 border-b border-black/25 px-3 py-2 text-[11px] font-semibold text-white">
          <span className="text-white/70">#</span>
          <span>general</span>
          <span className="ml-2 hidden truncate text-[10px] font-normal text-white/65 md:inline">
            طلبات الأعضاء والدعم
          </span>
        </div>

        {/* Newest message anchored to the bottom: in short frames (the
            services-page media header) the OLDEST message is what clips
            off the top — exactly how a real chat viewport behaves. */}
        <div className="flex min-h-0 flex-1 flex-col justify-end overflow-hidden space-y-2.5 px-3 py-3">
          {/* Member message */}
          <div className="flex gap-2">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#5865F2] text-[9px] font-bold text-white">
              A
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-white">
                Ahmed
                <span className="ml-1.5 text-[9px] font-normal text-white/60">
                  Today 4:12 PM
                </span>
              </p>
              <p dir="rtl" className="mt-0.5 text-right text-[11.5px] leading-snug text-white/80">
                نحتاج نظام تذاكر لطلبات الأعضاء
              </p>
            </div>
          </div>

          {/* Typing indicator — fades out as the reply lands */}
          <div className="flux-typing flex items-center gap-1.5 pl-8">
            <span className="flex items-end gap-[3px]">
              <span className="flux-dot h-1 w-1 rounded-full bg-white/70" />
              <span
                className="flux-dot h-1 w-1 rounded-full bg-white/70"
                style={{ animationDelay: "0.15s" }}
              />
              <span
                className="flux-dot h-1 w-1 rounded-full bg-white/70"
                style={{ animationDelay: "0.3s" }}
              />
            </span>
            <span className="text-[10px] text-white/70">
              FLUX Bot is typing…
            </span>
          </div>

          {/* Bot reply */}
          <div
            className="animate-flux-up flex gap-2"
            style={{ animationDelay: "1.15s" }}
          >
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2f7bff] to-[#1a63e6] text-[10px] font-extrabold text-white">
              F
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-white">
                FLUX Bot
                <span className="ml-1.5 rounded-[3px] bg-[#5865F2] px-1 text-[8px] font-bold leading-[14px] text-white">
                  BOT
                </span>
                <span className="ml-1.5 text-[9px] font-normal text-white/60">
                  Today 4:12 PM
                </span>
              </p>
              <div
                dir="rtl"
                className="mt-1 max-w-[86%] rounded border-l-[3px] border-[#2f7bff] bg-[#2b2d31] p-2.5 text-right shadow-sm"
              >
                <p className="text-[11.5px] font-semibold text-white">
                  تم فتح التذكرة #1024
                </p>
                <p className="mt-1 text-[11px] leading-snug text-white/75">
                  سيرد فريق FLUX هنا — اكتب مشكلتك بالتفصيل وسنتابع معك.
                </p>
                <div className="mt-2 flex justify-end gap-1.5">
                  <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] text-white/70">
                    إغلاق
                  </span>
                  <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] text-white/70">
                    تحويل
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Message input */}
        <div className="px-3 pb-3">
          <div className="rounded-lg bg-[#383a40] px-3 py-2 text-[10.5px] text-white/65">
            Message #general
          </div>
        </div>
      </div>

      {/* Honesty tag */}
      <span
        dir="rtl"
        className="absolute bottom-2 left-2 rounded bg-black/55 px-1.5 py-0.5 text-[10.5px] leading-none text-white/75"
      >
        نموذج توضيحي
      </span>
    </div>
  );
}
