import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";
import TickerBar from "./components/TickerBar";
import { LanguageProvider } from "./components/LanguageProvider";

export const metadata: Metadata = {
  title: "بورصة 2026",
  description: "موقع البورصة المصرية والاقتصاد",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-gray-950 text-white min-h-screen">
        <LanguageProvider>
          {/* شريط التنبيه */}
          <div className="bg-yellow-500 text-black text-center py-2 px-4 text-xs font-bold sticky top-0 z-50">
            ⚠️ الموقع تحت التجربة - بيانات البورصة المصرية ليست بيانات فعلية &nbsp;|&nbsp; ⚠️ This site is under testing - Egyptian stock market data is not real
          </div>
          <Navbar />
          <TickerBar />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}