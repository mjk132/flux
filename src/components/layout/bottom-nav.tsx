"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Store, Heart, ShoppingCart, User } from "lucide-react";
import { cn } from "@/lib/utils";

const bottomLinks = [
  { href: "/", label: "الرئيسية", icon: Home },
  { href: "/store", label: "المتجر", icon: Store },
  { href: "/wishlist", label: "المفضلة", icon: Heart },
  { href: "/cart", label: "السلة", icon: ShoppingCart },
  { href: "/account", label: "حسابي", icon: User },
];

function isActiveLink(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/store") return pathname.startsWith("/store");
  if (href === "/account") return pathname.startsWith("/account");
  return pathname === href;
}

/**
 * Mobile bottom bar. Each item shows its active state from the current
 * route (the old markup highlighted nothing, so you could never tell
 * where you were). Targets are ~56px tall — above the 44px touch
 * minimum — with aria-current marking the active page for screen readers.
 */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      dir="rtl"
      aria-label="التنقل السريع"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-near-black/95 backdrop-blur-xl lg:hidden"
    >
      <div className="grid grid-cols-5">
        {bottomLinks.map((link) => {
          const active = isActiveLink(pathname, link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-[56px] flex-col items-center justify-center gap-1 py-2.5 transition-colors",
                active
                  ? "text-purple-accent"
                  : "text-gray-text hover:text-white"
              )}
            >
              <link.icon className="h-5 w-5" />
              <span
                className={cn(
                  "text-[10px]",
                  active ? "font-bold" : "font-medium"
                )}
              >
                {link.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
