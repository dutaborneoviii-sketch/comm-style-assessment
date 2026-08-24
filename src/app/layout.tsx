import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import { cn } from "@/lib/utils";

const fontSans = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "BELIAN - Bimbingan, Monitoring dan Kemajuan",
  description: "Workplace communication style assessment tool.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", fontSans.variable)}>
      <body className={`${fontSans.className} min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-800`}>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
