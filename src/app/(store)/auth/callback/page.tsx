"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/auth";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((s) => s.login);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/auth/me", {
          cache: "no-store",
        });
        const data = await res.json();

        if (!res.ok || !data.user) {
          setError("لم نتمكن من تسجيل الدخول، حاول مرة أخرى");
          return;
        }

        const user = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          avatar: data.user.avatar,
          discordUsername: data.user.discordUsername,
        };

        login(user, data.token || "");

        if (!cancelled) {
          const next = searchParams.get("next") || "/account";
          router.replace(next.startsWith("/") ? next : "/account");
        }
      } catch {
        setError("حدث خطأ، حاول مرة أخرى");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [login, router, searchParams]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      {error ? (
        <>
          <p className="text-[15px] font-semibold text-danger">{error}</p>
          <button
            onClick={() => router.replace("/auth/login")}
            className="mt-4 rounded-xl bg-purple-accent px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-violet"
          >
            العودة لتسجيل الدخول
          </button>
        </>
      ) : (
        <>
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-purple-accent border-t-transparent" />
          <p className="mt-4 text-sm text-gray-text">جارٍ تسجيل الدخول...</p>
        </>
      )}
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <CallbackContent />
    </Suspense>
  );
}
