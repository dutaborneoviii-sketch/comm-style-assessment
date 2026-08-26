export const dynamic = 'force-dynamic';

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User as UserIcon, MessageCircle, Calendar, Plus, Info, Target, MessageSquareQuote, Lightbulb, Sparkles, Activity, Clock } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cn } from "@/lib/utils";

import { 
  directiveGuide, expressiveGuide, harmoniousGuide, analyticalGuide,
  dirAnaGuide, eksHarGuide, dirEksGuide, harAnaGuide, dirHarGuide 
} from "../../guide/data";
import { CombinationGuideCard } from "../../guide/CombinationCard";
import CoachingTracker from "@/components/coaching-tracker";
import CoachingSectionLayout from "@/components/coaching-section-layout";
import ByteSizedCard from "@/components/byte-sized-card";
import { getStyleDescription, getStyleTrait, getStyleAdvice } from "@/lib/scoring";


export const metadata = {
  title: "Strategi Coaching - Belian",
};

const styleColors: Record<string, { main: string, bg: string, border: string, lightBg: string, guideClass: string }> = {
  "Direktif": { main: "text-red-700 dark:text-red-400", bg: "bg-red-500/10", border: "border-red-200 dark:border-red-900", lightBg: "bg-red-100 dark:bg-red-900/50", guideClass: "text-red-600 dark:text-red-400" },
  "Ekspresif": { main: "text-amber-700 dark:text-amber-400", bg: "bg-amber-500/10", border: "border-amber-200 dark:border-amber-900", lightBg: "bg-amber-100 dark:bg-amber-900/50", guideClass: "text-orange-600 dark:text-orange-500" },
  "Harmonis": { main: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-200 dark:border-emerald-900", lightBg: "bg-emerald-100 dark:bg-emerald-900/50", guideClass: "text-emerald-600 dark:text-emerald-400" },
  "Analitis": { main: "text-blue-700 dark:text-blue-400", bg: "bg-blue-500/10", border: "border-blue-200 dark:border-blue-900", lightBg: "bg-blue-100 dark:bg-blue-900/50", guideClass: "text-[#015249] dark:text-blue-400" },
  "Direktif + Ekspresif": { main: "text-orange-700 dark:text-orange-400", bg: "bg-orange-500/10", border: "border-orange-200 dark:border-orange-900", lightBg: "bg-orange-100 dark:bg-orange-900/50", guideClass: "text-orange-600 dark:text-orange-500" },
  "Direktif + Analitis": { main: "text-purple-700 dark:text-purple-400", bg: "bg-purple-500/10", border: "border-purple-200 dark:border-purple-900", lightBg: "bg-purple-100 dark:bg-purple-900/50", guideClass: "text-purple-600 dark:text-purple-400" },
  "Harmonis + Analitis": { main: "text-sky-700 dark:text-sky-400", bg: "bg-sky-500/10", border: "border-sky-200 dark:border-sky-900", lightBg: "bg-sky-100 dark:bg-sky-900/50", guideClass: "text-sky-600 dark:text-sky-400" },
  "Ekspresif + Harmonis": { main: "text-teal-700 dark:text-teal-400", bg: "bg-teal-500/10", border: "border-teal-200 dark:border-teal-900", lightBg: "bg-teal-100 dark:bg-teal-900/50", guideClass: "text-teal-600 dark:text-teal-400" },
  "Direktif + Harmonis": { main: "text-yellow-700 dark:text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-200 dark:border-yellow-900", lightBg: "bg-yellow-100 dark:bg-yellow-900/50", guideClass: "text-yellow-600 dark:text-yellow-500" },
};

// Reusable component for Primary Styles
function GuideRowCards({ rows, colorClass, bgClass, borderClass, lightBgClass }: { rows: { panduan: string, penjelasan: string, caraCoaching: string, contohKalimat: string }[], colorClass: string, bgClass: string, borderClass: string, lightBgClass: string }) {
  return (
    <div className="space-y-6 mt-6">
      {rows.map((row, idx: number) => (
        <div key={idx} className="bg-white/40 dark:bg-black/20 border border-slate-100 dark:border-slate-800 rounded-xl p-5 sm:p-7 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <h3 className={`text-lg font-bold mb-6 flex items-start sm:items-center gap-3 ${colorClass}`}>
            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shrink-0 mt-0.5 sm:mt-0 shadow-sm ${lightBgClass}`}>
              {idx + 1}
            </span>
            <span className="leading-tight">{row.panduan}</span>
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
            <div className="space-y-3">
               <h4 className="font-semibold text-sm text-foreground/80 flex items-center gap-2">
                  <Info className={`w-4 h-4 ${colorClass}`} />
                  Penjelasan
               </h4>
               <p className="text-sm leading-relaxed text-muted-foreground">{row.penjelasan}</p>
            </div>
            <div className="space-y-3">
               <h4 className="font-semibold text-sm text-foreground/80 flex items-center gap-2">
                  <Target className={`w-4 h-4 ${colorClass}`} />
                  Cara Coaching
               </h4>
               <p className="text-sm leading-relaxed text-foreground/90 font-medium">{row.caraCoaching}</p>
            </div>
            <div className={`space-y-3 p-4 rounded-xl shadow-sm border ${bgClass} ${borderClass} md:col-span-2`}>
               <h4 className={`font-semibold text-sm flex items-center gap-2 ${colorClass}`}>
                  <MessageSquareQuote className="w-4 h-4" />
                  Contoh Kalimat
               </h4>
               <p className="text-sm leading-relaxed italic text-foreground/90">{row.contohKalimat}</p> 
            </div>
          </div>

        </div>
      ))}
    </div>
  )
}

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

function getGuideData(primary: string | undefined, secondary: string | undefined, isCombination: boolean | undefined) {
  if (!primary) return null;
  
  if (isCombination && secondary) {
    const combined = normalizeCombination(primary, secondary);
    if (combined === "Direktif + Analitis") return { type: "combination", data: dirAnaGuide, color: styleColors["Direktif + Analitis"] };
    if (combined === "Ekspresif + Harmonis") return { type: "combination", data: eksHarGuide, color: styleColors["Ekspresif + Harmonis"] };
    if (combined === "Direktif + Ekspresif") return { type: "combination", data: dirEksGuide, color: styleColors["Direktif + Ekspresif"] };
    if (combined === "Harmonis + Analitis") return { type: "combination", data: harAnaGuide, color: styleColors["Harmonis + Analitis"] };
    if (combined === "Direktif + Harmonis") return { type: "combination", data: dirHarGuide, color: styleColors["Direktif + Harmonis"] };
  }

  // Primary
  if (primary === "Direktif") return { type: "primary", data: directiveGuide, color: styleColors["Direktif"] };
  if (primary === "Ekspresif") return { type: "primary", data: expressiveGuide, color: styleColors["Ekspresif"] };
  if (primary === "Harmonis") return { type: "primary", data: harmoniousGuide, color: styleColors["Harmonis"] };
  if (primary === "Analitis") return { type: "primary", data: analyticalGuide, color: styleColors["Analitis"] };

  return null;
}

export default async function CoachingStrategyPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Fetch subordinate details
  const subordinate = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      assessments: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    }
  });

  if (!subordinate) {
    notFound();
  }

  const latestAssessment = subordinate.assessments[0];
  const hasAssessment = !!latestAssessment;
  const primaryStyle = parseStyleName(latestAssessment?.primaryStyle);
  const isCombination = latestAssessment?.isCombination;
  const secondaryStyle = parseStyleName(latestAssessment?.secondaryStyle);

  const displayStyle = (isCombination && latestAssessment?.secondaryStyle) 
    ? normalizeCombination(primaryStyle, parseStyleName(latestAssessment.secondaryStyle)) 
    : (primaryStyle || "Belum Asesmen");
  const colorDef = styleColors[displayStyle] || { main: "text-slate-600", bg: "bg-slate-100", border: "border-slate-200" };
  const badgeClass = `${colorDef.bg} ${colorDef.main} ${colorDef.border}`;

  let totalScore = 0;
  let directivePct = 0;
  let expressivePct = 0;
  let harmoniousPct = 0;
  let analyticalPct = 0;

  if (latestAssessment) {
    totalScore = latestAssessment.countA + latestAssessment.countB + latestAssessment.countC + latestAssessment.countD;
    if (totalScore > 0) {
      directivePct = Math.round((latestAssessment.countA / totalScore) * 100);
      expressivePct = Math.round((latestAssessment.countB / totalScore) * 100);
      harmoniousPct = Math.round((latestAssessment.countC / totalScore) * 100);
      analyticalPct = Math.round((latestAssessment.countD / totalScore) * 100);
    }
  }

  const stats = [
    { label: "Direktif", pct: directivePct, color: "bg-red-500" },
    { label: "Ekspresif", pct: expressivePct, color: "bg-amber-500" },
    { label: "Harmonis", pct: harmoniousPct, color: "bg-emerald-500" },
    { label: "Analitis", pct: analyticalPct, color: "bg-blue-500" },
  ].sort((a, b) => b.pct - a.pct);

  const guide = getGuideData(primaryStyle, secondaryStyle, isCombination);

  // Fetch current user role to determine log visibility
  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, position: true }
  });

  const viewMode = cookies().get('view-mode')?.value || 'admin';
  const asistenMode = cookies().get('asisten-mode')?.value || 'coach';
  
  const isViewModeUser = currentUser?.role === 'ADMIN' && viewMode === 'user';
  const isAsistenModeCoachee = currentUser?.position === 'Asisten Deputi' && asistenMode === 'coachee';
  
  if (currentUser) {
    if (isViewModeUser) {
      currentUser.role = 'USER';
      currentUser.position = 'Staf Pelaksana';
    } else if (isAsistenModeCoachee) {
      currentUser.position = 'Staf Pelaksana';
    }
  }

  // Security check: Only Manager/Admin can view team details
  const isManager = currentUser?.role === 'ADMIN' || currentUser?.position === 'Asisten Deputi' || currentUser?.position === 'Deputi Direksi Wilayah';
  if (!isManager) {
    redirect("/profile");
  }

  const isAdmin = currentUser?.role === 'ADMIN';
  const isDeputiOrAdmin = currentUser?.role === 'ADMIN' || currentUser?.position === 'Deputi Direksi Wilayah';

  const coachingLogs = await prisma.coachingLog.findMany({
    where: {
      coacheeId: params.id,
      // Deputi & Admin can see all logs; others only see their own
      ...(!isDeputiOrAdmin ? { coachId: session.user.id } : {})
    },
    include: {
      coach: { select: { name: true, npp: true, department: true, position: true } },
      actionItems: true
    },
    orderBy: [
      { isClosed: 'asc' },
      { date: 'desc' },
      { createdAt: 'desc' }
    ]
  });

  return (
    <div className={cn("w-full max-w-[1920px] mx-auto relative pt-2 -mt-10 pb-8 md:pb-12 px-4 sm:px-6 lg:px-8 xl:px-12")}>
      


      <div className="flex flex-col gap-2">
        
        {/* Top Section: Unified Profile & Assessment Panel */}
        <div className="w-full relative pt-4 pb-8 -mt-4">
          <Card className="overflow-hidden shadow-2xl border-slate-200/40 dark:border-slate-800/80 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl rounded-2xl relative">
            {/* Top glowing linear accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#015249] via-[#3b82f6] to-[#57BC90]"></div>
            
            <CardContent className="p-0 flex flex-col xl:flex-row">
              
              {/* Left Panel: Futuristic Identity Avatar Ring */}
              <div className="xl:w-1/4 p-6 sm:p-8 flex flex-col items-center xl:items-start justify-center border-b xl:border-b-0 xl:border-r border-slate-100 dark:border-slate-800/60 bg-gradient-to-b from-slate-50/50 to-white/0 dark:from-zinc-900/10 dark:to-transparent">
                <div className="flex flex-col items-center xl:items-start gap-4 text-center xl:text-left w-full">
                  {/* Glassmorphic Avatar & Communication Badge side-by-side */}
                  <div className="flex flex-row items-center gap-5 w-full">
                    {/* Glassmorphic Avatar with styled ring glow */}
                    <div className="relative group shrink-0">
                      <div className="absolute -inset-0.5 bg-gradient-to-tr from-[#015249] to-[#57BC90] rounded-2xl blur opacity-30 group-hover:opacity-70 transition duration-500"></div>
                      <div className="relative w-20 h-20 rounded-2xl bg-white dark:bg-zinc-900 p-1 border border-slate-200/50 dark:border-slate-800">
                        <div className="w-full h-full rounded-xl bg-gradient-to-tr from-[#015249] to-[#3b82f6] text-white flex items-center justify-center font-extrabold text-3xl shadow-inner">
                          {subordinate.name ? subordinate.name.charAt(0) : "U"}
                        </div>
                      </div>
                    </div>

                    {/* Communication Badge moved to the red box position */}
                    <div className="flex flex-col gap-1.5 items-start">
                      <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Gaya Komunikasi Utama</span>
                      <div className={`inline-flex items-center px-4 py-2.5 rounded-xl border text-xs font-black shadow-sm ${badgeClass}`}>
                        <MessageCircle className="w-3.5 h-3.5 mr-2 flex-shrink-0 animate-pulse" />
                        <span>{displayStyle}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight leading-none">
                      {subordinate.name || "Tanpa Nama"}
                    </h2>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">{subordinate.npp ? `NPP: ${subordinate.npp}` : "Pelaksana"}</p>
                  </div>

                  <div className="w-full pt-4 border-t border-slate-200/30 dark:border-slate-800/40 space-y-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Bidang Wilayah</span>
                      <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">{subordinate.department || "-"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Panel: Detailed Assessment */}
              {latestAssessment && (
                <div className="xl:w-3/4 p-6 sm:p-8 flex flex-col justify-between gap-6">
                  
                  {/* Text Columns with Glowing indicator cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-slate-50/40 dark:bg-zinc-900/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800/50 relative overflow-hidden group hover:border-[#3b82f6]/40 dark:hover:border-[#3b82f6]/40 transition-all duration-300">
                      <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                      <h3 className="font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-widest text-[9px] flex items-center gap-2 mb-2">
                        <Target className="w-3.5 h-3.5 text-blue-500 shrink-0" /> Fokus Utama
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 capitalize text-xs leading-relaxed font-semibold">
                        {getStyleDescription(displayStyle).replace('Fokus utama Anda adalah ', '')}
                      </p>
                    </div>
                    
                    <div className="bg-slate-50/40 dark:bg-zinc-900/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800/50 relative overflow-hidden group hover:border-purple-500/40 dark:hover:border-purple-500/40 transition-all duration-300">
                      <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
                      <h3 className="font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-widest text-[9px] flex items-center gap-2 mb-2">
                        <Sparkles className="w-3.5 h-3.5 text-purple-500 shrink-0" /> Ciri Khas
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed font-semibold">
                        {getStyleTrait(displayStyle)}
                      </p>
                    </div>
                    
                    <div className="bg-slate-50/40 dark:bg-zinc-900/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800/50 relative overflow-hidden group hover:border-amber-500/40 dark:hover:border-amber-500/40 transition-all duration-300">
                      <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                      <h3 className="font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-widest text-[9px] flex items-center gap-2 mb-2">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" /> Saran Pendekatan
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed font-semibold">
                        {getStyleAdvice(displayStyle) || "Gunakan pendekatan fleksibel."}
                      </p>
                    </div>
                  </div>

                  {/* Horizontal Segmented Progress Bar */}
                  <div className="pt-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                       <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Peta Komposisi Kepribadian</span>
                       <div className="flex flex-wrap gap-3 sm:gap-4 text-[9px] font-extrabold text-slate-600 dark:text-slate-400">
                          {stats.map(s => (
                            <span key={s.label} className="flex items-center gap-1.5 bg-slate-50 dark:bg-zinc-900 px-2 py-1 rounded-md border border-slate-100 dark:border-slate-800/50"><span className={`w-2 h-2 rounded-full ${s.color}`}></span> {s.label} {s.pct}%</span>
                          ))}
                       </div>
                    </div>
                    <div className="w-full flex h-3.5 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800/80 p-0.5 border border-slate-200/50 dark:border-slate-700/30">
                      {stats.map((s, index) => (
                        <div 
                          key={s.label} 
                          className={`${s.color} transition-all duration-1000 first:rounded-l-lg last:rounded-r-lg relative group`} 
                          style={{ width: `${s.pct}%` }} 
                          title={`${s.label}: ${s.pct}%`}
                        >
                          {s.pct > 12 && (
                            <span className="absolute inset-0 flex items-center justify-center text-[7.5px] font-black text-white leading-none tracking-tighter opacity-80 group-hover:opacity-100 transition-opacity">
                              {s.pct}%
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Bottom Section: Tactics & Tracker */}
        <CoachingSectionLayout
          hasByteSizedCard={!!guide}
          coachingTracker={
            <div className="lg:sticky lg:top-[175px] z-30 h-fit">
              <div>
                <CoachingTracker 
                  logs={coachingLogs.filter(log => !log.title.startsWith('Diskusi: ')).sort((a, b) => {
                    if (a.isClosed === b.isClosed) {
                      if (new Date(a.date).getTime() !== new Date(b.date).getTime()) {
                        return new Date(b.date).getTime() - new Date(a.date).getTime();
                      }
                      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                    }
                    return a.isClosed ? 1 : -1;
                  })} 
                  discussionLogs={coachingLogs.filter(log => log.title.startsWith('Diskusi: '))}
                  coacheeId={params.id} 
                  coacheeName={subordinate.name}
                  coacheeStyle={displayStyle}
                  isReadOnly={isAdmin} 
                  isDeputi={currentUser?.position === 'Deputi Direksi Wilayah'}
                  hasAssessment={hasAssessment}
                />
              </div>
            </div>
          }
          tacticalGuide={
            <div className="h-fit">
              {guide ? (
                <Card className="w-full flex flex-col border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-md">
                  <CardHeader className="pt-10 pb-4 shrink-0 bg-slate-50/50 dark:bg-slate-900/20 border-b border-slate-100 dark:border-slate-800/60">
                    <CardTitle className={`text-xl font-extrabold tracking-wide ${guide.color.guideClass}`}>
                      {guide.data.title}
                    </CardTitle>
                    <CardDescription className="text-sm mt-2 leading-relaxed text-justify font-medium text-slate-600 dark:text-slate-300">
                      {guide.data.subtitle}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                    {guide.type === "primary" ? (
                      <GuideRowCards 
                        rows={(guide.data.rows as any[])}
                        colorClass={guide.color.guideClass}
                        bgClass={guide.color.bg}
                        borderClass={guide.color.border}
                        lightBgClass={guide.color.lightBg}
                      />
                    ) : (
                      <div className="mt-4">
                        <CombinationGuideCard
                          data={guide.data}
                          colorClass={guide.color.guideClass}
                          bgClass={guide.color.bg}
                          borderClass={guide.color.border}
                          lightBgClass={guide.color.lightBg}
                          coacheeId={params.id}
                          isReadOnly={isAdmin}
                          logs={coachingLogs}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                 <Card className="shadow-md border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-950 opacity-70">
                  <CardHeader className="pt-14 pb-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full z-10 flex-shrink-0">
                        <Clock className="w-5 h-5 text-slate-500" />
                      </div>
                      <div className="relative z-20 w-full">
                        <CardTitle className="text-xl text-muted-foreground m-0 relative">
                          Menunggu Hasil Asesmen
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Panduan taktis coaching belum tersedia karena bawahan Anda belum mengisi asesmen. Mintalah mereka untuk menyelesaikan asesmen terlebih dahulu untuk membuka fitur ini.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          }
        />
      </div>
    </div>
  );
}
