import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ShieldAlert, Database, ChevronRight } from "lucide-react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  });

  if (user?.role !== "ADMIN") {
    return (
      <div className="container mx-auto py-20 px-4 text-center max-w-xl">
        <div className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-8 rounded-3xl border border-red-100 dark:border-red-900/30 flex flex-col items-center">
          <ShieldAlert className="w-16 h-16 mb-4 opacity-80" />
          <h1 className="text-2xl font-bold mb-2">Akses Ditolak</h1>
          <p className="mb-6">Anda tidak memiliki izin (Administrator) untuk mengakses halaman ini.</p>
          <Link href="/profile" className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors">
            Kembali ke Dasbor
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="flex items-center gap-3 text-sm text-muted-foreground mb-8 font-medium">
        <Database className="w-4 h-4 text-[#1eb88a]" />
        <span>Admin Panel</span>
        <ChevronRight className="w-4 h-4 opacity-50" />
        <span className="text-foreground">Bank Pertanyaan</span>
      </div>
      
      {children}
    </div>
  );
}
