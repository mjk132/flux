import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Browser-frame website preview for the "المواقع" service — a miniature
 * landing page (nav, hero, CTA, feature cards) drawn as blocks so it reads
 * as a design mock rather than a claim about any real client site. The
 * placeholder URL and the نموذج توضيحي tag keep it explicitly illustrative.
 */
export function BrowserSite({ className }: { className?: string }) {
  return (
    <div
      dir="rtl"
      role="img"
      aria-label="نموذج توضيحي: معاينة صفحة هبوط لمتجر إلكتروني داخل نافذة متصفح"
      className={cn(
        "flux-showcase relative flex h-full min-h-[168px] flex-col overflow-hidden rounded-xl border border-white/10 bg-[#0f1117] shadow-[0_18px_44px_-22px_rgba(0,0,0,0.7)]",
        className
      )}
    >
      {/* Chrome bar — LTR chrome (browsers are LTR), body stays RTL */}
      <div dir="ltr" className="flex items-center gap-2 border-b border-white/5 bg-[#15171c] px-3 py-2">
        <span className="flex shrink-0 gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
          <span className="h-2 w-2 rounded-full bg-[#febc2e]" />
          <span className="h-2 w-2 rounded-full bg-[#28c840]" />
        </span>
        <span className="mx-auto flex min-w-0 items-center gap-1.5 rounded-md bg-black/40 px-3 py-1">
          <Lock className="h-2.5 w-2.5 shrink-0 text-white/60" aria-hidden="true" />
          <span className="truncate text-[10px] text-white/70">
            yourstore.com
          </span>
        </span>
        <span className="w-10 shrink-0" />
      </div>

      {/* Page mock */}
      <div className="flex flex-1 flex-col gap-2.5 overflow-hidden px-4 py-3">
        {/* Nav */}
        <div className="flex items-center gap-2">
          <span className="h-4 w-4 rounded-[5px] bg-gradient-to-br from-[#2f7bff] to-[#1a63e6]" />
          <span className="h-1.5 w-9 rounded-full bg-white/20" />
          <span className="mr-auto flex gap-1.5">
            <span className="h-1.5 w-6 rounded-full bg-white/10" />
            <span className="h-1.5 w-6 rounded-full bg-white/10" />
            <span className="h-1.5 w-6 rounded-full bg-white/10" />
          </span>
          <span className="h-4 w-10 rounded-md bg-accent-solid" />
        </div>

        {/* Hero — min-h-0 so it absorbs tight frames instead of pushing
            the feature cards out of the clipped page area */}
        <div className="flex min-h-0 flex-1 flex-col justify-center gap-2">
          <p className="text-[12.5px] font-extrabold leading-tight text-white">
            متجرك يبدأ من فكرة واحدة
          </p>
          <span className="block h-1.5 w-3/4 rounded-full bg-white/10" />
          <span className="mt-0.5 flex gap-2">
            <span className="rounded-md bg-accent-solid px-3 py-1.5 text-[9.5px] font-bold text-white">
              اطلب الآن
            </span>
            <span className="rounded-md border border-white/15 px-3 py-1.5 text-[9.5px] text-white/70">
              تعرّف أكثر
            </span>
          </span>
        </div>

        {/* Feature cards */}
        <div className="grid shrink-0 grid-cols-3 gap-2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="flex flex-col gap-1.5 rounded-lg border border-white/[0.07] bg-white/[0.03] p-1.5"
            >
              <span
                className={cn(
                  "h-3.5 w-3.5 rounded-[4px]",
                  i === 0
                    ? "bg-[#2f7bff]/70"
                    : i === 1
                      ? "bg-white/25"
                      : "bg-white/15"
                )}
              />
              <span className="block h-1.5 w-full rounded-full bg-white/10" />
              <span className="block h-1.5 w-2/3 rounded-full bg-white/[0.07]" />
            </span>
          ))}
        </div>
      </div>

      {/* Honesty tag */}
      <span
        className="absolute bottom-2 left-2 rounded bg-black/55 px-1.5 py-0.5 text-[10.5px] leading-none text-white/75"
      >
        نموذج توضيحي
      </span>
    </div>
  );
}
