"use client";

import { useState } from "react";
import Image from "next/image";
import { Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface GalleryImage {
  url: string;
  alt?: string | null;
}

interface ProductGalleryProps {
  images: GalleryImage[];
  name: string;
  /** Real discount percentage from the shared pricing helper — 0 hides it. */
  discountPercent?: number;
}

/**
 * Product page gallery. The main frame and the thumbnails used to be
 * static divs: nothing switched the hero image, so a second image could
 * never be seen. Thumbnails are real buttons (keyboard-reachable, with
 * aria-current on the active one and a visible accent ring), and the
 * badge radius matches the product cards so both surfaces read as one
 * system.
 */
export function ProductGallery({
  images,
  name,
  discountPercent = 0,
}: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-deep-purple">
        {current ? (
          <Image
            src={current.url}
            alt={current.alt || name}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-text">
            <Package className="h-24 w-24" aria-hidden="true" />
          </div>
        )}
        {discountPercent > 0 && (
          <span className="absolute right-4 top-4 rounded-md bg-danger px-2.5 py-1 text-sm font-bold text-white">
            -{discountPercent}%
          </span>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex gap-2">
          {images.slice(0, 5).map((img, i) => (
            <button
              key={img.url}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`عرض الصورة ${i + 1}`}
              aria-current={i === active ? "true" : undefined}
              className={cn(
                "relative h-16 w-16 overflow-hidden rounded-lg border transition-[border-color,opacity] duration-200",
                i === active
                  ? "border-purple-accent ring-1 ring-purple-accent/40"
                  : "border-border opacity-60 hover:opacity-100"
              )}
            >
              <Image
                src={img.url}
                alt=""
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
