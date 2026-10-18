import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Yunlong's Blog",
  description: "Technology, photography, travel and thoughts.",
};

export const instant = false;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const messages = await getMessages();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-screen flex-col">
        <NextIntlClientProvider messages={messages}>

          {/* 全站导航栏 */}
          <Navbar />

          {/* 页面主体 */}
          <div className="flex-1">
            {children}
          </div>

          {/* 全站页脚 */}
          <Footer />

        </NextIntlClientProvider>
      </body>
    </html>
  );
}