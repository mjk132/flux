"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { AdminSidebar } from "./admin-sidebar";
import { AdminTopbar } from "./admin-topbar";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/auth/login");
    } else if (user?.role !== "ADMIN" && user?.role !== "OWNER") {
      router.replace("/");
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || (user?.role !== "ADMIN" && user?.role !== "OWNER")) {
    return (
      <div className="flex h-screen items-center justify-center bg-near-black">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminTopbar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
