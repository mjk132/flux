import { revalidatePath } from "next/cache";

/* Storefront pages are statically prerendered with ISR (see the `revalidate`
   export in src/app/(store)/page.tsx, faq/page.tsx and store/[slug]/page.tsx).
   That is what makes navigation instant — but it also means an admin edit
   would otherwise only appear once the next 60-second revalidation runs.

   Call this after any mutation that changes what visitors can see. It marks
   the pages for regeneration, and Next does that lazily on their next visit,
   so an edit never triggers a burst of rendering work.

   The set is deliberately broad (one call, no per-route bookkeeping): every
   entry here is a cheap, DB-free-to-regenerate client page, so over-marking
   costs nothing but an occasional background render. */
export function revalidateStorefront(): void {
  // Homepage (categories, products, reviews, FAQ teaser, hero copy)
  revalidatePath("/");
  // Storefront listing + filters
  revalidatePath("/store");
  // Every product detail page — a dynamic segment needs the `page` type.
  // Covers slug changes and newly published products too.
  revalidatePath("/store/[slug]", "page");
  // FAQ page (admin-editable)
  revalidatePath("/faq");
}
