import { z } from "zod";
import { SERVICE_SLUGS } from "@/config/services";

// ─── Auth ───────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// ─── Product ────────────────────────────────────────────────────────────────

export const productCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  short_description: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  compare_at_price: z.number().positive().optional().nullable(),
  sku: z.string().min(1, "SKU is required"),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).default("DRAFT"),
  category_id: z.string().uuid("Invalid category"),
  brand: z.string().optional().nullable(),
  weight: z.number().positive().optional().nullable(),
  dimensions: z.string().optional().nullable(),
  is_featured: z.boolean().default(false),
  is_digital: z.boolean().default(false),
  meta_title: z.string().optional().nullable(),
  meta_description: z.string().optional().nullable(),
  tags: z.array(z.string()).default([]),
  images: z
    .array(
      z.object({
        url: z.string().url(),
        alt_text: z.string().optional(),
        is_primary: z.boolean().default(false),
      })
    )
    .min(1, "At least one image is required"),
  inventory: z.object({
    quantity: z.number().int().min(0),
    low_stock_threshold: z.number().int().min(0).default(5),
  }),
});

export const productUpdateSchema = productCreateSchema.partial().extend({
  id: z.string().uuid(),
});

// ─── Category ───────────────────────────────────────────────────────────────

export const categoryCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().nullable(),
  image: z.string().url().optional().nullable(),
  parent_id: z.string().uuid().optional().nullable(),
  is_active: z.boolean().default(true),
  sort_order: z.number().int().default(0),
});

export const categoryUpdateSchema = categoryCreateSchema.partial().extend({
  id: z.string().uuid(),
});

// ─── Order ──────────────────────────────────────────────────────────────────

export const orderCreateSchema = z.object({
  shipping: z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email"),
    phone: z.string().min(1, "Phone is required"),
    address: z.string().min(1, "Address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    zip: z.string().min(1, "ZIP is required"),
    country: z.string().min(1, "Country is required"),
  }),
  billing: z
    .object({
      name: z.string().min(1),
      address: z.string().min(1),
      city: z.string().min(1),
      state: z.string().min(1),
      zip: z.string().min(1),
      country: z.string().min(1),
    })
    .optional(),
  items: z
    .array(
      z.object({
        product_id: z.string().uuid(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1, "At least one item is required"),
  coupon_code: z.string().optional(),
  notes: z.string().optional(),
  payment_method: z.string().min(1, "Payment method is required"),
});

// ─── Coupon ─────────────────────────────────────────────────────────────────

// Base shape kept separate from the refinement so `partial()` (used by the
// update schema below) stays available — zod refuses to call `.partial()` on
// a refined schema, which crashed this module at import time.
const couponCreateObject = z.object({
  code: z.string().min(3, "Code must be at least 3 characters"),
  description: z.string().optional().nullable(),
  discount_type: z.enum(["PERCENTAGE", "FIXED"]),
  discount_value: z.number().positive("Discount must be positive"),
  minimum_order: z.number().positive().optional().nullable(),
  maximum_discount: z.number().positive().optional().nullable(),
  usage_limit: z.number().int().positive().optional().nullable(),
  is_active: z.boolean().default(true),
  starts_at: z.string().datetime().optional().nullable(),
  expires_at: z.string().datetime().optional().nullable(),
});

export const couponCreateSchema = couponCreateObject.refine(
  (data) => {
    if (data.discount_type === "PERCENTAGE" && data.discount_value > 100)
      return false;
    return true;
  },
  { message: "Percentage discount cannot exceed 100", path: ["discount_value"] }
);

export const couponUpdateSchema = couponCreateObject.partial().extend({
  id: z.string().uuid(),
});

// ─── Review ─────────────────────────────────────────────────────────────────

export const reviewCreateSchema = z.object({
  product_id: z.string().uuid("Invalid product"),
  rating: z
    .number()
    .int()
    .min(1, "Rating must be between 1 and 5")
    .max(5, "Rating must be between 1 and 5"),
  title: z.string().max(200).optional().nullable(),
  comment: z.string().max(2000).optional().nullable(),
});

// ─── Banner ─────────────────────────────────────────────────────────────────

export const bannerCreateSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().optional().nullable(),
  image: z.string().url("Invalid image URL"),
  link: z.string().url().optional().nullable(),
  position: z.enum(["HOME_TOP", "HOME_MIDDLE", "SIDEBAR"]).default("HOME_TOP"),
  is_active: z.boolean().default(true),
  sort_order: z.number().int().default(0),
  starts_at: z.string().datetime().optional().nullable(),
  expires_at: z.string().datetime().optional().nullable(),
});

