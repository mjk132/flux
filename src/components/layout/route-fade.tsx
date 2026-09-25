"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * Dependency-free page transition: re-keys itself with the pathname so
 * React remounts the subtree and the `.flux-page-enter` entrance
 * animation replays on every navigation. Hash/query-only changes keep
 * the same pathname, so anchors and filters stay smooth.
 */
export function RouteFade({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <div key={pathname} className={cn("flux-page-enter", className)}>
      {children}
    </div>
  );
}
