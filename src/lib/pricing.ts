/* One source of truth for what a customer actually pays.

   The store keeps three price fields per product and they were being read
   inconsistently: the product detail page, the cart API and the orders API
   all applied `discount` to `price`, while the product card and the offers
   widget showed `price` untouched next to a "-50%" badge. That is exactly
   how a product ended up advertising a discount it never showed — and why
   two screens could quote different numbers for the same item.

   Field meanings:
   - `price`        the catalogue price (the admin's "السعر")
   - `discount`     percentage off that price ("الخصم %")
   - `comparePrice` a display-only "was" price ("سعر المقارنة").
                    It never changes what is charged.

   `final` mirrors api/cart/route.ts and api/orders/route.ts word for word,
   because those are the two places money is actually taken. Anything that
   is rendered as a price must go through here so the three can never drift
   apart again. */

export interface PricedProduct {
  price: number;
  comparePrice?: number | null;
  discount?: number | null;
}

export interface SalePrice {
  /** What the customer pays. */
  final: number;
  /** The struck-through "was" price — null when there is no real discount. */
  was: number | null;
  /** Percentage for the badge — 0 when there is no real discount. */
  percent: number;
}

export function getSalePrice(product: PricedProduct): SalePrice {
  const list = product.price;

  // The discount field has no max in the admin form, so guard it: anything
  // outside 0-100 is clamped, and 150% off can only ever mean "free" rather
  // than a negative price the checkout would have to absorb.
  const percentOff = Math.min(100, Math.max(0, product.discount ?? 0));

  const final = percentOff > 0 ? list * (1 - percentOff / 100) : list;

  // The "was" price is the highest price the product genuinely sat above
  // before the sale: either the pre-discount catalogue price, or an entered
  // compare price — but only when it is really above what is charged, so a
  // stale/low compare price never shows as a fake discount.
  const wasCandidate = Math.max(
    percentOff > 0 ? list : 0,
    product.comparePrice && product.comparePrice > final ? product.comparePrice : 0
  );

  const was = wasCandidate > final ? wasCandidate : null;
  const percent = was ? Math.round(((was - final) / was) * 100) : 0;

  return { final, was, percent };
}
