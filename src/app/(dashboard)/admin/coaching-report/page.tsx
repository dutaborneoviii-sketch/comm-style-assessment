import { getCoachingReport } from "@/app/actions/reports";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { FileSpreadsheet, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

function MetricCell({ count, names, activeClass, inactiveClass, isLast = false }: { count: number, names?: string[], activeClass: string, inactiveClass: string, isLast?: boolean }) {
  if (count === 0) {
    return (
      <div className={`mx-auto w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${inactiveClass}`}>
        -
      </div>
    );
  }
  
  return (
    <div className="relative group/tooltip flex justify-center">
      <div className={`mx-auto w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors cursor-help ${activeClass}`}>
        {count}
      </div>
      
      {names && names.length > 0 && (
        <div className={`absolute bottom-full mb-2 hidden group-hover/tooltip:block bg-slate-800 dark:bg-zinc-800 text-white text-[11px] rounded-lg px-3 py-2 z-50 shadow-xl border border-slate-700/50 w-max max-w-[200px] text-left ${isLast ? 'right-0' : 'left-1/2 -translate-x-1/2'}`}>
          <div className="font-bold text-slate-300 mb-1 pb-1 border-b border-slate-700/50">Daftar Anggota:</div>
          <div className="flex flex-col gap-0.5">
            {names.map((name, i) => (
              <div key={i} className="truncate">{name}</div>
            ))}
          </div>
          <div className={`absolute top-full border-4 border-transparent border-t-slate-800 dark:border-t-zinc-800 ${isLast ? 'right-3' : 'left-1/2 -translate-x-1/2'}`}></div>
        </div>
      )}
    </div>
  );
}

export const dynamic = "force-dynamic";

export default async function CoachingReportPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const currentUser = await prisma.user.findUnique({ where: { id: session.user.id } });
  
  const isAsdepSDM = currentUser?.position === 'Asisten Deputi' && currentUser?.department === 'Bidang SDM, Umum dan Komunikasi (SDMUK)';
  if (!currentUser || (currentUser.role !== "ADMIN" && !isAsdepSDM)) redirect("/profile");

  const reports = await getCoachingReport();

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
          <div className="overflow-x-auto md:overflow-visible">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#f2fafa] dark:bg-[#015249]/20 text-[#015249] dark:text-[#57BC90] font-bold border-b border-slate-200 dark:border-slate-800/50">
                <tr>
                  <th className="px-6 py-4 rounded-tl-xl w-16">No</th>
                  <th className="px-6 py-4">Nama Pimpinan</th>
                  <th className="px-6 py-4">Jabatan</th>
                  <th className="px-6 py-4">Bidang</th>
                  <th className="px-4 py-4 text-center">Jumlah Sesi</th>
                  <th className="px-4 py-4 text-center text-emerald-600 dark:text-emerald-400">Selesai Coaching</th>
                  <th className="px-4 py-4 text-center text-blue-600 dark:text-blue-400">Proses Coaching</th>
                  <th className="px-4 py-4 text-center text-amber-600 dark:text-amber-400 rounded-tr-xl">Belum Mulai</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {reports.map((report, index) => {
                  const getInitials = (name: string) => {
                    if (!name) return "NA";
                    return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
                  };

                  return (
                    <tr 
                      key={report.id} 
                      className="hover:bg-slate-50 dark:hover:bg-zinc-900/50 transition-colors group"
                    >
                      <td className="px-6 py-4 text-slate-400 dark:text-slate-500 font-medium">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#015249]/10 to-[#57BC90]/20 flex items-center justify-center text-[#015249] dark:text-[#57BC90] font-bold text-xs ring-2 ring-white dark:ring-zinc-950 group-hover:scale-110 transition-transform">
                            {getInitials(report.name || "")}
                          </div>
                          <div className="font-bold text-slate-800 dark:text-slate-200 uppercase text-xs tracking-wide">
                            {report.name || "N/A"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-500 dark:text-slate-400 text-xs font-medium">
                          {report.position || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-500 dark:text-slate-400 text-xs">
                          {report.department || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <MetricCell 
                          count={report.totalSesi} 
                          names={report.totalSesiNames} 
                          activeClass="bg-[#164732] text-white shadow-sm" 
                          inactiveClass="bg-slate-100 text-slate-400 dark:bg-slate-800/80 dark:text-slate-500" 
                        />
                      </td>
                      <td className="px-4 py-4">
                        <MetricCell 
                          count={report.selesai} 
                          names={report.selesaiNames} 
                          activeClass="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" 
                          inactiveClass="text-slate-300 dark:text-slate-600" 
                        />
                      </td>
                      <td className="px-4 py-4">
                        <MetricCell 
                          count={report.proses} 
                          names={report.prosesNames} 
                          activeClass="bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400" 
                          inactiveClass="text-slate-300 dark:text-slate-600" 
                        />
                      </td>
                      <td className="px-4 py-4">
                        <MetricCell 
                          count={report.belumMulai} 
                          names={report.belumMulaiNames} 
                          activeClass="bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400" 
                          inactiveClass="text-slate-300 dark:text-slate-600"
                          isLast={true}
                        />
                      </td>
                    </tr>
                  );
                })}
                {reports.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Search className="w-8 h-8 text-slate-300" />
                        <span className="text-slate-500 dark:text-slate-400 font-medium">Tidak ada data pimpinan.</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
