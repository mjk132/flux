import type { Metadata } from "next";
import { Bot, Gamepad2, Globe, LayoutDashboard, Code, Palette, Check } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SERVICES } from "@/config/services";
import { ServiceRequestForm } from "@/components/store/service-request-form";

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

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-8">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-extrabold text-white">الخدمات</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-gray-text">
          في FLUX ننفّذ أعمال التطوير المخصصة: من البوتات والسكربتات إلى المواقع
          ولوحات التحكم. اختر الخدمة التي تناسبك وصف احتياجك، وسيتواصل معك فريقنا
          لمناقشة التفاصيل قبل البدء.
        </p>
      </header>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((service) => {
          const Icon = serviceIcons[service.icon] ?? Bot;
          return (
            <li
              key={service.slug}
              className="flex flex-col rounded-2xl border border-border bg-surface p-5"
            >
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
            </li>
          );
        })}
      </ul>

      <section
        id="request"
        aria-labelledby="service-request-heading"
        className="mt-12 rounded-2xl border border-border bg-surface p-5 sm:p-8"
      >
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
      </section>
    </div>
  );
}
