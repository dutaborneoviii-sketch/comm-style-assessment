import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ShieldAlert, Database, ChevronRight } from "lucide-react";
import { cookies } from "next/headers";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, position: true, department: true }
  });

  const viewMode = cookies().get('view-mode')?.value || 'admin';
  const isViewModeUser = user?.role === 'ADMIN' && viewMode === 'user';
  if (isViewModeUser && user) {
    user.role = 'USER';
    user.position = 'Staf Pelaksana';
  }

  let userRoleGroup = "Staf";
  if (user?.role === "ADMIN") {
    // Admin always has access
  } else {
    if (user?.position === "Asisten Deputi") userRoleGroup = "Asisten Deputi";
    else if (user?.position === "Deputi Direksi Wilayah") userRoleGroup = "Deputi Direksi Wilayah";
  }

  const { getFeatureFlagsMap } = await import("@/app/actions/features");
  const featuresMap = await getFeatureFlagsMap(userRoleGroup, user?.department);
  
  const isAsdepSDM = user?.position === 'Asisten Deputi' && user?.department === 'Bidang SDM, Umum dan Komunikasi (SDMUK)';
  
  const hasFlag = user?.role === "ADMIN" || isAsdepSDM
    ? true 
    : (featuresMap["manajemen_bank_soal"] ||
       featuresMap["jangka_asesmen_ulang"] ||
       featuresMap["manajemen_kamus_panduan"] ||
       featuresMap["manajemen_menu_aplikasi"]);

  if (user?.role !== "ADMIN" && !hasFlag) {
    return (
      <div className="container mx-auto py-20 px-4 text-center max-w-xl">
        <div className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-8 rounded-3xl border border-red-100 dark:border-red-900/30 flex flex-col items-center">
          <ShieldAlert className="w-16 h-16 mb-4 opacity-80" />
          <h1 className="text-2xl font-bold mb-2">Akses Ditolak</h1>
          <p className="mb-6">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
          <Link href="/profile" className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors">
            Kembali ke Dasbor
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {children}
    </div>
  );
}
