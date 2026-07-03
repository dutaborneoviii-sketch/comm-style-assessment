import { prisma } from "@/lib/prisma";
import { QuizWizard } from "@/components/quiz-wizard";

export const dynamic = "force-dynamic";

export default async function QuestionnairePage() {
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
    <div className="container mx-auto py-10 px-4 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8 text-center text-foreground">Asesmen Gaya Komunikasi</h1>
      {dbQuestions.length > 0 ? (
        <QuizWizard questions={dbQuestions} />
      ) : (
        <div className="text-center text-muted-foreground p-12 bg-muted/20 rounded-2xl border border-border">
          Belum ada pertanyaan kuesioner yang aktif.
        </div>
      )}
    </div>
  )
}
