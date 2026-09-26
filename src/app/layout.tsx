import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ToastContainer } from "@/components/ui/toast";
import { SessionSync } from "@/components/layout/session-sync";

export const metadata: Metadata = {
  title: "FLUX — منتجات رقمية وتطوير مخصص",
  description:
    "بوتات ديسكورد وسكربتات FiveM جاهزة، وتطوير مواقع ولوحات تحكم وبرمجة مخصصة — الدفع عبر PayPal والتسليم عبر حسابك.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "FLUX",
    description:
      "منتجات رقمية جاهزة وخدمات تطوير مخصصة: ديسكورد، FiveM، مواقع، لوحات تحكم.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#04020a",
};

/* Runs before first paint so the correct theme is on <html> immediately —
   no flash of the wrong palette while React hydrates. Keep in sync with
   src/store/theme.ts (same storage key, same scope on <html>).
   The storage read has its own try/catch so a corrupted localStorage
   entry can never skip the system-preference fallback. */
const themeInitScript = `(function(){try{var t=null;try{var s=localStorage.getItem("theme-storage");if(s){var p=JSON.parse(s).state;if(p&&(p.theme==="light"||p.theme==="dark")){t=p.theme;}}}catch(e){}if(!t){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}var r=document.documentElement;r.setAttribute("data-theme",t);r.style.colorScheme=t;r.classList.toggle("flux-light",t==="light");r.classList.toggle("flux-dark",t==="dark");var m=document.querySelector('meta[name="theme-color"]');if(m){m.setAttribute("content",t==="light"?"#f4f7fc":"#04020a");}}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // suppressHydrationWarning: the pre-paint script below legitimately
    // mutates <html> attributes before React takes over.
    <html lang="ar" dir="rtl" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">
        {/* First focusable element on the page: keyboard users can jump
            straight past the navigation to the content. */}
        <a href="#main-content" className="skip-link">
          تخطَّ إلى المحتوى
        </a>
        <div className="flex min-h-screen flex-col">{children}</div>
        {/* Invisible: refreshes the persisted login (role included) from
            the server once per page load — see session-sync.tsx. */}
        <SessionSync />
        {/* Mounted once, above every route: the store's add-to-cart
            feedback and the admin panel's save confirmations both render
            here (see components/ui/toast.tsx). */}
        <ToastContainer />
      </body>
    </html>
  );
}
