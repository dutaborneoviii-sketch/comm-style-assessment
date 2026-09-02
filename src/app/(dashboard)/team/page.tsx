import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, User as UserIcon, MessageCircle, ArrowRight, ArrowLeft, Info } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { getUserAccess } from "@/lib/access";
import { Button, buttonVariants } from "@/components/ui/button";
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
    redirect("/");
  }

  // Get current user's department and position
  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, positionDetail: true, department: true, employeeLocation: true, workUnit: true, pangkat: true }
  });

  const viewMode = cookies().get('view-mode')?.value || 'admin';
  const asistenMode = cookies().get('asisten-mode')?.value || 'coach';
  
  const isViewModeUser = currentUser?.role === 'ADMIN' && viewMode === 'user';
  const isAsistenModeCoachee = (currentUser?.positionDetail?.startsWith('Asisten Deputi') || currentUser?.positionDetail === 'Kepala Kabupaten') && asistenMode === 'coachee';
  
  if (currentUser) {
    if (isViewModeUser) {
      currentUser.role = 'USER';
      currentUser.positionDetail = 'Staf Pelaksana';
    } else if (isAsistenModeCoachee) {
      currentUser.positionDetail = 'Staf Pelaksana';
    }
  }

  const access = getUserAccess(currentUser as any);
  const isManager = access.isAdmin || access.isCoach;
  
  if (!isManager) {
    redirect("/profile");
  }

  const isDeputi = currentUser?.positionDetail === 'Deputi Direksi Wilayah' || currentUser?.positionDetail === 'Kepala Cabang';
  const isKepalaCabang = currentUser?.pangkat === 'Manager' && currentUser?.workUnit?.startsWith('Kantor Cabang');
  const isKepalaKabupaten = currentUser?.positionDetail === 'Kepala Kabupaten';
  const isKepalaCabupatenOrBagian = currentUser?.role === 'ADMIN' ||
                                    currentUser?.positionDetail === 'Kepala Kabupaten' || 
                                    currentUser?.positionDetail === 'Kepala Kantor Kabupaten' || currentUser?.positionDetail === 'Kepala Kantor Kota' || 
                                    currentUser?.positionDetail === 'Asisten Manager' ||
                                    currentUser?.positionDetail?.startsWith('Asisten Deputi');
  const department = currentUser?.department;
  
  let teamMembers: any[] = [];
  
  if (currentUser?.role === 'ADMIN') {
    teamMembers = await prisma.user.findMany({
      where: { 
        status: 'APPROVED',
        id: { not: session.user.id },
        department: currentUser.department || undefined 
      },
      include: {
        assessments: { orderBy: { createdAt: 'desc' }, take: 1 },
        coacheeLogs: { orderBy: { date: 'desc' } }
      },
      orderBy: [{ name: 'asc' }]
    });
  } else if (access.isCoach) {
    let targetPangkat: string[] = [];
    const isTopLevel = currentUser.pangkat === 'Senior Manager' || currentUser.pangkat === 'Deputi Direksi Wilayah' || currentUser.positionDetail === 'Deputi Direksi Wilayah' || currentUser.positionDetail === 'Kepala Cabang';
    
    if (isTopLevel) {
      if (currentUser.positionDetail === 'Kepala Cabang' || (currentUser.workUnit?.startsWith('Kantor Cabang') && currentUser.pangkat === 'Manager')) {
        targetPangkat = ['Asisten Manager'];
      } else if (currentUser.pangkat === 'Senior Manager') {
        targetPangkat = ['Manager'];
      } else {
        targetPangkat = ['Manager', 'Asisten Manager', 'Pelaksana', 'PTT/PATT', 'Asisten Deputi', 'Kepala Kabupaten', 'Kepala Kantor Kabupaten', 'Kepala Kantor Kota', 'Staf Pelaksana'];
      }
    } else if (currentUser.pangkat === 'Manager' || currentUser.positionDetail?.startsWith('Asisten Deputi') || currentUser.positionDetail === 'Kepala Kabupaten' || currentUser.positionDetail === 'Kepala Kantor Kabupaten' || currentUser?.positionDetail === 'Kepala Kantor Kota') {
      targetPangkat = ['Asisten Manager', 'Pelaksana', 'PTT/PATT', 'Staf Pelaksana'];
    } else if (currentUser.pangkat === 'Asisten Manager' || currentUser.positionDetail === 'Asisten Manager') {
      targetPangkat = ['Pelaksana', 'PTT/PATT', 'Staf Pelaksana'];
    }

    teamMembers = await prisma.user.findMany({
      where: {
        id: { not: session.user.id },
        workUnit: currentUser.workUnit || undefined,
        // Top level (Deputi/Senior Manager) sees all departments in their workUnit, 
        // Kepala Cabang sees all departments in their workUnit (they only see Asisten Manager).
        // Kepala Kabupaten sees all departments in their employeeLocation (Kabupaten).
        // Others (Manager/Asisten Manager) only see their own department.
        ...((isTopLevel || currentUser.positionDetail === 'Kepala Kabupaten' || currentUser.positionDetail === 'Kepala Kantor Kabupaten' || currentUser?.positionDetail === 'Kepala Kantor Kota') ? {} : { department: currentUser.department || undefined }),
        ...((currentUser.positionDetail === 'Kepala Kabupaten' || currentUser.positionDetail === 'Kepala Kantor Kabupaten' || currentUser?.positionDetail === 'Kepala Kantor Kota') ? { employeeLocation: currentUser.employeeLocation || undefined } : {}),
        OR: [
          { pangkat: { in: targetPangkat } },
          { positionDetail: { in: targetPangkat } }
        ],
        status: 'APPROVED'
      },
      include: {
        assessments: { orderBy: { createdAt: 'desc' }, take: 1 },
        coacheeLogs: { orderBy: { date: 'desc' } }
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
            {currentUser?.workUnit?.startsWith('Kantor Cabang') || currentUser?.workUnit === 'Kantor Kabupaten' || currentUser?.workUnit === 'Kantor Kota' ? "Anggota Bagian" : "Anggota Bidang"}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg md:mb-1">
            {isKepalaCabupatenOrBagian 
              ? `${(currentUser.department || "Staf Pelaksana").replace(/\s*\([^)]*\)$/, '')} - ${currentUser.employeeLocation || "Unit Kerja"}` 
              : isDeputi 
                ? (currentUser.positionDetail === 'Kepala Cabang' 
                    ? currentUser.workUnit || "Cabang"
                    : "Memonitoring Seluruh Bidang Kedeputian Wilayah VIII") 
                : (department ? department : `Anda belum tergabung dalam ${currentUser?.workUnit?.startsWith('Kantor Cabang') || currentUser?.workUnit === 'Kantor Kabupaten' || currentUser?.workUnit === 'Kantor Kota' ? 'bagian' : 'bidang'} apapun.`)}
          </p>
        </div>
        
        {/* Information Alert */}
        {isManager && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 md:p-5 shadow-sm">
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
            <h3 className="text-2xl font-bold mb-3 text-foreground">{currentUser?.workUnit?.startsWith('Kantor Cabang') || currentUser?.workUnit === 'Kantor Kabupaten' || currentUser?.workUnit === 'Kantor Kota' ? 'Bagian' : 'Bidang'} Belum Diatur</h3>
            <p className="text-muted-foreground max-w-md text-base">
              Profil Anda belum memiliki informasi {currentUser?.workUnit?.startsWith('Kantor Cabang') || currentUser?.workUnit === 'Kantor Kabupaten' || currentUser?.workUnit === 'Kantor Kota' ? 'Bagian' : 'Bidang'}. Anggota tim Anda akan muncul di sini secara otomatis berdasarkan {currentUser?.workUnit?.startsWith('Kantor Cabang') || currentUser?.workUnit === 'Kantor Kabupaten' || currentUser?.workUnit === 'Kantor Kota' ? 'bagian' : 'bidang'} yang sama.
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
      ) : isKepalaCabang ? (
        <div className="flex flex-col gap-6">
          <div className="hidden sm:grid sm:grid-cols-[2fr_1.2fr_1.2fr_120px] items-center p-3.5 px-6 gap-4 sm:gap-6 bg-[#164732] text-white rounded-full shadow-sm">
            <div className="font-bold text-sm tracking-wide">Anggota</div>
            <div className="font-bold text-sm tracking-wide">Gaya Komunikasi</div>
            <div className="font-bold text-sm tracking-wide">Status Coaching</div>
            <div className="font-bold text-sm tracking-wide text-center">Aksi</div>
          </div>
          
          <div className="space-y-10">
            {Object.entries(
              teamMembers.reduce((groups: Record<string, typeof teamMembers>, member) => {
                const groupName = member.department === "Kantor Kabupaten" ? "Kantor Kabupaten" : (currentUser?.workUnit || "Kantor Cabang");
                if (!groups[groupName]) groups[groupName] = [];
                groups[groupName].push(member);
                return groups;
              }, {})
            ).sort(([a], [b]) => {
              if (a.startsWith("Kantor Cabang") && !b.startsWith("Kantor Cabang")) return -1;
              if (!a.startsWith("Kantor Cabang") && b.startsWith("Kantor Cabang")) return 1;
              return a.localeCompare(b, 'id');
            }).map(([groupName, members]) => (
              <div key={groupName}>
                <div className="flex items-center gap-4 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-8 rounded-full bg-gradient-to-b from-[#57BC90] to-[#015249]" />
                    <h2 className="text-xl font-extrabold text-slate-800 dark:text-white tracking-tight">{groupName}</h2>
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-slate-200 dark:from-slate-800 to-transparent" />
                  <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                    {members.length} anggota
                  </span>
                </div>
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
                                {member.department || "-"} - {member.employeeLocation || "-"}
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

                          <div className="flex justify-center items-center w-full sm:w-auto">
                            <Link 
                              href={latestAssessment ? `/team/${member.id}` : "#"} 
                              className={cn(
                                buttonVariants({ variant: latestAssessment ? "default" : "outline" }),
                                "w-full justify-center transition-all duration-300 rounded-full h-8 px-4 text-xs font-bold shadow-sm",
                                latestAssessment ? "bg-[#164732] hover:bg-[#0f3022] text-white" : "bg-slate-200 text-slate-500 hover:bg-slate-300 pointer-events-none"
                              )}
                            >
                              Detail
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
                    <div className="min-w-0 flex flex-col">
                      <h4 className="text-sm font-bold text-foreground group-hover:text-[#015249] dark:group-hover:text-blue-400 transition-colors truncate">
                        {member.name || "Tanpa Nama"} {member.npp && <span className="text-muted-foreground font-normal ml-1">({member.npp})</span>}
                      </h4>
                      <p className="text-[10px] text-muted-foreground font-medium mt-0.5 truncate">
                        {member.email}
                      </p>
                      <div className="mt-1.5 inline-flex w-fit items-center px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800/80 rounded text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                        {member.department || "-"} - {member.employeeLocation || "-"}
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

                  <div className="flex justify-center items-center w-full sm:w-auto">
                    <Link 
                      href={latestAssessment ? `/team/${member.id}` : "#"} 
                      className={cn(
                        buttonVariants({ variant: latestAssessment ? "default" : "outline" }),
                        "w-full justify-center transition-all duration-300 rounded-full h-8 px-4 text-xs font-bold shadow-sm",
                        latestAssessment ? "bg-[#164732] hover:bg-[#0f3022] text-white" : "bg-slate-200 text-slate-500 hover:bg-slate-300 pointer-events-none"
                      )}
                    >
                      Detail
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
