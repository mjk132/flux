import { Star, Quote } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";

interface ReviewData {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: string | Date;
  user: { name: string };
  product: { name: string; nameAr?: string | null };
}

interface ReviewsSectionProps {
  reviews: ReviewData[];
  averageRating?: number;
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            "h-3.5 w-3.5",
            i <= Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "text-faint"
          )}
        />
      ))}
    </div>
  );
}

function Avatar({ name }: { name: string }) {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-accent to-violet text-sm font-bold text-white">
      {name?.charAt(0) || "ل"}
    </div>
  );
}

export function ReviewsSection({ reviews, averageRating }: ReviewsSectionProps) {
  if (reviews.length === 0) return null;

  const featured = reviews[0];
  const rest = reviews.slice(1, 5);
  const avg = averageRating ?? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;

  return (
    <section className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-purple-accent">
            آراء حقيقية
          </p>
          <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            ماذا يقول عملاؤنا
          </h2>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5">
          <Stars rating={avg} />
          <span className="text-[13px] font-bold text-white">
            {avg.toFixed(1)}
          </span>
          <span className="text-[12px] text-gray-muted">تقييم عملاء Flux</span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Featured review */}
        <article className="relative overflow-hidden rounded-2xl border border-purple-accent/30 bg-gradient-to-br from-purple-accent/15 via-surface to-surface p-7 lg:row-span-2">
          <Quote className="absolute left-6 top-6 h-14 w-14 text-purple-accent/15" />
          <div className="relative">
            <span className="inline-flex rounded-full bg-purple-accent/15 px-2.5 py-0.5 text-[10.5px] font-bold text-purple-accent">
              الأكثر تفضيلاً
            </span>
            <div className="mt-4">
              <Stars rating={featured.rating} />
            </div>
            <p className="mt-4 text-[15px] font-medium leading-relaxed text-white">
              {featured.comment ||
                "تجربة ممتازة — تسليم فوري وتعامل راقٍ من فريق Flux."}
            </p>
            <div className="mt-6 flex items-center gap-3 border-t border-white/10 pt-5">
              <Avatar name={featured.user.name} />
              <div>
                <p className="text-[13.5px] font-bold text-white">
                  {featured.user.name}
                </p>
                <p className="text-[11.5px] text-gray-muted">
                  اشترى:{" "}
                  {featured.product.nameAr || featured.product.name} •{" "}
                  {formatDate(featured.createdAt)}
                </p>
              </div>
            </div>
          </div>
        </article>

        {/* Rest of reviews */}
        {rest.map((review) => (
          <article
            key={review.id}
            className="flex flex-col rounded-2xl border border-border/60 bg-surface p-6 transition-colors hover:border-purple-accent/40 hover:bg-surface-raised"
          >
            <div className="flex items-center justify-between">
              <Stars rating={review.rating} />
              <span className="text-[11px] text-gray-muted">
                {formatDate(review.createdAt)}
              </span>
            </div>
            <p className="mt-3 line-clamp-3 flex-1 text-[13px] leading-relaxed text-gray-text">
              {review.comment || "توصية واضحة — منتج ممتاز وسريع التسليم."}
            </p>
            <div className="mt-5 flex items-center gap-2.5 border-t border-border/60 pt-4">
              <Avatar name={review.user.name} />
              <div className="min-w-0">
                <p className="truncate text-[13px] font-bold text-white">
                  {review.user.name}
                </p>
                <p className="truncate text-[11px] text-gray-muted">
                  {review.product.nameAr || review.product.name}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
