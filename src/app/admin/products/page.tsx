"use client";

import { useEffect, useState, useCallback } from "react";
import { authFetch } from "@/store/auth";
import { formatPrice, formatDate } from "@/lib/utils";
import { getSalePrice } from "@/lib/pricing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Pagination } from "@/components/ui/pagination";
import { useToast } from "@/components/ui/toast";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalFooter,
  ModalClose,
} from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Search,
  Star,
  Award,
  Image as ImageIcon,
  Upload,
  X,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice: number | null;
  discount: number;
  status: string;
  stock: number;
  isFeatured: boolean;
  isBestSeller: boolean;
  productType: string;
  sku: string | null;
  discordRoleId: string | null;
  category: { id: string; name: string };
  images: Array<{ url: string }>;
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const statusLabels: Record<string, { label: string; variant: "success" | "warning" | "danger" | "info" | "default" }> = {
  PUBLISHED: { label: "منشور", variant: "success" },
  DRAFT: { label: "مسودة", variant: "warning" },
  ARCHIVED: { label: "أرشفة", variant: "default" },
};

const emptyProduct = {
  name: "",
  description: "",
  price: 0,
  comparePrice: 0,
  discount: 0,
  categoryId: "",
  status: "DRAFT",
  stock: 0,
  sku: "",
  discordRoleId: "",
  isFeatured: false,
  isBestSeller: false,
  productType: "DIGITAL",
  images: [] as Array<{ url: string; alt?: string }>,
};

/* Live preview of what the customer is actually charged. The store keeps
   price, compare price and discount as three separate fields, and reading
   them inconsistently is what made a "-50%" badge sit next to an unchanged
   price on the storefront. Showing the outcome while typing removes the
   guesswork. */
