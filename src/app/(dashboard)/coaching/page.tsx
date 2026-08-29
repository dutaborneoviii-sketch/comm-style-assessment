import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { History, Calendar, MessageCircle, FileText, ArrowLeft } from "lucide-react";
import { EditResponseDialog } from "@/components/coaching/edit-response-dialog";
import { CoachingMasterTable } from "@/components/coaching/coaching-master-table";
import { cookies } from "next/headers";

export const metadata = {
  title: "Rekapitulasi Coaching - Belian",
};

export const dynamic = "force-dynamic";

export default async function CoachingMasterPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Authorize user
  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, position: true, department: true }
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

  const isAuthorized = currentUser?.role === 'ADMIN' || currentUser?.position === 'Deputi Direksi Wilayah' || currentUser?.position === 'Asisten Deputi' || currentUser?.position === 'Kepala Kabupaten';
  if (!isAuthorized) {
    redirect("/profile");
  }
  
  const isDeputi = currentUser?.position === 'Deputi Direksi Wilayah';

  const whereClause = (currentUser?.role === 'ADMIN' || currentUser?.position === 'Deputi Direksi Wilayah')
    ? {}
    : (currentUser?.position === 'Kepala Kabupaten' 
        ? { coachee: { employeeLocation: currentUser?.employeeLocation, position: 'Staf Pelaksana' } } 
        : { coachee: { department: currentUser?.department } });

  // Fetch coaching logs
  const logs = await prisma.coachingLog.findMany({
    where: whereClause,
    include: {
      coach: { select: { name: true, npp: true, department: true } },
      coachee: { 
        select: { 
          name: true, 
          npp: true, 
          department: true,
          assessments: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: { primaryStyle: true, secondaryStyle: true, isCombination: true }
          }
        } 
      },
      actionItems: true
    },
    orderBy: { date: 'desc' }
  });

  return (
      <div className="w-full max-w-[1920px] mx-auto pt-4 pb-8 md:pt-6 md:pb-12 px-4 md:px-6 lg:px-8 xl:px-12 relative">
        {/* Decorative Blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#57BC90]/10 rounded-full blur-3xl -z-10 mix-blend-multiply" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#015249]/10 rounded-full blur-3xl -z-10 mix-blend-multiply" />
      
      <div className="w-full relative z-10 mb-6">
        <Card className="flex flex-col md:flex-row items-center p-6 md:p-8 shadow-[0_8px_30px_rgb(30,184,138,0.12)] border border-slate-100 dark:border-slate-800 bg-white dark:bg-zinc-950 overflow-hidden w-full rounded-2xl relative gap-6">
          <div className="absolute inset-0 pointer-events-none opacity-[0.04] dark:opacity-[0.1]" style={{ backgroundImage: 'radial-gradient(#015249 2px, transparent 2px)', backgroundSize: '24px 24px' }}></div>
          
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-[#57BC90] to-[#015249] flex items-center justify-center text-white shadow-xl shadow-[#57BC90]/20 flex-shrink-0 relative z-10">
            <History className="w-8 h-8 md:w-10 md:h-10" />
          </div>
          
          <div className="flex-1 text-center md:text-left relative z-10">
            <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
              Rekapitulasi Coaching
            </h1>
            <p className="mt-2 text-muted-foreground text-sm md:text-base font-medium max-w-2xl">
              Memantau dan mengawasi seluruh aktivitas sesi diskusi, feedback, dan coaching antar anggota bidang secara terpusat.
            </p>
          </div>
        </Card>
      </div>

      <Card className="shadow-lg border-slate-200/60 dark:border-slate-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md rounded-2xl overflow-hidden relative z-10">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 pb-4">
          <CardTitle className="text-xl font-bold flex items-center gap-2 text-[#015249] dark:text-blue-400">
            <FileText className="w-5 h-5 text-[#57BC90]" />
            Daftar Seluruh Sesi
          </CardTitle>
          <CardDescription>
            Menampilkan {logs.length} catatan sesi coaching terbaru.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <CoachingMasterTable logs={logs} isDeputi={isDeputi} />
        </CardContent>
      </Card>
    </div>
  );
}
