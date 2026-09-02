import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getUserAccess } from "@/lib/access";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CalendarDays, Clock, MessageSquare, Paperclip, CheckCircle2, Circle } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { EvidenceDialog } from "@/components/coaching/evidence-dialog";

import { ActionItemFollowUp } from "@/components/coaching/action-item-followup";

export const dynamic = "force-dynamic";

export default async function CoachingDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/");
  }

  const logId = params.id;

  const coachingLog = await prisma.coachingLog.findUnique({
    where: { id: logId },
    include: {
      coach: { select: { name: true, positionDetail: true, department: true } },
      coachee: { select: { name: true, positionDetail: true } },
      actionItems: { orderBy: { createdAt: 'asc' } }
    }
  });

  if (!coachingLog) {
    return (
      <div className="container mx-auto py-10 px-4 max-w-4xl text-center">
        <h1 className="text-2xl font-bold mb-4">Sesi Coaching Tidak Ditemukan</h1>
        <Link href="/profile">
          <Button variant="outline">Kembali ke Dashboard</Button>
        </Link>
      </div>
    );
  }

  // Get current user details to check if they have access
  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, positionDetail: true, department: true, employeeLocation: true, workUnit: true, pangkat: true }
  });

  const access = getUserAccess(currentUser as any);
  const isOwner = session.user.id === coachingLog.coacheeId || session.user.id === coachingLog.coachId;
  const isAuthorized = isOwner || access.isAdmin || (access.isCoach && currentUser?.pangkat === 'Deputi Direksi Wilayah');
  
  if (!isAuthorized) {
    redirect("/profile");
  }

  const isCoachee = session.user.id === coachingLog.coacheeId;

  return (
    <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8 space-y-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/profile">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-200">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Detail Sesi Coaching</h1>
          <p className="text-slate-500 mt-1">Melihat rincian dan action items sesi coaching.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
        {/* Main Content Left */}
        <div className="lg:col-span-2 xl:col-span-3 space-y-6">
          <Card className="shadow-sm border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
              <h2 className="font-bold text-lg text-slate-800">{coachingLog.title}</h2>
              <div className="flex items-center gap-2 text-sm text-slate-500 mt-2">
                <CalendarDays className="h-4 w-4" />
                {format(coachingLog.date, "EEEE, d MMMM yyyy", { locale: idLocale })}
              </div>
            </div>
            <CardContent className="p-6">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Catatan Sesi</h3>
              <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap">
                {coachingLog.notes}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-emerald-500/20">
            <CardHeader className="bg-emerald-50/50 pb-4 border-b border-emerald-100">
              <CardTitle className="text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                Action Items
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {coachingLog.actionItems.length === 0 ? (
                <p className="text-slate-500 italic text-sm">Tidak ada action items untuk sesi ini.</p>
              ) : (
                <div className="space-y-4">
                  {coachingLog.actionItems.map((item) => (
                    <div key={item.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-zinc-900/50 space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-2.5">
                          {item.evidenceUrl || item.followUpNotes ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                          ) : (
                            <Circle className="h-5 w-5 text-slate-300 dark:text-slate-700 mt-0.5 shrink-0" />
                          )}
                          <p className="text-slate-800 dark:text-slate-200 font-bold text-base">{item.text}</p>
                        </div>
                        
                        {item.dueDate && (
                          <div className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 rounded-md w-fit border border-amber-200 dark:border-amber-900/50 shrink-0">
                            <Clock className="h-3.5 w-3.5" />
                            Tenggat: {format(item.dueDate, "d MMM yyyy", { locale: idLocale })}
                          </div>
                        )}
                      </div>

                      <ActionItemFollowUp
                        item={item}
                        coacheeId={coachingLog.coacheeId}
                        isCoachee={isCoachee}
                        isClosed={coachingLog.isClosed}
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {coachingLog.response && (
            <Card className="shadow-sm border-blue-500/20">
              <CardHeader className="bg-blue-50/50 pb-4 border-b border-blue-100">
                <CardTitle className="text-blue-800 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-[#015249]" />
                  Tanggapan Akhir Coach
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap">
                  {coachingLog.response.split('@@@')[0]}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar Right */}
        <div className="space-y-6">
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="bg-slate-50 pb-4 border-b border-slate-200">
              <CardTitle className="text-slate-800 text-base">Partisipan</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Coach</p>
                <p className="font-medium text-slate-800">{coachingLog.coach.name}</p>
                <p className="text-sm text-slate-500">{coachingLog.coach.positionDetail}</p>
                {coachingLog.coach.department && (
                  <p className="text-xs text-slate-400 mt-0.5">{coachingLog.coach.department}</p>
                )}
              </div>
              <div className="h-px bg-slate-100 w-full"></div>
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Coachee</p>
                <p className="font-medium text-slate-800">{coachingLog.coachee.name}</p>
                <p className="text-sm text-slate-500">{coachingLog.coachee.positionDetail}</p>
              </div>
            </CardContent>
          </Card>


        </div>
      </div>
    </div>
  );
}
