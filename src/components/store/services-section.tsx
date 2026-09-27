import Link from "next/link";
import {
  Bot,
  Gamepad2,
  Globe,
  LayoutDashboard,
  Code,
  Palette,
  Wrench,
  ArrowLeft,
  Check,
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

/** Two services lead (they cover most requests); the rest stay compact.
    The flagships span two columns at lg, which gives the grid a rhythm
    instead of six identical icon-plus-paragraph tiles. */
const FLAGSHIP = new Set(["discord", "websites"]);

/**
 * Homepage services block — the second half of FLUX's offer (custom
 * development) sitting right next to the ready-made products. Each card
 * links to its own anchor on /services, so "اطلب هذه الخدمة" lands on
 * that service and its deliverables, not on the top of the page.
 * The closing tile is a direct link to the request form.
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
            const flagship = FLAGSHIP.has(service.slug);
            return (
              <article
                key={service.slug}
                className={[
                  "group relative flex flex-col rounded-2xl border border-border/60 bg-surface p-6 transition-[border-color,background-color,box-shadow] duration-300",
                  "hover:border-purple-accent/40 hover:bg-surface-raised focus-within:border-purple-accent/60",
                  flagship
                    ? "lg:col-span-2 lg:p-7"
                    : "",
                ].join(" ")}
              >
                <div
                  className={
                    flagship
                      ? "flex h-12 w-12 items-center justify-center rounded-xl bg-purple-accent/10 text-purple-accent ring-1 ring-purple-accent/20"
                      : "flex h-10 w-10 items-center justify-center rounded-xl bg-purple-accent/10 text-purple-accent ring-1 ring-purple-accent/20"
                  }
                >
                  <Icon
                    className={flagship ? "h-6 w-6" : "h-5 w-5"}
                    aria-hidden="true"
                  />
                </div>

                <h3
                  className={
                    flagship
                      ? "mt-5 text-lg font-extrabold text-white"
                      : "mt-4 text-[15px] font-bold text-white"
                  }
                >
                  <Link
                    href={`/services#${service.slug}`}
                    className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-[-4px] focus-visible:after:outline-purple-accent"
                  >
                    {service.title}
                  </Link>
                </h3>

                <p
                  className={
                    flagship
                      ? "mt-2 max-w-xl text-[14px] leading-relaxed text-gray-text"
                      : "mt-2 text-[13px] leading-relaxed text-gray-text"
                  }
                >
                  {service.summary}
                </p>

                {/* Flagships show what you actually receive — two real
                    deliverables from the service's own list */}
                {flagship && (
                  <ul className="mt-4 space-y-1.5">
                    {service.deliverables.slice(0, 2).map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-[13px] text-gray-muted"
                      >
                        <Check
                          className="mt-0.5 h-4 w-4 shrink-0 text-purple-accent"
                          aria-hidden="true"
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}

                <div
                  className={flagship ? "mt-auto pt-6" : "mt-auto pt-4"}
                >
                  <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-purple-accent">
                    اطلب هذه الخدمة
                    <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
                  </span>
                </div>
              </article>
            );
          })}

          {/* Closing tile — one clear path to the request form */}
          <Link
            href="/services#request"
            className="group flex flex-col justify-between rounded-2xl border border-purple-accent/30 bg-purple-accent/[0.06] p-6 transition-[border-color,background-color] duration-300 hover:border-purple-accent/60 hover:bg-purple-accent/10 sm:col-span-2 lg:col-span-1"
          >
            <div>
              <h3 className="text-[15px] font-bold text-white">
                لا تجد ما تبحث عنه؟
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-gray-text">
                صف فكرتك في طلب واحد — نراجعها ونتواصل معك لمناقشة التفاصيل
                قبل أي التزام.
              </p>
            </div>
            <span className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-purple-accent">
              ابدأ طلب الخدمة
              <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
