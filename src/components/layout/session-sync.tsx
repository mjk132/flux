"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth";

interface FreshUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string | null;
  discordUsername?: string | null;
}

/**
 * Re-sync the signed-in user (role, name, avatar, active flag) from the
 * server on every full page load.
 *
 * The auth store persists to localStorage at login time, so without this a
 * role granted by the owner stays invisible until the user logs out and
 * back in — both the navbar's admin link and the /admin guard read this
 * store, while the server already authorises the new role immediately.
 */
export function SessionSync() {
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (cancelled) return;
        if (res.status === 401) {
          // Token rejected (expired/tampered): the session is dead on the
          // server already — clear the stale local copy instead of showing
          // a logged-in UI whose every request fails.
          useAuthStore.getState().logout();
          return;
        }
        if (!res.ok) return; // transient server error: keep cached state
        const data = await res.json();
        const fresh: FreshUser | undefined = data?.user;
        if (!fresh?.id) return;

        const cur = useAuthStore.getState().user;
        const changed =
          !cur ||
          cur.id !== fresh.id ||
          cur.name !== fresh.name ||
          cur.email !== fresh.email ||
          cur.role !== fresh.role ||
          (cur.avatar ?? null) !== (fresh.avatar ?? null) ||
          (cur.discordUsername ?? null) !== (fresh.discordUsername ?? null);
        if (changed) useAuthStore.getState().setUser(fresh);
      } catch {
        /* offline / transient network error: keep the cached session */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  return null;
}
