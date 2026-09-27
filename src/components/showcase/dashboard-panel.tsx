import { BarChart3, Inbox, LayoutDashboard, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Admin dashboard preview for "لوحات التحكم" — RTL app shell (sidebar on
 * the right, as FLUX builds them). Stat values are rendered as neutral
 * blocks, not invented numbers, and the chart line draws itself once.
 * Tagged as an illustrative mock so nothing reads as real client data.
 */
export function DashboardPanel({ className }: { className?: string }) {
  return (
    <div
      dir="rtl"
      role="img"
      aria-label="نموذج توضيحي: معاينة لوحة تحكم عربية مع رسم بياني لأداء المتجر"
      className={cn(
        "flux-showcase relative flex h-full min-h-[168px] overflow-hidden rounded-xl border border-white/10 bg-[#0f1117] shadow-[0_18px_44px_-22px_rgba(0,0,0,0.7)]",
        className
      )}
    >
      {/* Sidebar (right, RTL) */}
      <div className="flex w-11 shrink-0 flex-col items-center gap-2.5 border-l border-white/5 bg-[#15171c] py-3">
        <span className="flex h-6 w-6 items-center justify-center rounded-[7px] bg-accent-solid text-[10px] font-extrabold text-white">
          F
        </span>
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-solid/15 text-[#2f7bff] ring-1 ring-[#2f7bff]/25">
          <LayoutDashboard className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
        <span className="flex h-7 w-7 items-center justify-center rounded-lg text-white/60">
          <BarChart3 className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
        <span className="flex h-7 w-7 items-center justify-center rounded-lg text-white/60">
          <Inbox className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
        <span className="mt-auto flex h-7 w-7 items-center justify-center rounded-lg text-white/60">
          <Settings className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
      </div>

      {/* Main — min-h-0 + overflow-hidden so a short frame trims this
          column instead of breaking the media header's fixed height */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2 overflow-hidden p-3 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11.5px] font-bold text-white">لوحة التحكم</p>
          <span className="h-5 w-5 rounded-full bg-white/10" />
        </div>

        {/* Stat blocks — neutral bars, no invented figures */}
        <div className="grid grid-cols-3 gap-2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="flex flex-col gap-1.5 rounded-lg border border-white/[0.07] bg-white/[0.03] p-1.5"
            >
              <span className="block h-1.5 w-8 rounded-full bg-white/15" />
              <span
                className={cn(
                  "block h-2.5 rounded-full",
                  i === 0 ? "w-12 bg-[#2f7bff]/60" : "w-9 bg-white/25"
                )}
              />
            </span>
          ))}
        </div>

        {/* Chart */}
        <span className="block rounded-lg border border-white/[0.07] bg-white/[0.03] p-2">
          <span className="mb-1.5 block h-1.5 w-14 rounded-full bg-white/15" />
          <svg
            viewBox="0 0 160 40"
            className="h-8 w-full"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M0 32 L23 27 L46 30 L70 20 L93 23 L116 12 L140 15 L160 6"
              pathLength="1"
              fill="none"
              stroke="#2f7bff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="flux-draw"
            />
          </svg>
        </span>

        {/* Table row */}
        <span className="flex items-center gap-2">
          <span className="h-4 w-4 shrink-0 rounded-full bg-white/10" />
          <span className="block h-1.5 flex-1 rounded-full bg-white/[0.08]" />
          <span className="block h-1.5 w-8 rounded-full bg-white/[0.08]" />
        </span>
      </div>

      {/* Honesty tag */}
      <span className="absolute bottom-2 left-2 rounded bg-black/55 px-1.5 py-0.5 text-[10.5px] leading-none text-white/75">
        نموذج توضيحي
      </span>
    </div>
  );
}
