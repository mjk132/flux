export const STORE = {
  name: "FLUX STORE",
  tagline: "حلول رقمية بهوية مختلفة",
  description: "Premium digital store for scripts, bots, websites, and design.",
  url: process.env.NEXT_PUBLIC_STORE_URL || "http://localhost:3000",
  currency: "USD",
  currencySymbol: "$",
} as const;

export const ROLES = {
  CUSTOMER: "CUSTOMER",
  ADMIN: "ADMIN",
  SUPER_ADMIN: "SUPER_ADMIN",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PRODUCT_STATUSES = ["DRAFT", "ACTIVE", "ARCHIVED"] as const;

export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export const DEFAULT_PAGE_LIMIT = 12;

export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  CUSTOMER: [
    "products:read",
    "orders:create",
    "orders:read",
    "reviews:create",
    "wishlist:read",
    "wishlist:write",
    "profile:read",
    "profile:write",
  ],
  ADMIN: [
    "products:read",
    "products:write",
    "categories:read",
    "categories:write",
    "orders:read",
    "orders:write",
    "users:read",
    "coupons:read",
    "coupons:write",
    "banners:read",
    "banners:write",
    "faqs:read",
    "faqs:write",
    "reviews:read",
    "reviews:write",
    "settings:read",
    "dashboard:read",
    "inventory:read",
    "inventory:write",
  ],
  SUPER_ADMIN: [
    "products:read",
    "products:write",
    "categories:read",
    "categories:write",
    "orders:read",
    "orders:write",
    "users:read",
    "users:write",
    "coupons:read",
    "coupons:write",
    "banners:read",
    "banners:write",
    "faqs:read",
    "faqs:write",
    "reviews:read",
    "reviews:write",
    "settings:read",
    "settings:write",
    "dashboard:read",
    "inventory:read",
    "inventory:write",
    "audit:read",
    "roles:manage",
  ],
};
