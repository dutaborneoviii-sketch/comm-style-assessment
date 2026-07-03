import { prisma } from "@/lib/prisma";
import { QuestionEditor } from "@/components/admin/question-editor";
import { UploadExcel } from "@/components/admin/upload-excel";

export const dynamic = "force-dynamic";

export default async function AdminQuestionsPage() {
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
        <h1 className="text-3xl font-bold mb-2">Manajemen Pertanyaan</h1>
        <p className="text-muted-foreground">Kelola teks pertanyaan dan opsi asesmen gaya komunikasi Anda di sini. Perubahan akan langsung tercermin di kuesioner utama.</p>
      </div>

      <UploadExcel />

      <div className="space-y-6">
        {questions.length === 0 ? (
          <div className="text-center p-12 bg-muted/20 border rounded-2xl">
            Belum ada pertanyaan yang tersedia di database.
          </div>
        ) : (
          questions.map(q => (
            <QuestionEditor key={q.id} question={q} />
          ))
        )}
      </div>
    </div>
  );
}
