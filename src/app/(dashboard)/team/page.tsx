import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, User as UserIcon, MessageCircle, ArrowRight, ArrowLeft, Info } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Anggota Bidang - Belian",
};

const styleColors: Record<string, string> = {
  "Direktif": "bg-[#164732] text-white border-transparent",
  "Ekspresif": "bg-teal-500 text-white border-transparent",
  "Harmonis": "bg-emerald-500 text-white border-transparent",
  "Analitis": "bg-blue-500 text-white border-transparent",
  "Direktif + Ekspresif": "bg-orange-500 text-white border-transparent",
  "Direktif + Analitis": "bg-emerald-500 text-white border-transparent",
  "Harmonis + Analitis": "bg-sky-500 text-white border-transparent",
  "Ekspresif + Harmonis": "bg-teal-600 text-white border-transparent",
  "Direktif + Harmonis": "bg-slate-700 text-white border-transparent",
};

function parseStyleName(dbStyle: string | null | undefined): string {
  if (!dbStyle) return "";
  if (dbStyle.includes("Directive")) return "Direktif";
  if (dbStyle.includes("Expressive")) return "Ekspresif";
  if (dbStyle.includes("Harmonious")) return "Harmonis";
  if (dbStyle.includes("Analytical")) return "Analitis";
  return dbStyle;
}

function normalizeCombination(p: string, s: string): string {
  const combo = [p, s];
  if (combo.includes("Direktif") && combo.includes("Ekspresif")) return "Direktif + Ekspresif";
  if (combo.includes("Direktif") && combo.includes("Analitis")) return "Direktif + Analitis";
  if (combo.includes("Harmonis") && combo.includes("Analitis")) return "Harmonis + Analitis";
  if (combo.includes("Ekspresif") && combo.includes("Harmonis")) return "Ekspresif + Harmonis";
  if (combo.includes("Direktif") && combo.includes("Harmonis")) return "Direktif + Harmonis";
  return combo.sort().join(" + ");
}

