import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft, Calendar } from "lucide-react";
import { STYLE_COLORS } from "@/lib/scoring";

export default async function HistoryPage() {
  const session = await auth();
  if (!session?.user?.id) return redirect("/");

  const assessments = await prisma.assessment.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl space-y-8">
      <Link href="/profile" className="inline-flex items-center text-sm font-medium hover:underline text-white">
        <ChevronLeft className="h-4 w-4 mr-1" />
        Kembali ke Dasbor
      </Link>

      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Riwayat Asesmen</h1>
        <p className="text-muted-foreground">Lihat kembali hasil asesmen gaya komunikasi Anda sebelumnya.</p>
      </div>

      <div className="grid gap-4">
        {assessments.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              Anda belum pernah mengambil asesmen ini.
            </CardContent>
          </Card>
        ) : (
          assessments.map((assessment) => {
            const primaryColor = STYLE_COLORS[assessment.primaryStyle]?.split(' ')[0] || "bg-gray-500";
            const secondaryColor = assessment.secondaryStyle ? (STYLE_COLORS[assessment.secondaryStyle]?.split(' ')[0] || "bg-gray-500") : "";

            return (
              <Card key={assessment.id} className="overflow-hidden hover:shadow-lg transition-shadow glass-card border-primary/10">
                <div className="flex h-full">
                  <div className={`w-3 ${primaryColor}`}></div>
                  {assessment.isCombination && <div className={`w-3 ${secondaryColor}`}></div>}
                  <div className="flex-1 p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                    <div className="space-y-1">
                      <h3 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80">
                        {assessment.primaryStyle}
                        {assessment.isCombination && ` & ${assessment.secondaryStyle}`}
                      </h3>
                      <div className="flex items-center text-sm font-medium text-muted-foreground mt-2">
                        <Calendar className="h-4 w-4 mr-2" />
                        {new Date(assessment.createdAt).toLocaleDateString()} pukul {new Date(assessment.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                    <Link href={`/questionnaire/result/${assessment.id}`} className="w-full sm:w-auto">
                      <Button variant="secondary" className="w-full sm:w-auto shadow-sm">Lihat Detail</Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