function PricePreview({
  price,
  comparePrice,
  discount,
}: {
  price: number;
  comparePrice: number;
  discount: number;
}) {
  const sale = getSalePrice({ price, comparePrice, discount });

  // Nothing to warn about when the customer just pays the listed price.
  if (sale.was === null) return null;

  return (
    <div className="col-span-2 rounded-xl border border-purple-accent/25 bg-purple-accent/10 px-3.5 py-2.5 text-[12.5px]">
      <span className="text-gray-muted">سعر العميل في المتجر: </span>
      <span className="font-extrabold text-purple-accent">
        {formatPrice(sale.final)}
      </span>
      <span className="mx-2 text-gray-muted line-through">
        {formatPrice(sale.was)}
      </span>
      <span className="font-bold text-danger">-{sale.percent}%</span>
    </div>
  );
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyProduct);
  const [saving, setSaving] = useState(false);
  const { success, error } = useToast();

  const fetchProducts = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });
      if (search) params.set("search", search);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (categoryFilter !== "all") params.set("category", categoryFilter);

      const res = await authFetch(`/api/products?${params}`);
      const json = await res.json();
      setProducts(json.products || []);
      setPagination(json.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 });
    } catch {
      /* empty */
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, categoryFilter]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await authFetch("/api/categories");
      const json = await res.json();
      setCategories(Array.isArray(json) ? json : json.data || []);
    } catch {
      /* empty */
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchProducts(1);
  }, [fetchProducts]);

  function openCreate() {
    setEditingProduct(null);
    setForm(emptyProduct);
    setModalOpen(true);
  }

  function openEdit(product: Product) {
    setEditingProduct(product);
    setForm({
      name: product.name,
      description: "",
      price: product.price,
      comparePrice: product.comparePrice || 0,
      discount: product.discount || 0,
      categoryId: product.category?.id || "",
      status: product.status,
      stock: product.stock,
      sku: product.sku || "",
      discordRoleId: product.discordRoleId || "",
      isFeatured: product.isFeatured,
      isBestSeller: product.isBestSeller,
      productType: product.productType,
      images: product.images?.map((img) => ({ url: img.url, alt: "" })) || [],
    });
    setModalOpen(true);
  }

  async function uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "products");
    const res = await authFetch("/api/admin/upload", {
      method: "POST",
      body: formData,
    });
    const json = await res.json();
    if (!json.success || !json.url) throw new Error("فشل رفع الصورة");
    return json.url;
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    if (form.images.length + files.length > 5) {
      alert("الحد الأقصى 5 صور للمنتج");
      return;
    }
    files.forEach(async (file) => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`الملف ${file.name} أكبر من 5 ميغابايت`);
        return;
      }
      try {
        const url = await uploadImage(file);
        setForm({ ...form, images: [...form.images, { url, alt: file.name }] });
      } catch {
        alert("فشل رفع الصورة: " + file.name);
      }
    });
    e.target.value = "";
  }

  function handleImageDrop(e: React.DragEvent) {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;
    if (form.images.length + files.length > 5) {
      alert("الحد الأقصى 5 صور للمنتج");
      return;
    }
    files.forEach(async (file) => {
      if (!file.type.startsWith("image/")) return;
      if (file.size > 5 * 1024 * 1024) {
        alert(`الملف ${file.name} أكبر من 5 ميغابايت`);
        return;
      }
      try {
        const url = await uploadImage(file);
        setForm({ ...form, images: [...form.images, { url, alt: file.name }] });
      } catch {
        alert("فشل رفع الصورة: " + file.name);
      }
    });
  }

  function removeImage(index: number) {
    setForm({ ...form, images: form.images.filter((_, i) => i !== index) });
  }

  async function handleSave() {
    setSaving(true);
    try {
      const body = { ...form };
      if (editingProduct) {
        await authFetch(`/api/products/${editingProduct.id}`, {
          method: "PUT",
          body: JSON.stringify(body),
        });
      } else {
        await authFetch("/api/products", {
          method: "POST",
          body: JSON.stringify(body),
        });
      }
      setModalOpen(false);
      fetchProducts(pagination.page);
    } catch {
      /* empty */
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("هل أنت متأكد من حذف هذا المنتج؟")) return;
    try {
      await authFetch(`/api/products/${id}`, { method: "DELETE" });
      fetchProducts(pagination.page);
    } catch {
      /* empty */
    }
  }

  async function toggleFeatured(id: string, current: boolean) {
    try {
      await authFetch(`/api/products/${id}`, {
        method: "PUT",
        body: JSON.stringify({ isFeatured: !current }),
      });
      fetchProducts(pagination.page);
    } catch {
      /* empty */
    }
  }

  async function toggleBestSeller(id: string, current: boolean) {
    try {
      await authFetch(`/api/products/${id}`, {
        method: "PUT",
        body: JSON.stringify({ isBestSeller: !current }),
      });
      fetchProducts(pagination.page);
    } catch {
      /* empty */
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">المنتجات</h1>
        <Button onClick={openCreate}>
          <Plus className="ml-2 h-4 w-4" />
          إضافة منتج
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-text" />
          <Input
            placeholder="بحث عن منتج..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الحالات</SelectItem>
            <SelectItem value="PUBLISHED">منشور</SelectItem>
            <SelectItem value="DRAFT">مسودة</SelectItem>
            <SelectItem value="ARCHIVED">أرشفة</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="الفئة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الفئات</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-right font-medium text-gray-text">الصورة</th>
                <th className="px-4 py-3 text-right font-medium text-gray-text">الاسم</th>
                <th className="px-4 py-3 text-right font-medium text-gray-text">السعر</th>
                <th className="px-4 py-3 text-right font-medium text-gray-text">الفئة</th>
                <th className="px-4 py-3 text-right font-medium text-gray-text">الحالة</th>
                <th className="px-4 py-3 text-right font-medium text-gray-text">المخزون</th>
                <th className="px-4 py-3 text-right font-medium text-gray-text">التاريخ</th>
                <th className="px-4 py-3 text-right font-medium text-gray-text">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    <td className="px-4 py-3"><Skeleton className="h-10 w-10 rounded" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-32" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-5 w-16 rounded-full" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-10" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-8" /></td>
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-text">
                    لا توجد منتجات
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const st = statusLabels[product.status] || { label: product.status, variant: "default" as const };
                  const sale = getSalePrice(product);
                  return (
                    <tr key={product.id} className="border-b border-border transition-colors hover:bg-surface/50">
                      <td className="px-4 py-3">
                        {product.images?.[0] ? (
                          <img src={product.images[0].url} alt="" className="h-10 w-10 rounded object-cover" />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded bg-deep-purple text-gray-text">?</div>
                        )}
                      </td>
                      <td className="max-w-[200px] truncate px-4 py-3 font-medium text-white">
                        {product.name}
                      </td>
                      <td className="px-4 py-3 text-white">
                        {formatPrice(sale.final)}
                        {sale.was !== null && (
                          <span className="mr-1.5 text-xs text-gray-muted line-through">
                            {formatPrice(sale.was)}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-text">{product.category?.name || "-"}</td>
                      <td className="px-4 py-3">
                        <Badge variant={st.variant}>{st.label}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <span className={product.stock <= 5 ? "text-warning" : "text-white"}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-text">
                        {formatDate(product.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEdit(product)}>
                              <Pencil className="ml-2 h-4 w-4" />
                              تعديل
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleFeatured(product.id, product.isFeatured)}>
                              <Star className="ml-2 h-4 w-4" />
                              {product.isFeatured ? "إلغاء التمييز" : "تمييز"}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleBestSeller(product.id, product.isBestSeller)}>
                              <Award className="ml-2 h-4 w-4" />
                              {product.isBestSeller ? "إلغاء الأكثر مبيعاً" : "الأكثر مبيعاً"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDelete(product.id)} className="text-danger">
                              <Trash2 className="ml-2 h-4 w-4" />
                              حذف
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={fetchProducts}
      />

      {/* Create/Edit Modal */}
      <Modal open={modalOpen} onOpenChange={setModalOpen}>
        <ModalContent className="max-w-2xl">
          <ModalHeader>
            <ModalTitle>{editingProduct ? "تعديل المنتج" : "إضافة منتج جديد"}</ModalTitle>
          </ModalHeader>
          <div className="max-h-[60vh] space-y-4 overflow-y-auto">
            <Input
              label="اسم المنتج"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Textarea
              label="الوصف"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            {/* Image Upload Section */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-text">
                صور المنتج
              </label>
              <div
                className="flex flex-wrap gap-3 border-2 border-dashed border-border rounded-xl p-4 transition-colors hover:border-purple-accent/50"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleImageDrop}
              >
                <label className="flex flex-col items-center justify-center gap-2 cursor-pointer w-28 h-28 rounded-lg border-2 border-dashed border-purple-accent/50 bg-purple-accent/5 text-purple-accent transition-all hover:bg-purple-accent/10">
                  <Upload className="h-6 w-6" />
                  <span className="text-xs">إضافة صورة</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageSelect}
                  />
                </label>
                {form.images.map((img, index) => (
                  <div key={index} className="relative w-28 h-28 rounded-lg overflow-hidden">
                    <img
                      src={img.url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-danger/90 text-white flex items-center justify-center hover:bg-danger transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-[11.5px] text-gray-muted">
                اسحب وأفلت الصور أو اضغط على "إضافة صورة". الحد الأقصى: 5 صور، 5 ميغابايت لكل صورة.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="السعر"
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
              />
              <Input
                label="سعر المقارنة"
                type="number"
                value={form.comparePrice}
                onChange={(e) => setForm({ ...form, comparePrice: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="الخصم %"
                type="number"
                value={form.discount}
                onChange={(e) => setForm({ ...form, discount: parseFloat(e.target.value) || 0 })}
              />
              <Input
                label="المخزون"
                type="number"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })}
              />
            </div>
            <PricePreview
              price={form.price}
              comparePrice={form.comparePrice}
              discount={form.discount}
            />
            <Input
              label="SKU"
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
            />
            <Input
              label="Discord Role ID"
              value={form.discordRoleId}
              onChange={(e) => setForm({ ...form, discordRoleId: e.target.value })}
              placeholder="مثلا: 123456789012345678"
              dir="ltr"
              className="text-left"
            />
            <p className="-mt-2 text-[11.5px] leading-relaxed text-gray-muted">
              تُمنح هذه الرتبة تلقائياً في سيرفر الديسكورد عند تأكيد الدفع. انسخ
              ID الرتبة من إعدادات السيرفر (Developer Mode ← Copy Role ID).
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-text">الفئة</label>
                <Select value={form.categoryId} onValueChange={(v) => setForm({ ...form, categoryId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الفئة" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-text">الحالة</label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">مسودة</SelectItem>
                    <SelectItem value="PUBLISHED">منشور</SelectItem>
                    <SelectItem value="ARCHIVED">أرشفة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.isFeatured}
                  onCheckedChange={(v) => setForm({ ...form, isFeatured: v })}
                />
                <span className="text-sm text-gray-text">منتج مميز</span>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.isBestSeller}
                  onCheckedChange={(v) => setForm({ ...form, isBestSeller: v })}
                />
                <span className="text-sm text-gray-text">الأكثر مبيعاً</span>
              </div>
            </div>
          </div>
          <ModalFooter>
            <ModalClose asChild>
              <Button variant="secondary">إلغاء</Button>
            </ModalClose>
            <Button onClick={handleSave} loading={saving}>
              {editingProduct ? "حفظ التعديلات" : "إضافة"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
