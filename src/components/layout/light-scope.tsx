"use client";

import { useEffect } from "react";

/**
 * Storefront light-mode scope for anything rendered outside the layout
 * tree (e.g. Radix portals that mount on <body>). The store layout root
 * already carries `.flux-light` for its own DOM; this effect mirrors the
 * class onto <body> so portaled UI (dropdowns, etc.) inherits the light
 * palette too. Unmounting (e.g. navigating into /admin) removes it.
 */
export function LightScope() {
  useEffect(() => {
    document.body.classList.add("flux-light");
    return () => document.body.classList.remove("flux-light");
  }, []);

  return null;
}