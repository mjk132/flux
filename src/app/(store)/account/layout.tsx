"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  User,
  Shield,
} from "lucide-react";
import { useAuthStore } from "@/store/auth";

const sidebarLinks = [
  {
    href: "/account",
    label: "نظرة عامة",
    icon: LayoutDashboard,
  },
  {
    href: "/account/orders",
    label: "طلباتي",
    icon: Package,
  },
  {
    href: "/account/purchases",
    label: "منتجاتي المشتراة",
    icon: ShoppingBag,
  },
  {
    href: "/account/profile",
    label: "الملف الشخصي",
    icon: User,
  },
  {
    href: "/account/security",
    label: "الأمان",
    icon: Shield,
  },
];

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid gap-6 md:grid-cols-[220px_1fr]">
        {/* Sidebar */}
        <aside className="hidden md:block">
          <nav className="sticky top-20 space-y-1">
            {sidebarLinks.map((link) => {
              const isActive =
                link.href === "/account"
                  ? pathname === "/account"
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-purple-accent text-white"
                      : "text-gray-text hover:bg-surface hover:text-white"
                  }`}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Mobile Nav */}
        <div className="mb-4 overflow-x-auto md:hidden">
          <div className="flex gap-1 pb-2">
            {sidebarLinks.map((link) => {
              const isActive =
                link.href === "/account"
                  ? pathname === "/account"
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-purple-accent text-white"
                      : "text-gray-text hover:bg-surface hover:text-white"
                  }`}
                >
                  <link.icon className="h-3 w-3" />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div>{children}</div>
      </div>
    </div>
  );
}
