import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { STYLE_COLORS, STYLE_DESCRIPTIONS, STYLE_TRAITS, STYLE_ADVICE } from "@/lib/scoring";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft, Target, Sparkles } from "lucide-react";

export default async function ResultPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return redirect("/");

  const assessment = await prisma.assessment.findUnique({
    where: { id: params.id, userId: session.user.id }
  });

  if (!assessment) return redirect("/profile");

  const primaryColor = STYLE_COLORS[assessment.primaryStyle] || "bg-gray-500 text-white";
  const secondaryColor = assessment.secondaryStyle ? (STYLE_COLORS[assessment.secondaryStyle] || "bg-gray-500 text-white") : "";
  
  const totalAnswers = assessment.countA + assessment.countB + assessment.countC + assessment.countD;
  const pct = (count: number) => Math.round((count / totalAnswers) * 100) || 0;

  const formatStyleTitle = (style: string) => {
    const parts = style.split(' (');
    if (parts.length > 1) {
      return (
        <span className="flex flex-col items-center justify-center gap-1">
          <span>{parts[0]}</span>
          <span className="text-xl md:text-2xl lg:text-3xl font-bold opacity-90">({parts[1]}</span>
        </span>
      );
    }
    return style;
  };

  return (
    <div className="container mx-auto pt-6 pb-12 px-4 md:px-6 max-w-7xl space-y-4">
      <Link href="/profile" className="inline-flex items-center text-sm font-medium hover:underline text-white">
        <ChevronLeft className="h-4 w-4 mr-1" />
        Kembali ke Dasbor
      </Link>

      <Card className="overflow-hidden shadow-2xl glass-card border-0">
        <div className="min-h-[12rem] flex flex-col md:flex-row w-full">
           <div className={`flex-1 ${primaryColor} flex items-center justify-center p-8 text-center`}>
             <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white drop-shadow-lg tracking-tight leading-tight">
                {formatStyleTitle(assessment.primaryStyle)}
             </h2>
           </div>
           {assessment.isCombination && assessment.secondaryStyle && (
             <div className={`flex-1 ${secondaryColor} flex items-center justify-center p-8 text-center`}>
               <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white drop-shadow-lg tracking-tight leading-tight">
                  {formatStyleTitle(assessment.secondaryStyle)}
               </h2>
             </div>
           )}
        </div>
        <div className="flex flex-col items-center justify-center gap-5 pt-8 pb-2 px-6 sm:px-10 max-w-4xl mx-auto text-center w-full">
          <div className="space-y-2 flex flex-col items-center w-full">
            <div className="flex items-center gap-4 w-full max-w-2xl mx-auto mb-1">
              <div className="h-px flex-1 bg-primary/20 dark:bg-primary/10"></div>
              <span className="text-xs font-black text-primary/60 dark:text-primary/50 uppercase tracking-[0.2em] flex items-center gap-2">
                <Target className="w-3.5 h-3.5" /> FOKUS UTAMA
              </span>
              <div className="h-px flex-1 bg-primary/20 dark:bg-primary/10"></div>
            </div>
            <p className="text-xl md:text-2xl font-medium text-foreground leading-relaxed">
              {STYLE_DESCRIPTIONS[assessment.primaryStyle].replace('Fokus utama Anda adalah ', '').replace(/^\\w/, c => c.toUpperCase())}
            </p>
          </div>
          
          {assessment.isCombination && assessment.secondaryStyle && (
             <div className="space-y-2 flex flex-col items-center w-full">
               <div className="flex items-center gap-4 w-full max-w-2xl mx-auto mb-1">
                 <div className="h-px flex-1 bg-muted-foreground/20"></div>
                 <span className="text-xs font-black text-muted-foreground/60 uppercase tracking-[0.2em] flex items-center gap-2">
                   <Sparkles className="w-3.5 h-3.5" /> GAYA PENDUKUNG
                 </span>
                 <div className="h-px flex-1 bg-muted-foreground/20"></div>
               </div>
               <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                 {STYLE_DESCRIPTIONS[assessment.secondaryStyle].replace('Fokus utama Anda adalah ', '').replace(/^\\w/, c => c.toUpperCase())}
               </p>
             </div>
          )}
        </div>
        <CardContent className="space-y-8 p-6 sm:p-10">
          
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-muted/30 rounded-2xl p-6 sm:p-10 border shadow-sm h-full">
              <h3 className="text-xl font-bold mb-6">Rincian Gaya Komunikasi</h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Direktif</span>
                    <span className="font-bold">{pct(assessment.countA)}%</span>
                  </div>
                  <div className="w-full bg-muted h-4 rounded-full overflow-hidden shadow-inner border border-white/5">
                    <div className="bg-red-500 h-full transition-all duration-1000 shadow-sm" style={{ width: `${pct(assessment.countA)}%` }} />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Ekspresif</span>
                    <span className="font-bold">{pct(assessment.countB)}%</span>
                  </div>
                  <div className="w-full bg-muted h-4 rounded-full overflow-hidden shadow-inner border border-white/5">
                    <div className="bg-amber-500 h-full transition-all duration-1000 shadow-sm" style={{ width: `${pct(assessment.countB)}%` }} />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Harmonis</span>
                    <span className="font-bold">{pct(assessment.countC)}%</span>
                  </div>
                  <div className="w-full bg-muted h-4 rounded-full overflow-hidden shadow-inner border border-white/5">
                    <div className="bg-emerald-500 h-full transition-all duration-1000 shadow-sm" style={{ width: `${pct(assessment.countC)}%` }} />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Analitis</span>
                    <span className="font-bold">{pct(assessment.countD)}%</span>
                  </div>
                  <div className="w-full bg-muted h-4 rounded-full overflow-hidden shadow-inner border border-white/5">
                    <div className="bg-indigo-500 h-full transition-all duration-1000 shadow-sm" style={{ width: `${pct(assessment.countD)}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/40 dark:bg-black/20 rounded-2xl p-6 sm:p-10 border shadow-sm flex flex-col h-full">
              <h3 className="text-xl font-bold border-b border-border/50 pb-4 mb-6">Analisis Tipe & Saran Berkomunikasi</h3>
              <div className="space-y-6 flex-1 flex flex-col">
                <div className="space-y-3">
                   <h4 className="font-semibold text-lg flex items-center gap-2">
                      <span className="text-primary text-xl">✨</span> Ciri Khas
                   </h4>
                   <p className="text-muted-foreground leading-relaxed">
                     {STYLE_TRAITS[assessment.primaryStyle]}
                   </p>
                </div>
                
                <div className="space-y-3 mt-auto pt-4">
                   <h4 className="font-semibold text-lg flex items-center gap-2">
                      <span className="text-primary text-xl">💡</span> Saran Komunikasi
                   </h4>
                   <div className="bg-primary/5 p-4 sm:p-5 rounded-xl border border-primary/10 shadow-sm">
                     <p className="text-foreground leading-relaxed font-medium">
                       {STYLE_ADVICE[assessment.primaryStyle]}
                     </p>
                   </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center mt-8 gap-4 px-4 sm:px-0">
            <Link href="/history" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full">Lihat Riwayat</Button>
            </Link>
            <Link href="/profile" className="w-full sm:w-auto">
              <Button size="lg" className="w-full shadow-lg shadow-primary/25">Kembali ke Beranda</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
