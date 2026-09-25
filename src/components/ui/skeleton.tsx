import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "flux-shimmer rounded-lg bg-deep-purple",
        className
      )}
    />
  );
}
