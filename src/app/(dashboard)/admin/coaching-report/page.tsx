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

  const isAsistenDeputi = currentUser.pangkat === 'Manager' || currentUser.pangkat === 'Asisten Deputi' || currentUser.positionDetail === 'Asisten Deputi' || currentUser.positionDetail === 'Kepala Kabupaten';
  const isAsdepSDM = (isAsistenDeputi && currentUser.department?.includes('SDMUK')) || currentUser.positionDetail?.includes('Asisten Deputi Bidang Sumber Daya Manusia');
  
  if (!isAdmin && !isEnabled && !isAsdepSDM) redirect("/profile");

  let reports = await getCoachingReport();

  const allowedPositions = [
    'Senior Manager', 'Manager', 'Asisten Manager', 
    'Deputi Direksi Wilayah', 'Asisten Deputi', 'Kepala Cabang', 'Kepala Kabupaten', 'Kepala Kantor Kabupaten'
  ];
  
  reports = reports.filter(r => {
    const isAllowedRole = allowedPositions.includes(r.pangkat!) || allowedPositions.includes(r.positionDetail!);
    if (!isAllowedRole) return false;
    
    // Exclude Asisten Manager from Kedeputian Wilayah VIII
    if ((r.pangkat === 'Asisten Manager' || r.positionDetail === 'Asisten Manager') && r.workUnit === 'Kedeputian Wilayah VIII') return false;
    
    return true;
  });

  // Filter specific to Manager SDMUK Kedeputian Wilayah VIII
  if (!isAdmin && isAsdepSDM) {
    reports = reports.filter(r => 
      r.workUnit === 'Kedeputian Wilayah VIII' || 
      (r.workUnit && r.workUnit.startsWith('Kantor Cabang')) || 
      (r.workUnit && r.workUnit.startsWith('Kantor Kabupaten'))
    );
  } else if (!isAdmin) {
    // If other non-admins get access via feature flags, restrict them to their own workUnit
    reports = reports.filter(r => r.workUnit === currentUser.workUnit);
  }

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
          <CoachingReportTable reports={reports} />
        </CardContent>
      </Card>
    </div>
  );
}
