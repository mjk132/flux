import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard, type ProductCardData } from "./product-card";

interface ProductGridProps {
  products: ProductCardData[];
  loading?: boolean;
}

function ProductSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-surface">
      <Skeleton className="aspect-[4/3] w-full" />
      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-2.5 w-14" />
          <Skeleton className="h-2.5 w-16" />
        </div>
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-2.5 w-full" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function ProductGrid({ products, loading = false }: ProductGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-surface">
          <span className="text-xl font-extrabold tracking-tight text-purple-accent/25">
            Flux
          </span>
        </div>
        <h3 className="text-base font-semibold text-white">
          لا توجد منتجات حالياً
        </h3>
        <p className="mt-2 max-w-sm text-[13px] text-gray-text">
          لم نعرض منتجات في هذه القائمة بعد. تفقد المتجر لاحقاً!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
