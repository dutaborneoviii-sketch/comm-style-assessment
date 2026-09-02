import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getStyleColor, getStyleDescription, getStyleTrait, getStyleAdvice, resolveStyleKey } from "@/lib/scoring";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft, Target, Sparkles, Search, Lightbulb } from "lucide-react";
import { RadarChartClient } from "@/components/radar-chart-client";

export default async function ResultPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return redirect("/");

  const assessment = await prisma.assessment.findUnique({
    where: { id: params.id, userId: session.user.id }
  });

  if (!assessment) return redirect("/profile");

  const primaryColor = getStyleColor(assessment.primaryStyle);
  const secondaryColor = assessment.secondaryStyle ? getStyleColor(assessment.secondaryStyle) : "";
  
  const totalAnswers = assessment.countA + assessment.countB + assessment.countC + assessment.countD;
  const pct = (count: number) => Math.round((count / totalAnswers) * 100) || 0;

  const radarData = [
    { subject: 'Direktif', A: pct(assessment.countA), fullMark: 100 },
    { subject: 'Ekspresif', A: pct(assessment.countB), fullMark: 100 },
    { subject: 'Harmonis', A: pct(assessment.countC), fullMark: 100 },
    { subject: 'Analitis', A: pct(assessment.countD), fullMark: 100 },
  ];

  const formatStyleTitle = (style: string) => {
    const parts = style.split(' (');
    if (parts.length > 1) {
      return (
        <div className="flex flex-col justify-center gap-0 text-left">
          <span className="text-xl md:text-2xl font-black text-slate-900 leading-tight">{parts[0]}</span>
          <span className="text-sm md:text-base font-semibold text-slate-800/80 leading-tight">({parts[1]}</span>
        </div>
      );
    }
    return <span className="text-xl md:text-2xl font-black text-slate-900">{style}</span>;
  };

  const getStyleIcon = (style: string) => {
    if (style.includes('Direktif')) return '🎯';
    if (style.includes('Ekspresif')) return '🎨';
    if (style.includes('Harmonis')) return '🤝';
    if (style.includes('Analitis')) return '🔍';
    return '✨';
  };

  return (
    <div className="w-full pb-8 space-y-4">
      <div className="sticky top-16 z-40 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl py-3 px-4 border-b border-slate-200 dark:border-slate-800 shadow-sm mb-4 -mt-2">
        <Link href="/profile" className="inline-flex items-center text-xs font-medium hover:underline text-slate-600 hover:text-white transition-colors">
          <ChevronLeft className="h-3.5 w-3.5 mr-1" />
          Kembali ke Dasbor
        </Link>
      </div>

      <div className="max-w-6xl mx-auto space-y-4 px-4">
        
        {/* TOP CARDS */}
        <div className={`grid grid-cols-1 ${assessment.isCombination && assessment.secondaryStyle ? 'md:grid-cols-2' : ''} gap-4`}>
           {/* Primary Style Box */}
           <div className={`rounded-3xl p-4 flex items-center gap-4 ${primaryColor} shadow-md`}>
             <div className="w-20 h-20 shrink-0 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-4xl shadow-inner border border-white/30">
               {getStyleIcon(assessment.primaryStyle)}
             </div>
             {formatStyleTitle(assessment.primaryStyle)}
           </div>

           {/* Secondary Style Box (if combination) */}
           {assessment.isCombination && assessment.secondaryStyle && (
             <div className={`rounded-3xl p-4 flex items-center gap-4 ${secondaryColor} shadow-md`}>
               <div className="w-20 h-20 shrink-0 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-4xl shadow-inner border border-white/30">
                 {getStyleIcon(assessment.secondaryStyle)}
               </div>
               {formatStyleTitle(assessment.secondaryStyle)}
             </div>
           )}
        </div>

        {/* MIDDLE SECTION (FOKUS & GAYA PENDUKUNG) */}
        <Card className="rounded-3xl border border-slate-200 shadow-sm bg-white dark:bg-zinc-950 p-6 md:p-8">
           <div className="space-y-6">
             <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
                    <Target className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Fokus Utama</h3>
                </div>
                <p className="text-lg md:text-xl font-bold text-slate-900 dark:text-white pl-8 leading-snug text-justify">
                  {getStyleDescription(assessment.primaryStyle).replace('Fokus utama Anda adalah ', '')}
                </p>
             </div>

             {assessment.isCombination && assessment.secondaryStyle && (
               <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Gaya Pendukung</h3>
                  </div>
                  <p className="text-base md:text-lg font-semibold text-slate-700 dark:text-slate-300 pl-8 leading-snug text-justify">
                    {getStyleDescription(assessment.secondaryStyle).replace('Fokus utama Anda adalah ', '')}
                  </p>
               </div>
             )}
           </div>
        </Card>

        {/* BOTTOM SECTION (2 COLUMNS) */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-4">
          
          {/* Left Column: Rincian & Radar Chart */}
          <Card className="rounded-3xl border border-slate-200 shadow-sm bg-white dark:bg-zinc-950 p-6">
            <div className="flex flex-col md:flex-row gap-6 h-full">
               <div className="w-full md:w-48 shrink-0 flex flex-col justify-start border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 pb-6 md:pb-0 md:pr-6">
                 <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white mb-6">
                   Rincian<br/>Gaya<br/>Komunikasi
                 </h3>
                 <div className="space-y-4">
                   <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                     <span className="text-red-500 text-lg">✨</span> Direktif
                   </div>
                   <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                     <span className="text-amber-500 text-lg">🎨</span> Ekspresif
                   </div>
                   <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                     <span className="text-emerald-500 text-lg">✨</span> Harmonis
                   </div>
                   <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                     <span className="text-indigo-500 text-lg">🎯</span> Analitis
                   </div>
                 </div>
               </div>
               
               <div className="flex-1 min-h-[300px] md:min-h-[350px] w-full flex items-center justify-center">
                 {/* Recharts RadarChart requires client component, we will need to wrap it if this is a server component. Wait, ResultPage is a server component! */}
                 <RadarChartClient data={radarData} />
               </div>
            </div>
          </Card>

          {/* Right Column: Analisis & Saran */}
          <div className="flex flex-col gap-4">
             <Card className="rounded-3xl border border-slate-200 shadow-sm bg-white dark:bg-zinc-950 p-6 flex-1">
               <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white mb-4">Analisis & Saran</h3>
               <div className="space-y-3">
                 <div className="flex items-center gap-2">
                   <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                     <Search className="w-4 h-4" />
                   </div>
                   <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide">Ciri Khas</h4>
                 </div>
                 <p className="text-sm font-medium text-slate-800 dark:text-slate-200 pl-10 text-justify">
                   {getStyleTrait(assessment.primaryStyle)}
                 </p>
               </div>
             </Card>

             <Card className="rounded-3xl border border-slate-200 shadow-sm bg-white dark:bg-zinc-950 p-6 flex-1">
               <div className="space-y-3">
                 <div className="flex items-center gap-2">
                   <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600">
                     <Lightbulb className="w-4 h-4" />
                   </div>
                   <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide">Saran Komunikasi</h4>
                 </div>
                 <p className="text-sm font-medium text-slate-800 dark:text-slate-200 pl-10 text-justify">
                   {getStyleAdvice(assessment.primaryStyle)}
                 </p>
               </div>
             </Card>
          </div>

        </div>
      </div>
    </div>
  );
}
