import { NextRequest, NextResponse } from "next/server";

/**
 * تسجيل الدخول أصبح فقط عبر ديسكورد (OAuth).
 * هذه الواجهة مغلقة ولا تقبل البريد الإلكتروني وكلمة المرور بعد الآن.
 */
export async function POST(_request: NextRequest) {
  return NextResponse.json(
    { error: "Login via email is disabled. Use Discord login instead." },
    { status: 403 }
  );
}
