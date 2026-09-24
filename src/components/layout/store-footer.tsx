import Link from "next/link";
import Image from "next/image";

interface FooterCategory {
  slug: string;
  name: string;
  nameAr?: string | null;
}

interface StoreFooterProps {
  categories?: FooterCategory[];
}

const quickLinks = [
  { href: "/store", label: "المتجر" },
  { href: "/#offers", label: "العروض" },
  { href: "/faq", label: "الأسئلة الشائعة" },
  { href: "/account", label: "حسابي" },
  { href: "/account/orders", label: "طلباتي" },
];

const supportLinks = [
  { href: "/faq", label: "مركز المساعدة" },
  { href: "https://discord.gg/fluxstore", label: "ديسكورد" },
  { href: "/auth/register", label: "أنشئ حساباً" },
  { href: "/auth/login", label: "تسجيل الدخول" },
];

function DiscordLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.947 2.418-2.157 2.418z" />
    </svg>
  );
}

export function StoreFooter({ categories = [] }: StoreFooterProps) {
  return (
    <footer dir="rtl" className="relative border-t border-border/60 bg-near-black">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-accent/40 to-transparent" />

      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="relative h-9 w-9 overflow-hidden rounded-full ring-1 ring-white/10">
                <Image
                  src="/logo.png"
                  alt="Flux Store"
                  fill
                  className="object-cover"
                />
              </div>
              <span className="flex items-baseline gap-1">
                <span className="text-lg font-extrabold tracking-tight text-white">
                  Flux
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gray-muted">
                  Store
                </span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-gray-text">
              متجرك الرقمي الأول — بوتات ديسكورد، سكربتات FiveM، مواقع
              وتصاميم بهوية عصرية. جودة عالية ودعم متواصل.
            </p>

            <a
              href="https://discord.gg/fluxstore"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-[#5865F2] px-4 text-[13px] font-bold text-[#ffffff] transition-all hover:bg-[#4752c4] hover:shadow-[0_0_20px_rgba(88,101,242,0.4)]"
            >
              <DiscordLogo className="h-5 w-5" />
              انضم على ديسكورد
            </a>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="mb-4 text-[12px] font-bold uppercase tracking-wider text-gray-muted">
              التصفح
            </h3>
            <ul className="space-y-2.5">
              {quickLinks.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-[13px] text-gray-text transition-colors hover:text-white"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="mb-4 text-[12px] font-bold uppercase tracking-wider text-gray-muted">
              الأقسام
            </h3>
            <ul className="space-y-2.5">
              {categories.slice(0, 6).map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/store?category=${cat.slug}`}
                    className="text-[13px] text-gray-text transition-colors hover:text-white"
                  >
                    {cat.nameAr || cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-4 text-[12px] font-bold uppercase tracking-wider text-gray-muted">
              الدعم
            </h3>
            <ul className="space-y-2.5">
              {supportLinks.map((l) => (
                <li key={l.label}>
                  {l.href.startsWith("http") ? (
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[13px] text-gray-text transition-colors hover:text-white"
                    >
                      {l.label}
                    </a>
                  ) : (
                    <Link
                      href={l.href}
                      className="text-[13px] text-gray-text transition-colors hover:text-white"
                    >
                      {l.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border/50 pt-6 sm:flex-row">
          <p className="text-[12px] text-gray-muted">
            &copy; {new Date().getFullYear()} Flux Store. جميع الحقوق محفوظة.
          </p>
          <div className="flex items-center gap-5">
            <span className="text-[12px] text-gray-muted">شروط الاستخدام</span>
            <span className="h-3 w-px bg-border" />
            <span className="text-[12px] text-gray-muted">سياسة الخصوصية</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
