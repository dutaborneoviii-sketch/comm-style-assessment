import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Communication Style Assessment",
  description: "Workplace communication style assessment tool.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", inter.variable)}>
      <body className={`${inter.className} min-h-screen bg-gradient-to-br from-slate-800 via-zinc-800 to-slate-900 text-slate-100`}>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
