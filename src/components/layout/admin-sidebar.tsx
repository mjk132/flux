"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Briefcase,
  Database,
  Users,
  Ticket,
  Star,
  Image,
  HelpCircle,
  Bell,
  Shield,
  Settings,
  FileText,
  ChevronLeft,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { href: "/admin", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/admin/products", label: "المنتجات", icon: Package },
  { href: "/admin/categories", label: "الفئات", icon: FolderTree },
  { href: "/admin/orders", label: "الطلبات", icon: ShoppingBag },
  { href: "/admin/services", label: "طلبات الخدمات", icon: Briefcase },
  { href: "/admin/inventory", label: "المخزون الرقمي", icon: Database },
  { href: "/admin/customers", label: "العملاء", icon: Users },
  { href: "/admin/coupons", label: "الكوبونات", icon: Ticket },
  { href: "/admin/reviews", label: "التقييمات", icon: Star },
  { href: "/admin/banners", label: "البانرات", icon: Image },
  { href: "/admin/faq", label: "الأسئلة الشائعة", icon: HelpCircle },
  { href: "/admin/notifications", label: "الإشعارات", icon: Bell },
  { href: "/admin/roles", label: "الأدوار", icon: Shield },
  { href: "/admin/settings", label: "الإعدادات", icon: Settings },
  { href: "/admin/audit", label: "سجل التدقيق", icon: FileText },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="text-xl font-black tracking-tighter text-purple-accent">
            Flux
          </span>
          {!collapsed && (
            <span className="text-[10px] uppercase text-gray-text">Admin</span>
          )}
        </Link>
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="hidden rounded p-1 text-gray-text hover:text-white lg:block"
          aria-label="طيّ القائمة"
        >
          <ChevronLeft
            className={cn(
              "h-4 w-4 transition-transform",
              collapsed && "rotate-180"
            )}
          />
        </button>
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="rounded p-1 text-gray-text hover:text-white lg:hidden"
          aria-label="إغلاق"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-purple-accent/15 text-purple-accent"
                  : "text-gray-text hover:bg-surface/60 hover:text-white",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Store link */}
      <div className="border-t border-border px-3 py-3">
        <Link
          href="/"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-text transition-colors hover:bg-surface/60 hover:text-white",
            collapsed && "justify-center px-2"
          )}
        >
          <LayoutDashboard className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span>المتجر</span>}
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-50 rounded-lg bg-[var(--color-surface)] p-2 text-gray-text shadow-lg hover:text-white lg:hidden"
        aria-label="فتح القائمة"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Desktop sidebar */}
      <aside
        dir="rtl"
        className={cn(
          "hidden lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:border-l lg:border-border bg-[var(--color-near-black)] transition-all duration-200",
          collapsed ? "lg:w-[68px]" : "lg:w-64"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside
            dir="rtl"
            className="absolute inset-y-0 right-0 flex w-64 flex-col border-l border-border bg-[var(--color-near-black)] shadow-xl"
          >
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
