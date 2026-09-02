import { prisma } from "@/lib/prisma";
import { QuizWizard } from "@/components/quiz-wizard";
import { auth } from "@/auth";
import { cookies } from "next/headers";
import { getCooldownSetting } from "@/app/actions/settings";
import { Clock } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function QuestionnairePage() {
  const session = await auth();
  let showCancel = false;
  let isUnderCooldown = false;
  let nextAvailableDate: Date | null = null;

  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        assessments: {
          orderBy: { createdAt: "desc" },
          take: 1
        }
      }
    });
    if (user) {
      const viewMode = cookies().get('view-mode')?.value || 'admin';
      const isViewModeUser = user.role === 'ADMIN' && viewMode === 'user';
      const positionDetail = isViewModeUser ? 'Staf Pelaksana' : user.positionDetail;
      showCancel = positionDetail === 'Staf Pelaksana' || positionDetail === 'Asisten Manager';

      const latestAssessment = user.assessments?.[0];
      const cooldownMonths = await getCooldownSetting();

      if (latestAssessment && cooldownMonths > 0) {
        const lastDate = new Date(latestAssessment.createdAt);
        const targetDate = new Date(lastDate);
        targetDate.setMonth(targetDate.getMonth() + cooldownMonths);
        
        const now = new Date();
        if (now < targetDate) {
          isUnderCooldown = true;
          nextAvailableDate = targetDate;
        }
      }
    }
  }

  const dbQuestions = await prisma.question.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
    include: {
      options: {
        orderBy: { letter: 'asc' }
      }
    }
  });

  return (
    <div className="flex-1 min-h-0 flex flex-col w-full">
      {isUnderCooldown && nextAvailableDate ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center p-12 bg-white dark:bg-zinc-950 rounded-2xl border border-border max-w-lg shadow-sm">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Akses Terkunci</h2>
            <p className="text-muted-foreground mb-6">
              Batas waktu pengisian ulang sedang aktif. Gaya komunikasi membutuhkan waktu untuk berkembang, Anda baru dapat mengisi ulang setelah jangka waktu terlewati.
            </p>
            <p className="text-sm font-bold text-red-500 mb-8 bg-red-50 p-4 rounded-xl inline-block">
              Dapat diisi kembali mulai:<br/>
              {new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(nextAvailableDate)}
            </p>
          </div>
        </div>
      ) : dbQuestions.length > 0 ? (
        <QuizWizard questions={dbQuestions} showCancel={showCancel} />
      ) : (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center text-muted-foreground p-12 bg-muted/20 rounded-2xl border border-border max-w-md">
            Belum ada pertanyaan kuesioner yang aktif.
          </div>
        </div>
      )}
    </div>
  )
}
