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
            className="rounded-xl border border-border bg-surface overflow-hidden"
          >
            <button
              onClick={() => setOpenId(isOpen ? null : faq.id)}
              className="flex w-full items-center justify-between px-5 py-4 text-right"
            >
              <span className="text-sm font-medium text-white">
                {faq.question}
              </span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 shrink-0 text-gray-text transition-transform duration-200",
                  isOpen && "rotate-180"
                )}
              />
            </button>
            <div
              className={cn(
                "overflow-hidden transition-all duration-200",
                isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              )}
            >
              <div className="border-t border-border px-5 py-4">
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
