export type PaymentProvider =
  | "cod"
  | "moyasar"
  | "tap"
  | "paytabs"
  | "stripe"
  | "hyperpay";

export const PAYMENT_PROVIDERS: {
  value: PaymentProvider;
  label: string;
  description: string;
}[] = [
  {
    value: "cod",
    label: "الدفع عند الاستلام",
    description: "لا يحتاج أي مفاتيح — متاح دائماً",
  },
  {
    value: "moyasar",
    label: "Moyasar",
    description: "بطاقات مدى/فيزا/ماستركارد محلياً",
  },
  {
    value: "tap",
    label: "Tap Payments",
    description: "مدى + Apple Pay + بطاقات",
  },
  {
    value: "paytabs",
    label: "PayTabs",
    description: "بوابة دفع عربية شهيرة",
  },
  {
    value: "stripe",
    label: "Stripe",
    description: "بوابة عالمية",
  },
  {
    value: "hyperpay",
    label: "HyperPay",
    description: "مدى + تحويل + محافظ إلكترونية",
  },
];
