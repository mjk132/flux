"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Pauses a showcase's CSS sequences until the mock is actually on screen.
 *
 * The wrapper marks itself `data-observed` on hydration (a global rule in
 * globals.css then pauses every animation inside `.flux-showcase`) and adds
 * `data-inview` once enough of the mock is visible, which resumes them.
 * Without JS the attribute never appears, animations run from page load as
 * normal, and every sequence still lands on the same readable end state.
 */
export function InView({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inview, setInview] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.setAttribute("data-observed", "");

    // Low threshold: sequences should begin as soon as the mock meaningfully
    // peeks into view — starting early is safe (end states are sensible),
    // starting late would show a half-played mock.
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInview(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} data-inview={inview || undefined} className={className}>
      {children}
    </div>
  );
}
