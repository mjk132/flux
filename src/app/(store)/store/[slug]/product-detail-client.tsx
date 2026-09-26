"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Zap, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import { getSalePrice } from "@/lib/pricing";
import { useToast } from "@/components/ui/toast";

interface ProductInfo {
  id: string;
  name: string;
  nameAr: string | null;
  price: number;
  discount: number;
  stock: number;
  image: string;
  slug: string;
  productType: string;
}

export default function ProductDetailClient({ product }: { product: ProductInfo }) {
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const router = useRouter();
  const { success } = useToast();

  const finalPrice = getSalePrice(product).final;

  const handleAddToCart = () => {
    const name = product.nameAr || product.name;
    addItem({
      productId: product.id,
      name,
      price: finalPrice,
      image: product.image,
      stock: product.stock,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    success("أُضيفت إلى السلة", `${name} — ${formatPrice(finalPrice)}`, {
      label: "عرض السلة",
      href: "/cart",
    });
  };

  const handleBuyNow = () => {
    addItem({
      productId: product.id,
      name: product.nameAr || product.name,
      price: finalPrice,
      image: product.image,
      stock: product.stock,
    });
    router.push("/checkout");
  };

  return (
    <div className="flex flex-col gap-3">
      <Button
        onClick={handleAddToCart}
        disabled={product.stock <= 0}
        variant="secondary"
        size="lg"
        className="w-full"
      >
        {added ? (
          <>
            <Check className="ml-2 h-4 w-4" />
            تمت الإضافة
          </>
        ) : (
          <>
            <ShoppingCart className="ml-2 h-4 w-4" />
            أضف إلى السلة
          </>
        )}
      </Button>

      <Button
        onClick={handleBuyNow}
        disabled={product.stock <= 0}
        size="lg"
        className="w-full"
      >
        <Zap className="ml-2 h-4 w-4" />
        شراء الآن
      </Button>
    </div>
  );
}
