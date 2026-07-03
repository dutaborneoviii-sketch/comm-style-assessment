import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { redirect } from "next/navigation";
import { User, Activity, Sparkles } from "lucide-react";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) return redirect("/");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      assessments: {
        orderBy: { createdAt: "desc" },
        take: 1
      }
    }
  });

  if (!user) return redirect("/");

  const latestAssessment = user.assessments[0];

  const getStyleHex = (styleName: string) => {
    if (!styleName) return "#6366f1";
    if (styleName.includes("Directive")) return "#ef4444";
    if (styleName.includes("Expressive")) return "#f59e0b";
    if (styleName.includes("Harmonious")) return "#10b981";
    if (styleName.includes("Analytical")) return "#3b82f6";
    return "#6366f1";
  };

  const primaryHex = latestAssessment ? getStyleHex(latestAssessment.primaryStyle) : "#6366f1";
  const secondaryHex = (latestAssessment && latestAssessment.secondaryStyle) ? getStyleHex(latestAssessment.secondaryStyle) : primaryHex;

  return (
    <div className="container mx-auto py-8 md:py-12 px-4 md:px-6 max-w-6xl relative space-y-2">
      {/* Decorative Blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#1eb88a]/10 rounded-full blur-3xl -z-10 mix-blend-multiply" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#0a3161]/10 rounded-full blur-3xl -z-10 mix-blend-multiply" />
      
      {/* Header Section */}
      <div className="w-full relative z-10 mt-4 mb-2">
        <Card className="flex flex-col items-center justify-center py-8 md:py-10 shadow-[0_8px_30px_rgb(30,184,138,0.12)] border border-slate-100 dark:border-slate-800 bg-white dark:bg-zinc-950 overflow-hidden w-full rounded-2xl relative">
          {/* Subtle Tech Dot Pattern */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.04] dark:opacity-[0.1]" style={{ backgroundImage: 'radial-gradient(#0a3161 2px, transparent 2px)', backgroundSize: '24px 24px' }}></div>
          <div className="flex items-center text-7xl md:text-9xl font-black tracking-widest mb-4 md:mb-6">
            <span className="text-[#0a3161] dark:text-blue-400">C</span>
            <span className="text-[#1eb88a]">O</span>
            <span className="text-[#0a3161] dark:text-blue-400">G</span>
            <span className="text-[#1eb88a]">N</span>
            <span className="text-[#0a3161] dark:text-blue-400">I</span>
            <span className="text-[#0a3161] dark:text-blue-400">T</span>
          </div>
          <div className="flex items-center gap-2 md:gap-4 text-[9px] sm:text-[10px] md:text-xs font-bold tracking-[0.15em] md:tracking-[0.25em] text-[#0a3161] dark:text-slate-300">
            <span className="w-6 md:w-8 h-[2px] bg-[#1eb88a]"></span>
            COACHING GUIDANCE, MONITORING & INSIGHT TRACKER
            <span className="w-6 md:w-8 h-[2px] bg-[#1eb88a]"></span>
          </div>
        </Card>
        
        <div 
          className="w-full mx-auto overflow-hidden whitespace-nowrap relative text-center my-4"
          style={{ maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)' }}
        >
          <style>{`
            @keyframes marquee {
              0% { transform: translateX(100%); }
              100% { transform: translateX(-100%); }
            }
            .animate-marquee {
              display: inline-block;
              animation: marquee 22s linear infinite;
            }
          `}</style>
          <p className="text-white text-lg md:text-xl font-medium animate-marquee">
            Selamat datang kembali! Kelola profil Anda dan tinjau riwayat asesmen gaya komunikasi Anda di sini.
          </p>
        </div>
      </div>
      
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {/* Profile Card */}
        <Card className="glass-card overflow-hidden border-[#1eb88a]/20 dark:border-[#1eb88a]/10 shadow-lg hover:shadow-xl transition-all bg-white/60 dark:bg-zinc-950/60">
          <div className="h-2 w-full bg-gradient-to-r from-[#0a3161] to-[#1eb88a]"></div>
          <CardHeader className="pb-4 pt-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#1eb88a]/10 dark:bg-[#1eb88a]/20 flex items-center justify-center text-[#1eb88a] shadow-inner">
                <User className="w-7 h-7" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold">{user.name}</CardTitle>
                <CardDescription className="font-medium text-[#16966f] dark:text-[#1eb88a] mt-1">
                  Divisi: {user.department}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
             <div className="space-y-3 p-4 bg-muted/30 rounded-xl border border-border/50">
               <div className="flex flex-col">
                 <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Alamat Email</span>
                 <span className="text-sm font-medium">{user.email}</span>
               </div>
             </div>
          </CardContent>
        </Card>

        {/* Assessment Action Card */}
        <Card className="md:col-span-1 lg:col-span-2 flex flex-col justify-center glass-card border-[#1eb88a]/30 dark:border-[#1eb88a]/20 shadow-lg hover:shadow-xl transition-all relative overflow-hidden bg-white/60 dark:bg-zinc-950/60">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#1eb88a]/10 rounded-full blur-3xl mix-blend-multiply pointer-events-none"></div>
          <CardHeader className="pt-6 sm:pt-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1eb88a]/10 dark:bg-[#1eb88a]/20 text-[#16966f] dark:text-[#1eb88a] font-bold text-xs tracking-wide uppercase w-fit mb-3">
              <Activity className="w-3.5 h-3.5" />
              Tindakan
            </div>
            <CardTitle className="text-2xl md:text-3xl font-black text-foreground">
              {latestAssessment ? "Perbarui Asesmen Anda" : "Mulai Asesmen Gaya Komunikasi"}
            </CardTitle>
            <CardDescription className="text-base md:text-lg mt-3 text-muted-foreground max-w-xl leading-relaxed">
              {latestAssessment 
                ? "Gaya komunikasi bisa berkembang. Ikuti ulang asesmen jika Anda merasa ada perubahan dalam cara Anda berinteraksi di tempat kerja." 
                : "Temukan gaya komunikasi Anda di tempat kerja untuk meningkatkan kolaborasi dan mengurangi potensi konflik."}
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-6 sm:pb-8">
            <Link href="/questionnaire">
              <Button size="lg" className="w-full sm:w-auto shadow-xl shadow-[#16966f]/20 bg-[#16966f] hover:bg-[#117657] text-white transition-all hover:scale-105 px-8 font-bold text-base h-12 rounded-xl">
                {latestAssessment ? "Ulangi Asesmen" : "Mulai Asesmen Sekarang"}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {latestAssessment && (
        <div className="mt-16 pt-8 space-y-6">
          <div className="flex items-center gap-4 w-full mb-8">
            <h2 className="text-2xl font-bold flex items-center gap-3 text-foreground">
              <Activity className="h-6 w-6 text-[#1eb88a]" /> Hasil Terakhir
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent"></div>
          </div>
          <Card className="glass-card shadow-xl hover:shadow-2xl transition-all relative overflow-hidden bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl border" style={{ borderColor: primaryHex + '30' }}>
            {/* Extended Gradient Bar */}
            <div className="absolute left-0 top-0 bottom-0 w-5 md:w-6" style={{ background: `linear-gradient(to bottom, ${primaryHex}, ${secondaryHex})` }}></div>
            
            {/* Expansive Atmospheric Glows */}
            <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full blur-[80px] opacity-15 pointer-events-none" style={{ backgroundColor: primaryHex }}></div>
            <div className="absolute -bottom-20 left-20 w-80 h-80 rounded-full blur-[80px] opacity-15 pointer-events-none" style={{ backgroundColor: secondaryHex }}></div>
            
            <CardContent className="p-6 md:p-8 pl-10 md:pl-14 relative z-10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted/80 text-muted-foreground font-bold text-xs tracking-wide uppercase border border-border/50">
                    Diselesaikan pada {new Date(latestAssessment.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-foreground">
                    {latestAssessment.primaryStyle}
                    {latestAssessment.isCombination && (
                      <span className="text-muted-foreground/60 font-semibold text-xl md:text-2xl ml-2"> 
                        + {latestAssessment.secondaryStyle}
                      </span>
                    )}
                  </h3>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto mt-4 md:mt-0">
                  <Link href={`/questionnaire/result/${latestAssessment.id}`} className="w-full sm:w-auto">
                    <Button variant="default" className="w-full shadow-md bg-[#16966f] hover:bg-[#117657] text-white font-semibold rounded-xl h-11 px-6 transition-all hover:scale-105">
                      Lihat Detail
                    </Button>
                  </Link>
                  <Link href="/history" className="w-full sm:w-auto">
                    <Button variant="outline" className="w-full bg-white/50 dark:bg-black/50 font-semibold rounded-xl h-11 px-6 hover:bg-muted">
                      Lihat Riwayat
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
