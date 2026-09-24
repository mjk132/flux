import { MessagesSquare, ArrowLeft } from "lucide-react";

function DiscordLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.947 2.418-2.157 2.418z" />
    </svg>
  );
}

interface DiscordCtaProps {
  discordUrl?: string;
}

export function DiscordCtaSection({ discordUrl }: DiscordCtaProps) {
  const url = discordUrl || "https://discord.gg/fluxstore";

  return (
    <section className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-16">
      <div className="relative overflow-hidden rounded-3xl border border-purple-accent/25 bg-gradient-to-br from-violet/20 via-deep-purple to-surface">
        <div className="absolute inset-0 bg-grid opacity-50" />
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-purple-accent/25 blur-[90px]" />
        <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-violet/20 blur-[90px]" />

        <div className="relative flex flex-col items-center px-6 py-14 text-center sm:py-16">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#5865F2] shadow-[0_0_35px_rgba(88,101,242,0.5)]">
            <DiscordLogo className="h-8 w-8 text-[#ffffff]" />
          </div>

          <span className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-success/25 bg-[#ffffff]/70 px-3 py-1 text-[11px] font-semibold text-gray-text">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            المجتمع مفتوح الآن
          </span>

          <h2 className="max-w-xl text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            تحتاج مساعدة؟{" "}
            <span className="text-gradient">انضم لمجتمع Flux</span> على ديسكورد
          </h2>
          <p className="mt-3 max-w-md text-[13.5px] leading-relaxed text-gray-text">
            اسأل، احصل على الدعم الفوري، وابقَ على اطلاع بكل عروضنا الجديدة —
            كل ذلك في سيرفر ديسكورد واحد.
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center gap-2.5 rounded-xl bg-[#5865F2] px-6 text-sm font-bold text-[#ffffff] transition-all hover:bg-[#4752c4] hover:shadow-[0_0_25px_rgba(88,101,242,0.45)]"
            >
              <DiscordLogo className="h-5 w-5" />
              انضم إلى ديسكورد
            </a>
            <a
              href="/faq"
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/15 px-6 text-sm font-semibold text-gray-text transition-all hover:border-white/30 hover:text-white"
            >
              <MessagesSquare className="h-4 w-4" />
              اقرأ الأسئلة الشائعة
              <ArrowLeft className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
