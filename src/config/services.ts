/** The six service identifiers, as a typed tuple (usable with zod's z.enum). */
export const SERVICE_SLUGS = [
  "discord",
  "fivem",
  "websites",
  "dashboards",
  "custom-programming",
  "ui-design",
] as const;

export type ServiceSlug = (typeof SERVICE_SLUGS)[number];

export interface Service {
  /** English kebab-case identifier, used as the form/API value */
  slug: ServiceSlug;
  /** Arabic title shown to customers */
  title: string;
  /** Arabic one-line description */
  summary: string;
  /** What the client actually receives — factual bullets, no guarantees */
  deliverables: string[];
  /** lucide-react icon name (resolved in components) */
  icon: string;
}

/**
 * The six services FLUX actually offers. This is the single source of truth:
 * the storefront services page, the request form and the API validation all
 * read from it. Copy stays honest — no superlatives, no response-time claims.
 */
export const SERVICES: Service[] = [
  {
    slug: "discord",
    title: "تطوير ديسكورد",
    summary: "بوتات وأنظمة مخصصة لإدارة سيرفرك وتنظيم أعضائه.",
    deliverables: [
      "إعداد بوت مخصص بالوظائف التي تحتاجها",
      "نظام تخدير وسجلات للأحداث والرسائل",
      "نظام تذاكر لمتابعة طلبات الأعضاء",
      "أتمتة الرتب والصلاحيات حسب قواعد سيرفرك",
    ],
    icon: "Bot",
  },
  {
    slug: "fivem",
    title: "تطوير FiveM",
    summary: "سكربتات وأنظمة مخصصة لسيرفر FiveM الخاص بك.",
    deliverables: [
      "برمجة سكربتات مخصصة (Lua/JS) حسب فكرتك",
      "أنظمة لعب وتوازن تُبنى على متطلباتك",
      "ربط السكربتات بقاعدة بيانات سيرفرك",
      "تجربة السكربتات داخل سيرفرك قبل التسليم",
    ],
    icon: "Gamepad2",
  },
  {
    slug: "websites",
    title: "المواقع",
    summary: "مواقع تعريفية ومتاجر إلكترونية مبنية على احتياجاتك.",
    deliverables: [
      "تصميم صفحات متجاوبة تعمل على الجوال والحاسوب",
      "تهيئة النطاق والاستضافة وربطها بالموقع",
      "لوحة محتوى بسيطة لتحديث بياناتك بنفسك",
      "نسخة تجريبية للمراجعة قبل النشر",
    ],
    icon: "Globe",
  },
  {
    slug: "dashboards",
    title: "لوحات التحكم",
    summary: "واجهات إدارية لعرض بياناتك وإدارة عملياتك من مكان واحد.",
    deliverables: [
      "واجهة إدارية تعرض البيانات التي تحتاجها",
      "مصادقة وصلاحيات للمستخدمين",
      "رسوم بيانية وتقارير من بياناتك الفعلية",
      "ربط اللوحة بمصدر بياناتك أو قاعدة بياناتك",
    ],
    icon: "LayoutDashboard",
  },
  {
    slug: "custom-programming",
    title: "برمجة مخصصة",
    summary: "أتمتة المهام المتكررة وبناء الأدوات التي لا تجدها جاهزة.",
    deliverables: [
      "أتمتة عمليات متكررة توفر وقت فريقك",
      "أدوات صغيرة لأعمالك تُبنى حسب طلبك",
      "ربط الأنظمة والخدمات عبر واجهات API",
      "تسليم الكود مع شرح طريقة استخدامه",
    ],
    icon: "Code",
  },
  {
    slug: "ui-design",
    title: "تصميم واجهات",
    summary: "واجهات واضحة وسهلة الاستخدام لموقعك أو تطبيقك.",
    deliverables: [
      "تصميم شاشات موقعك أو تطبيقك كملفات مصدّرة",
      "نظام ألوان وخطوط وعناصر قابلة لإعادة الاستخدام",
      "نسخة تفاعلية لتجربة التصميم قبل التنفيذ",
      "ملفات التصميم جاهزة للتسليم للمبرمج",
    ],
    icon: "Palette",
  },
];
