"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "light" | "dark";

const STORAGE_KEY = "theme-storage";
const LIGHT_COLOR = "#f4f7fc";
const DARK_COLOR = "#04020a";

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

/**
 * Single source of truth: the theme scope lives on <html> only, as both
 * a `flux-light` / `flux-dark` class (drives the CSS variables) and a
 * `data-theme` attribute (drives meta tags / future styling).
 *
 * Never put the class on <body> or a layout wrapper — nested scopes
 * override each other and the toggle appears to do nothing.
 */
function applyTheme(theme: Theme, animate = true) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const commit = () => {
    root.dataset.theme = theme;
    root.classList.toggle("flux-light", theme === "light");
    root.classList.toggle("flux-dark", theme === "dark");
    root.style.colorScheme = theme;

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", theme === "light" ? LIGHT_COLOR : DARK_COLOR);
    }
  };

  if (!animate || reduceMotion) {
    commit();
    return;
  }

  const doc = document as Document & {
    startViewTransition?: (update: () => void) => unknown;
  };

  if (typeof doc.startViewTransition === "function") {
    // Chrome/Edge/Safari 18+: cross-fade the whole page smoothly.
    doc.startViewTransition(commit);
    return;
  }

  // Fallback: briefly enable palette transitions on every surface.
  commit();
  root.classList.add("theme-animating");
  window.setTimeout(() => root.classList.remove("theme-animating"), 400);
}

function readStoredTheme(): Theme | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const theme = JSON.parse(raw)?.state?.theme;
    return theme === "light" || theme === "dark" ? theme : null;
  } catch {
    return null;
  }
}

/** First visit (or corrupted storage): follow the OS preference. */
function detectTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "light",
      setTheme: (theme: Theme) => {
        set({ theme });
        applyTheme(theme);
      },
      toggleTheme: () => {
        const next: Theme = get().theme === "light" ? "dark" : "light";
        set({ theme: next });
        applyTheme(next);
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);

if (typeof window !== "undefined") {
  // Persisted values hydrate synchronously during create(). If nothing
  // usable was stored, seed from the OS preference so the store agrees
  // with what the pre-paint script already put on <html>.
  const stored = readStoredTheme();
  if (stored !== useThemeStore.getState().theme) {
    useThemeStore.setState({ theme: stored ?? detectTheme() });
  }

  // Never animate the very first application — the pre-paint script in
  // the root layout already set the correct theme before this runs.
  applyTheme(useThemeStore.getState().theme, false);

  // Keep every open tab in sync.
  window.addEventListener("storage", (event) => {
    if (event.key !== STORAGE_KEY || !event.newValue) return;
    try {
      const theme = JSON.parse(event.newValue)?.state?.theme;
      if (theme === "light" || theme === "dark") {
        useThemeStore.setState({ theme });
        applyTheme(theme, false);
      }
    } catch {
      /* ignore malformed payloads */
    }
  });
}
