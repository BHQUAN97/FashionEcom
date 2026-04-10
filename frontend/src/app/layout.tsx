import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin", "vietnamese"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Fashion Ecom — Thoi trang nam cao cap",
  description: "Mua sam thoi trang nam chinh hang, giao hang toan quoc",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={cn("font-sans", inter.variable)}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
