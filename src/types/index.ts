import type {
  User as PrismaUser,
  Category as PrismaCategory,
  Product as PrismaProduct,
  ProductImage as PrismaProductImage,
  Inventory as PrismaInventory,
  Order as PrismaOrder,
  OrderItem as PrismaOrderItem,
  Payment as PrismaPayment,
  Coupon as PrismaCoupon,
  CouponUsage as PrismaCouponUsage,
  CouponProduct as PrismaCouponProduct,
  Review as PrismaReview,
  Wishlist as PrismaWishlist,
  Notification as PrismaNotification,
  Banner as PrismaBanner,
  FAQ as PrismaFAQ,
  Setting as PrismaSetting,
  Session as PrismaSession,
  AuditLog as PrismaAuditLog,
} from "@/generated/prisma";

// ─── DB Model Types ─────────────────────────────────────────────────────────

export type User = PrismaUser;
export type Category = PrismaCategory;
export type Product = PrismaProduct;
export type ProductImage = PrismaProductImage;
export type Inventory = PrismaInventory;
export type Order = PrismaOrder;
export type OrderItem = PrismaOrderItem;
export type Payment = PrismaPayment;
export type Coupon = PrismaCoupon;
export type CouponUsage = PrismaCouponUsage;
export type CouponProduct = PrismaCouponProduct;
export type Review = PrismaReview;
export type Wishlist = PrismaWishlist;
export type Notification = PrismaNotification;
export type Banner = PrismaBanner;
export type FAQ = PrismaFAQ;
export type Setting = PrismaSetting;
export type Session = PrismaSession;
export type AuditLog = PrismaAuditLog;

// ─── API Response Types ─────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success?: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: "asc" | "desc";
}

// ─── Dashboard Stats ────────────────────────────────────────────────────────

export interface DashboardStats {
  totalRevenue: number;
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalCustomers: number;
  totalProducts: number;
  lowStockProducts: number;
  recentOrders: Order[];
  topProducts: TopProduct[];
  revenueChart: ChartData[];
  salesByCategory: CategorySales[];
}

export interface TopProduct {
  id: string;
  name: string;
  totalSold: number;
  revenue: number;
}

export interface ChartData {
  date: string;
  revenue: number;
  orders: number;
}

export interface CategorySales {
  category: string;
  total: number;
}

export interface OrderStatusCount {
  status: string;
  count: number;
}

// ─── Extended Types with Relations ──────────────────────────────────────────

export interface ProductWithRelations extends Product {
  images: ProductImage[];
  category: Category | null;
  reviews?: Review[];
  inventory?: Inventory[];
  _count?: {
    reviews: number;
    orderItems: number;
  };
}

export interface OrderWithRelations extends Order {
  items: (OrderItem & { product: Product })[];
  payments: Payment[];
  user: Pick<User, "id" | "name" | "email" | "phone">;
}

export interface UserWithOrders extends User {
  _count: {
    orders: number;
    reviews: number;
  };
}

export interface CategoryWithProducts extends Category {
  _count: {
    products: number;
  };
}
