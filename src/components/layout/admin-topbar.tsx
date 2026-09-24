"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Bell, ChevronDown, LogOut, Settings, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export function AdminTopbar() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/admin/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  }

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <header
      dir="rtl"
      className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-near-black/80 px-6 backdrop-blur-md"
    >
      {/* Search */}
      <form onSubmit={handleSearch} className="flex items-center">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-text" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث..."
            className="h-9 w-64 rounded-lg border border-border bg-surface pr-9 pl-3 text-sm text-white placeholder:text-gray-text/60 focus:border-purple-accent focus:outline-none focus:ring-1 focus:ring-purple-accent/30 lg:w-80"
          />
        </div>
      </form>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button
          type="button"
          className="relative rounded-lg p-2 text-gray-text transition-colors hover:bg-surface hover:text-white"
          aria-label="الإشعارات"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute left-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white">
            3
          </span>
        </button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-gray-text transition-colors hover:bg-surface hover:text-white"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-accent/20 text-purple-accent">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-bold">
                    {user?.name?.charAt(0) || "A"}
                  </span>
                )}
              </div>
              <span className="hidden max-w-[100px] truncate text-sm md:inline">
                {user?.name || "Admin"}
              </span>
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <a href="/admin/settings">
                <Settings className="ml-2 h-4 w-4" />
                الإعدادات
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href="/">
                <User className="ml-2 h-4 w-4" />
                عرض المتجر
              </a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-danger">
              <LogOut className="ml-2 h-4 w-4" />
              تسجيل الخروج
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
