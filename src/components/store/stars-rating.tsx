import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarsRatingProps {
  rating: number;
  size?: "sm" | "md" | "lg";
  readonly?: boolean;
}

const sizeMap = {
  sm: "h-3.5 w-3.5",
  md: "h-4.5 w-4.5",
  lg: "h-5.5 w-5.5",
};

export function StarsRating({
  rating,
  size = "md",
  readonly = true,
}: StarsRatingProps) {
  return (
    <div className="flex gap-0.5" role={readonly ? "img" : undefined}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            sizeMap[size],
            star <= rating
              ? "fill-yellow-400 text-yellow-400"
              : "fill-transparent text-gray-text/30",
            !readonly && "cursor-pointer transition-colors hover:text-yellow-400"
          )}
        />
      ))}
    </div>
  );
}
