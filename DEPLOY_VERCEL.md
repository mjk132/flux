# 🚀 نشر المتجر على Vercel — Deploy Flux Store to Vercel

المتجر جاهز للنشر ولا يحتاج تعديل أي كود. كل ما تبقى خطوات حسابية (حسابك أنت).
The store is deploy-ready. What's left is account setup on your side — no code changes needed.

---

## 1) قاعدة البيانات السحابية (مطلوبة أولاً) — Create a serverless database

> المتجر يستخدم **SQLite عبر LibSQL driver**، لذا أنسب خيار هو **Turso** (سحابي، SQLite-compatible، مجاني).
> The app already uses the LibSQL driver, so **Turso** is the natural serverless DB.

1. سجّل في https://turso.tech وأنشئ قاعدة جديدة باسم `flux-store`.
2. من صفحة القاعدة انسخ **`Database URL`** (يبدأ بـ `libsql://...`) و **`Auth Token`**.
3. اجمعها في رابط واحد:
   ```
   DATABASE_URL="libsql://flux-store-youruser.turso.io?authToken=YOUR_TOKEN"
   ```

### إنشاء الجداول وبيانات البداية — Push schema + seed (من جهازك)

شغّل هذه الأوامر من مجلد المشروع (ستتصل بقاعدة Turso مباشرة):
```powershell
$env:DATABASE_URL="libsql://flux-store-youruser.turso.io?authToken=YOUR_TOKEN"

# 1) إنشاء الجداول
npx prisma db push

# 2) بيانات البداية (13 منتج + حساب المدير)
npm run seed
```
> لو أخطأ `db push` مع روابط `libsql://`، استخدم المسار البديل:
> ```powershell
> npx prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script > schema.sql
> # ثم طبّق الملف من لوحة Turso: Database → Run query / turso db shell
> ```

---

## 2) نشر الكود — Deploy to Vercel

### الطريقة أ: GitHub + Vercel (الأسهل لإعادة النشر تلقائياً)

```powershell
cd "C:\Users\mmmho\Desktop\Lux website\flux-store"
git init
git add -A
git commit -m "Flux store - Vercel ready"
```
ثم ادفع المشروع إلى GitHub جديد، واربطه من https://vercel.com/new (استورد الريبو، الإعدادات الافتراضية كافية — لن تحتاج تعديل Build أو Framework).

### الطريقة ب: Vercel CLI
```powershell
npm i -g vercel
vercel login
vercel --prod
```

---

## 3) متغيرات البيئة في Vercel — Environment variables

من Vercel → مشروعك → **Settings → Environment Variables** أضف:

| المتغير | القيمة |
|---|---|
| `DATABASE_URL` | رابط Turso كامل (`libsql://...?authToken=...`) |
| `JWT_SECRET` | نص عشوائي طويل (مثل `openssl rand -base64 32`) |
| `NEXTAUTH_SECRET` | نص عشوائي طويل آخر |
| `NEXTAUTH_URL` | `https://اسم-مشروعك.vercel.app` |
| `DISCORD_CLIENT_ID` | من https://discord.com/developers/applications |
| `DISCORD_CLIENT_SECRET` | من نفس التطبيق |
| `DISCORD_REDIRECT_URI` | `https://اسم-مشروعك.vercel.app/api/auth/discord/callback` |
| `DISCORD_OWNER_ID` | Discord ID الخاص بك (يمنحك دور OWNER عند الدخول) |
| `DISCORD_BOT_TOKEN` | توكن البوت (لتسليم الرتب تلقائياً) |
| `DISCORD_GUILD_ID` | رقم سيرفرك (أو يُضبط من لوحة التحكم ← الإعدادات) |
| `BLOB_READ_WRITE_TOKEN` | من Vercel → **Storage → Create → Blob** (لتخزين صور QR وإثباتات الدفع) |

> **مهم**: قائمة Discord OAuth Redirects في تطبيقك يجب أن تشمل الرابط الجديد،
> وقد تحتاج إضافة `https://اسم-مشروعك.vercel.app` كـ Origin في **OAuth2 → General**.
> إعدادات PayPal (الإيميل + صورة QR) تُضاف لاحقاً من **لوحة التحكم ← الإعدادات**.

---

## 4) الدخول الأول للوحة التحكم — First admin login

بعد أول نشر، ادخل من `https://اسم-مشروعك.vercel.app/auth/login` بـ:
- **Admin:** `admin@fluxstore.com` / `admin123`

⚠️ غيّر كلمة المرور فوراً. وحساب Discord صاحب `DISCORD_OWNER_ID` يصبح OWNER تلقائياً.

---

## ملاحظات النشر — Notes

- **الملفات المرفوعة** (إثباتات الدفع، QR، صور المنتجات): عند وجود `BLOB_READ_WRITE_TOKEN`
  تُحفظ في Vercel Blob (دائمة). محلياً بلا توكن تُحفظ في `public/uploads/` كالمعتاد — لا حاجة لتغيير أي كود.
- **بوت الديسكورد**: منح الرتب يتم عبر **REST** داخل طلبات Vercel (يعمل بدون بوت دائم).
  ملف `scripts/discord-bot.ts` (أوامر Slash) لا يعمل على Vercel لأنه عملية دائمة — شغّله محلياً إن أردت.
- **نشر PDF/static**: الصور الثابتة (`/flux-welcome.png` وغيرها) ضمن الريبو وتُنشر تلقائياً.
- **إعادة النشر**: أي تحديث لاحق = `git push` فقط (GitHub flow) أو `vercel --prod`.