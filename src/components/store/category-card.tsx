import Link from "next/link";
import { cn } from "@/lib/utils";
import { getCategoryArt } from "./product-visual-data";
import type { CategoryWithProducts } from "@/types";

interface CategoryCardProps {
  category: CategoryWithProducts;
  size?: "lg" | "sm";
  className?: string;
}

export function CategoryCard({
  category,
  size = "sm",
  className,
}: CategoryCardProps) {
  const art = getCategoryArt(category.slug);
  const Icon = art.icon;
  const isLarge = size === "lg";

  return (
    <Link
      href={`/store?category=${category.slug}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-surface flux-dark-panel",
        "transition-all duration-300 hover:-translate-y-0.5 hover:border-purple-accent/40",
        isLarge ? "min-h-[300px] lg:row-span-2" : "min-h-[150px]",
        className
      )}
    >
      {/* Backdrop */}
      <div className={cn("absolute inset-0", art.bg)}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.07),transparent_55%)]" />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
            maskImage:
              "radial-gradient(circle at 70% 40%, black, transparent 80%)",
            WebkitMaskImage:
              "radial-gradient(circle at 70% 40%, black, transparent 80%)",
          }}
        />
      </div>

      {/* Icon watermark */}
      <Icon
        className={cn(
          "absolute text-white/[0.06] transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6",
          isLarge ? "-left-6 -top-6 h-40 w-40" : "-left-4 -top-4 h-24 w-24"
        )}
      />

      {/* Rotated accent icon */}
      <div
        className={cn(
          "absolute flex items-center justify-center rounded-xl bg-gradient-to-br shadow-lg transition-transform duration-300 group-hover:rotate-90",
          art.badge,
          isLarge ? "right-6 top-6 h-14 w-14" : "right-4 top-4 h-10 w-10"
        )}
      >
        <Icon className={cn("text-white", isLarge ? "h-7 w-7" : "h-5 w-5")} />
      </div>

      {/* Content */}
      <div className="relative mt-auto p-5">
        <p
          className={cn(
            "text-[11px] font-semibold opacity-70",
            art.accent
          )}
        >
          {category._count.products} منتج
        </p>
        <h3
          className={cn(
            "font-extrabold text-white",
            isLarge ? "text-2xl" : "text-base"
          )}
        >
          {category.nameAr || category.name}
        </h3>
        {isLarge && category.description && (
          <p className="mt-1.5 line-clamp-2 max-w-[75%] text-[12.5px] leading-relaxed text-gray-text">
            {category.description}
          </p>
        )}
      </div>
    </Link>
  );
}
