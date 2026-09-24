import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | "...")[] = [];

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <nav
      className={cn("flex items-center justify-center gap-1", className)}
      aria-label=".pagination"
    >
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-text transition-colors hover:bg-surface hover:text-white disabled:pointer-events-none disabled:opacity-50"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {pages.map((page, i) =>
        page === "..." ? (
          <span
            key={`ellipsis-${i}`}
            className="inline-flex h-9 w-9 items-center justify-center text-gray-text"
          >
            <MoreHorizontal className="h-4 w-4" />
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={cn(
              "inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors",
              currentPage === page
                ? "bg-purple-accent text-white"
                : "text-gray-text hover:bg-surface hover:text-white"
            )}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-text transition-colors hover:bg-surface hover:text-white disabled:pointer-events-none disabled:opacity-50"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
