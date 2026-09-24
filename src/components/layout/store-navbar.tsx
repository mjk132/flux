"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  ShoppingCart,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Package,
  Heart,
  Home,
  Store,
  Tags,
  User,
  ChevronLeft,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface NavCategory {
  slug: string;
  name: string;
  nameAr?: string | null;
}

const navLinks = [
  { href: "/", label: "الرئيسية", icon: Home },
  { href: "/store", label: "المتجر", icon: Store },
  { href: "/#offers", label: "العروض", icon: Tags },
  { href: "/faq", label: "الأسئلة الشائعة", icon: HelpCircle },
];

export function StoreNavbar({ categories = [] }: { categories?: NavCategory[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const getItemCount = useCartStore((s) => s.getItemCount);
  const wishlistItems = useWishlistStore((s) => s.items);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const cartCount = mounted ? getItemCount() : 0;
  const wishlistCount = mounted ? wishlistItems.length : 0;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchInputRef.current?.focus(), 60);
  }, [searchOpen]);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/store?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  }

  function handleLogout() {
    logout();
    router.push("/");
  }

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    if (href === "/store") return pathname.startsWith("/store") && pathname !== "/";
    if (href.includes("#")) return pathname === "/" && false;
    return pathname === href;
  }

  return (
    <>
      <nav
        dir="rtl"
        className={cn(
          "fixed left-0 right-0 top-0 z-50 transition-all duration-300",
          scrolled
            ? "border-b border-border/70 bg-near-black/85 backdrop-blur-xl"
            : "border-b border-transparent bg-gradient-to-b from-near-black/70 to-transparent"
        )}
      >
        <div className="mx-auto flex h-[68px] max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Right: mobile menu + logo */}
          <div className="flex items-center gap-2 lg:gap-6">
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="rounded-lg p-2 text-gray-text transition-colors hover:text-white lg:hidden"
              aria-label="القائمة"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <Link href="/" className="group flex items-center gap-2.5">
              <div className="relative h-9 w-9 overflow-hidden rounded-full ring-1 ring-white/10 transition-all group-hover:ring-purple-accent/40">
                <Image
                  src="/logo.png"
                  alt="Flux Store"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <span className="flex items-baseline gap-1">
                <span className="text-lg font-extrabold tracking-tight text-white">
                  Flux
                </span>
                <span className="hidden text-[10px] font-semibold uppercase tracking-[0.28em] text-gray-muted sm:inline">
                  Store
                </span>
              </span>
            </Link>
          </div>

          {/* Center: nav links */}
          <div className="hidden items-center gap-0.5 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "relative rounded-lg px-3.5 py-2 text-[13.5px] font-medium transition-colors",
                  isActive(link.href)
                    ? "text-white"
                    : "text-gray-text hover:text-white"
                )}
              >
                {link.label}
                {isActive(link.href) && (
                  <span className="absolute inset-x-3 -bottom-0.5 h-px bg-gradient-to-r from-transparent via-purple-accent to-transparent" />
                )}
              </Link>
            ))}

            {/* Categories dropdown */}
            {categories.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-1 rounded-lg px-3.5 py-2 text-[13.5px] font-medium text-gray-text transition-colors hover:text-white"
                  >
                    الأقسام
                    <ChevronDown className="h-3.5 w-3.5 text-gray-muted" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64 p-2">
                  <div className="grid grid-cols-2 gap-1">
                    {categories.map((cat) => (
                      <Link
                        key={cat.slug}
                        href={`/store?category=${cat.slug}`}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] text-gray-text transition-colors hover:bg-surface-raised hover:text-white"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-purple-accent/60" />
                        {cat.nameAr || cat.name}
                      </Link>
                    ))}
                  </div>
                  <DropdownMenuSeparator />
                  <Link
                    href="/store"
                    className="flex items-center justify-center gap-1 rounded-lg px-3 py-2 text-[12.5px] font-medium text-purple-accent transition-colors hover:bg-surface-raised"
                  >
                    جميع الأقسام
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </Link>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Left: actions */}
          <div className="flex items-center gap-0.5 sm:gap-1">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="rounded-lg p-2 text-gray-text transition-colors hover:text-white"
              aria-label="بحث"
            >
              <Search className="h-[18px] w-[18px]" />
            </button>

            <Link
              href="/wishlist"
              className="hidden rounded-lg p-2 text-gray-text transition-colors hover:text-white sm:block"
              aria-label="المفضلة"
            >
              <Heart className="h-[18px] w-[18px]" />
              {wishlistCount > 0 && (
                <span className="absolute -mt-6 mr-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-purple-accent px-1 text-[9px] font-bold text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link
              href="/cart"
              className="relative rounded-lg p-2 text-gray-text transition-colors hover:text-white"
              aria-label="السلة"
            >
              <ShoppingCart className="h-[18px] w-[18px]" />
              {cartCount > 0 && (
                <span className="absolute -left-0.5 -top-0.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-purple-accent px-1 text-[9px] font-bold text-white ring-2 ring-near-black">
                  {cartCount}
                </span>
              )}
            </Link>

            <div className="mx-1 hidden h-5 w-px bg-border sm:block" />

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-1.5 rounded-lg py-1.5 pl-1.5 pr-1 text-gray-text transition-colors hover:text-white"
                    aria-label="حسابي"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-purple-accent to-violet text-[11px] font-bold text-white">
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="h-7 w-7 rounded-full object-cover"
                        />
                      ) : (
                        user?.name?.charAt(0) || "U"
                      )}
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/account">
                      <Package className="ml-2 h-4 w-4" />
                      حسابي
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/account/orders">
                      <Package className="ml-2 h-4 w-4" />
                      طلباتي
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/wishlist">
                      <Heart className="ml-2 h-4 w-4" />
                      المفضلة
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {(user?.role === "ADMIN" || user?.role === "OWNER") && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">
                        <Package className="ml-2 h-4 w-4" />
                        لوحة الإدارة
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {(user?.role === "ADMIN" || user?.role === "OWNER") && <DropdownMenuSeparator />}
                  <DropdownMenuItem onClick={handleLogout} className="text-danger">
                    <LogOut className="ml-2 h-4 w-4" />
                    تسجيل الخروج
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                href="/auth/login"
                className="hidden rounded-lg bg-purple-accent px-4 py-2 text-[13px] font-semibold text-white transition-all hover:bg-violet hover:shadow-[0_0_20px_rgba(124,58,237,0.35)] sm:inline-flex"
              >
                دخول
              </Link>
            )}

            {/* Mobile cart fallback */}
            <Link
              href="/auth/login"
              className="rounded-lg p-2 text-gray-text hover:text-white lg:hidden sm:hidden"
              aria-label="دخول"
            >
              <User className="h-[18px] w-[18px]" />
            </Link>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={cn(
            "overflow-hidden transition-all duration-300 lg:hidden",
            mobileOpen ? "max-h-[520px] border-t border-border bg-near-black/95 backdrop-blur-xl" : "max-h-0"
          )}
        >
          <div className="space-y-0.5 px-4 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors",
                  isActive(link.href)
                    ? "bg-surface-raised text-white"
                    : "text-gray-text hover:text-white"
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
            <div className="my-2 h-px bg-border" />
            <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-gray-muted">
              الأقسام
            </p>
            {categories.slice(0, 8).map((cat) => (
              <Link
                key={cat.slug}
                href={`/store?category=${cat.slug}`}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-[13px] text-gray-text transition-colors hover:text-white"
              >
                <span className="h-1 w-1 rounded-full bg-purple-accent/60" />
                {cat.nameAr || cat.name}
              </Link>
            ))}
            {!isAuthenticated && (
              <div className="flex gap-2 pt-3">
                <Link
                  href="/auth/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 rounded-xl bg-purple-accent px-4 py-3 text-center text-sm font-semibold text-white"
                >
                  دخول
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 rounded-xl border border-border px-4 py-3 text-center text-sm font-medium text-gray-text"
                >
                  تسجيل
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center bg-void/80 pt-24 backdrop-blur-md">
          <div className="mx-4 w-full max-w-xl rounded-2xl border border-border bg-surface p-5 shadow-2xl shadow-black/50">
            <form onSubmit={handleSearch} className="flex items-center gap-3">
              <Search className="h-5 w-5 flex-shrink-0 text-gray-muted" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن بوت، سكربت، موقع..."
                className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-muted focus:outline-none"
                dir="rtl"
              />
              <button
                type="button"
                onClick={() => {
                  setSearchOpen(false);
                  setSearchQuery("");
                }}
                className="rounded-lg p-1.5 text-gray-muted transition-colors hover:text-white"
                aria-label="إغلاق"
              >
                <X className="h-4 w-4" />
              </button>
            </form>
            <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
              <p className="text-[11px] text-gray-muted">اضغط Enter للبحث</p>
              <div className="flex gap-1.5">
                {["بوت", "FiveM", "تصميم"].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      router.push(`/store?search=${encodeURIComponent(tag)}`);
                      setSearchOpen(false);
                    }}
                    className="rounded-md border border-border px-2 py-1 text-[11px] text-gray-text transition-colors hover:border-purple-accent/40 hover:text-white"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
