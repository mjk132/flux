import { cn } from "@/lib/utils";

/**
 * Script/console preview for "تطوير FiveM" — a Lua snippet in an editor
 * frame ending in a started-resource line. The comment mirrors the real
 * deliverable ("تجربة السكربتات داخل سيرفرك قبل التسليم"); nothing here
 * claims volumes, players or performance. One-shot animation: lines fade
 * up, the caret blinks (static under reduced motion).
 */
export function TerminalScript({ className }: { className?: string }) {
  return (
    <div
      dir="ltr"
      role="img"
      aria-label="نموذج توضيحي: محرر سكربتات FiveM يعرض كود Lua ورسالة تشغيل السكربت"
      className={cn(
        "flux-showcase relative flex h-full min-h-[168px] flex-col overflow-hidden rounded-xl border border-white/10 bg-[#0b0d12] shadow-[0_18px_44px_-22px_rgba(0,0,0,0.7)]",
        className
      )}
    >
      {/* Tab bar */}
      <div className="flex items-center gap-2 border-b border-white/5 bg-[#15171c] px-3 py-2">
        <span className="flex gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
          <span className="h-2 w-2 rounded-full bg-[#febc2e]" />
          <span className="h-2 w-2 rounded-full bg-[#28c840]" />
        </span>
        <span className="flex items-center gap-1.5 rounded-md bg-white/[0.06] px-2.5 py-1 text-[10px] text-white/75">
          <span className="h-1.5 w-1.5 rounded-full bg-[#2f7bff]" />
          garage_system.lua
        </span>
      </div>

      {/* Code */}
      <div className="flex-1 space-y-1.5 px-3.5 py-3 font-mono text-[10.5px] leading-relaxed">
        <p className="animate-flux-up" style={{ animationDelay: "0.05s" }}>
          <span className="mr-3 select-none text-white/25">1</span>
          <span className="text-[#7aa2ff]">local</span>
          <span className="text-white/70"> Config = {}</span>
        </p>
        <p className="animate-flux-up" style={{ animationDelay: "0.15s" }}>
          <span className="mr-3 select-none text-white/25">2</span>
          <span className="text-white/70">Config.</span>
          <span className="text-[#7aa2ff]">Locale</span>
          <span className="text-white/70"> = </span>
          <span className="text-emerald-300">&apos;ar&apos;</span>
        </p>
        <p className="animate-flux-up" style={{ animationDelay: "0.25s" }}>
          <span className="mr-3 select-none text-white/25">3</span>
          <span className="text-violet-300">RegisterNetEvent</span>
          <span className="text-white/70">(</span>
          <span className="text-emerald-300">&apos;flux:garage&apos;</span>
          <span className="text-white/70">)</span>
        </p>
        <p
          className="animate-flux-up text-white/65"
          style={{ animationDelay: "0.35s" }}
        >
          <span className="mr-3 select-none text-white/25">4</span>
          <span dir="auto">-- تجربة داخل سيرفرك قبل التسليم</span>
        </p>
        <p className="animate-flux-up pt-1" style={{ animationDelay: "1s" }}>
          <span className="mr-3 select-none text-white/25">5</span>
          <span className="text-emerald-400">✓ resource started</span>
          <span className="flux-blink ml-1 inline-block h-3 w-[6px] translate-y-[2px] bg-[#2f7bff]" />
        </p>
      </div>

      {/* Honesty tag */}
      <span className="absolute bottom-2 right-2 rounded bg-black/55 px-1.5 py-0.5 text-[10.5px] leading-none text-white/75">
        نموذج توضيحي
      </span>
    </div>
  );
}
