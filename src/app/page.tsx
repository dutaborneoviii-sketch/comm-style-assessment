import { AuthForm } from "@/components/auth-form";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const session = await auth();
  if (session?.user) {
    redirect("/profile");
  }

  const departments = await prisma.department.findMany({
    where: { name: { not: 'GLOBAL' } },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-50 dark:bg-slate-950">
      
      {/* Left Column: Branding with Gradient Background */}
      <div className="w-full lg:w-[55%] xl:w-3/5 bg-gradient-to-br from-[#015249] via-[#57BC90] to-[#77C9D4] text-white px-6 py-12 lg:p-16 xl:p-24 flex flex-col justify-center relative shadow-2xl lg:shadow-[20px_0_50px_rgba(0,0,0,0.1)] z-10 lg:rounded-br-[80px]">
        
        <div className="w-full max-w-2xl mx-auto lg:mx-0 space-y-6">
          <div className="flex flex-col items-center lg:items-start w-full text-center lg:text-left">

            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tighter leading-[1.1] mb-6 drop-shadow-md">
              Membangun SDM<br className="hidden sm:block" /> Unggul
            </h1>
            <p className="text-blue-50 text-lg sm:text-xl lg:text-2xl font-medium leading-relaxed max-w-none mx-auto lg:mx-0 drop-shadow-sm whitespace-nowrap">
              Melalui Coaching yang Terarah, Terukur, dan Berkelanjutan.
            </p>
            
            <div className="mt-8 bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl rounded-2xl p-5 lg:p-6 inline-block transform hover:-translate-y-1 transition-all duration-300">
              <p className="italic font-bold text-white text-xl lg:text-2xl tracking-tight drop-shadow-sm">
                "Membimbing Hari Ini, Meningkatkan Kinerja Esok Hari."
              </p>
            </div>
          </div>
 
          <div className="hidden lg:grid grid-cols-1 gap-4 pt-10">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all shadow-sm max-w-md">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center border border-white/10">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Coaching Guidance & Strategy</h3>
                <p className="text-sm text-white/80 mt-0.5">Panduan taktik interaksi & strategi coaching personal.</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all shadow-sm max-w-md">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center border border-white/10">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Monitoring Sesi & Rencana Aksi</h3>
                <p className="text-sm text-white/80 mt-0.5">Log pencatatan berkala dan pelacakan komitmen.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
 
      <div className="w-full lg:w-[45%] xl:w-2/5 flex flex-col items-center justify-center p-6 py-16 lg:p-12 relative bg-slate-50 dark:bg-slate-950 z-0 overflow-hidden">
        {/* Realistic Water Texture Overlay */}
        <div 
          className="absolute inset-0 pointer-events-none z-0 opacity-70 mix-blend-multiply dark:mix-blend-screen dark:opacity-30" 
          style={{ 
            backgroundImage: `url("/water-texture.jpg")`, 
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-slate-50 dark:from-slate-950/40 dark:to-slate-950 z-0 pointer-events-none"></div>
        <div className="mt-16 -mb-12 flex justify-center w-full z-10 relative">
          <Image 
            src="/logo-belian.png" 
            alt="Logo Belian" 
            width={350} 
            height={110}
            className="w-full max-w-[280px] lg:max-w-[340px] h-auto object-contain"
            priority
          />
        </div>
        <div className="w-full max-w-md">
          <AuthForm departments={departments} />
        </div>
      </div>
    </div>
  );
}
