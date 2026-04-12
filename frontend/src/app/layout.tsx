import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const quicksand = Quicksand({ subsets: ["latin", "vietnamese"], variable: "--font-sans", weight: ["400", "500", "600", "700"] });

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
    <html lang="vi" className={cn("font-sans", quicksand.variable)}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
