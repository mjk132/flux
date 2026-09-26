"use client";

import { useEffect, useState } from "react";
import { Package, Copy, Check } from "lucide-react";
import { authFetch } from "@/store/auth";

interface Purchase {
  id: string;
  orderNumber: string;
  createdAt: string;
  product: { name: string; slug: string };
  inventory: { code: string; status: string }[];
}

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPurchases() {
      try {
        const res = await authFetch("/api/orders?limit=50");
        const data = await res.json();
        const orders = data.data || [];
        const digitalItems: Purchase[] = [];
        for (const order of orders) {
          for (const item of order.items || []) {
            if (item.product?.productType === "DIGITAL") {
              digitalItems.push({
                id: item.id,
                orderNumber: order.orderNumber,
                createdAt: order.createdAt,
                product: item.product,
                inventory: [],
              });
            }
          }
        }
        setPurchases(digitalItems);
      } catch {
        setPurchases([]);
      } finally {
        setLoading(false);
      }
    }
    fetchPurchases();
  }, []);

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">منتجاتي المشتراة</h1>
        <p className="text-sm text-gray-text">
          جميع المنتجات الرقمية التي قمت بشرائها
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-deep-purple" />
          ))}
        </div>
      ) : purchases.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface p-8 text-center">
          <Package className="mx-auto mb-3 h-12 w-12 text-gray-text" />
          <p className="text-gray-text">لم تقم بشراء أي منتجات رقمية بعد</p>
        </div>
      ) : (
        <div className="space-y-3">
          {purchases.map((purchase) => (
            <div
              key={purchase.id}
              className="rounded-2xl border border-border bg-surface p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-white">
                    {purchase.product.name}
                  </h3>
                  <p className="text-xs text-gray-text">
                    طلب {purchase.orderNumber}
                  </p>
                </div>
              </div>

              {purchase.inventory.length > 0 && (
                <div className="mt-3 space-y-2">
                  {purchase.inventory.map((inv, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 rounded-lg bg-deep-purple px-3 py-2"
                    >
                      <code className="flex-1 text-sm text-purple-accent">
                        {inv.code}
                      </code>
                      <button
                        onClick={() => handleCopy(inv.code, `${purchase.id}-${i}`)}
                        className="text-gray-text hover:text-white transition-colors"
                      >
                        {copiedId === `${purchase.id}-${i}` ? (
                          <Check className="h-4 w-4 text-success" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
