import Link from "next/link";
import {
  Bot,
  Gamepad2,
  Globe,
  LayoutDashboard,
  Code,
  Palette,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SectionHeading } from "./section-heading";
import { SERVICES } from "@/config/services";

/** Icon names come from the shared SERVICES config; unknown names fall
    back to a neutral glyph instead of crashing the page. */
const ICONS: Record<string, LucideIcon> = {
  Bot,
  Gamepad2,
  Globe,
  LayoutDashboard,
  Code,
  Code2: Code,
  Palette,
  Wrench,
};

/**
 * Homepage services block — the second half of FLUX's offer (custom
 * development) sitting right next to the ready-made products. Cards link
 * to /services via a stretched overlay, so there are no nested buttons.
 */
export function ServicesSection() {
  return (
    <section className="border-t border-border/40 bg-dark-purple/50">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-16">
        <SectionHeading
          eyebrow="خدمات التطوير"
          title="ما يُبنى لطلبك"
          description="ست خدمات يُنفذها فريق FLUX حسب احتياجك — اختر الخدمة، أرسل التفاصيل، ونتفق قبل البدء."
          href="/services"
          actionLabel="كل الخدمات"
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service) => {
            const Icon = ICONS[service.icon] ?? Wrench;
            return (
              <article
                key={service.slug}
                className="group relative flex flex-col rounded-2xl border border-border/60 bg-surface p-6 transition-all duration-300 hover:border-purple-accent/40 hover:bg-surface-raised focus-within:border-purple-accent/60"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-purple-accent/10 text-purple-accent ring-1 ring-purple-accent/20">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-[15px] font-bold text-white">
                  <Link
                    href="/services"
                    className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-[-4px] focus-visible:after:outline-purple-accent"
                  >
                    {service.title}
                  </Link>
                </h3>
                <p className="mt-2 flex-1 text-[13px] leading-relaxed text-gray-text">
                  {service.summary}
                </p>
                <span className="mt-4 text-[12.5px] font-semibold text-purple-accent">
                  اطلب هذه الخدمة
                </span>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
