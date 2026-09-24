import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import FAQAccordion from "./faq-accordion";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "الأسئلة الشائعة | Flux Store",
  description: "إجابات على أكثر الأسئلة شيوعاً حول التسوق من Flux Store",
};

export default async function FAQPage() {
  const faqs = await prisma.fAQ.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-white">الأسئلة الشائعة</h1>
        <p className="mt-2 text-sm text-gray-text">
          إجابات على أكثر الأسئلة شيوعاً
        </p>
      </div>

      {faqs.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-8 text-center">
          <p className="text-gray-text">
            لا توجد أسئلة شائعة حالياً
          </p>
        </div>
      ) : (
        <FAQAccordion faqs={faqs} />
      )}
    </div>
  );
}
