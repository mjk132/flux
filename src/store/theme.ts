"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "light" | "dark";

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  initTheme: () => void;
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
        const newTheme = get().theme === "light" ? "dark" : "light";
        set({ theme: newTheme });
        applyTheme(newTheme);
      },
      initTheme: () => {
        // Only run on client
        if (typeof window !== "undefined") {
          const stored = localStorage.getItem("theme-storage");
          if (stored) {
            try {
              const { state } = JSON.parse(stored);
              applyTheme(state.theme);
            } catch {
              applyTheme("light");
            }
          } else {
            applyTheme("light");
          }
        }
      },
    }),
    {
      name: "theme-storage",
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);

function applyTheme(theme: Theme) {
  if (typeof window === "undefined") return;
  const root = document.documentElement;
  const body = document.body;
  
  if (theme === "dark") {
    root.classList.remove("flux-light");
    body.classList.remove("flux-light");
    body.classList.add("flux-dark");
  } else {
    root.classList.add("flux-light");
    body.classList.add("flux-light");
    body.classList.remove("flux-dark");
  }
}

// Initialize on client
if (typeof window !== "undefined") {
  useThemeStore.getState().initTheme();
}