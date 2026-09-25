"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/store/theme";

/**
 * Storefront light-mode scope for anything rendered outside the layout
 * tree (e.g. Radix portals that mount on <body>). This syncs with the
 * theme store to ensure portaled UI (dropdowns, etc.) inherits the correct
 * theme palette.
 */
export function LightScope() {
  const { theme } = useThemeStore();

  useEffect(() => {
    if (theme === "light") {
      document.body.classList.add("flux-light");
      document.body.classList.remove("flux-dark");
    } else {
      document.body.classList.add("flux-dark");
      document.body.classList.remove("flux-light");
    }
    return () => {
      document.body.classList.remove("flux-light");
      document.body.classList.remove("flux-dark");
    };
  }, [theme]);

  return null;
}