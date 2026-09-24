"use client";

import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { ShieldCheck } from "lucide-react";

function DiscordLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.947 2.418-2.157 2.418z" />
    </svg>
  );
}

const errorMessages: Record<string, string> = {
  "discord-not-configured":
    "دخول ديسكورد غير مفعّل بعد. تأكد من إعداد DISCORD_CLIENT_ID في ملف .env",
  "discord-denied": "تم إلغاء تسجيل الدخول عبر ديسكورد",
  "discord-failed": "تعذّر الاتصال بديسكورد، حاول مرة أخرى",
  "missing-code": "حدث خطأ في تسجيل الدخول، حاول مرة أخرى",
};

function LoginContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full ring-1 ring-white/10">
            <Image
              src="/logo.png"
              alt="Flux Store"
              width={64}
              height={64}
              className="object-cover"
            />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            تسجيل الدخول عبر ديسكورد
          </h1>
          <p className="mt-2 text-sm text-gray-text">
            الدخول إلى Flux Store يتم فقط بحساب ديسكورد
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6">
          <a
            href="/api/auth/discord?next=/account"
            className="flex h-13 w-full items-center justify-center gap-3 rounded-xl bg-[#5865F2] px-6 text-[15px] font-bold text-[#ffffff] transition-all hover:bg-[#4752c4] hover:shadow-[0_0_30px_rgba(88,101,242,0.45)]"
          >
            <DiscordLogo className="h-6 w-6" />
            الدخول بحساب ديسكورد
          </a>

          {error && errorMessages[error] && (
            <div className="mt-4 rounded-lg bg-danger/10 p-3 text-center text-[13px] text-danger">
              {errorMessages[error]}
            </div>
          )}

          <div className="mt-5 space-y-2 border-t border-border/60 pt-5 text-center">
            <p className="text-[12.5px] leading-relaxed text-gray-text">
              لأول مرة؟ سيتم إنشاء حسابك تلقائياً عند الدخول.
            </p>
            <p className="flex items-center justify-center gap-1.5 text-[12px] text-gray-muted">
              <ShieldCheck className="h-3.5 w-3.5 text-purple-accent" />
              لا نشارك بياناتك مع أي جهة خارجية
            </p>
          </div>
        </div>

        <p className="mt-5 text-center text-[12.5px] text-gray-muted">
          تواجه مشكلة في الدخول؟{" "}
          <Link
            href="/faq"
            className="font-semibold text-purple-accent hover:underline"
          >
            اقرأ الأسئلة الشائعة
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
