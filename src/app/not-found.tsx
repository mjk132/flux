import Link from "next/link";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 text-7xl font-bold text-purple-accent">404</div>
      <h1 className="mb-3 text-2xl font-bold text-white">
        الصفحة غير موجودة
      </h1>
      <p className="mb-6 max-w-md text-gray-text">
        عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها إلى عنوان آخر.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-lg bg-purple-accent px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-violet"
      >
        <Home className="h-4 w-4" />
        العودة إلى الصفحة الرئيسية
      </Link>
    </div>
  );
}
