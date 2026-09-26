import Link from "next/link";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  /** Small accent label above the title (kept sentence-case: letter-spacing
      is harmful on Arabic, so no uppercase/tracking here) */
  eyebrow: string;
  title: string;
  /** Optional supporting line — keeps the editorial rhythm consistent */
  description?: string;
  /** Renders the "show all" action on the leading side when provided */
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
        <p className="mb-2.5 flex items-center gap-2 text-[12px] font-bold text-purple-accent">
          <span className="h-px w-6 bg-purple-accent/60" />
          {eyebrow}
        </p>
        <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
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
          className="inline-flex items-center rounded-full border border-border px-3.5 py-2 text-[13px] font-semibold text-purple-accent transition-all duration-300 hover:border-purple-accent/40 hover:bg-purple-accent/5 hover:text-violet"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
