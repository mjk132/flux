import { NextRequest, NextResponse } from "next/server";

/**
 * التسجيل أصبح فقط عبر ديسكورد (OAuth) — يُنشأ الحساب تلقائياً عند الدخول.
 * هذه الواجهة مغلقة ولا تقبل إنشاء حساب بالبريد الإلكتروني.
 */
export async function POST(_request: NextRequest) {
  return NextResponse.json(
    { error: "Registration is disabled. Login with Discord instead." },
    { status: 403 }
  );
}