export const bannerUpdateSchema = bannerCreateSchema.partial().extend({
  id: z.string().uuid(),
});

// ─── FAQ ────────────────────────────────────────────────────────────────────

export const faqCreateSchema = z.object({
  question: z.string().min(1, "Question is required"),
  answer: z.string().min(1, "Answer is required"),
  category: z.string().optional().nullable(),
  sort_order: z.number().int().default(0),
  is_active: z.boolean().default(true),
});

export const faqUpdateSchema = faqCreateSchema.partial().extend({
  id: z.string().uuid(),
});

// ─── Service Request ────────────────────────────────────────────────────────

/** Email address OR a Discord-style handle (letters, numbers, dots, underscores). */
const contactRegex = /^(@?[\w.]{2,32}|[^@\s]+@[^@\s]+\.[^@\s]+)$/;

export const serviceRequestCreateSchema = z.object({
  name: z.string().trim().min(2, "الاسم قصير جداً"),
  contact: z
    .string()
    .trim()
    .min(3, "وسيلة التواصل قصيرة جداً")
    .regex(contactRegex, "أدخل بريداً إلكترونياً أو اسم مستخدم ديسكورد"),
  serviceType: z.enum(SERVICE_SLUGS, "اختر نوع الخدمة"),
  description: z
    .string()
    .trim()
    .min(20, "الوصف يجب أن يكون 20 حرفاً على الأقل")
    .max(2000, "الوصف طويل جداً (الحد الأقصى 2000 حرف)"),
});

export const serviceRequestStatusSchema = z.object({
  status: z.enum(["NEW", "CONTACTED", "CLOSED"], "حالة غير صالحة"),
});

// ─── Settings ───────────────────────────────────────────────────────────────

export const settingsUpdateSchema = z.object({
  store_name: z.string().min(1).optional(),
  store_tagline: z.string().optional(),
  store_description: z.string().optional(),
  store_email: z.string().email().optional(),
  store_phone: z.string().optional(),
  store_address: z.string().optional(),
  currency: z.string().optional(),
  tax_rate: z.number().min(0).max(100).optional(),
  shipping_cost: z.number().min(0).optional(),
  free_shipping_threshold: z.number().min(0).optional(),
  maintenance_mode: z.boolean().optional(),
  social_links: z
    .object({
      facebook: z.string().url().optional().nullable(),
      instagram: z.string().url().optional().nullable(),
      twitter: z.string().url().optional().nullable(),
      youtube: z.string().url().optional().nullable(),
    })
    .optional(),
});

// ─── Inferred Types ─────────────────────────────────────────────────────────

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ProductCreateInput = z.infer<typeof productCreateSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
export type CategoryCreateInput = z.infer<typeof categoryCreateSchema>;
export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>;
export type OrderCreateInput = z.infer<typeof orderCreateSchema>;
export type CouponCreateInput = z.infer<typeof couponCreateSchema>;
export type CouponUpdateInput = z.infer<typeof couponUpdateSchema>;
export type ReviewCreateInput = z.infer<typeof reviewCreateSchema>;
export type BannerCreateInput = z.infer<typeof bannerCreateSchema>;
export type BannerUpdateInput = z.infer<typeof bannerUpdateSchema>;
export type FAQCreateInput = z.infer<typeof faqCreateSchema>;
export type FAQUpdateInput = z.infer<typeof faqUpdateSchema>;
export type ServiceRequestCreateInput = z.infer<typeof serviceRequestCreateSchema>;
export type ServiceRequestStatusInput = z.infer<typeof serviceRequestStatusSchema>;
export type SettingsUpdateInput = z.infer<typeof settingsUpdateSchema>;
