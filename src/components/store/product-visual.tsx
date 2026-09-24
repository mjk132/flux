"use client";

import { Gem, Rocket, ShieldCheck, Gift, Bot, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCategoryArt } from "./product-visual-data";

interface ProductVisualProps {
  categorySlug?: string | null;
  productName?: string;
  imageUrl?: string | null;
  alt?: string;
  className?: string;
}

export function ProductVisual({
  categorySlug,
  productName,
  imageUrl,
  alt,
  className,
}: ProductVisualProps) {
  const art = getCategoryArt(categorySlug);
  const Icon = art.icon;

  const isRealImage =
    imageUrl && !imageUrl.endsWith("logo.png") && !imageUrl.includes("logo.png");

  if (isRealImage) {
    return (
      <img
        src={imageUrl!}
        alt={alt || productName || ""}
        className={cn("h-full w-full object-cover", className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "relative flex h-full w-full items-center justify-center overflow-hidden flux-dark-panel",
        art.bg,
        className
      )}
    >
      {/* Subtle radial light */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.08),transparent_55%)]" />

      {/* Corner grid */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
          maskImage:
            "radial-gradient(circle at 50% 45%, black, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(circle at 50% 45%, black, transparent 75%)",
        }}
      />

      {/* Watermark icon */}
      <Icon className={cn("absolute h-28 w-28 opacity-[0.07]", art.accent)} />

      {/* Diamond badge */}
      <div
        className={cn(
          "absolute left-4 top-4 flex h-8 w-8 rotate-45 items-center justify-center rounded-lg bg-gradient-to-br",
          art.badge
        )}
      >
        <Icon className="h-4 w-4 -rotate-45 text-white" />
      </div>

      {/* Main icon in ring */}
      <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm">
        <Icon className={cn("h-8 w-8", art.accent)} />
      </div>

      {/* Chip */}
      <div
        className={cn(
          "absolute bottom-4 right-4 rounded-full border px-3 py-1 text-[10px] font-semibold",
          art.chip
        )}
      >
        {productName || "Flux"}
      </div>
    </div>
  );
}
