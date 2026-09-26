"use client";

import { useCallback, useSyncExternalStore } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

export interface ToastAction {
  label: string;
  href: string;
}

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: ToastAction;
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const colors = {
  success: "border-success/30 bg-success/10 text-success",
  error: "border-danger/30 bg-danger/10 text-danger",
  warning: "border-warning/30 bg-warning/10 text-warning",
  info: "border-info/30 bg-info/10 text-info",
};

/* ── One shared queue ──────────────────────────────────────────────────
   This used to exist in two disconnected copies: <ToastContainer> kept its
   own `toasts` array and useToast() kept another one, so a store component
   calling success() wrote into a list nothing ever rendered — the customer
   clicked "add to cart" and the page stayed completely silent. The single
   module-level queue below is what both the renderer and the hook talk to,
   so any component, on any page, can raise a toast that actually appears.

   It is a plain module store (not React context) on purpose: the container
   lives in the root layout, one level above every caller. */

/** Never let toasts pile up — keep only the newest few on screen. */
const MAX_VISIBLE = 3;

let queue: Toast[] = [];
const listeners = new Set<() => void>();
const timers = new Map<string, ReturnType<typeof setTimeout>>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return queue;
}

/* The server renders no toasts. Returning one constant keeps the snapshot
   referentially stable, which useSyncExternalStore requires. */
const NO_TOASTS: Toast[] = [];
function getServerSnapshot() {
  return NO_TOASTS;
}

function dismiss(id: string) {
  const timer = timers.get(id);
  if (timer) {
    clearTimeout(timer);
    timers.delete(id);
  }
  queue = queue.filter((t) => t.id !== id);
  emit();
}

function pushToast(toast: Omit<Toast, "id">): string {
  const id = Math.random().toString(36).slice(2) + Date.now().toString(36);

  // Drop the oldest when at capacity so a burst of clicks stays readable.
  queue = [...queue, { ...toast, id }].slice(-MAX_VISIBLE);
  emit();

  timers.set(
    id,
    setTimeout(() => dismiss(id), toast.duration ?? 4000)
  );
  return id;
}

export function ToastContainer() {
  const toasts = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (toasts.length === 0) return null;

  return (
    /* pointer-events-none on the wrapper so an empty/stacked area never
       blocks clicks on the page underneath; each toast opts back in. */
    <div
      dir="rtl"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-20 z-[100] flex flex-col items-start gap-2 lg:inset-x-auto lg:bottom-6 lg:right-6"
    >
      {toasts.map((toast) => {
        const Icon = icons[toast.type];
        return (
          <div
            key={toast.id}
            className={cn(
              /* bottom-20 on small screens clears the mobile bottom nav */
              "pointer-events-auto flex w-full max-w-md min-w-[260px] animate-flux-toast items-start gap-3 rounded-xl border px-4 py-3 shadow-xl backdrop-blur-md",
              colors[toast.type]
            )}
          >
            <Icon className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="font-medium">{toast.title}</p>
              {toast.message && (
                <p className="mt-0.5 text-sm opacity-80">{toast.message}</p>
              )}
              {toast.action && (
                <Link
                  href={toast.action.href}
                  onClick={() => dismiss(toast.id)}
                  className="mt-2 inline-flex items-center rounded-lg border border-current px-2.5 py-1 text-xs font-bold transition-opacity hover:opacity-75"
                >
                  {toast.action.label}
                </Link>
              )}
            </div>
            <button
              onClick={() => dismiss(toast.id)}
              className="flex-shrink-0 p-1 opacity-50 transition-opacity hover:opacity-100"
              aria-label="إغلاق"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

/* The helpers are stable module functions, so calling this hook does not
   make a component re-render every time a toast appears — relevant for the
   product grid, where every card would otherwise re-render at once. */
export function useToast() {
  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    pushToast(toast);
  }, []);

  const removeToast = useCallback((id: string) => {
    dismiss(id);
  }, []);

  const success = (title: string, message?: string, action?: ToastAction) =>
    pushToast({ type: "success", title, message, action });
  const error = (title: string, message?: string, action?: ToastAction) =>
    pushToast({ type: "error", title, message, action });
  const warning = (title: string, message?: string, action?: ToastAction) =>
    pushToast({ type: "warning", title, message, action });
  const info = (title: string, message?: string, action?: ToastAction) =>
    pushToast({ type: "info", title, message, action });

  return { addToast, removeToast, success, error, warning, info };
}
