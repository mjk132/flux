"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * Dependency-free page transition: re-keys itself on navigation so
 * React remounts the subtree and the `.flux-page-enter` entrance
 * animation replays. Hash/query-only changes keep the same pathname,
 * so anchors and filters stay smooth.
 *
 * The key deliberately does NOT read `usePathname()` during the first
 * render: the prerendered value can differ from the browser URL (the
 * same documented hazard that made the navbar hydrate wrong), and a key
 * that disagrees between server HTML and the first client render makes
 * React discard the server DOM for the whole page. Both sides render a
 * constant key; the pathname is folded in through an effect, so
 * re-keying — and the transition replay — only ever happens on real
 * client-side navigations.
 */
export function RouteFade({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const pathname = usePathname();
  const [fadeKey, setFadeKey] = useState("initial");
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (lastPath.current === null) {
      // First run after hydration: remember the real URL, never re-key.
      lastPath.current = pathname;
      return;
    }
    if (lastPath.current !== pathname) {
      lastPath.current = pathname;
      setFadeKey(pathname);
    }
  }, [pathname]);

  return (
    <div key={fadeKey} className={cn("flux-page-enter", className)}>
      {children}
    </div>
  );
}
