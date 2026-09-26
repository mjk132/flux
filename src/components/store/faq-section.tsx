"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, MessageCircleQuestion } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FAQ } from "@/types";

interface FaqSectionProps {
  faqs: FAQ[];
}

function FaqItem({ faq, index }: { faq: FAQ; index: number }) {
  const [open, setOpen] = useState(index === 0);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border transition-all duration-300",
        open
          ? "border-purple-accent/40 bg-surface-raised"
          : "border-border/60 bg-surface hover:border-border"
      )}
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-4 px-5 py-4 text-start"
        aria-expanded={open}
      >
        <span className="flex-1 text-[14px] font-semibold text-white">
          {faq.question}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-gray-muted transition-transform duration-300",
            open && "rotate-180 text-purple-accent"
          )}
        />
      </button>
      <div
        className={cn(
          "grid transition-all duration-300 ease-in-out",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <p className="px-5 pb-5 text-[13px] leading-relaxed text-gray-text">
            {faq.answer}
          </p>
        </div>
      </div>
    </div>
  );
}

export function FaqSection({ faqs }: FaqSectionProps) {
  if (faqs.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-16">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.5fr] lg:gap-14">
        {/* Header side */}
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-[12px] font-bold text-purple-accent">
            <MessageCircleQuestion className="h-4 w-4" />
            المساعدة
          </p>
          <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
            الأسئلة الشائعة
          </h2>
          <p className="mt-3 max-w-sm text-[13.5px] leading-relaxed text-gray-text">
            إجابات مباشرة على أكثر ما يسأل عنه العملاء. لم تجد سؤالك؟ اسألنا
            في سيرفر الديسكورد.
          </p>
          <Link
            href="/faq"
            className="mt-6 inline-flex items-center rounded-xl border border-border px-5 py-2.5 text-[13px] font-semibold text-gray-text transition-all hover:border-purple-accent/50 hover:text-white"
          >
            عرض كل الأسئلة
          </Link>
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <FaqItem key={faq.id} faq={faq} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
