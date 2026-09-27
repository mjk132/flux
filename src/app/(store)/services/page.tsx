import type { Metadata } from "next";
import { Bot, Gamepad2, Globe, LayoutDashboard, Code, Palette, Check } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SERVICES } from "@/config/services";
import { ServiceRequestForm } from "@/components/store/service-request-form";
import { Reveal } from "@/components/store/reveal";
import { DiscordChat } from "@/components/showcase/discord-chat";
import { BrowserSite } from "@/components/showcase/browser-site";
import { DashboardPanel } from "@/components/showcase/dashboard-panel";
import { TerminalScript } from "@/components/showcase/terminal-script";
import { InView } from "@/components/showcase/in-view";

export const metadata: Metadata = {
  title: "الخدمات — تطوير مخصص | FLUX",
  description:
    "خدمات تطوير مخصصة من FLUX: بوتات ديسكورد، سكربتات FiveM، مواقع، لوحات تحكم، برمجة مخصصة وتصميم واجهات. أرسل طلبك ونتواصل معك لمناقشة التفاصيل.",
};

const serviceIcons: Record<string, LucideIcon> = {
  Bot,
  Gamepad2,
  Globe,
  LayoutDashboard,
  Code,
  Palette,
};

/* The four services whose deliverable is an interface get a purpose-built
   preview at the top of the card (bleeding to the card's top edge). The
   two advisory services — custom programming and UI design — stay text:
   a mockup there would be decoration, not evidence. All four previews are
   tagged as illustrative inside the artwork. */
const SHOWCASES: Record<string, React.ComponentType<{ className?: string }>> = {
  discord: DiscordChat,
  fivem: TerminalScript,
  websites: BrowserSite,
  dashboards: DashboardPanel,
};

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-8">
      <header className="max-w-2xl">
        <p className="mb-2.5 flex items-center gap-2 text-[12px] font-bold text-purple-accent">
          <span className="h-px w-6 bg-purple-accent/60" />
          تطوير مخصص
        </p>
        <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
          الخدمات
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-gray-text">
          في FLUX ننفّذ أعمال التطوير المخصصة: من البوتات والسكربتات إلى المواقع
          ولوحات التحكم. اختر الخدمة التي تناسبك وصف احتياجك، وسيتواصل معك فريقنا
          لمناقشة التفاصيل قبل البدء.
        </p>
      </header>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((service, i) => {
          const Icon = serviceIcons[service.icon] ?? Bot;
          const Showcase = SHOWCASES[service.slug];
          return (
            <li
              key={service.slug}
              id={service.slug}
              className="scroll-mt-28 rounded-2xl border border-border bg-surface"
            >
              <Reveal delay={(i % 3) * 70} duration={600} className="flex h-full flex-col">
                {Showcase ? (
                  <div className="h-[216px] overflow-hidden rounded-t-2xl border-b border-border/60 bg-void sm:h-[228px]">
                    {/* Flush mount: the preview becomes the card's media
                        header, so its own frame/radius/shadow are dropped.
                        InView starts its sequence only when seen. */}
                    <InView className="h-full">
                      <Showcase className="h-full rounded-none border-0 shadow-none" />
                    </InView>
                  </div>
                ) : null}

                <div className="flex flex-1 flex-col p-5">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-accent/10">
                    <Icon className="h-5 w-5 text-purple-accent" aria-hidden="true" />
                  </div>
                  <h2 className="text-lg font-bold text-white">{service.title}</h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-gray-text">
                    {service.summary}
                  </p>
                  <ul className="mt-4 space-y-2 border-t border-border/60 pt-4">
                    {service.deliverables.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-[13px] leading-relaxed text-gray-muted"
                      >
                        <Check
                          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-purple-accent"
                          aria-hidden="true"
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            </li>
          );
        })}
      </ul>

      <section
        id="request"
        aria-labelledby="service-request-heading"
        className="mt-12 scroll-mt-28 rounded-2xl border border-border bg-surface p-5 sm:p-8"
      >
        <Reveal>
          <div className="max-w-2xl">
            <h2 id="service-request-heading" className="text-2xl font-extrabold text-white">
              اطلب خدمة
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-text">
              املأ النموذج التالي وصف احتياجك، وسنراجع طلبك ونتواصل معك عبر وسيلة
              التواصل التي تُدخلها.
            </p>
          </div>
          <div className="mt-6 max-w-2xl">
            <ServiceRequestForm />
          </div>
        </Reveal>
      </section>
    </div>
  );
}
