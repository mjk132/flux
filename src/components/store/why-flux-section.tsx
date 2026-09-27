import Link from "next/link";

/**
 * "Why FLUX" — the brand statement, deliberately in a different voice
 * from everything around it. The capability strip above the fold lists
 * transaction mechanics (pay / delivery / support) as icon columns;
 * this section says what FLUX *is* — a store and a workshop run by one
 * team — as three typographic rows with hairline dividers. No icon
 * boxes, no cards: if both blocks printed the same four promises, the
 * page read as filler.
 *
 * Every row states something the store can demonstrate today: published
 * pricing with PayPal checkout, agreement before custom work starts, and
 * Discord as the single channel. No numbers, no guarantees we don't offer.
 */
const positions = [
  {
    title: "منتجات جاهزة تشتريها الآن",
    desc: "بوتات وسكربتات ومنصات منشورة بسعر واضح — تختار، تدفع عبر PayPal، ويظهر المنتج في حسابك بعد اعتماد الدفع.",
  },
  {
    title: "تطوير يبدأ من فكرتك",
    desc: "موقع أو لوحة تحكم أو نظام مخصص يُبنى لطلبك — نتفق على التفاصيل والسعر قبل البدء، بلا مفاجآت في النهاية.",
  },
  {
    title: "فريق واحد، وقناة واحدة",
    desc: "نفس الفريق خلف المنتجات والخدمات، والتواصل والدعم عبر سيرفر الديسكورد مباشرة.",
  },
];

export function WhyFluxSection() {
  return (
    /* Peak spacing: the statement band breathes more than the utility
       bands around it (py-16) so the page has one moment of air. */
    <section className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.35fr] lg:gap-14">
        {/* Statement */}
        <div className="relative">
          <div className="sticky top-28">
            <p className="mb-2 text-[12px] font-bold text-purple-accent">
              لماذا FLUX؟
            </p>
            <h2 className="text-2xl font-extrabold leading-snug text-white sm:text-3xl lg:text-4xl text-balance">
              متجر منتجات، وورشة تطوير — في مكان واحد
            </h2>
            <p className="mt-4 max-w-md text-[14px] leading-relaxed text-gray-text">
              تختار منتجاً جاهزاً وتشتريه في دقائق، أو تطلب تنفيذاً مخصصاً
              يبدأ من فكرتك. نفس الفريق، نفس القناة، ونفس الشفافية في السعر.
            </p>
            <Link
              href="/services"
              className="mt-6 inline-flex items-center rounded-lg border border-border px-5 py-2.5 text-[13px] font-semibold text-gray-text transition-[border-color,color] duration-300 hover:border-purple-accent/50 hover:text-white"
            >
              تعرّف على الخدمات
            </Link>
          </div>
        </div>

        {/* Positioning — divided typographic rows, no icon boxes */}
        <div className="divide-y divide-border/60 border-y border-border/60">
          {positions.map((f) => (
            <div key={f.title} className="py-7 sm:py-8">
              <h3 className="text-[17px] font-bold text-white sm:text-lg">
                {f.title}
              </h3>
              <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-gray-text">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
