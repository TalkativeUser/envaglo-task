import type { Metadata } from "next";
import { Tajawal, IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";   // ⬅️ ضيف السطر ده


// إعداد خط تجوال (للعناوين البارزة)
const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700"],
  variable: "--font-tajawal",
});

// إعداد خط آي بي إم (للنصوص والواجهات)
const ibmPlex = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm-plex",
});

export const metadata: Metadata = {
  title: "نظام إدارة الفواتير",
  description: "نظام إدارة الفواتير والموافقات",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={`${tajawal.variable} ${ibmPlex.variable}`}>
      <body className={`min-h-screen font-sans antialiased`}>
        {children}
         <Toaster position="top-center" dir="rtl" richColors closeButton />
      </body>
    </html>
  );
}