import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Activity, MapPin, Globe, Clock, ShieldCheck, User as UserIcon } from "lucide-react";
import { cookies } from "next/headers";

export const metadata = {
  title: "Log Aktivitas User - COGNIT",
};

export const dynamic = "force-dynamic";

export default async function AdminLogsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Authorize only real admin
  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  });

  const viewMode = cookies().get('view-mode')?.value || 'admin';
  const isAdminView = currentUser?.role === 'ADMIN' && viewMode === 'admin';

  if (!isAdminView) {
    redirect("/profile");
  }

  // Fetch the latest 100 login logs
  const logs = await prisma.loginActivity.findMany({
    take: 100,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true, npp: true, department: true } }
    }
  });

  return (
    <div className="w-full max-w-[1920px] mx-auto pt-4 pb-8 md:pt-6 md:pb-12 px-4 md:px-6 lg:px-8 xl:px-12 relative">
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl -z-10 mix-blend-multiply" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl -z-10 mix-blend-multiply" />
      
      <div className="w-full relative z-10 mb-6">
        <Card className="flex flex-col md:flex-row items-center p-6 md:p-8 shadow-[0_8px_30px_rgb(251,191,36,0.12)] border border-slate-100 dark:border-slate-800 bg-white dark:bg-zinc-950 overflow-hidden w-full rounded-2xl relative gap-6">
          <div className="absolute inset-0 pointer-events-none opacity-[0.04] dark:opacity-[0.1]" style={{ backgroundImage: 'radial-gradient(#d97706 2px, transparent 2px)', backgroundSize: '24px 24px' }}></div>
          
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-white shadow-xl shadow-orange-500/20 flex-shrink-0 relative z-10">
            <ShieldCheck className="w-8 h-8 md:w-10 md:h-10" />
          </div>
          
          <div className="flex-1 text-center md:text-left relative z-10">
            <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
              Log Aktivitas User
            </h1>
            <p className="mt-2 text-muted-foreground text-sm md:text-base font-medium max-w-2xl">
              Memantau riwayat akses (login) pengguna secara real-time, meliputi informasi lokasi, perangkat, dan waktu akses untuk tujuan keamanan sistem.
            </p>
          </div>
        </Card>
      </div>

      <Card className="shadow-lg border-slate-200/60 dark:border-slate-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md rounded-2xl overflow-hidden relative z-10">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 pb-4">
          <CardTitle className="text-xl font-bold flex items-center gap-2 text-orange-700 dark:text-orange-400">
            <Activity className="w-5 h-5 text-orange-500" />
            Riwayat Akses Terbaru
          </CardTitle>
          <CardDescription>
            Menampilkan 100 aktivitas login terakhir di sistem COGNIT.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-0 overflow-x-auto">
            {logs.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4 text-slate-400">
                  <Activity className="w-8 h-8" />
                </div>
                <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">
                  Belum Ada Data Login
                </p>
                <p className="text-slate-500 mt-2 max-w-md">
                  Aktivitas login akan muncul di sini secara otomatis setelah pengguna berhasil masuk ke aplikasi.
                </p>
              </div>
            ) : (
              <Table className="w-full">
                <TableHeader className="bg-gradient-to-r from-slate-100 to-slate-50/50 dark:from-slate-800/80 dark:to-slate-900/50 shadow-sm border-b-2 border-orange-500/20">
                  <TableRow className="hover:bg-transparent border-0">
                    <TableHead className="font-extrabold whitespace-nowrap px-6 py-5 text-orange-700 dark:text-orange-300 uppercase tracking-wider text-xs">Waktu Akses</TableHead>
                    <TableHead className="font-extrabold whitespace-nowrap px-6 text-orange-700 dark:text-orange-300 uppercase tracking-wider text-xs">Pengguna</TableHead>
                    <TableHead className="font-extrabold whitespace-nowrap px-6 text-orange-700 dark:text-orange-300 uppercase tracking-wider text-xs">IP & Lokasi</TableHead>
                    <TableHead className="font-extrabold px-6 min-w-[200px] text-orange-700 dark:text-orange-300 uppercase tracking-wider text-xs">Perangkat (User-Agent)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log: any, idx: number) => (
                    <TableRow 
                      key={log.id} 
                      className={`group hover:bg-white dark:hover:bg-zinc-900 transition-all duration-300 hover:shadow-md ${idx % 2 === 0 ? 'bg-slate-50/30 dark:bg-slate-900/20' : 'bg-transparent'} border-b border-slate-100 dark:border-slate-800/60`}
                    >
                      <TableCell className="px-6 py-4 align-top relative">
                        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-transparent group-hover:bg-orange-500 transition-colors duration-300 rounded-r-full"></div>
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-black/40 py-1.5 px-3 rounded-lg w-fit shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-slate-200/60 dark:border-slate-700/50">
                            <Clock className="w-3.5 h-3.5 text-orange-500" />
                            {new Date(log.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </div>
                          <span className="text-xs font-bold text-slate-500 pl-2">
                            {new Date(log.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute:'2-digit', second:'2-digit' })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 align-top">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5">
                            <UserIcon className="w-4 h-4 text-slate-400" />
                            <p className="font-bold text-foreground text-sm">{log.user?.name || 'Unknown User'}</p>
                          </div>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 w-fit border border-slate-200 dark:border-slate-700">
                              NPP: {log.user?.npp || '-'}
                            </span>
                            {log.user?.department && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-widest bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800 w-fit">
                                {log.user.department}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 align-top">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-1.5">
                            <Globe className="w-4 h-4 text-emerald-500" />
                            <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                              {log.ipAddress || 'Unknown IP'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-rose-500" />
                            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                              {log.location && log.location !== 'Unknown City, Unknown Country' ? log.location : 'Lokasi Tidak Diketahui'}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 align-top">
                        <div className="w-[250px] sm:w-[350px] lg:w-[450px]">
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed break-words whitespace-normal bg-slate-50 dark:bg-zinc-900/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                            {log.userAgent || 'Unknown Device'}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