export default async function TeamPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Get current user's department and position
  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { department: true, position: true, role: true, employeeLocation: true, workUnit: true }
  });

  const viewMode = cookies().get('view-mode')?.value || 'admin';
  const asistenMode = cookies().get('asisten-mode')?.value || 'coach';
  
  const isViewModeUser = currentUser?.role === 'ADMIN' && viewMode === 'user';
  const isAsistenModeCoachee = (currentUser?.position === 'Asisten Deputi' || currentUser?.position === 'Kepala Kabupaten') && asistenMode === 'coachee';
  
  if (currentUser) {
    if (isViewModeUser) {
      currentUser.role = 'USER';
      currentUser.position = 'Staf Pelaksana';
    } else if (isAsistenModeCoachee) {
      currentUser.position = 'Staf Pelaksana';
    }
  }

  // Redirect if not a manager
  const isManager = currentUser?.role === 'ADMIN' || 
                    currentUser?.position === 'Asisten Deputi' || 
                    currentUser?.position === 'Deputi Direksi Wilayah' || 
                    currentUser?.position === 'Kepala Cabang' ||
                    currentUser?.position === 'Kepala Kabupaten' ||
                    currentUser?.position === 'Kepala Kantor Kabupaten' ||
                    currentUser?.position === 'Asisten Manager';
  if (!isManager) {
    redirect("/profile");
  }

  const isDeputi = currentUser?.position === 'Deputi Direksi Wilayah' || currentUser?.position === 'Kepala Cabang';
  const isKepalaCabupatenOrBagian = currentUser?.role === 'ADMIN' ||
                                    currentUser?.position === 'Kepala Kabupaten' || 
                                    currentUser?.position === 'Kepala Kantor Kabupaten' || 
                                    currentUser?.position === 'Asisten Manager' ||
                                    currentUser?.position === 'Asisten Deputi';
  const department = currentUser?.department;
  
  let teamMembers: any[] = [];
  if (isDeputi) {
    teamMembers = await prisma.user.findMany({
      where: {
        ...(currentUser?.role !== 'ADMIN' ? { id: { not: session.user.id } } : {}),
        OR: currentUser?.position === 'Kepala Cabang' ? [
          { position: 'Asisten Manager', department: { notIn: ['Kantor Kabupaten', 'Kepesertaan dan Penagihan Iuran (Kabupaten)', 'Penjaminan Manfaat dan Pengelolaan Fasilitas Kesehatan (Kabupaten)'] } },
          { position: 'Kepala Kabupaten' },
          { position: 'Kepala Kantor Kabupaten' }
        ] : [
          { position: 'Asisten Deputi' }
        ],
        ...(currentUser?.position === 'Kepala Cabang' ? { workUnit: currentUser.workUnit || undefined } : {}),
        status: 'APPROVED'
      },
      include: {
        assessments: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        coacheeLogs: {
          orderBy: { date: 'desc' }
        }
      },
      orderBy: [
        { department: 'asc' },
        { name: 'asc' }
      ]
    });
  } else if (isKepalaCabupatenOrBagian) {
    teamMembers = await prisma.user.findMany({
      where: {
        ...(currentUser?.role !== 'ADMIN' ? { id: { not: session.user.id } } : {}),
        ...(currentUser?.position === 'Kepala Kabupaten' || currentUser?.position === 'Kepala Kantor Kabupaten' 
          ? {} 
          : { department: currentUser.department || undefined }
        ),
        employeeLocation: currentUser.employeeLocation || undefined,
        workUnit: currentUser.workUnit || undefined,
        ...(currentUser.role !== 'ADMIN' ? {
          position: {
            in: (currentUser.position === 'Asisten Deputi' || currentUser.position === 'Kepala Kabupaten' || currentUser.position === 'Kepala Kantor Kabupaten')
              ? ['Staf Pelaksana', 'PTT/PATT', 'Asisten Manager'] 
              : ['Staf Pelaksana', 'PTT/PATT']
          }
        } : {}),
        // Kecualikan Asisten Manager dari Kedeputian Wilayah VIII
        NOT: {
          AND: [
            { position: 'Asisten Manager' },
            { workUnit: 'Kedeputian Wilayah VIII' }
          ]
        },
        status: 'APPROVED'
      },
      include: {
        assessments: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        coacheeLogs: {
          orderBy: { date: 'desc' }
        }
      },
      orderBy: { name: 'asc' }
    });
  }

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-end gap-2 md:gap-4">
          <h1 className="text-3xl font-extrabold text-[#015249] dark:text-white tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 text-[#57BC90]" />
            Anggota Bidang
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg md:mb-1">
            {isKepalaCabupatenOrBagian 
              ? `${(currentUser.department || "Staf Pelaksana").replace(/\s*\([^)]*\)$/, '')} - ${currentUser.employeeLocation || "Unit Kerja"}` 
              : isDeputi 
                ? (currentUser.position === 'Kepala Cabang' 
                    ? `Pimpinan Bawahan di ${currentUser.workUnit || "Cabang"}` 
                    : "Memonitoring Seluruh Bidang Kedeputian Wilayah VIII") 
                : (department ? `Bidang ${department}` : "Anda belum tergabung dalam bidang apapun.")}
          </p>
        </div>
        
        {/* Information Alert */}
        {isManager && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 text-amber-800 dark:text-amber-300 px-5 py-4 rounded-r-lg shadow-sm flex items-start gap-3">
            <Info className="w-6 h-6 flex-shrink-0 mt-0.5 text-amber-600 dark:text-amber-400 animate-pulse" />
            <div className="flex flex-col">
              <span className="font-bold text-amber-900 dark:text-amber-200 text-base mb-1">Informasi Penting</span>
              <p className="text-sm">
                Pastikan Anggota Anda telah mengisi <strong>Kuisioner Gaya Komunikasi</strong> untuk dapat memulai sesi coaching.
              </p>
            </div>
          </div>
        )}
      </div>

      {(!department && !isDeputi && !isKepalaCabupatenOrBagian) ? (
        <Card className="bg-slate-50 dark:bg-slate-900/50 border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
              <Users className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-foreground">Bidang Belum Diatur</h3>
            <p className="text-muted-foreground max-w-md text-base">
              Profil Anda belum memiliki informasi Bidang. Anggota tim Anda akan muncul di sini secara otomatis berdasarkan bidang yang sama.
            </p>
            <Link href="/profile" className="mt-8">
              <Button size="lg" className="bg-[#015249] hover:bg-[#57BC90] text-white">Perbarui Profil</Button>
            </Link>
          </CardContent>
        </Card>
      ) : teamMembers.length === 0 ? (
        <Card className="bg-slate-50 dark:bg-slate-900/50 border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 bg-[#57BC90]/10 rounded-full flex items-center justify-center mb-6">
              <Users className="w-10 h-10 text-[#57BC90]" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-foreground">Belum Ada Anggota Tim</h3>
            <p className="text-muted-foreground max-w-md text-base">
              Saat ini belum ada pengguna lain yang mendaftar dan tergabung di bidang <strong>{department}</strong>.
            </p>
          </CardContent>
        </Card>
      ) : isDeputi ? (
        // Grouped by department for Deputi view
        <div className="space-y-10">
          {Object.entries(
            teamMembers.reduce((groups: Record<string, typeof teamMembers>, member) => {
              const dept = member.department || "Tanpa Bidang";
              if (!groups[dept]) groups[dept] = [];
              groups[dept].push(member);
              return groups;
            }, {})
          ).sort(([a], [b]) => a.localeCompare(b, 'id')).map(([dept, members]) => (
            <div key={dept}>
              {/* Department Header */}
              <div className="flex items-center gap-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-8 rounded-full bg-gradient-to-b from-[#57BC90] to-[#015249]" />
                  <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">{dept}</h2>
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-white/20 to-transparent" />
                <span className="text-xs font-bold text-slate-400 bg-white/10 px-3 py-1 rounded-full border border-slate-200">
                  {members.length} anggota
                </span>
              </div>
              {/* Table Header */}
              <div className="hidden sm:grid sm:grid-cols-[2fr_1.2fr_1.2fr_120px] items-center p-3.5 px-6 gap-4 sm:gap-6 bg-[#164732] text-white rounded-full mb-3 shadow-sm">
                <div className="font-bold text-sm tracking-wide">Anggota</div>
                <div className="font-bold text-sm tracking-wide">Gaya Komunikasi</div>
                <div className="font-bold text-sm tracking-wide">Status Coaching</div>
                <div className="font-bold text-sm tracking-wide text-center">Aksi</div>
              </div>
              
              {/* Members List (Table Rows) */}
              <div className="flex flex-col gap-2.5 w-full">
                {(members as typeof teamMembers).map((member) => {
                  const latestAssessment = member.assessments[0];
                  const primaryStyle = parseStyleName(latestAssessment?.primaryStyle) || "Belum Asesmen";
                  const isCombination = latestAssessment?.isCombination;
                  const styleLabel = (isCombination && latestAssessment?.secondaryStyle) 
                    ? normalizeCombination(primaryStyle, parseStyleName(latestAssessment.secondaryStyle)) 
                    : primaryStyle;
                  const colorClass = styleColors[styleLabel] || "bg-slate-200 text-slate-700 border-transparent dark:bg-slate-800 dark:text-slate-300";
                  return (
                    <Card key={member.id} className="overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border-slate-200/50 dark:border-slate-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md rounded-3xl sm:rounded-full group relative">
                      <div className="flex flex-col sm:grid sm:grid-cols-[2fr_1.2fr_1.2fr_120px] sm:items-center p-3 sm:py-3 px-5 sm:px-6 gap-4 sm:gap-6">
                        {/* User Info */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#57BC90]/10 to-[#015249]/10 dark:from-[#57BC90]/20 dark:to-[#015249]/20 flex items-center justify-center text-[#57BC90] flex-shrink-0 shadow-sm ring-2 ring-white dark:ring-zinc-950 group-hover:scale-105 transition-all duration-300">
                            <UserIcon className="w-5 h-5" />
                          </div>
                          <div className="min-w-0 flex flex-col">
                            <h4 className="text-sm font-bold text-foreground group-hover:text-[#015249] dark:group-hover:text-blue-400 transition-colors truncate">
                              {member.name || "Tanpa Nama"} {member.npp && <span className="text-muted-foreground font-normal ml-1">({member.npp})</span>}
                            </h4>
                            <p className="text-[10px] text-muted-foreground font-medium mt-0.5 truncate">
                              {member.email}
                            </p>
                            <div className="mt-1.5 inline-flex w-fit items-center px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800/80 rounded text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                              {member.position || "-"}
                            </div>
                          </div>
                        </div>

                        {/* Gaya Komunikasi */}
                        <div className="flex flex-col gap-1.5 justify-center items-start">
                          <span className="sm:hidden text-[9px] font-black text-slate-400 uppercase tracking-wider">Gaya Komunikasi</span>
                          <div>
                            {latestAssessment ? (
                              <div className={`inline-flex items-center px-3 py-1.5 rounded-full border text-[11px] font-bold ${colorClass}`}>
                                {isCombination && latestAssessment.secondaryStyle 
                                  ? normalizeCombination(primaryStyle, parseStyleName(latestAssessment.secondaryStyle))
                                  : primaryStyle}
                              </div>
                            ) : (
                              <div className="inline-flex items-center px-3 py-1.5 rounded-full border bg-slate-200 text-slate-500 border-transparent dark:bg-slate-800 dark:text-slate-400 text-[11px] font-bold">
                                Belum Asesmen
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Status Coaching */}
                        <div className="flex flex-col gap-1.5 justify-center items-start">
                          <span className="sm:hidden text-[9px] font-black text-slate-400 uppercase tracking-wider">Status Coaching</span>
                          <div>
                            {(() => {
                              if (!member.coacheeLogs || member.coacheeLogs.length === 0) {
                                return (
                                  <div className="inline-flex items-center px-3 py-1.5 rounded-full border bg-amber-500 text-white border-transparent text-[11px] font-bold">
                                    Belum Coaching
                                  </div>
                                );
                              }
                              
                              const selesaiCount = member.coacheeLogs.filter((log: any) => log.isClosed).length;
                              const prosesCount = member.coacheeLogs.filter((log: any) => !log.isClosed).length;
                              const recentLog = member.coacheeLogs[0];
                              
                              return (
                                <div className="flex flex-col gap-1.5">
                                  <div className="inline-flex items-center justify-center px-3 py-1.5 rounded-full border bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-transparent text-[11px] font-bold">
                                    {recentLog.isClosed ? 'Selesai' : 'Sedang Berjalan'} ({new Date(recentLog.date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: '2-digit' })})
                                  </div>
                                  <div className="flex items-center gap-3 text-[10px] font-medium text-slate-500 dark:text-slate-400 pl-1">
                                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Selesai: {selesaiCount}</span>
                                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>Sedang Berjalan: {prosesCount}</span>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        </div>

                        {/* Action Button */}
                        <div className="flex justify-center items-center w-full sm:w-auto">
                          <Link href={`/team/${member.id}`} className="block w-full">
                            <Button
                              variant={latestAssessment ? "default" : "outline"}
                              className={`w-full justify-center transition-all duration-300 rounded-full h-8 px-4 text-xs font-bold shadow-sm ${latestAssessment ? "bg-[#164732] hover:bg-[#0f3022] text-white" : "bg-slate-200 text-slate-500 hover:bg-slate-300"}`}
                              disabled={!latestAssessment}
                            >
                              Detail
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Table Header */}
          <div className="hidden sm:grid sm:grid-cols-[2fr_1.2fr_1.2fr_120px] items-center p-3.5 px-6 gap-4 sm:gap-6 bg-[#164732] text-white rounded-full mb-3 shadow-sm">
            <div className="font-bold text-sm tracking-wide">Anggota</div>
            <div className="font-bold text-sm tracking-wide">Gaya Komunikasi</div>
            <div className="font-bold text-sm tracking-wide">Status Coaching</div>
            <div className="font-bold text-sm tracking-wide text-center">Aksi</div>
          </div>

          {/* Members List (Table Rows) */}
          <div className="flex flex-col gap-2.5 w-full">
          {teamMembers.map((member) => {
            const latestAssessment = member.assessments[0];
            const primaryStyle = parseStyleName(latestAssessment?.primaryStyle) || "Belum Asesmen";
            const isCombination = latestAssessment?.isCombination;
            const styleLabel = (isCombination && latestAssessment?.secondaryStyle) 
              ? normalizeCombination(primaryStyle, parseStyleName(latestAssessment.secondaryStyle)) 
              : primaryStyle;
            const colorClass = styleColors[styleLabel] || "bg-slate-200 text-slate-700 border-transparent dark:bg-slate-800 dark:text-slate-300";
            return (
              <Card key={member.id} className="overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border-slate-200/50 dark:border-slate-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md rounded-3xl sm:rounded-full group relative">
                <div className="flex flex-col sm:grid sm:grid-cols-[2fr_1.2fr_1.2fr_120px] sm:items-center p-3 sm:py-3 px-5 sm:px-6 gap-4 sm:gap-6">
                  {/* User Info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#57BC90]/10 to-[#015249]/10 dark:from-[#57BC90]/20 dark:to-[#015249]/20 flex items-center justify-center text-[#57BC90] flex-shrink-0 shadow-sm ring-2 ring-white dark:ring-zinc-950 group-hover:scale-105 transition-all duration-300">
                      <UserIcon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-foreground group-hover:text-[#015249] dark:group-hover:text-blue-400 transition-colors truncate">
                        {member.name || "Tanpa Nama"} {member.npp && <span className="text-muted-foreground font-normal ml-1">({member.npp})</span>}
                      </h4>
                      <p className="text-[10px] text-muted-foreground font-medium mt-0.5 truncate">
                        {member.email}
                      </p>
                    </div>
                  </div>

                  {/* Gaya Komunikasi */}
                  <div className="flex flex-col gap-1.5 justify-center items-start">
                    <span className="sm:hidden text-[9px] font-black text-slate-400 uppercase tracking-wider">Gaya Komunikasi</span>
                    <div>
                      {latestAssessment ? (
                        <div className={`inline-flex items-center px-3 py-1.5 rounded-full border text-[11px] font-bold ${colorClass}`}>
                          {isCombination && latestAssessment.secondaryStyle 
                            ? normalizeCombination(primaryStyle, parseStyleName(latestAssessment.secondaryStyle))
                            : primaryStyle}
                        </div>
                      ) : (
                        <div className="inline-flex items-center px-3 py-1.5 rounded-full border bg-slate-200 text-slate-500 border-transparent dark:bg-slate-800 dark:text-slate-400 text-[11px] font-bold">
                          Belum Asesmen
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status Coaching */}
                  <div className="flex flex-col gap-1.5 justify-center items-start">
                    <span className="sm:hidden text-[9px] font-black text-slate-400 uppercase tracking-wider">Status Coaching</span>
                    <div>
                      {(() => {
                        if (!member.coacheeLogs || member.coacheeLogs.length === 0) {
                          return (
                            <div className="inline-flex items-center px-3 py-1.5 rounded-full border bg-amber-500 text-white border-transparent text-[11px] font-bold">
                              Belum Coaching
                            </div>
                          );
                        }
                        
                        const selesaiCount = member.coacheeLogs.filter((log: any) => log.isClosed).length;
                        const prosesCount = member.coacheeLogs.filter((log: any) => !log.isClosed).length;
                        const recentLog = member.coacheeLogs[0];
                        
                        return (
                          <div className="flex flex-col gap-1.5">
                            <div className="inline-flex items-center justify-center px-3 py-1.5 rounded-full border bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-transparent text-[11px] font-bold w-fit">
                              {recentLog.isClosed ? 'Selesai' : 'Sedang Berjalan'} ({new Date(recentLog.date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: '2-digit' })})
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-[10px] font-medium text-slate-500 dark:text-slate-400 pl-1">
                              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Selesai: {selesaiCount}</span>
                              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>Sedang Berjalan: {prosesCount}</span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex justify-center items-center w-full sm:w-auto">
                    <Link href={`/team/${member.id}`} className="block w-full">
                      <Button
                        variant={latestAssessment ? "default" : "outline"}
                        className={`w-full justify-center transition-all duration-300 rounded-full h-8 px-4 text-xs font-bold shadow-sm ${latestAssessment ? "bg-[#164732] hover:bg-[#0f3022] text-white" : "bg-slate-200 text-slate-500 hover:bg-slate-300"}`}
                        disabled={!latestAssessment}
                      >
                        Detail
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
        </>
      )}
    </div>
  );
}
