import { getCoachingReport } from "@/app/actions/reports";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { FileSpreadsheet, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CoachingReportTable } from "@/components/admin/coaching-report-table";

export const dynamic = "force-dynamic";

export default async function CoachingReportPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const currentUser = await prisma.user.findUnique({ where: { id: session.user.id } });
  
  if (!currentUser) redirect("/");

  const isAdmin = currentUser.role === "ADMIN";
  const userRoleGroup = currentUser.pangkat || currentUser.positionDetail || "Staf";
  
  const { isFeatureEnabled } = await import("@/app/actions/features");
  const isEnabled = await isFeatureEnabled("rekapitulasi_coaching", userRoleGroup, currentUser.department, currentUser.employeeLocation);

  const isAsistenDeputi = currentUser.pangkat === 'Manager' || currentUser.pangkat === 'Asisten Deputi' || currentUser.positionDetail?.startsWith('Asisten Deputi') || currentUser.positionDetail === 'Kepala Kabupaten';
  const isAsdepSDM = (isAsistenDeputi && currentUser.department?.includes('SDMUK')) || currentUser.positionDetail?.includes('Asisten Deputi SDM, Umum dan Komunikasi');
  
  if (!isAdmin && !isEnabled && !isAsdepSDM) redirect("/profile");

  let reports: any[] = [];
  let errorMsg = null;
  try {
    reports = await getCoachingReport();
  } catch(e: any) {
    errorMsg = e.message || e.toString();
  }

  const allowedPositions = [
    'Senior Manager', 'Manager', 'Asisten Manager', 
    'Deputi Direksi Wilayah', 'Asisten Deputi', 'Kepala Cabang', 'Kepala Kabupaten', 'Kepala Kantor Kabupaten', 'Kepala Kantor Kota'
  ];
  
  try {
    reports = reports.filter(r => {
      const isAllowedRole = allowedPositions.includes(r.pangkat!) || allowedPositions.includes(r.positionDetail!);
      if (!isAllowedRole) return false;
      if ((r.pangkat === 'Asisten Manager' || r.positionDetail === 'Asisten Manager') && r.workUnit === 'Kedeputian Wilayah VIII') return false;
      return true;
    });

    if (!isAdmin && isAsdepSDM) {
      reports = reports.filter(r => 
        r.workUnit === 'Kedeputian Wilayah VIII' || 
        (r.workUnit && r.workUnit.startsWith('Kantor Cabang')) || 
        (r.workUnit && r.workUnit.startsWith('Kantor Kabupaten') || r.workUnit.startsWith('Kantor Kota'))
      );
    } else if (!isAdmin) {
      reports = reports.filter(r => r.workUnit === currentUser.workUnit);
    }
  } catch(e: any) {
    errorMsg = errorMsg || e.message || e.toString();
  }

  
  // Ensure no undefined values are passed to Client Components
  const sanitize = (obj: any): any => {
    if (obj === undefined) return null;
    if (obj === null || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(sanitize);
    const newObj: any = {};
    for (const key in obj) {
      newObj[key] = sanitize(obj[key]);
    }
    return newObj;
  };
  reports = sanitize(reports);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-[#015249] dark:text-white tracking-tight flex items-center gap-3">
          <FileSpreadsheet className="w-8 h-8 text-[#57BC90]" />
          Rekapitulasi Coaching
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
          Laporan riwayat jumlah sesi coaching yang dilakukan oleh pimpinan pada masing-masing bidang.
        </p>
      </div>

      <Card className="border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl bg-white dark:bg-zinc-950">
        <CardContent className="p-0">
          {errorMsg ? (
            <div className="p-8 text-red-500 font-mono whitespace-pre-wrap">{errorMsg}</div>
          ) : (
            <CoachingReportTable reports={reports} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
