import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  /** Small accent label above the title */
  eyebrow: string;
  title: string;
  /** Optional supporting line — keeps the editorial rhythm consistent */
  description?: string;
  /** Renders the "show all" link on the left when provided */
  href?: string;
  actionLabel?: string;
  className?: string;
}

/**
 * Shared section header: accent rule + eyebrow, title, optional lead,
 * and an optional action link. Used across the homepage so every section
 * opens with the same typographic rhythm.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  href,
  actionLabel = "عرض الكل",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "mb-8 flex flex-wrap items-end justify-between gap-4",
        className
      )}
    >
      <div className="max-w-2xl">
        <p className="mb-2.5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-purple-accent">
          <span className="h-px w-6 bg-purple-accent/60" />
          {eyebrow}
        </p>
        <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
          {title}
        </h2>
        {description && (
          <p className="mt-2.5 text-[14px] leading-relaxed text-gray-text">
            {description}
          </p>
        )}
      </div>

      {href && (
        <Link
          href={href}
          className="group inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-2 text-[13px] font-semibold text-purple-accent transition-all duration-300 hover:border-purple-accent/40 hover:bg-purple-accent/5 hover:text-violet"
        >
          {actionLabel}
          <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-1" />
        </Link>
      )}
    </div>
  );
}
