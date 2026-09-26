"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { authFetch, getAuthHeaders } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { PAYMENT_PROVIDERS } from "@/lib/payment-providers";
import { Save, CreditCard } from "lucide-react";

interface Setting {
  id: string;
  key: string;
  value: string;
}

/* Only settings that actually drive the storefront are editable here.
   The old general/social/footer tabs edited keys (store_name, hero_title,
   contact_email, social_*, footer_text…) that nothing reads — controls
   that silently do nothing erode trust in the whole panel. */

export default function AdminSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingQr, setUploadingQr] = useState(false);
  const qrInputRef = useRef<HTMLInputElement>(null);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch("/api/admin/settings");
      const json = await res.json();
      const settingsArr = json.settings || [];
      const map: Record<string, string> = {};
      for (const s of settingsArr) {
        map[s.key] = s.value;
      }
      setSettings(map);
    } catch {
      /* empty */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      await authFetch("/api/admin/settings", {
        method: "PUT",
        body: JSON.stringify({ settings }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      /* empty */
    } finally {
      setSaving(false);
    }
  }

  function updateSetting(key: string, value: string) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  async function handleQrUpload(file: File | undefined) {
    if (!file) return;
    setUploadingQr(true);
    try {
      const form = new FormData();
      form.set("file", file);
      form.set("folder", "paypal");
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { ...getAuthHeaders() },
        body: form,
      });
      const json = await res.json();
      if (json.success) {
        updateSetting("paypal_qr_image", json.url);
      }
    } catch {
      /* empty */
    } finally {
      setUploadingQr(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">الإعدادات</h1>
        <Card className="p-6">
          <Skeleton className="h-96 w-full" />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">الإعدادات</h1>
        <Button onClick={handleSave} loading={saving}>
          <Save className="ml-2 h-4 w-4" />
          حفظ الإعدادات
        </Button>
      </div>

      {saved && (
        <div className="rounded-lg bg-success/10 p-3 text-sm text-success">
          تم حفظ الإعدادات بنجاح
        </div>
      )}

      <Tabs defaultValue="payment">
        <TabsList>
          <TabsTrigger value="payment">
            <CreditCard className="ml-1.5 h-4 w-4" />
            الدفع
          </TabsTrigger>
          <TabsTrigger value="discord">ديسكورد</TabsTrigger>
        </TabsList>

        <TabsContent value="payment">
          <Card className="space-y-6 p-6">
            <div className="space-y-4 border-b border-border/60 pb-5">
              <p className="text-sm font-bold text-white">
                PayPal (تحويل يدوي)
              </p>
              <Input
                label="بريد PayPal"
                value={settings["paypal_email"] || ""}
                onChange={(e) =>
                  updateSetting("paypal_email", e.target.value)
                }
                placeholder="you@paypal.com"
                dir="ltr"
                className="text-left"
              />
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-text">
                  صورة QR
                </label>
                <div className="flex items-center gap-4">
                  {settings["paypal_qr_image"] ? (
                    <img
                      src={settings["paypal_qr_image"]}
                      alt="PayPal QR"
                      className="h-24 w-24 rounded-xl border border-border bg-white object-contain"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-xl border border-dashed border-border text-[11px] text-gray-muted">
                      لا توجد صورة
                    </div>
                  )}
                  <div>
                    <input
                      ref={qrInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleQrUpload(e.target.files?.[0])}
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => qrInputRef.current?.click()}
                      loading={uploadingQr}
                    >
                      رفع صورة QR
                    </Button>
                    <p className="mt-1.5 max-w-[220px] text-[11px] leading-relaxed text-gray-muted">
                      تظهر هذه الصورة للعميل في صفحة الدفع
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-text">
                بوابة الدفع
              </label>
              <Select
                value={settings["payment_gateway"] || "cod"}
                onValueChange={(value) =>
                  updateSetting("payment_gateway", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر بوابة الدفع" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_PROVIDERS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="mt-1.5 text-xs text-gray-muted">
                {
                  PAYMENT_PROVIDERS.find(
                    (p) =>
                      p.value ===
                      (settings["payment_gateway"] || "cod")
                  )?.description
                }
              </p>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border bg-deep-purple/40 p-4">
              <div>
                <p className="text-sm font-medium text-white">
                  تفعيل الدفع الإلكتروني
                </p>
                <p className="text-xs text-gray-muted">
                  عند الإيقاف يعمل المتجر بالدفع عند الاستلام فقط
                </p>
              </div>
              <Switch
                checked={settings["payment_enabled"] === "1"}
                onCheckedChange={(checked) =>
                  updateSetting("payment_enabled", checked ? "1" : "0")
                }
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border bg-deep-purple/40 p-4">
              <div>
                <p className="text-sm font-medium text-white">وضع الاختبار</p>
                <p className="text-xs text-gray-muted">
                  استخدم مفاتيح الاختبار (Sandbox) قبل الإطلاق
                </p>
              </div>
              <Switch
                checked={settings["payment_test_mode"] === "1"}
                onCheckedChange={(checked) =>
                  updateSetting("payment_test_mode", checked ? "1" : "0")
                }
              />
            </div>

            <div className="space-y-4 border-t border-border/60 pt-5">
              <Input
                label="المفتاح العام (Publishable Key)"
                value={settings["payment_publishable_key"] || ""}
                onChange={(e) =>
                  updateSetting("payment_publishable_key", e.target.value)
                }
                placeholder="pk_live_..."
                dir="ltr"
                className="text-left"
              />
              <Input
                label="المفتاح السري (Secret Key)"
                type="password"
                value={settings["payment_secret_key"] || ""}
                onChange={(e) =>
                  updateSetting("payment_secret_key", e.target.value)
                }
                placeholder="sk_live_..."
                dir="ltr"
                className="text-left"
              />
              <Input
                label="مفتاح الويب هوك (Webhook Secret)"
                value={settings["payment_webhook_secret"] || ""}
                onChange={(e) =>
                  updateSetting("payment_webhook_secret", e.target.value)
                }
                placeholder="whsec_..."
                dir="ltr"
                className="text-left"
              />
            </div>

            <div className="rounded-lg bg-purple-accent/10 p-4 text-xs leading-relaxed text-gray-text">
              ضع المفاتيح من لوحة تحكم البوابة (منطقة التطبيقات/المفاتيح). عند
              اختيار بوابة غير الدفع عند الاستلام، أضف رابط الويب هوك التالي في
              لوحة البوابة: <code className="text-purple-accent">/api/payments/webhook</code>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="discord">
          <Card className="space-y-4 p-6">
            <div>
              <Input
                label="رابط دعوة السيرفر"
                value={settings["discord_link"] || ""}
                onChange={(e) =>
                  updateSetting("discord_link", e.target.value.trim())
                }
                placeholder="https://discord.gg/..."
                dir="ltr"
                className="text-left"
              />
              <p className="mt-1.5 text-xs text-gray-muted">
                يظهر في الفوتر ودعوة الديسكورد بالصفحة الرئيسية.
              </p>
            </div>
            <Input
              label="Discord Server ID"
              value={settings["discord_guild_id"] || ""}
              onChange={(e) =>
                updateSetting("discord_guild_id", e.target.value.trim())
              }
              placeholder="مثلا: 123456789012345678"
              dir="ltr"
              className="text-left"
            />
            <div className="rounded-lg bg-purple-accent/10 p-4 text-xs leading-relaxed text-gray-text">
              <p className="mb-2 font-bold text-white">خطوات التفعيل:</p>
              <p>1. فعّل Developer Mode في ديسكورد، ثم كليك يمين على السيرفر ← Copy Server ID والصقه هنا.</p>
              <p>2. أضف البوت إلى سيرفرك وأعطه صلاحية Manage Roles.</p>
              <p>3. ضع رتبة البوت فوق رتب المنتجات في إعدادات السيرفر.</p>
              <p>4. ضع توكن البوت في ملف .env باسم DISCORD_BOT_TOKEN.</p>
              <p className="mt-2">عند تأكيد الدفع تُمنح رتب المنتجات تلقائياً للأعضاء المسجلين عبر ديسكورد. بدون التوكن أو الـ ID يعمل تأكيد الدفع بشكل طبيعي لكن بدون منح الرتب.</p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
