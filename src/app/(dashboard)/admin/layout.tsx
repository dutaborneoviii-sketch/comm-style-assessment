import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ShieldAlert, Database, ChevronRight } from "lucide-react";
import { cookies } from "next/headers";
import { getUserAccess } from "@/lib/access";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, positionDetail: true, department: true, employeeLocation: true, workUnit: true, pangkat: true }
  });

  const viewMode = cookies().get('view-mode')?.value || 'admin';
  const isViewModeUser = user?.role === 'ADMIN' && viewMode === 'user';
  if (isViewModeUser && user) {
    user.positionDetail = 'Staf Pelaksana';
  }

  const access = getUserAccess(user as any);
  const isAdmin = access.isAdmin;

  let userRoleGroup = "Staf";
  if (isAdmin) {
    // Admin always has access
  } else {
    userRoleGroup = user?.pangkat || user?.positionDetail || "Staf";
  }

  const { getFeatureFlagsMap } = await import("@/app/actions/features");
  const featuresMap = await getFeatureFlagsMap(userRoleGroup, user?.department, user?.employeeLocation);
  
  const isAsistenDeputi = user?.pangkat === 'Manager' || user?.pangkat === 'Asisten Deputi' || user?.positionDetail === 'Asisten Deputi' || user?.positionDetail === 'Kepala Kabupaten';
  const isAsdepSDM = (isAsistenDeputi && user?.department?.includes('SDMUK')) || user?.positionDetail?.includes('Asisten Deputi Bidang Sumber Daya Manusia');
  
  const hasFlag = isAdmin || isAsdepSDM
    ? true 
    : (featuresMap["manajemen_bank_soal"] ||
       featuresMap["jangka_asesmen_ulang"] ||
       featuresMap["manajemen_kamus_panduan"] ||
       featuresMap["manajemen_menu_aplikasi"]);

  if (!isAdmin && !hasFlag) {
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
