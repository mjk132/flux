import { prisma } from "@/lib/prisma";
import { StoreNavbar } from "./store-navbar";
import { StoreFooter } from "./store-footer";
import { RouteFade } from "./route-fade";
import { BottomNav } from "./bottom-nav";

interface StoreLayoutProps {
  children: React.ReactNode;
}

export async function StoreLayout({ children }: StoreLayoutProps) {
  const categories = await prisma.category
    .findMany({
      where: { isVisible: true },
      select: { slug: true, name: true, nameAr: true },
      orderBy: { sortOrder: "asc" },
      take: 12,
    })
    .catch(() => []);

  // The theme scope lives on <html> (see src/store/theme.ts) — never
  // hardcode `flux-light` here, it used to override the dark toggle.
  return (
    <div className="flex min-h-screen flex-col bg-void">
      <StoreNavbar categories={categories} />
      <main id="main-content" className="flex-1 pt-[68px] pb-16 lg:pb-0">
        <RouteFade>{children}</RouteFade>
      </main>
      <StoreFooter categories={categories} />

      {/* Mobile bottom navigation */}
      <BottomNav />
    </div>
  );
}
