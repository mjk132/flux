"use client";

import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useThemeStore } from "@/store/theme";

/**
 * Sun/moon toggle shared by the storefront navbar and the admin topbar.
 * Both icons are stacked and cross-fade with a rotate + scale so the
 * switch reads as a single morphing glyph instead of a hard swap.
 * Icon semantics: it shows what you will get (moon in light mode).
 */
export function ThemeToggle({ className }: { className?: string }) {
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === "light" ? "تفعيل الوضع الليلي" : "تفعيل الوضع النهاري"}
      title={theme === "light" ? "الوضع الليلي" : "الوضع النهاري"}
      className={cn(
        "group relative inline-flex h-9 w-9 items-center justify-center rounded-full",
        "text-gray-text transition-colors duration-300",
        "hover:bg-surface-raised hover:text-white",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-accent/50",
        "active:scale-90",
        className
      )}
    >
      <span className="relative block h-[18px] w-[18px]">
        <Sun
          aria-hidden
          className={cn(
            "absolute inset-0 h-[18px] w-[18px] transition-all duration-300 ease-out",
            theme === "dark"
              ? "rotate-0 scale-100 opacity-100"
              : "-rotate-90 scale-0 opacity-0"
          )}
        />
        <Moon
          aria-hidden
          className={cn(
            "absolute inset-0 h-[18px] w-[18px] transition-all duration-300 ease-out",
            theme === "light"
              ? "rotate-0 scale-100 opacity-100"
              : "rotate-90 scale-0 opacity-0"
          )}
        />
      </span>
    </button>
  );
}
