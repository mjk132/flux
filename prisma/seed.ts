// @ts-nocheck
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import bcrypt from "bcryptjs";

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL || "file:./prisma/dev.db",
});
const prisma = new PrismaClient({ adapter });

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

async function main() {
  // Safety: never wipe the production (Turso) database by accident.
  // Demo data is for local development only.
  if (
    (process.env.DATABASE_URL || "").startsWith("libsql://") &&
    process.env.ALLOW_PRODUCTION_SEED !== "yes"
  ) {
    console.error(
      "Refusing to seed: DATABASE_URL points at a remote (production) database.\n" +
        "Seeding would DELETE all existing data.\n" +
        "If you really mean it, rerun with ALLOW_PRODUCTION_SEED=yes"
    );
    process.exit(1);
  }

  console.log("Starting seed...\n");

  // Clear existing data
  console.log("Clearing existing data...");
  await prisma.auditLog.deleteMany();
  await prisma.session.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.review.deleteMany();
  await prisma.couponProduct.deleteMany();
  await prisma.couponUsage.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  await prisma.setting.deleteMany();
  await prisma.fAQ.deleteMany();
  await prisma.banner.deleteMany();
  console.log("Existing data cleared\n");

  // ==================== USERS ====================
  console.log("Creating users...");
  const admin = await prisma.user.create({
    data: {
      name: "المدير",
      email: "admin@fluxstore.com",
      password: await hashPassword("admin123"),
      role: "OWNER",
      phone: "+966500000000",
      isActive: true,
    },
  });

  const customer1 = await prisma.user.create({
    data: {
      name: "أحمد محمد",
      email: "customer1@example.com",
      password: await hashPassword("customer123"),
      role: "CUSTOMER",
      phone: "+966500000002",
      isActive: true,
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      name: "سارة العلي",
      email: "customer2@example.com",
      password: await hashPassword("customer123"),
      role: "CUSTOMER",
      isActive: true,
    },
  });

  const customer3 = await prisma.user.create({
    data: {
      name: "خالد الشمري",
      email: "customer3@example.com",
      password: await hashPassword("customer123"),
      role: "CUSTOMER",
      isActive: true,
    },
  });
  console.log("Users created\n");

  // ==================== CATEGORIES ====================
  console.log("Creating categories...");
    const categoriesData = [
    { name: "Discord Bots", nameAr: "بوتات ديسكورد", slug: "discord-bots", description: "بوتات ديسكورد جاهزة وحلول مخصصة لسيرفرك", sortOrder: 1 },
    { name: "FiveM Services", nameAr: "خدمات FiveM", slug: "fivem", description: "سكربتات وإعداد سيرفرات FiveM", sortOrder: 2 },
    { name: "Websites", nameAr: "المواقع", slug: "websites", description: "تصميم وبناء مواقع احترافية", sortOrder: 3 },
    { name: "Programming", nameAr: "البرمجة", slug: "programming", description: "خدمات برمجية وحلول تقنية مخصصة", sortOrder: 4 },
    { name: "Design", nameAr: "التصميم", slug: "design", description: "تصاميم وهوية بصرية عصرية", sortOrder: 5 },
  ];

  const categories: Record<string, any> = {};
  for (const cat of categoriesData) {
    categories[cat.slug] = await prisma.category.create({ data: cat });
  }
  console.log("Categories created\n");

  // ==================== PRODUCTS ====================
  console.log("Creating products...");

    const productsData = [
    // === Discord Bots ===
    {
      name: "Custom Discord Bot",
      nameAr: "بوت ديسكورد مخصص",
      slug: "custom-discord-bot",
      description: "تطوير بوت ديسكورد مخصص بالكامل حسب احتياجات سيرفرك",
      shortDescription: "بوت خاص بسيرفرك من الصفر",
      price: 49.99,
      comparePrice: 79.99,
      discount: 0,
      productType: "SERVICE",
      status: "PUBLISHED",
      isFeatured: true,
      isBestSeller: true,
      stock: 10,
      features: JSON.stringify([
        "تطوير مخصص بالكامل",
        "لوحة تحكم خاصة",
        "دعم فني لمدة 30 يوم",
        "تحديثات مجانية",
        "توثيق كامل"
      ]),
      requirements: JSON.stringify([
        "وصف واضح للميزات المطلوبة",
        "حساب ديسكورد"
      ]),
      deliveryInfo: "تسليم خلال 3-5 أيام عمل",
      warranty: "ضمان 30 يوم",
      tags: JSON.stringify(["discord", "bot", "custom", "بوت"]),
      categoryId: categories["discord-bots"].id,
    },
    {
      name: "Auto Moderation Bot",
      nameAr: "بوت الأتمتة والإشراف",
      slug: "auto-moderation-bot",
      description: "بوت أتمتة وإشراف تلقائي لسيرفر ديسكورد",
      shortDescription: "بوت يدير سيرفرك تلقائياً",
      price: 19.99,
      comparePrice: 29.99,
      discount: 0,
      productType: "DIGITAL",
      status: "PUBLISHED",
      isFeatured: false,
      isBestSeller: true,
      stock: 30,
      features: JSON.stringify([
        "حذف الرسائل التلقائي",
        "منع السبام",
        "نظام تحذيرات",
        "إشعارات إدارية",
        "سهل التثبيت"
      ]),
      requirements: JSON.stringify([
        "حساب بوت ديسكورد",
        "صلاحيات إدارية"
      ]),
      deliveryInfo: "تسليم رقمي عبر حسابك بعد اعتماد الدفع — مع دليل التثبيت",
      warranty: "ضمان 14 يوم",
      tags: JSON.stringify(["discord", "bot", "moderation", "أتمتة"]),
      categoryId: categories["discord-bots"].id,
    },
    {
      name: "Discord Server Setup",
      nameAr: "إعداد سيرفر ديسكورد",
      slug: "discord-server-setup",
      description: "خدمة إعداد سيرفر ديسكورد احترافي بالكامل",
      shortDescription: "سيرفر احترافي جاهز",
      price: 29.99,
      comparePrice: 49.99,
      discount: 0,
      productType: "SERVICE",
      status: "PUBLISHED",
      isFeatured: false,
      isBestSeller: false,
      stock: 20,
      features: JSON.stringify([
        "إعداد السيرفر بالكامل",
        "تصنيفات وقنوات منظمة",
        "بوتات ترحيب",
        "نظام أدوار",
        "غلاف وبروفايل احترافي"
      ]),
      requirements: JSON.stringify([
        "حساب ديسكورد",
        "وصول إداري للسيرفر"
      ]),
      deliveryInfo: "تسليم خلال 24 ساعة",
      warranty: "دعم مجاني لمدة 7 أيام",
      tags: JSON.stringify(["discord", "server", "setup", "إعداد"]),
      categoryId: categories["discord-bots"].id,
    },

    // === FiveM ===
    {
      name: "FiveM ESX Script Pack",
      nameAr: "حزمة سكربتات FiveM",
      slug: "fivem-esx-script-pack",
      description: "حزمة سكربتات FiveM جاهزة — وظائف، أنظمة اقتصاد ومهام",
      shortDescription: "سكربتات جاهزة لسيرفرك",
      price: 24.99,
      comparePrice: 39.99,
      discount: 0,
      productType: "DIGITAL",
      status: "PUBLISHED",
      isFeatured: true,
      isBestSeller: true,
      stock: 50,
      features: JSON.stringify([
        "حزمة سكربتات متكاملة",
        "متوافقة مع ESX",
        "تحديثات مجانية",
        "دليل تركيب بالعربي",
        "دعم فني"
      ]),
      requirements: JSON.stringify([
        "سيرفر FiveM يعمل بإطار ESX"
      ]),
      deliveryInfo: "تسليم رقمي عبر حسابك بعد اعتماد الدفع",
      warranty: "ضمان 14 يوم",
      tags: JSON.stringify(["fivem", "scripts", "esx", "سكربتات"]),
      categoryId: categories["fivem"].id,
    },
    {
      name: "Custom FiveM Script",
      nameAr: "سكربت FiveM مخصص",
      slug: "custom-fivem-script",
      description: "برمجة سكربت FiveM مخصص لفكرتك — من التصميم حتى التركيب",
      shortDescription: "سكربت بفكرتك الخاصة",
      price: 59.99,
      comparePrice: 89.99,
      discount: 0,
      productType: "SERVICE",
      status: "PUBLISHED",
      isFeatured: true,
      isBestSeller: false,
      stock: 8,
      features: JSON.stringify([
        "برمجة حسب الطلب",
        "كود نظيف وموثق",
        "اختبار قبل التسليم",
        "دعم لمدة 30 يوم"
      ]),
      requirements: JSON.stringify([
        "وصف واضح للفكرة",
        "نسخة تجريبية للاختبار"
      ]),
      deliveryInfo: "تسليم خلال 5-7 أيام عمل",
      warranty: "ضمان 30 يوم",
      tags: JSON.stringify(["fivem", "custom", "script", "برمجة"]),
      categoryId: categories["fivem"].id,
    },
    {
      name: "FiveM Server Setup",
      nameAr: "إعداد سيرفر FiveM",
      slug: "fivem-server-setup",
      description: "إعداد سيرفر FiveM كامل — إطار العمل والسكربتات الأساسية",
      shortDescription: "سيرفر FiveM جاهز للانطلاق",
      price: 39.99,
      comparePrice: 59.99,
      discount: 0,
      productType: "SERVICE",
      status: "PUBLISHED",
      isFeatured: false,
      isBestSeller: false,
      stock: 15,
      features: JSON.stringify([
        "تثبيت إطار العمل",
        "السكربتات الأساسية",
        "ضبط قاعدة البيانات",
        "اختبار شامل"
      ]),
      requirements: JSON.stringify([
        "استضافة أو VPS",
        "صلاحيات الوصول للسيرفر"
      ]),
      deliveryInfo: "تسليم خلال 48 ساعة",
      warranty: "دعم مجاني لمدة 7 أيام",
      tags: JSON.stringify(["fivem", "server", "setup", "سيرفر"]),
      categoryId: categories["fivem"].id,
    },

    // === Websites ===
    {
      name: "Business Website",
      nameAr: "موقع أعمال احترافي",
      slug: "business-website",
      description: "تصميم وبناء موقع أعمال احترافي متجاوب مع جميع الأجهزة",
      shortDescription: "موقع يعكس هوية نشاطك",
      price: 99.99,
      comparePrice: 149.99,
      discount: 0,
      productType: "SERVICE",
      status: "PUBLISHED",
      isFeatured: true,
      isBestSeller: true,
      stock: 5,
      features: JSON.stringify([
        "تصميم عصري متجاوب",
        "حتى 7 صفحات",
        "تحسين لمحركات البحث",
        "نموذج تواصل",
        "دعم لمدة 30 يوم"
      ]),
      requirements: JSON.stringify([
        "الشعار والمحتوى النصي",
        "أمثلة لمواقع تعجبك"
      ]),
      deliveryInfo: "تسليم خلال 7-10 أيام عمل",
      warranty: "دعم مجاني لمدة 30 يوم",
      tags: JSON.stringify(["website", "business", "design", "موقع"]),
      categoryId: categories["websites"].id,
    },
    {
      name: "E-commerce Website",
      nameAr: "متجر إلكتروني",
      slug: "ecommerce-website",
      description: "بناء متجر إلكتروني متكامل مع بوابات دفع وإدارة منتجات",
      shortDescription: "متجرك الإلكتروني الجاهز",
      price: 149.99,
      comparePrice: 199.99,
      discount: 0,
      productType: "SERVICE",
      status: "PUBLISHED",
      isFeatured: true,
      isBestSeller: false,
      stock: 5,
      features: JSON.stringify([
        "سلة ودفع إلكتروني",
        "لوحة إدارة منتجات",
        "تصميم متجاوب",
        "تدريب على الإدارة"
      ]),
      requirements: JSON.stringify([
        "بيانات المنتجات",
        "بوابة الدفع المفضلة"
      ]),
      deliveryInfo: "تسليم خلال 10-14 يوم عمل",
      warranty: "دعم مجاني لمدة 30 يوم",
      tags: JSON.stringify(["website", "store", "ecommerce", "متجر"]),
      categoryId: categories["websites"].id,
    },
    {
      name: "Landing Page",
      nameAr: "صفحة هبوط",
      slug: "landing-page",
      description: "تصميم صفحة هبوط سريعة ومقنعة لمنتجك أو خدمتك",
      shortDescription: "صفحة واحدة بتركيز عالٍ",
      price: 49.99,
      comparePrice: 69.99,
      discount: 0,
      productType: "SERVICE",
      status: "PUBLISHED",
      isFeatured: false,
      isBestSeller: false,
      stock: 10,
      features: JSON.stringify([
        "تصميم يركز على التحويل",
        "سرعة تحميل عالية",
        "نموذج تواصل أو طلب",
        "متجاوبة مع الجوال"
      ]),
      requirements: JSON.stringify([
        "المحتوى النصي والصور"
      ]),
      deliveryInfo: "تسليم خلال 3-5 أيام عمل",
      warranty: "دعم مجاني لمدة 14 يوم",
      tags: JSON.stringify(["website", "landing", "page", "هبوط"]),
      categoryId: categories["websites"].id,
    },

    // === Programming ===
    {
      name: "Custom Script Development",
      nameAr: "برمجة سكربت مخصص",
      slug: "custom-script-development",
      description: "برمجة حل تقني مخصص — أتمتة، أدوات أو تكاملات حسب احتياجك",
      shortDescription: "حل برمجي على مقاسك",
      price: 49.99,
      comparePrice: 79.99,
      discount: 0,
      productType: "SERVICE",
      status: "PUBLISHED",
      isFeatured: true,
      isBestSeller: false,
      stock: 10,
      features: JSON.stringify([
        "تحليل المتطلبات",
        "كود نظيف وموثق",
        "اختبار شامل",
        "دعم لمدة 30 يوم"
      ]),
      requirements: JSON.stringify([
        "وصف واضح للمطلوب"
      ]),
      deliveryInfo: "حسب حجم المشروع — يتم الاتفاق",
      warranty: "ضمان 30 يوم",
      tags: JSON.stringify(["programming", "custom", "development", "برمجة"]),
      categoryId: categories["programming"].id,
    },
    {
      name: "Bug Fix & Optimization",
      nameAr: "إصلاح وتحسين",
      slug: "bugfix-optimization",
      description: "إصلاح أخطاء وتحسين أداء مشروعك الحالي",
      shortDescription: "نصلح ونسرّع مشروعك",
      price: 19.99,
      comparePrice: 29.99,
      discount: 0,
      productType: "SERVICE",
      status: "PUBLISHED",
      isFeatured: false,
      isBestSeller: true,
      stock: 20,
      features: JSON.stringify([
        "تشخيص المشكلة",
        "إصلاح مضمون",
        "تحسين الأداء",
        "تقرير بالتعديلات"
      ]),
      requirements: JSON.stringify([
        "الوصول للكود المصدري",
        "وصف المشكلة"
      ]),
      deliveryInfo: "خلال 24-72 ساعة",
      warranty: "ضمان 14 يوم",
      tags: JSON.stringify(["programming", "bugfix", "fix", "إصلاح"]),
      categoryId: categories["programming"].id,
    },

    // === Design ===
    {
      name: "Server Design Pack",
      nameAr: "حزمة تصميم سيرفر",
      slug: "server-design-pack",
      description: "حزمة تصاميم جاهزة لسيرفرك — بانر وشعار وإيموجي",
      shortDescription: "هوية سيرفرك جاهزة",
      price: 14.99,
      comparePrice: 24.99,
      discount: 0,
      productType: "DIGITAL",
      status: "PUBLISHED",
      isFeatured: false,
      isBestSeller: true,
      stock: 100,
      features: JSON.stringify([
        "بانر احترافي",
        "شعار مخصص",
        "حزمة إيموجي",
        "ملفات بجودة عالية"
      ]),
      requirements: JSON.stringify([]),
      deliveryInfo: "تسليم رقمي عبر حسابك بعد اعتماد الدفع",
      warranty: "ضمان الجودة",
      tags: JSON.stringify(["design", "server", "pack", "تصميم"]),
      categoryId: categories["design"].id,
    },
    {
      name: "Brand Identity Pack",
      nameAr: "حزمة الهوية البصرية",
      slug: "brand-identity-pack",
      description: "تصميم هوية بصرية متكاملة — شعار وألوان وقوالب",
      shortDescription: "هوية تميزك عن الجميع",
      price: 59.99,
      comparePrice: 99.99,
      discount: 0,
      productType: "SERVICE",
      status: "PUBLISHED",
      isFeatured: true,
      isBestSeller: false,
      stock: 10,
      features: JSON.stringify([
        "شعار احترافي",
        "دليل الألوان والخطوط",
        "قوالب سوشيال ميديا",
        "مراجعتان مجانيتان"
      ]),
      requirements: JSON.stringify([
        "اسم النشاط ومجاله",
        "أمثلة تعجبك"
      ]),
      deliveryInfo: "تسليم خلال 5-7 أيام عمل",
      warranty: "مراجعتان مجانيتان",
      tags: JSON.stringify(["design", "brand", "identity", "هوية"]),
      categoryId: categories["design"].id,
    },
  ];

  const products: Record<string, any> = {};
  for (const productData of productsData) {
    products[productData.slug] = await prisma.product.create({ data: productData });
  }
  console.log("Products created\n");

  // ==================== PRODUCT IMAGES ====================
  console.log("Creating product images...");
  for (const slug of Object.keys(products)) {
    await prisma.productImage.create({
      data: {
        url: "/logo.png",
        alt: products[slug].nameAr || products[slug].name,
        sortOrder: 0,
        productId: products[slug].id,
      },
    });
  }
  console.log("Product images created\n");

  // ==================== INVENTORY CODES ====================
  console.log("Creating inventory codes...");
  const digitalProducts = Object.values(products).filter(
    (p: any) => p.productType === "DIGITAL"
  );

  for (const product of digitalProducts) {
    const codeCount = Math.floor(Math.random() * 6) + 5;
    for (let i = 1; i <= codeCount; i++) {
      const code = `FLUX-${String(i).padStart(3, "0")}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      await prisma.inventory.create({
        data: {
          code,
          status: "AVAILABLE",
          productId: product.id,
        },
      });
    }
  }
  console.log("Inventory codes created\n");

    // ==================== REVIEWS ====================
  // No reviews are seeded, ever. Reviews are trust signals: they must only
  // come from real verified purchases, so a fresh install shows the honest
  // empty state instead of manufactured praise (the old seed created six
  // fake 5-star reviews from invented customers).

  // ==================== COUPONS ====================
  console.log("Creating coupons...");
  await prisma.coupon.create({
    data: {
      code: "WELCOME10",
      discount: 10,
      isPercentage: true,
      minimumOrder: 5,
      maximumUses: 200,
      usedCount: 0,
      isActive: true,
    },
  });
  await prisma.coupon.create({
    data: {
      code: "FLUX5",
      discount: 5,
      isPercentage: false,
      minimumOrder: 20,
      maximumUses: 100,
      usedCount: 0,
      isActive: true,
    },
  });
  console.log("Coupons created\n");

  // ==================== SETTINGS ====================
  console.log("Creating settings...");
  await prisma.setting.create({ data: { key: "store_name", value: "FLUX STORE", type: "text" } });
  await prisma.setting.create({ data: { key: "store_tagline", value: "منتجات رقمية بهوية مختلفة", type: "text" } });
  await prisma.setting.create({ data: { key: "hero_title", value: "منتجات رقمية بهوية مختلفة", type: "text" } });
  await prisma.setting.create({ data: { key: "hero_description", value: "بوتات ديسكورد، سكربتات FiveM، مواقع وتصاميم — تسليم سريع وجودة عالية ودعم متواصل", type: "text" } });
  await prisma.setting.create({ data: { key: "discord_link", value: "https://discord.gg/xRQGGKfZzN", type: "url" } });
  await prisma.setting.create({ data: { key: "discord_guild_id", value: "", type: "text" } });
  await prisma.setting.create({ data: { key: "paypal_email", value: "", type: "text" } });
  await prisma.setting.create({ data: { key: "paypal_qr_image", value: "", type: "url" } });
  await prisma.setting.create({ data: { key: "footer_text", value: "© 2026 FLUX STORE. جميع الحقوق محفوظة.", type: "text" } });
  console.log("Settings created\n");

    // ==================== FAQS ====================
  console.log("Creating FAQs...");
  await prisma.fAQ.create({ data: { question: "كيف أستلم المنتج بعد الشراء؟", answer: "المنتجات الجاهزة (بوتات، سكربتات، حزم تصميم) تظهر في حسابك بعد اعتماد الدفع — ترفع صورة إيصال PayPal في صفحة الطلب وتتم مراجعته من فريقنا. أما الخدمات المخصصة فنتواصل معك عبر الديسكورد لبدء الاتفاق على التفاصيل.", sortOrder: 1 } });
  await prisma.fAQ.create({ data: { question: "كيف أطلب خدمة مخصصة؟", answer: "اختر الخدمة من صفحة الخدمات واملأ نموذج طلب الخدمة بتفاصيل ما تحتاجه — نراجع طلبك ونتواصل معك عبر الديسكورد لتأكيد السعر والمدة قبل بدء التنفيذ.", sortOrder: 2 } });
  await prisma.fAQ.create({ data: { question: "ما هي طرق الدفع المتاحة؟", answer: "الدفع عبر PayPal: تنقل المبلغ إلى حسابنا وترفع صورة الإيصال في صفحة الطلب، وبعد مراجعته يُؤكد الطلب ويبدأ التسليم عبر حسابك.", sortOrder: 3 } });
  await prisma.fAQ.create({ data: { question: "ماذا لو واجهت مشكلة في المنتج؟", answer: "تواصل معنا عبر سيرفر الديسكورد مع رقم الطلب ووصف المشكلة، وسنراجعها معك في أقرب وقت ممكن.", sortOrder: 4 } });
  await prisma.fAQ.create({ data: { question: "هل يمكنني استرداد المبلغ؟", answer: "نعم، يمكنك استرداد المبلغ إذا لم يتم تسليم المنتج الجاهز، أو إذا لم يبدأ العمل في الخدمة المخصصة بعد.", sortOrder: 5 } });
  console.log("FAQs created\n");

  // ==================== SAMPLE ORDER ====================
  console.log("Creating sample order...");
  const order = await prisma.order.create({
    data: {
      orderNumber: `FLUX-${Date.now().toString(36).toUpperCase()}`,
      status: "COMPLETED",
      paymentStatus: "PAID",
      subtotal: 49.99,
      discount: 0,
      total: 49.99,
      customerName: customer1.name,
      customerEmail: customer1.email,
      paymentMethod: "credit_card",
      userId: customer1.id,
    },
  });
  await prisma.orderItem.create({
    data: { quantity: 1, price: 49.99, total: 49.99, orderId: order.id, productId: products["custom-discord-bot"].id },
  });
  await prisma.payment.create({
    data: { amount: 49.99, method: "credit_card", status: "PAID", transactionId: `TXN-${Date.now()}`, orderId: order.id },
  });
  console.log("Sample order created\n");

  console.log("=== Seed Summary ===");
  console.log("Users: 4");
  console.log("Categories: 5");
  console.log("Products: 13");
  console.log("Reviews: 0 (intentionally — reviews come only from real purchases)");
  console.log("Coupons: 2");
  console.log("Settings: 9");
  console.log("FAQs: 5");
  console.log("\nSeed completed!");
}

main()
  .catch((e) => { console.error("Seed failed:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
