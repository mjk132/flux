import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { StoreNavbar } from "./store-navbar";
import { StoreFooter } from "./store-footer";
import { LightScope } from "./light-scope";
import { Home, Store, Heart, ShoppingCart, User } from "lucide-react";

interface StoreLayoutProps {
  children: React.ReactNode;
}

const bottomLinks = [
  { href: "/", label: "الرئيسية", icon: Home },
  { href: "/store", label: "المتجر", icon: Store },
  { href: "/wishlist", label: "المفضلة", icon: Heart },
  { href: "/cart", label: "السلة", icon: ShoppingCart },
  { href: "/account", label: "حسابي", icon: User },
];

export async function StoreLayout({ children }: StoreLayoutProps) {
  const categories = await prisma.category
    .findMany({
      where: { isVisible: true },
      select: { slug: true, name: true, nameAr: true },
      orderBy: { sortOrder: "asc" },
      take: 12,
    })
    .catch(() => []);

  return (
    <div className="flex min-h-screen flex-col bg-void flux-light">
      <LightScope />
      <StoreNavbar categories={categories} />
      <main className="flex-1 pt-[68px] pb-16 lg:pb-0">{children}</main>
      <StoreFooter categories={categories} />

      {/* Mobile bottom navigation */}
      <nav
        dir="rtl"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-near-black/95 backdrop-blur-xl lg:hidden"
      >
        <div className="grid grid-cols-5">
          {bottomLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex flex-col items-center gap-1 py-2.5 text-gray-text transition-colors hover:text-white"
            >
              <link.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{link.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
