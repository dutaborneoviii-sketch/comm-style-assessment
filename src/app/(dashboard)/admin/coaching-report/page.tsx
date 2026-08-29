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
  
  const isAsdepSDM = currentUser?.position === 'Asisten Deputi' && currentUser?.department === 'Bidang SDM, Umum dan Komunikasi (SDMUK)';
  if (!currentUser || (currentUser.role !== "ADMIN" && !isAsdepSDM)) redirect("/profile");

  let reports = await getCoachingReport();

  const allowedPositions = ['Deputi Direksi Wilayah', 'Asisten Deputi', 'Kepala Cabang', 'Kepala Kabupaten', 'Asisten Manager'];
  reports = reports.filter(r => {
    if (!allowedPositions.includes(r.position!)) return false;
    // Exclude Asisten Manager from Kedeputian Wilayah VIII
    if (r.position === 'Asisten Manager' && r.workUnit === 'Kedeputian Wilayah VIII') return false;
    return true;
  });

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
