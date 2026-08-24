import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { QuestionEditor } from "@/components/admin/question-editor";
import { UploadExcel } from "@/components/admin/upload-excel";
import { cookies } from "next/headers";

import { Database, ChevronRight, ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminQuestionsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/");

  const viewMode = cookies().get('view-mode')?.value || 'admin';
  const isViewModeUser = user.role === 'ADMIN' && viewMode === 'user';
  if (isViewModeUser) {
    user.role = 'USER';
    user.position = 'Staf Pelaksana';
  }

  const isAdmin = user.role === "ADMIN";
  let canModify = isAdmin;

  // Double check feature flag for non-admin to ensure they have access to view this page
  if (!isAdmin) {
    let userRoleGroup = "Staf";
    if (user?.position === "Asisten Deputi") userRoleGroup = "Asisten Deputi";
    if (user?.position === "Deputi Direksi Wilayah") userRoleGroup = "Deputi Direksi Wilayah";

    const { isFeatureEnabled } = await import("@/app/actions/features");
    const isEnabled = await isFeatureEnabled("manajemen_bank_soal", userRoleGroup, user?.department);
    if (!isEnabled) {
      redirect("/profile");
    }
    canModify = true;
  }

  const questions = await prisma.question.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
    include: {
      options: {
        orderBy: { letter: 'asc' }
      }
    }
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-[#015249] dark:text-white tracking-tight flex items-center gap-3">
          <Database className="w-8 h-8 text-[#57BC90]" />
          Manajemen Bank Soal
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg max-w-3xl">
          Kelola teks pertanyaan dan opsi asesmen gaya komunikasi Anda di sini. Perubahan akan langsung tercermin di kuesioner utama.
        </p>
      </div>

      {canModify && <UploadExcel />}

      <div className="space-y-6">
        {questions.length === 0 ? (
          <div className="text-center p-12 bg-muted/20 border rounded-2xl">
            Belum ada pertanyaan yang tersedia di database.
          </div>
        ) : (
          questions.map(q => (
            <QuestionEditor key={q.id} question={q} canModify={canModify} />
          ))
        )}
      </div>
    </div>
  );
}
