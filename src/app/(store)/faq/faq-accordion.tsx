"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export default function FAQAccordion({ faqs }: { faqs: FAQ[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {faqs.map((faq) => {
        const isOpen = openId === faq.id;
        return (
          <div
            key={faq.id}
            className="rounded-2xl border border-border bg-surface overflow-hidden"
          >
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : faq.id)}
              aria-expanded={isOpen}
              aria-controls={`faq-panel-${faq.id}`}
              className="flex w-full items-center justify-between px-5 py-4 text-right"
            >
              <span className="text-sm font-semibold text-white">
                {faq.question}
              </span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 shrink-0 text-gray-text transition-transform duration-200",
                  isOpen && "rotate-180"
                )}
              />
            </button>
            {/* grid-rows animation instead of max-h: a tall answer used to
                be clipped at 384px with no way to read the rest */}
            <div
              id={`faq-panel-${faq.id}`}
              className={cn(
                "grid overflow-hidden transition-[grid-template-rows,opacity] duration-200 ease-in-out",
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              )}
            >
              <div className="min-h-0 overflow-hidden border-t border-border px-5 py-4">
                <p className="text-sm leading-relaxed text-gray-text">
                  {faq.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
