import type { Metadata, Viewport } from "next";
import "./globals.css";
// Toast notifications handled per-layout

export const metadata: Metadata = {
  title: "Flux Store - متجرك الرقمي الأول",
  description:
    "متجر المنتجات الرقمية المميزة — بوتات ديسكورد، سكربتات FiveM، مواقع وتصاميم. جودة عالية ودعم متواصل.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Flux Store",
    description: "متجرك الرقمي الأول — تسليم فوري وضمان شامل.",
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
   src/store/theme.ts (same storage key, same scope on <html>). */
const themeInitScript = `(function(){try{var t=null;var s=localStorage.getItem("theme-storage");if(s){var p=JSON.parse(s).state;if(p&&(p.theme==="light"||p.theme==="dark")){t=p.theme;}}if(!t){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}var r=document.documentElement;r.setAttribute("data-theme",t);r.style.colorScheme=t;r.classList.toggle("flux-light",t==="light");r.classList.toggle("flux-dark",t==="dark");var m=document.querySelector('meta[name="theme-color"]');if(m){m.setAttribute("content",t==="light"?"#f4f7fc":"#04020a");}}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className="h-full antialiased">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&family=Tajawal:wght@300;400;500;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <div className="flex min-h-screen flex-col">{children}</div>
      </body>
    </html>
  );
}
