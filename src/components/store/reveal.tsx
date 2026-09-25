"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type RevealVariant = "up" | "down" | "left" | "right" | "scale" | "blur" | "fade";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** Stagger delay in ms (use ~80ms steps for a cascading feel). */
  delay?: number;
  /** Entrance direction. Defaults to "up". */
  variant?: RevealVariant;
  /** Transition duration in ms. Defaults to 700. */
  duration?: number;
}

const hiddenByVariant: Record<RevealVariant, string> = {
  up: "translate-y-6 opacity-0",
  down: "-translate-y-6 opacity-0",
  left: "translate-x-6 opacity-0",
  right: "-translate-x-6 opacity-0",
  scale: "scale-95 opacity-0",
  blur: "translate-y-4 opacity-0 blur-[6px]",
  fade: "opacity-0",
};

/**
 * Scroll-reveal wrapper: fades/slides children in the first time they
 * enter the viewport, then disconnects. Honours the OS "reduce motion"
 * setting automatically (the global reduced-motion rule snaps the
 * transition to its end state).
 */
export function Reveal({
  children,
  className,
  delay = 0,
  variant = "up",
  duration = 700,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        transitionDelay: `${delay}ms`,
        transitionDuration: `${duration}ms`,
        // Once revealed, drop the transform entirely so the element
        // stops being a containing block (keeps fixed/sticky inside
        // working) and releases its compositing layer.
        ...(visible ? { transform: "none" } : null),
      }}
      className={cn(
        "transition-all ease-[cubic-bezier(0.16,1,0.3,1)]",
        visible ? "opacity-100" : hiddenByVariant[variant],
        className
      )}
    >
      {children}
    </div>
  );
}
